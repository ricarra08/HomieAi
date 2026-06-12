/**
 * POST /api/claim — the authenticated buyer takes over an agent-created transaction.
 *
 * Transfers ownership: transactions.user_id → the claiming buyer, agent_id unchanged, and the
 * claim token is cleared (single-use). Service-role, because the buyer can't RLS-touch a
 * transaction they don't own yet.
 *
 * Guards: same-origin + authenticated; the claimer must have a buyer profile; the transaction
 * must still be an unclaimed shell (user_id = agent_id) with a non-expired token; and the
 * ownership flip is conditional on the token still matching, so two racing claims can't both win.
 */
import { NextRequest } from "next/server";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { isLikelyClaimToken } from "@/lib/invites";
import { isSameOrigin } from "@/lib/security/same-origin";
import { rateLimit } from "@/lib/rate-limit";
import { isValidEmail, normalizeEmail } from "@/lib/email/validate";

export const dynamic = "force-dynamic";

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return json(403, { error: "invalid_origin" });

  let body: { token?: unknown };
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }
  if (!isLikelyClaimToken(body.token)) return json(400, { error: "invalid_token" });
  const token = body.token;

  const supabase = await createSupabaseServer();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return json(401, { error: "unauthenticated" });
  const buyerId = authData.user.id;

  const { limited } = await rateLimit(`claim:${buyerId}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (limited) return json(429, { error: "rate_limited" });

  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // The claimer must be an onboarded buyer.
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("user_id", buyerId)
    .maybeSingle();
  if (!profile) return json(409, { error: "no_profile" });
  if (profile.role !== "buyer") return json(403, { error: "not_a_buyer" });

  const { data: txn } = await admin
    .from("transactions")
    .select("id, user_id, agent_id, client_email, claim_token_expires_at")
    .eq("claim_token", token)
    .maybeSingle();

  if (!txn) return json(404, { error: "invalid_or_used" });
  if (txn.user_id !== txn.agent_id) return json(409, { error: "already_claimed" });
  if (txn.agent_id === buyerId) return json(400, { error: "cannot_claim_own" });
  if (txn.claim_token_expires_at && new Date(txn.claim_token_expires_at).getTime() < Date.now()) {
    return json(410, { error: "expired" });
  }
  // Recipient binding: when the agent addressed the invite to a specific email, require the
  // authenticated (email-confirmed) claimer to match it — so a leaked/forwarded link can't be
  // claimed by a third party. If no client_email was set, the link is an intentional bearer link.
  if (isValidEmail(txn.client_email)) {
    if (normalizeEmail(authData.user.email) !== normalizeEmail(txn.client_email)) {
      return json(403, { error: "email_mismatch" });
    }
  }

  // Race-safe transfer: conditional on the token still matching. A concurrent claim that already
  // cleared the token updates zero rows here, so only one claimer wins.
  const { data: updated, error: updErr } = await admin
    .from("transactions")
    .update({
      user_id: buyerId,
      claim_token: null,
      claim_token_expires_at: null,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", txn.id)
    .eq("claim_token", token)
    .select("id")
    .maybeSingle();

  if (updErr) return json(500, { error: "claim_failed" });
  if (!updated) return json(409, { error: "already_claimed" });

  return json(200, { ok: true, transactionId: updated.id });
}
