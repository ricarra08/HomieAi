/**
 * Agent invite links (/join/[slug]) — Strategy A distribution mechanic.
 *
 * An agent's profile carries a unique, URL-safe `invite_slug`. The public page
 * /join/<slug> shows a branded invitation; the buyer signs up via /signup?ref=<slug>,
 * the ref survives the email-confirmation roundtrip in localStorage, and onboarding
 * resolves it server-side (/api/join/resolve) into `profiles.referred_by_agent_id`.
 * Transaction creation then stamps `agent_id` so the agent sees the client's
 * transaction under the existing agent RLS policies.
 *
 * Slugs are public handles by design — they reveal only the agent's display name.
 */

/** localStorage key carrying the inviting agent's slug from /join → signup → onboarding. */
export const AGENT_REF_STORAGE_KEY = "phazr-agent-ref";

/**
 * localStorage key carrying a pending transaction claim token from /claim/<token> through
 * signup/login so the buyer is routed back to the claim page once authenticated.
 */
export const CLAIM_TOKEN_STORAGE_KEY = "phazr-claim-token";

/** Claim tokens are server-generated UUIDs. Light client-side shape check before routing on one. */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isLikelyClaimToken(raw: unknown): raw is string {
  return typeof raw === "string" && UUID_PATTERN.test(raw);
}

/** Lowercase alphanumerics and inner hyphens, 3–40 chars, no leading/trailing hyphen. */
const INVITE_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;

export function isValidInviteSlug(raw: unknown): raw is string {
  return typeof raw === "string" && INVITE_SLUG_PATTERN.test(raw) && !raw.includes("--");
}

/** "Sarah Q. Johnson" → "sarah-q-johnson"; empty/symbol-only names → "agent". */
export function slugifyDisplayName(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30)
    .replace(/-$/g, "");
  return base.length >= 2 ? base : "agent";
}

/**
 * Slug candidate for an agent: name part + 4-char random suffix so two agents with
 * the same name don't collide. Caller retries with a fresh call on a unique-index
 * violation.
 */
export function generateInviteSlug(displayName: string, random: () => number = Math.random): string {
  const suffix = Array.from({ length: 4 }, () =>
    "abcdefghjkmnpqrstuvwxyz23456789"[Math.floor(random() * 31)],
  ).join("");
  return `${slugifyDisplayName(displayName)}-${suffix}`;
}
