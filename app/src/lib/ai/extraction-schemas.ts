import type { ResponseFormatJSONSchema } from "openai/resources/shared";

export const TIER_1_TYPES = [
  "purchase_contract",
  "loan_estimate",
  "closing_disclosure",
  "inspection_report",
] as const;

export type Tier1DocType = (typeof TIER_1_TYPES)[number];

export function isTier1(docType: string): docType is Tier1DocType {
  return (TIER_1_TYPES as readonly string[]).includes(docType);
}

const CONFIDENCE = {
  type: "string" as const,
  enum: ["high", "medium", "low"],
  description: "Confidence level for this extracted value",
};

const purchaseContractSchema: ResponseFormatJSONSchema["json_schema"] = {
  name: "purchase_contract_extraction",
  strict: true,
  schema: {
    type: "object",
    properties: {
      property_address: { type: "object", properties: { value: { type: "string" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      purchase_price: { type: "object", properties: { value: { type: "number" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      buyer_names: { type: "object", properties: { value: { type: "array", items: { type: "string" } }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      seller_names: { type: "object", properties: { value: { type: "array", items: { type: "string" } }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      contract_date: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      closing_date: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      earnest_money: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      inspection_period_days: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      appraisal_contingency_days: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      financing_contingency_days: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      disclosure_review_days: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      special_terms: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      listing_agent: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      buyers_agent: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      escrow_company: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      title_company: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
    },
    required: [
      "property_address", "purchase_price", "buyer_names", "seller_names",
      "contract_date", "closing_date", "earnest_money",
      "inspection_period_days", "appraisal_contingency_days", "financing_contingency_days",
      "disclosure_review_days", "special_terms",
      "listing_agent", "buyers_agent", "escrow_company", "title_company",
    ],
    additionalProperties: false,
  },
};

const loanEstimateSchema: ResponseFormatJSONSchema["json_schema"] = {
  name: "loan_estimate_extraction",
  strict: true,
  schema: {
    type: "object",
    properties: {
      lender_name: { type: "object", properties: { value: { type: "string" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      loan_product: { type: "object", properties: { value: { type: "string" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      loan_amount: { type: "object", properties: { value: { type: "number" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      interest_rate: { type: "object", properties: { value: { type: "number" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      apr: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      monthly_pi: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      estimated_total_closing: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      cash_to_close: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      points: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      lender_fees: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      third_party_fees: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      pmi_monthly: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      impounds: { type: "object", properties: { value: { type: ["boolean", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      prepay_penalty: { type: "object", properties: { value: { type: ["boolean", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      lock_status: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      lock_expiration: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      down_payment_pct: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
    },
    required: [
      "lender_name", "loan_product", "loan_amount", "interest_rate",
      "apr", "monthly_pi", "estimated_total_closing", "cash_to_close",
      "points", "lender_fees", "third_party_fees", "pmi_monthly",
      "impounds", "prepay_penalty", "lock_status", "lock_expiration", "down_payment_pct",
    ],
    additionalProperties: false,
  },
};

const closingDisclosureSchema: ResponseFormatJSONSchema["json_schema"] = {
  name: "closing_disclosure_extraction",
  strict: true,
  schema: {
    type: "object",
    properties: {
      lender_name: { type: "object", properties: { value: { type: "string" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      loan_product: { type: "object", properties: { value: { type: "string" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      loan_amount: { type: "object", properties: { value: { type: "number" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      interest_rate: { type: "object", properties: { value: { type: "number" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      apr: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      monthly_pi: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      cash_to_close: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      final_cash_to_close: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      lender_fees: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      third_party_fees: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      pmi_monthly: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      prorations: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      seller_credits: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      recording_fees: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      transfer_taxes: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      prepaid_items: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      initial_escrow: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
    },
    required: [
      "lender_name", "loan_product", "loan_amount", "interest_rate",
      "apr", "monthly_pi", "cash_to_close", "final_cash_to_close",
      "lender_fees", "third_party_fees", "pmi_monthly",
      "prorations", "seller_credits", "recording_fees", "transfer_taxes",
      "prepaid_items", "initial_escrow",
    ],
    additionalProperties: false,
  },
};

const findingSchema = {
  type: "object" as const,
  properties: {
    description: { type: "string" as const },
    severity: { type: "string" as const, enum: ["critical", "major", "minor", "cosmetic"] },
    location: { type: ["string", "null"] as const },
    estimated_cost: { type: ["number", "null"] as const },
  },
  required: ["description", "severity", "location", "estimated_cost"] as const,
  additionalProperties: false as const,
};

const inspectionReportSchema: ResponseFormatJSONSchema["json_schema"] = {
  name: "inspection_report_extraction",
  strict: true,
  schema: {
    type: "object",
    properties: {
      inspector_name: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      inspection_date: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      inspection_type: { type: "object", properties: { value: { type: "string" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      major_findings: { type: "object", properties: { value: { type: "array", items: findingSchema }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      minor_findings: { type: "object", properties: { value: { type: "array", items: findingSchema }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      systems_condition: {
        type: "object",
        properties: {
          value: {
            type: "object",
            properties: {
              hvac: { type: ["string", "null"] },
              electrical: { type: ["string", "null"] },
              plumbing: { type: ["string", "null"] },
              roof: { type: ["string", "null"] },
              foundation: { type: ["string", "null"] },
            },
            required: ["hvac", "electrical", "plumbing", "roof", "foundation"],
            additionalProperties: false,
          },
          confidence: CONFIDENCE,
        },
        required: ["value", "confidence"],
        additionalProperties: false,
      },
      recommended_actions: { type: "object", properties: { value: { type: "array", items: { type: "string" } }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      overall_condition: { type: "object", properties: { value: { type: "string" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
    },
    required: [
      "inspector_name", "inspection_date", "inspection_type",
      "major_findings", "minor_findings", "systems_condition",
      "recommended_actions", "overall_condition",
    ],
    additionalProperties: false,
  },
};

export const EXTRACTION_SCHEMAS: Record<Tier1DocType, ResponseFormatJSONSchema["json_schema"]> = {
  purchase_contract: purchaseContractSchema,
  loan_estimate: loanEstimateSchema,
  closing_disclosure: closingDisclosureSchema,
  inspection_report: inspectionReportSchema,
};
