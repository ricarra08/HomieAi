import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { logRouteError } from "@/lib/log";

/**
 * Durable fixed-window rate limiter (security finding H2).
 *
 * Primary path: the `consume_rate_limit` RPC (migration 019) — one atomic upsert per
 * check, shared across all serverless instances. Fallback path: the original
 * per-instance in-memory window, used only when the RPC is unavailable (missing env in
 * tests, transient DB error). Degraded-but-limiting beats failing open or closed.
 */

const windows = new Map<string, { count: number; start: number }>();

// Opportunistic eviction: entries for keys that never recur (e.g. per-IP keys) would
// otherwise accumulate for the life of the process.
const SWEEP_THRESHOLD = 1000;

function sweepExpired(now: number, windowMs: number) {
  if (windows.size < SWEEP_THRESHOLD) return;
  for (const [key, entry] of windows) {
    if (now - entry.start > windowMs) {
      windows.delete(key);
    }
  }
}

/** Thrown by callers (e.g. ensureSnapshot's onCacheMiss) to abort a cost-incurring path. */
export class RateLimitExceededError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super("rate_limited");
    this.name = "RateLimitExceededError";
  }
}

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  /** Seconds until the current window resets. Only populated on the durable path. */
  retryAfterSeconds?: number;
}

function memoryRateLimit(key: string, maxRequests: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = windows.get(key);

  if (!entry || now - entry.start > windowMs) {
    sweepExpired(now, windowMs);
    windows.set(key, { count: 1, start: now });
    return { limited: false, remaining: maxRequests - 1 };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  return { limited: entry.count > maxRequests, remaining };
}

let adminClient: SupabaseClient | null = null;

function getAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!adminClient) {
    adminClient = createClient(url, key, { auth: { persistSession: false } });
  }
  return adminClient;
}

export async function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const admin = getAdminClient();
  if (!admin) {
    return memoryRateLimit(key, maxRequests, windowMs);
  }

  try {
    const { data, error } = await admin.rpc("consume_rate_limit", {
      p_key: key,
      p_max: maxRequests,
      p_window_seconds: Math.max(1, Math.round(windowMs / 1000)),
    });
    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    if (!row || typeof row.allowed !== "boolean") {
      throw new Error("consume_rate_limit returned no row");
    }
    return {
      limited: !row.allowed,
      remaining: row.remaining ?? 0,
      retryAfterSeconds: row.retry_after_seconds ?? undefined,
    };
  } catch (err) {
    // Degrade to the per-instance window rather than failing open (no limiting at
    // all) or closed (blocking legitimate users on a transient DB hiccup).
    logRouteError(
      { route: "lib/rate-limit", event: "durable_limiter_unavailable_memory_fallback" },
      err
    );
    return memoryRateLimit(key, maxRequests, windowMs);
  }
}
