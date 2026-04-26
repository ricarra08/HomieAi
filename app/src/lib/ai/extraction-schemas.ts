import type { ResponseFormatJSONSchema } from "openai/resources/shared";

export const TIER_1_TYPES = [
  "purchase_contract",
  "loan_estimate",
  "closing_disclosure",
  "inspection_report",
  "appraisal",
  "title_report",
  "insurance_binder",
  "disclosure",
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
      estimated_total_closing: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
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
      "lender_fees", "third_party_fees", "pmi_monthly", "estimated_total_closing",
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

const comparableSaleSchema = {
  type: "object" as const,
  properties: {
    address: { type: "string" as const },
    sale_price: { type: ["number", "null"] as const },
    sale_date: { type: ["string", "null"] as const },
    adjustments: { type: ["number", "null"] as const },
  },
  required: ["address", "sale_price", "sale_date", "adjustments"] as const,
  additionalProperties: false as const,
};

const appraisalSchema: ResponseFormatJSONSchema["json_schema"] = {
  name: "appraisal_extraction",
  strict: true,
  schema: {
    type: "object",
    properties: {
      appraised_value: { type: "object", properties: { value: { type: "number" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      appraiser_name: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      appraisal_date: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      property_address: { type: "object", properties: { value: { type: "string" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      property_type: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      living_area_sqft: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      lot_size: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      year_built: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      condition_rating: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      comparable_sales: { type: "object", properties: { value: { type: "array", items: comparableSaleSchema }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      reconciled_value: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      as_is_vs_subject_to: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
    },
    required: [
      "appraised_value", "appraiser_name", "appraisal_date", "property_address",
      "property_type", "living_area_sqft", "lot_size", "year_built",
      "condition_rating", "comparable_sales", "reconciled_value", "as_is_vs_subject_to",
    ],
    additionalProperties: false,
  },
};

const titleExceptionSchema = {
  type: "object" as const,
  properties: {
    type: { type: "string" as const },
    description: { type: "string" as const },
    insurable: { type: ["boolean", "null"] as const },
  },
  required: ["type", "description", "insurable"] as const,
  additionalProperties: false as const,
};

const lienSchema = {
  type: "object" as const,
  properties: {
    holder: { type: "string" as const },
    amount: { type: ["number", "null"] as const },
    type: { type: "string" as const },
  },
  required: ["holder", "amount", "type"] as const,
  additionalProperties: false as const,
};

const titleReportSchema: ResponseFormatJSONSchema["json_schema"] = {
  name: "title_report_extraction",
  strict: true,
  schema: {
    type: "object",
    properties: {
      title_company: { type: "object", properties: { value: { type: "string" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      effective_date: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      property_address: { type: "object", properties: { value: { type: "string" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      current_owner: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      legal_description: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      exceptions: { type: "object", properties: { value: { type: "array", items: titleExceptionSchema }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      liens: { type: "object", properties: { value: { type: "array", items: lienSchema }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      easements_count: { type: "object", properties: { value: { type: "number" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      title_insurance_commitment_amount: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      requirements_for_clear_title: { type: "object", properties: { value: { type: "array", items: { type: "string" } }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
    },
    required: [
      "title_company", "effective_date", "property_address", "current_owner",
      "legal_description", "exceptions", "liens", "easements_count",
      "title_insurance_commitment_amount", "requirements_for_clear_title",
    ],
    additionalProperties: false,
  },
};

const insuranceBinderSchema: ResponseFormatJSONSchema["json_schema"] = {
  name: "insurance_binder_extraction",
  strict: true,
  schema: {
    type: "object",
    properties: {
      insurance_company: { type: "object", properties: { value: { type: "string" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      policy_number: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      policy_type: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      effective_date: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      expiration_date: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      dwelling_coverage: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      personal_property_coverage: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      liability_coverage: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      annual_premium: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      deductible: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      flood_coverage: { type: "object", properties: { value: { type: ["boolean", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      wind_separate_policy: { type: "object", properties: { value: { type: ["boolean", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      named_insured: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      lender_loss_payee: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
    },
    required: [
      "insurance_company", "policy_number", "policy_type", "effective_date", "expiration_date",
      "dwelling_coverage", "personal_property_coverage", "liability_coverage",
      "annual_premium", "deductible", "flood_coverage", "wind_separate_policy",
      "named_insured", "lender_loss_payee",
    ],
    additionalProperties: false,
  },
};

const materialDefectSchema = {
  type: "object" as const,
  properties: {
    system: { type: "string" as const },
    description: { type: "string" as const },
    severity: { type: "string" as const, enum: ["critical", "major", "minor"] },
  },
  required: ["system", "description", "severity"] as const,
  additionalProperties: false as const,
};

const disclosureSchema: ResponseFormatJSONSchema["json_schema"] = {
  name: "disclosure_extraction",
  strict: true,
  schema: {
    type: "object",
    properties: {
      disclosure_type: { type: "object", properties: { value: { type: "string" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      property_address: { type: "object", properties: { value: { type: "string" }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      seller_name: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      date_signed: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      material_defects: { type: "object", properties: { value: { type: "array", items: materialDefectSchema }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      environmental_hazards: { type: "object", properties: { value: { type: "array", items: { type: "string" } }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      pending_permits: { type: "object", properties: { value: { type: ["boolean", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      insurance_claims: { type: "object", properties: { value: { type: "array", items: { type: "string" } }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      hoa_name: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      hoa_monthly_dues: { type: "object", properties: { value: { type: ["number", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      hoa_special_assessments: { type: "object", properties: { value: { type: ["boolean", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      flood_zone: { type: "object", properties: { value: { type: ["boolean", "null"] }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
      natural_hazard_zones: { type: "object", properties: { value: { type: "array", items: { type: "string" } }, confidence: CONFIDENCE }, required: ["value", "confidence"], additionalProperties: false },
    },
    required: [
      "disclosure_type", "property_address", "seller_name", "date_signed",
      "material_defects", "environmental_hazards", "pending_permits", "insurance_claims",
      "hoa_name", "hoa_monthly_dues", "hoa_special_assessments",
      "flood_zone", "natural_hazard_zones",
    ],
    additionalProperties: false,
  },
};

export const EXTRACTION_SCHEMAS: Record<Tier1DocType, ResponseFormatJSONSchema["json_schema"]> = {
  purchase_contract: purchaseContractSchema,
  loan_estimate: loanEstimateSchema,
  closing_disclosure: closingDisclosureSchema,
  inspection_report: inspectionReportSchema,
  appraisal: appraisalSchema,
  title_report: titleReportSchema,
  insurance_binder: insuranceBinderSchema,
  disclosure: disclosureSchema,
};
