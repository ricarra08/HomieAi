/**
 * Authorization scope for collaborator-uploaded documents (audit finding M-2).
 *
 * Collaborator links are UNAUTHENTICATED — anyone holding the 32-byte token can upload. Each link
 * is scoped to a `recipient_role` and (optionally) an explicit `requested_documents` list. These
 * helpers enforce that scope server-side after classification, and encode the security invariant
 * that authoritative financial tables (`loan_estimates`) are NEVER auto-populated from a
 * collaborator-sourced upload — the buyer/agent must review and accept it first. Without this, a
 * crafted PDF that classifies as a loan_estimate would inject attacker-chosen lender/rate/fee
 * values straight into the buyer's loan comparison.
 */

export type RecipientRole = "agent" | "lender" | "escrow" | "title" | "inspector" | "other";

/**
 * Doc types each role would legitimately provide. A role absent from this map (e.g. "other") is
 * treated as unrestricted. Deliberately conservative: only the lender issues loan estimates, so an
 * inspector/title/escrow/agent link that yields a "loan_estimate" is out of scope and gets flagged.
 */
export const ROLE_ALLOWED_DOC_TYPES: Record<string, readonly string[]> = {
  lender: ["loan_estimate", "closing_disclosure", "pre_approval", "proof_of_funds"],
  agent: [
    "purchase_contract",
    "disclosure",
    "inspection_report",
    "appraisal",
    "title_report",
    "closing_disclosure",
    "pre_approval",
    "proof_of_funds",
  ],
  escrow: ["closing_disclosure", "title_report", "insurance_binder", "disclosure"],
  title: ["title_report", "closing_disclosure", "insurance_binder"],
  inspector: ["inspection_report"],
  // "other" intentionally omitted → unrestricted (no scope flag), but still never auto-populates.
};

/**
 * The effective allow-list for a link: an explicit `requested_documents` list wins; otherwise the
 * role defaults apply. `null` means "no restriction" (a permissive/unknown role such as "other").
 */
export function allowedDocTypesForLink(
  role: string | null | undefined,
  requestedDocuments: readonly unknown[] | null | undefined,
): Set<string> | null {
  const requested = (requestedDocuments ?? []).filter(
    (d): d is string => typeof d === "string" && d.length > 0,
  );
  if (requested.length > 0) return new Set(requested);
  const roleDefaults = role ? ROLE_ALLOWED_DOC_TYPES[role] : undefined;
  return roleDefaults ? new Set(roleDefaults) : null;
}

/**
 * Whether a classified `docType` is within a collaborator link's authorized scope.
 * Unrestricted links and unclassified ("other"/empty) documents are always in scope so we never
 * raise a false flag on a legitimate-but-unrecognized upload.
 */
export function isDocTypeInScope(
  role: string | null | undefined,
  requestedDocuments: readonly unknown[] | null | undefined,
  docType: string | null | undefined,
): boolean {
  const allowed = allowedDocTypesForLink(role, requestedDocuments);
  if (!allowed) return true;
  if (!docType || docType === "other") return true;
  return allowed.has(docType);
}

/**
 * Security invariant: authoritative financial tables (`loan_estimates`) must never be
 * auto-populated from a collaborator-sourced document. Owner uploads (buyer/agent) still do.
 */
export function shouldAutoPopulateFinancials(sourceType: string | null | undefined): boolean {
  return sourceType !== "collaborator-upload";
}
