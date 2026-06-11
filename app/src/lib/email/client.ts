/**
 * Server-only transactional email via Resend.
 *
 * Graceful degradation: if RESEND_API_KEY is unset (local dev, CI, or before the
 * sending domain is verified), sendEmail() logs and returns { skipped: true } instead
 * of throwing — so the build and every feature keep working, and email "lights up"
 * the moment the key is configured. Callers should treat a skipped send as non-fatal.
 *
 * NEVER import this from a client component — it reads server secrets.
 */
import { Resend } from "resend";

const FROM_FALLBACK = "Phazr <notifications@phazr.co>";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export type SendEmailResult =
  | { ok: true; skipped: false; id: string | null }
  | { ok: true; skipped: true; reason: string }
  | { ok: false; skipped: false; error: string };

let client: Resend | null = null;
function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const resend = getClient();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY unset — skipping send to ${input.to} ("${input.subject}")`);
    return { ok: true, skipped: true, reason: "email_not_configured" };
  }

  const from = process.env.EMAIL_FROM || FROM_FALLBACK;
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    });
    if (error) {
      console.error(`[email] send failed to ${input.to}:`, error.message);
      return { ok: false, skipped: false, error: error.message };
    }
    return { ok: true, skipped: false, id: data?.id ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[email] send threw for ${input.to}:`, message);
    return { ok: false, skipped: false, error: message };
  }
}

/** Resolve the canonical site origin for links inside emails. */
export function emailSiteOrigin(requestOrigin: string): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || requestOrigin;
}
