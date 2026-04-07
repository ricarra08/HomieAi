type ExtractedField = { value: unknown; confidence?: string };
type ExtractedFields = Record<string, ExtractedField>;

function num(fields: ExtractedFields, key: string): number | undefined {
  const v = fields[key]?.value;
  return typeof v === "number" ? v : undefined;
}

function str(fields: ExtractedFields, key: string): string | undefined {
  const v = fields[key]?.value;
  return typeof v === "string" && v ? v : undefined;
}

function bool(fields: ExtractedFields, key: string): boolean | undefined {
  const v = fields[key]?.value;
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const lower = v.toLowerCase();
    if (lower === "yes" || lower === "true") return true;
    if (lower === "no" || lower === "false") return false;
  }
  return undefined;
}

function normalizeLockStatus(fields: ExtractedFields): "locked" | "floating" | null {
  const raw = str(fields, "lock_status");
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes("unlock") || lower.includes("float") || lower === "no" || lower === "false") return "floating";
  if (lower.includes("lock") || lower === "yes" || lower === "true") return "locked";
  return null;
}

export function mapExtractedToLE(
  extractedFields: Record<string, unknown>,
  documentId: string,
  dealId: string
): Record<string, unknown> {
  const fields = extractedFields as ExtractedFields;

  const loanAmount = num(fields, "loan_amount");
  const downPct = num(fields, "down_payment_pct");
  const downPayment = loanAmount && downPct
    ? Math.round(loanAmount * (downPct / (100 - downPct)))
    : undefined;

  return {
    deal_id: dealId,
    lender: str(fields, "lender_name") ?? "Unknown Lender",
    product: str(fields, "loan_product") ?? "Unknown Product",
    loan_amount: loanAmount ?? 0,
    rate: num(fields, "interest_rate") ?? 0,
    apr: num(fields, "apr"),
    down_payment: downPayment,
    points: num(fields, "points"),
    lender_fees: num(fields, "lender_fees"),
    third_party_fees: num(fields, "third_party_fees"),
    pmi_monthly: num(fields, "pmi_monthly"),
    impounds: bool(fields, "impounds") ?? false,
    cash_to_close: num(fields, "cash_to_close"),
    lock_status: normalizeLockStatus(fields),
    lock_expires: str(fields, "lock_expiration"),
    prepay_penalty: bool(fields, "prepay_penalty") ?? false,
    is_chosen: false,
    pdf_document_id: documentId,
  };
}
