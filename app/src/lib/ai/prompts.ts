export const TEXT_LIMITS = {
  classification: 6_000,
  extraction: 20_000,
  summarization: 30_000,
} as const;

const DOC_TYPE_LABELS: Record<string, string> = {
  purchase_contract: "Purchase Contract / Residential Purchase Agreement",
  loan_estimate: "Loan Estimate",
  closing_disclosure: "Closing Disclosure",
  inspection_report: "Home Inspection Report",
  appraisal: "Appraisal Report",
  title_report: "Preliminary Title Report",
  disclosure: "Seller Disclosure (TDS, NHD, Lead Paint, etc.)",
  insurance_binder: "Homeowner's Insurance Binder",
  pre_approval: "Mortgage Pre-Approval Letter",
  proof_of_funds: "Proof of Funds",
  other: "Real Estate Document",
};

function docLabel(docType: string): string {
  return DOC_TYPE_LABELS[docType] ?? DOC_TYPE_LABELS.other;
}

export function getExtractionSystemPrompt(docType: string): string {
  const label = docLabel(docType);

  const shared = `You are an expert real estate document data extractor. You are analyzing a ${label}.

Extract every requested field from the document text. For each field:
- Return the extracted value in the correct type.
- Rate your confidence: "high" if the value is clearly stated, "medium" if inferred or partially visible, "low" if guessing or the field was not found.
- If a field is not present in the document, return null for the value with "low" confidence.
- Dates should be in YYYY-MM-DD format when possible.
- Dollar amounts should be plain numbers without currency symbols.
- Percentages should be plain numbers (e.g., 6.5 not "6.5%").`;

  const typeSpecific: Record<string, string> = {
    purchase_contract: `Focus on: property details, parties, dates, financial terms (price, earnest money), contingency periods (inspection, appraisal, financing, disclosure), and involved professionals (agents, escrow, title).`,
    loan_estimate: `Focus on: lender info, loan product, amounts, rates (interest rate, APR), monthly payment, closing costs breakdown (lender fees, third-party fees), points/credits, PMI, impounds, lock status, and down payment.`,
    closing_disclosure: `Focus on: final loan terms, actual closing costs vs estimates, cash to close, prorations, seller credits, recording fees, transfer taxes, prepaid items, and initial escrow deposits.`,
    inspection_report: `Focus on: inspector details, date, type of inspection, major findings (with severity and estimated repair costs), minor findings, system conditions (HVAC, electrical, plumbing, roof, foundation), recommended actions, and overall condition assessment.`,
  };

  return `${shared}\n\n${typeSpecific[docType] ?? ""}`.trim();
}

export function getSummarizationSystemPrompt(docType: string): string {
  const label = docLabel(docType);

  const tier1Prompts: Record<string, string> = {
    purchase_contract: `Summarize this ${label} in plain English for a homebuyer. Cover:
- The property and parties involved
- Key financial terms (purchase price, earnest money, down payment)
- Important dates and deadlines (closing date, contingency periods)
- Any special terms or conditions the buyer should be aware of
- What the buyer needs to do next

Keep it clear, warm, and jargon-free. If a term might be unfamiliar, briefly explain it.`,

    loan_estimate: `Summarize this ${label} in plain English for a homebuyer. Cover:
- Who the lender is and what loan product is offered
- The interest rate and APR (explain the difference briefly)
- Monthly payment breakdown
- Total closing costs and cash needed to close
- Whether the rate is locked or floating
- Any notable fees, PMI, or points
- How this compares to typical terms (if anything stands out)

Keep it clear and actionable.`,

    closing_disclosure: `Summarize this ${label} in plain English for a homebuyer. Cover:
- Final loan terms and how they compare to the original Loan Estimate
- Total cash to close and what changed (if anything)
- Breakdown of costs: lender fees, title fees, prepaid items, escrow
- Any seller credits or prorations applied
- What the buyer should verify before signing

Flag anything that looks unusual or that changed significantly from the LE.`,

    inspection_report: `Summarize this ${label} in plain English for a homebuyer. Cover:
- Overall condition of the property
- Major findings that need immediate attention (with estimated costs if available)
- System conditions (HVAC, electrical, plumbing, roof, foundation)
- Minor issues worth monitoring
- Recommended next steps (repairs to negotiate, specialists to consult)

Prioritize safety and cost impact. Be honest but not alarming.`,
  };

  if (tier1Prompts[docType]) {
    return `You are Homie, a friendly AI homebuying assistant. ${tier1Prompts[docType]}`;
  }

  return `You are Homie, a friendly AI homebuying assistant. Summarize this ${label} in plain English for a homebuyer.

Explain:
- What this document is and why the buyer received it
- The key information or terms it contains
- Anything the buyer should pay attention to or verify
- What action (if any) the buyer needs to take

Keep it clear, warm, and jargon-free. If a term might be unfamiliar, briefly explain it.`;
}
