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

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { limited: boolean; remaining: number } {
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
