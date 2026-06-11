/**
 * POST /api/claim/invite — agent generates (or re-uses) a claim link for a client transaction,
 * and optionally emails it to the buyer.
 *
 * The write uses the agent's RLS-bound client (they own/agent the transaction). Guard: a claim
 * token may only exist on an UNCLAIMED shell (user_id = agent_id) — refusing to mint a token for
 * an already-buyer-owned transaction is what prevents an agent from hijacking a buyer's workspace.
 */
import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";
import { isSameOrigin } from "@/lib/security/same-origin";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail, emailSiteOrigin } from "@/lib/email/client";
import { agentClaimInviteEmail } from "@/lib/email/templates";
import { isValidEmail } from "@/lib/email/validate";

export const dynamic = "force-dynamic";

const CLAIM_TTL_DAYS = 14;
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return json(403, { error: "invalid_origin" });

  let body: { transactionId?: unknown; sendEmail?: unknown };
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }
  if (typeof body.transactionId !== "string") {
    return json(400, { error: "transactionId required" });
  }

  const supabase = await createSupabaseServer();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return json(401, { error: "unauthenticated" });
  const agentId = authData.user.id;

  const { limited } = rateLimit(`claim-invite:${agentId}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (limited) return json(429, { error: "rate_limited" });

  // RLS gates this read to transactions the caller owns or agents.
  const { data: txn, error: txnError } = await supabase
    .from("transactions")
    .select("id, user_id, agent_id, property_address, client_email, claim_token, claim_token_expires_at, claimed_at")
    .eq("id", body.transactionId)
    .maybeSingle();

  if (txnError || !txn) return json(404, { error: "transaction_not_found" });
  if (txn.agent_id !== agentId) return json(403, { error: "not_your_client" });
  // Already handed off to a buyer (user_id diverged from agent_id): never re-mint a token.
  if (txn.user_id !== txn.agent_id) return json(409, { error: "already_claimed" });

  // Reuse an existing unexpired token so re-opening the dialog shows a stable link.
  const now = Date.now();
  const existingValid =
    txn.claim_token &&
    txn.claim_token_expires_at &&
    new Date(txn.claim_token_expires_at).getTime() > now;

  let token = txn.claim_token as string | null;
  if (!existingValid) {
    token = randomUUID();
    const expires = new Date(now + CLAIM_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { error: updErr } = await supabase
      .from("transactions")
      .update({ claim_token: token, claim_token_expires_at: expires })
      .eq("id", txn.id);
    if (updErr) return json(500, { error: "could_not_create_link" });
  }

  const origin = emailSiteOrigin(request.nextUrl.origin);
  const claimUrl = `${origin}/claim/${token}`;

  let emailed = false;
  if (body.sendEmail === true && isValidEmail(txn.client_email)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", agentId)
      .maybeSingle();
    const { subject, html, text } = agentClaimInviteEmail({
      agentName: profile?.display_name || "Your agent",
      propertyAddress: txn.property_address,
      claimUrl,
    });
    const result = await sendEmail({ to: txn.client_email as string, subject, html, text });
    emailed = result.ok && result.skipped === false;
  }

  return json(200, { claimUrl, emailed });
}
