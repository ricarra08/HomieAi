/**
 * CSRF defense for cookie-authenticated, state-changing requests (audit finding H7).
 *
 * Supabase session cookies are SameSite=Lax, which already blocks the cookie from being sent on
 * most cross-site POSTs — but as defense-in-depth we also verify the request actually originated
 * from our own site by matching the `Origin` header (falling back to `Referer`) against the
 * request's own origin. Browser `fetch` always sends `Origin` on POST, so legitimate same-origin
 * calls pass; a missing/mismatched origin is rejected.
 *
 * Do NOT apply to server-to-server callers (e.g. the x-internal-secret path in
 * /api/documents/process) — those carry no cookie and no Origin header by design.
 */
import type { NextRequest } from "next/server";

/** Pure core: compare the request's Origin/Referer against the expected origin. */
export function matchesOrigin(
  originHeader: string | null,
  refererHeader: string | null,
  expectedOrigin: string,
): boolean {
  if (originHeader) return originHeader === expectedOrigin;
  // Some browsers omit Origin but send Referer; accept when its origin matches.
  if (refererHeader) {
    try {
      return new URL(refererHeader).origin === expectedOrigin;
    } catch {
      return false;
    }
  }
  // Neither header present. Browser fetch POSTs always send Origin, so absence is suspicious for a
  // cookie-authenticated state-changing request — reject.
  return false;
}

export function isSameOrigin(request: NextRequest): boolean {
  return matchesOrigin(
    request.headers.get("origin"),
    request.headers.get("referer"),
    request.nextUrl.origin,
  );
}
