/**
 * GET /api/claim/info?token=... — public lookup for the /claim/<token> landing page.
 *
 * Returns only what the page shows: whether the link is valid and, if so, the inviting agent's
 * display name and the property address. Service-role (the visitor isn't the owner yet). The
 * token is a high-entropy UUID; rate-limited by IP to blunt enumeration.
 */
import { NextRequest } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { isLikelyClaimToken } from "@/lib/invites";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { limited } = rateLimit(`claim-info:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (limited) return json(429, { error: "rate_limited" });

  const token = request.nextUrl.searchParams.get("token");
  if (!isLikelyClaimToken(token)) return json(400, { valid: false, reason: "invalid" });

  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: txn } = await admin
    .from("transactions")
    .select("agent_id, user_id, property_address, claim_token_expires_at")
    .eq("claim_token", token)
    .maybeSingle();

  if (!txn) return json(200, { valid: false, reason: "used_or_invalid" });
  if (txn.user_id !== txn.agent_id) return json(200, { valid: false, reason: "used_or_invalid" });
  if (txn.claim_token_expires_at && new Date(txn.claim_token_expires_at).getTime() < Date.now()) {
    return json(200, { valid: false, reason: "expired" });
  }

  let agentName = "Your agent";
  if (txn.agent_id) {
    const { data: agent } = await admin
      .from("profiles")
      .select("display_name")
      .eq("user_id", txn.agent_id)
      .maybeSingle();
    if (agent?.display_name) agentName = agent.display_name;
  }

  const address = txn.property_address && txn.property_address !== "TBD" ? txn.property_address : null;
  return json(200, { valid: true, agentName, propertyAddress: address });
}
