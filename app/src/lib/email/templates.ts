/**
 * Transactional email templates. Each returns { subject, html, text }; the caller passes
 * the result to sendEmail(). Plain, brand-aligned markup — inline styles only (email clients
 * don't support external CSS), conservative layout that renders everywhere.
 *
 * All interpolated values are caller-controlled-but-trusted (transaction owner's data) except
 * where noted; values that originate from untrusted parties are escaped before interpolation.
 */

const BRAND_ACCENT = "#D38E45"; // bronze
const TEXT = "#2D3748";
const MUTED = "#767676";

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(bodyHtml: string): string {
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#F5DEB3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${TEXT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5DEB3;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;border:1px solid #E8DBBF;overflow:hidden;">
        <tr><td style="padding:28px 32px 0 32px;">
          <span style="font-size:20px;font-weight:600;color:${TEXT};">Phazr</span>
        </td></tr>
        <tr><td style="padding:16px 32px 32px 32px;font-size:16px;line-height:1.55;">
          ${bodyHtml}
        </td></tr>
      </table>
      <p style="max-width:520px;margin:16px auto 0;font-size:12px;color:${MUTED};text-align:center;">
        Phazr helps homebuyers stay organized from offer to keys. This is a transactional message
        about a document request, not a marketing email.
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BRAND_ACCENT};color:#ffffff;text-decoration:none;font-weight:500;font-size:16px;padding:12px 22px;border-radius:8px;">${label}</a>`;
}

const ROLE_LABELS: Record<string, string> = {
  agent: "agent",
  lender: "lender",
  escrow: "escrow officer",
  title: "title company",
  inspector: "inspector",
  other: "collaborator",
};

export interface CollaboratorInviteInput {
  recipientRole: string;
  /** Property address for context; may be "TBD". Trusted (owner-entered). */
  propertyAddress: string;
  /** Full URL to the token-gated upload page. */
  uploadUrl: string;
  /** Optional list of requested document labels. Untrusted-ish; escaped. */
  requestedDocuments?: string[] | null;
  /** Optional human label for who sent it (e.g. "your client's transaction"). */
  senderLabel?: string;
}

export function collaboratorInviteEmail(input: CollaboratorInviteInput): {
  subject: string;
  html: string;
  text: string;
} {
  const roleLabel = ROLE_LABELS[input.recipientRole] ?? "collaborator";
  const address = input.propertyAddress && input.propertyAddress !== "TBD"
    ? input.propertyAddress
    : null;
  const subject = address
    ? `Document upload request for ${address}`
    : "Document upload request via Phazr";

  const docs = (input.requestedDocuments ?? []).filter((d) => typeof d === "string" && d.trim());
  const addressLine = address ? ` for the property at <strong>${escapeHtml(address)}</strong>` : "";

  const docsHtml = docs.length
    ? `<p style="margin:0 0 16px;">Requested documents:</p>
       <ul style="margin:0 0 16px;padding-left:20px;color:${TEXT};">
         ${docs.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}
       </ul>`
    : "";

  const html = layout(`
    <p style="margin:0 0 16px;">Hello,</p>
    <p style="margin:0 0 16px;">
      You've been asked, as the ${escapeHtml(roleLabel)}, to securely upload documents${addressLine}.
    </p>
    ${docsHtml}
    <p style="margin:0 0 24px;">No account is needed — just open the secure link below and upload your files.</p>
    <p style="margin:0 0 24px;">${button(input.uploadUrl, "Upload documents")}</p>
    <p style="margin:0 0 8px;font-size:13px;color:${MUTED};">
      Or paste this link into your browser:<br>
      <a href="${input.uploadUrl}" style="color:${BRAND_ACCENT};word-break:break-all;">${input.uploadUrl}</a>
    </p>
    <p style="margin:16px 0 0;font-size:13px;color:${MUTED};">
      This link is private and may expire. If you weren't expecting this request, you can ignore this email.
    </p>
  `);

  const text = [
    "Hello,",
    "",
    `You've been asked, as the ${roleLabel}, to securely upload documents${address ? ` for the property at ${address}` : ""}.`,
    docs.length ? `\nRequested documents:\n${docs.map((d) => `- ${d}`).join("\n")}` : "",
    "",
    "No account is needed — open this secure link to upload your files:",
    input.uploadUrl,
    "",
    "This link is private and may expire. If you weren't expecting this request, you can ignore this email.",
    "",
    "— Phazr",
  ].filter((l) => l !== "").join("\n");

  return { subject, html, text };
}
