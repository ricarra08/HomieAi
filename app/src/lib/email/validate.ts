/**
 * Minimal, conservative email validation for addresses we send TO (audit L5:
 * collaborator recipient_email was never validated). Not RFC-complete — just enough
 * to reject obvious garbage and prevent malformed addresses reaching the mail provider.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

export function isValidEmail(raw: unknown): raw is string {
  return typeof raw === "string" && raw.length <= 254 && EMAIL_PATTERN.test(raw.trim());
}

/** Lowercased, trimmed form for storage/sending; returns null if invalid. */
export function normalizeEmail(raw: unknown): string | null {
  if (!isValidEmail(raw)) return null;
  return raw.trim().toLowerCase();
}
