/**
 * POST /api/collaborator/invite — email a collaborator their upload link.
 *
 * Sends the secure /upload/<token> link to the recipient_email stored on a collaborator_link.
 * Ownership is enforced through the caller's RLS-bound client: the link (and its transaction)
 * are only readable if the caller owns or is the agent on the transaction, so no service-role
 * is needed. Sending degrades gracefully when email isn't configured (returns skipped).
 */
import { NextRequest } from "next/server";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";
import { isSameOrigin } from "@/lib/security/same-origin";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail, emailSiteOrigin } from "@/lib/email/client";
import { collaboratorInviteEmail } from "@/lib/email/templates";
import { isValidEmail } from "@/lib/email/validate";

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
  if (!isSameOrigin(request)) {
    return json(403, { error: "invalid_origin" });
  }

  let body: { linkId?: unknown };
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }
  if (typeof body.linkId !== "string") {
    return json(400, { error: "linkId required" });
  }

  // Auth
  const supabase = await createSupabaseServer();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return json(401, { error: "unauthenticated" });
  }
  const userId = authData.user.id;

  const { limited } = await rateLimit(`collab-invite:${userId}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (limited) {
    return json(429, { error: "rate_limited" });
  }

  // Ownership via RLS: the link is only visible if the caller owns/agents the transaction.
  const { data: link, error: linkError } = await supabase
    .from("collaborator_links")
    .select("id, deal_id, recipient_role, recipient_email, requested_documents, link_token, status, expires_at")
    .eq("id", body.linkId)
    .maybeSingle();

  if (linkError || !link) {
    return json(404, { error: "link_not_found" });
  }
  if (link.status !== "active") {
    return json(409, { error: "link_not_active" });
  }
  if (!isValidEmail(link.recipient_email)) {
    return json(422, { error: "no_valid_recipient_email" });
  }

  // Property address for context (RLS-gated read of the owner's transaction).
  const { data: transaction } = await supabase
    .from("transactions")
    .select("property_address")
    .eq("id", link.deal_id)
    .maybeSingle();

  const origin = emailSiteOrigin(request.nextUrl.origin);
  const uploadUrl = `${origin}/upload/${encodeURIComponent(link.link_token)}`;

  const { subject, html, text } = collaboratorInviteEmail({
    recipientRole: link.recipient_role,
    propertyAddress: transaction?.property_address ?? "TBD",
    uploadUrl,
    requestedDocuments: link.requested_documents,
  });

  const result = await sendEmail({ to: link.recipient_email, subject, html, text });

  if (!result.ok) {
    return json(502, { error: "send_failed" });
  }
  return json(200, { ok: true, skipped: result.skipped });
}
