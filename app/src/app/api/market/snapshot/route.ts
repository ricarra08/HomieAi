/**
 * POST /api/market/snapshot
 *
 * Returns a derived MarketSnapshot for a saved home. Reuses the same `property_data_snapshots`
 * cache as the projection route via `ensureSnapshot`; whichever route fetches first warms the
 * cache for the other. The rate-limit key (`valuation:${userId}`) is intentionally shared with
 * the projection route so users can't double OpenAI cost by toggling between cards.
 *
 * Security invariant: the service-role admin client is used only after auth.getUser() and an
 * RLS-gated saved_homes lookup confirm ownership of the savedHomeId.
 */
import { NextRequest } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";
import { searchAddresses } from "@/lib/geocode";
import { rateLimit, RateLimitExceededError } from "@/lib/rate-limit";
import { normalizeAddress } from "@/lib/valuation";
import { ensureSnapshot, SnapshotPersistError } from "@/lib/valuation/snapshot-fetcher";
import { sanitizeSnapshot } from "@/lib/valuation/sanitize";
import { PromptSafetyError, escapeForPrompt } from "@/lib/valuation/prompt-safety";
import { deriveMarketSnapshot } from "@/lib/market/derive";
import { logRouteError } from "@/lib/log";
import { isSameOrigin } from "@/lib/security/same-origin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const ROUTE = "api/market/snapshot";

function getServiceRoleClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function json(status: number, body: unknown, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

export async function POST(request: NextRequest) {
  // CSRF defense-in-depth: reject cross-site POSTs (cookie-authenticated route).
  if (!isSameOrigin(request)) {
    return json(403, { error: "invalid_origin" });
  }

  let body: { savedHomeId?: string };
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const savedHomeId = body.savedHomeId;
  if (!savedHomeId || typeof savedHomeId !== "string") {
    return json(400, { error: "savedHomeId required" });
  }

  // 1. Auth
  const supabase = await createSupabaseServer();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return json(401, { error: "unauthenticated" });
  }
  const userId = authData.user.id;

  // 2. Ownership (RLS-gated read with the user's session client).
  const { data: savedHome, error: shError } = await supabase
    .from("saved_homes")
    .select("id, deal_id, address, price, beds, baths, sqft")
    .eq("id", savedHomeId)
    .maybeSingle();

  if (shError || !savedHome) {
    return json(404, { error: "saved_home_not_found" });
  }
  if (!savedHome.deal_id) {
    return json(400, { error: "saved_home_not_linked_to_transaction" });
  }
  // Note: unlike the projection route, missing price is OK here — the derive function handles
  // null anchorPrice (just hides the home-vs-median tile).

  const admin = getServiceRoleClient();

  // 3. Geocode (best-effort).
  const geocodeResults = await searchAddresses(savedHome.address).catch(() => []);
  const geocode = geocodeResults[0] ?? null;
  const fullAddress = geocode?.formattedAddress ?? savedHome.address;
  const addressNormalized = normalizeAddress(fullAddress);

  // Reject prompt-unsafe addresses before any DB read or rate-limit charge — these can
  // never produce a snapshot, so they must not consume the user's hourly budget.
  try {
    escapeForPrompt(fullAddress);
  } catch (err) {
    if (err instanceof PromptSafetyError) {
      return json(400, { error: "invalid_address" });
    }
    throw err;
  }

  // 4. Snapshot via shared helper. The rate limit is charged inside ensureSnapshot's
  // single-flight miss path (onCacheMiss), so concurrent requests from the two shopping
  // cards cost one token, not two, and the charge can't drift from the cache check.
  // Rate limiting is durable (Supabase consume_rate_limit RPC, migration 019) with an in-memory fallback.
  let snapshotResult;
  try {
    snapshotResult = await ensureSnapshot({
      admin,
      addressNormalized,
      fullAddress,
      savedHome: {
        address: fullAddress,
        price: savedHome.price,
        beds: savedHome.beds,
        baths: savedHome.baths,
        sqft: savedHome.sqft,
      },
      onCacheMiss: async () => {
        const { limited, retryAfterSeconds } = await rateLimit(
          `valuation:${userId}`,
          RATE_LIMIT_MAX,
          RATE_LIMIT_WINDOW_MS
        );
        if (limited) {
          throw new RateLimitExceededError(retryAfterSeconds ?? RATE_LIMIT_WINDOW_MS / 1000);
        }
      },
    });
  } catch (err) {
    if (err instanceof RateLimitExceededError) {
      return json(
        429,
        { error: "rate_limited", message: "Hourly market-data limit reached. Try again later." },
        { "Retry-After": String(err.retryAfterSeconds) },
      );
    }
    if (err instanceof PromptSafetyError) {
      return json(400, { error: "invalid_address" });
    }
    if (err instanceof SnapshotPersistError) {
      logRouteError({ route: ROUTE, event: "snapshot_persist_failed", userId, status: 500 }, err);
      return json(500, { error: "snapshot_persist_failed" });
    }
    logRouteError({ route: ROUTE, event: "snapshot_fetch_failed", userId, status: 503 }, err);
    const debug =
      process.env.NODE_ENV !== "production"
        ? { stage: "data_provider", detail: err instanceof Error ? err.message : String(err) }
        : undefined;
    return json(503, { error: "market_unavailable", ...(debug ?? {}) });
  }

  // 5. Derive. Sanitize first so scale-mismatched LLM values get clamped to defensible ranges.
  const sanitized = sanitizeSnapshot(snapshotResult.snapshot);
  const market = deriveMarketSnapshot({
    snapshot: sanitized,
    savedHomeId,
    address: fullAddress,
    anchorPrice: savedHome.price && savedHome.price > 0 ? savedHome.price : null,
  });

  return json(200, market);
}
