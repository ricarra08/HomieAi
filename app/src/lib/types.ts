export type Phase = "shopping" | "offer" | "escrow" | "closing" | "post-close";

export type UserRole = "buyer" | "agent";

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  display_name: string;
  seen_phase_guides: Phase[];
  created_at: string;
  updated_at: string;
}

export interface SavedHome {
  id: string;
  user_id: string;
  deal_id: string | null;
  address: string;
  price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: string | null;
  notes: string | null;
  image_url: string | null;
  status: "interested" | "toured" | "offer-pending" | "removed";
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  agent_id: string | null;
  client_name: string | null;
  client_email: string | null;
  saved_home_id: string | null;
  property_address: string;
  purchase_price: number;
  contract_acceptance_date: string | null;
  closing_date: string | null;
  agent_name: string | null;
  agent_contact: string | null;
  current_phase: Phase;
  earnest_money_amount: number | null;
  earnest_money_status: "pending" | "sent" | "confirmed" | "held" | null;
  escrow_company: string | null;
  escrow_contact: string | null;
  closing_metadata: ClosingMetadata | null;
  archived: boolean;
  // State workflow engine fields
  state: string | null;
  property_type: "single_family" | "condo" | "townhome" | "new_construction" | "vacant_land" | null;
  loan_program: "conventional" | "fha" | "va" | "usda" | "jumbo" | "cash" | null;
  property_in_hoa: boolean;
  property_in_special_district: boolean;
  special_district_annual_cost: number | null;
  created_at: string;
  updated_at: string;
}

export interface OfferDetails {
  id: string;
  deal_id: string;
  offer_price: number;
  earnest_money: number;
  closing_date: string | null;
  contingency_inspection_days: number | null;
  contingency_appraisal_days: number | null;
  contingency_financing_days: number | null;
  contingency_disclosure_days: number | null;
  pre_approval_doc_id: string | null;
  proof_of_funds_doc_id: string | null;
  checklist_items: Record<string, boolean>;
  status: "draft" | "submitted" | "accepted" | "rejected" | "countered";
  // State-specific offer fields
  option_period_days: number | null;              // TX
  option_fee: number | null;                      // TX
  option_fee_delivered: boolean;                   // TX
  option_fee_delivery_date: string | null;         // TX
  investigation_contingency_days: number | null;   // CA
  contract_type: string | null;                    // FL: "standard" | "as_is"
  seller_repair_cap_percent: number | null;        // FL Standard: 1.5%
  created_at: string;
}

export interface Document {
  id: string;
  deal_id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  doc_type: string | null;
  category: string | null;
  stage: string | null;
  status: "required" | "missing" | "uploaded" | "processing" | "processed" | "failed" | "signed" | "acknowledged" | "final" | "read-only";
  version: string | null;
  extracted_text: string | null;
  extracted_fields: Record<string, unknown> | null;
  ai_summary: string | null;
  confidence_score: number | null;
  source_type: "buyer-upload" | "collaborator-upload" | "system-generated";
  created_at: string;
  updated_at: string;
}

export interface Deadline {
  id: string;
  deal_id: string;
  name: string;
  type:
    | "earnest-money" | "inspection" | "appraisal" | "financing" | "disclosure" | "closing" | "custom"
    // State-specific deadline types
    | "option-period" | "option-fee-delivery" | "investigation"
    | "title-commitment-delivery" | "title-review" | "hoa-doc-review"
    | "loan-application" | "contingency-removal" | "nbp-response"
    | "insurance-binder" | "survey" | "seller-disclosure-delivery";
  due_date: string;
  status: "upcoming" | "due-soon" | "overdue" | "completed" | "waived";
  notes: string | null;
  linked_document_ids: string[] | null;
  created_at: string;
}

export interface LoanEstimate {
  id: string;
  deal_id: string;
  lender: string;
  product: string;
  loan_amount: number;
  down_payment: number | null;
  rate: number;
  apr: number | null;
  points: number | null;
  lender_fees: number | null;
  third_party_fees: number | null;
  pmi_monthly: number | null;
  impounds: boolean;
  cash_to_close: number | null;
  lock_status: "locked" | "floating" | null;
  lock_expires: string | null;
  prepay_penalty: boolean;
  is_chosen: boolean;
  pdf_document_id: string | null;
  created_at: string;
}

export interface RepairItem {
  id: string;
  deal_id: string;
  description: string;
  category: "structural" | "electrical" | "plumbing" | "hvac" | "roof" | "pest" | "cosmetic" | "safety" | "other" | null;
  estimated_cost: number | null;
  agreed_cost: number | null;
  resolution: "repair" | "credit" | "as-is" | "pending" | "disputed" | null;
  status: "pending" | "requested" | "agreed" | "declined" | "completed";
  severity: "critical" | "major" | "minor" | "cosmetic" | null;
  source_document_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InsuranceInfo {
  id: string;
  deal_id: string;
  carrier: string;
  policy_type: string | null;
  annual_premium: number | null;
  coverage_dwelling: number | null;
  deductible: number | null;
  effective_date: string | null;
  mortgagee_clause: string | null;
  binder_status: "pending" | "requested" | "received" | "bound" | "verified";
  binder_document_id: string | null;
  is_chosen: boolean;
  notes: string | null;
  // State-specific insurance fields
  insurance_type: "homeowners" | "wind" | "flood" | "earthquake" | "sinkhole" | "title_owner" | "title_lender" | null;
  flood_zone: string | null;
  flood_insurance_required: boolean | null;
  wind_separate_policy: boolean | null;
  hurricane_deductible_percent: number | null;
  wildfire_zone: boolean | null;
  fair_plan: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CollaboratorLink {
  id: string;
  deal_id: string;
  recipient_role: "agent" | "lender" | "escrow" | "title" | "inspector" | "other";
  recipient_email: string | null;
  link_token: string;
  requested_documents: string[] | null;
  expires_at: string;
  status: "active" | "expired" | "revoked";
  uploads_received: number;
  created_at: string;
}

export interface ClosingMetadata {
  walkthrough_items: Record<string, boolean>;
  signing_date: string | null;
  signing_location: string | null;
  signing_confirmed: boolean;
  wire_verified_steps: [boolean, boolean, boolean];
  wire_status: "pending" | "wired" | "confirmed";
  wire_receipt_doc_id: string | null;
  cd_received_confirmed: boolean;
  cash_to_close_confirmed: boolean;
  title_acknowledged: boolean;
  funding_steps: { step: string; status: "pending" | "in-progress" | "complete"; date?: string }[];
  underwriting_conditions: { description: string; status: "outstanding" | "submitted" | "cleared" }[];
}

export const DEFAULT_CLOSING_METADATA: ClosingMetadata = {
  walkthrough_items: {},
  signing_date: null,
  signing_location: null,
  signing_confirmed: false,
  wire_verified_steps: [false, false, false],
  wire_status: "pending",
  wire_receipt_doc_id: null,
  cd_received_confirmed: false,
  cash_to_close_confirmed: false,
  title_acknowledged: false,
  funding_steps: [
    { step: "Lender Funds", status: "pending" },
    { step: "Escrow Disburses", status: "pending" },
    { step: "County Records", status: "pending" },
    { step: "Keys Released", status: "pending" },
  ],
  underwriting_conditions: [],
};

export interface CopilotMessage {
  id: string;
  user_id: string;
  deal_id: string | null;
  role: "user" | "assistant";
  content: string;
  citations: { documentName: string; page?: number; section?: string }[] | null;
  phase: Phase;
  created_at: string;
}

export type RegimeName =
  | "stagnant"
  | "stable"
  | "improving"
  | "accelerating"
  | "overheated"
  | "correcting";

export interface HomeValueProjectionSeriesPoint {
  monthOffset: number;
  conservative: number;
  moderate: number;
  optimistic: number;
  range50?: [number, number];
  range80?: [number, number];
  range95?: [number, number];
}

export interface HomeValueAttribution {
  structure: number;
  microLocation: number;
  macro: number;
  neighborhood: number;
  propertySpecific: number;
  compResidual: number;
}

export interface HomeValueProjection {
  id: string;
  savedHomeId: string;
  transactionId: string;
  modelVersion: string;
  anchorPrice: number;
  address: string;
  currentValue: {
    fairValue: number;
    range50: [number, number];
    range80: [number, number];
    range95: [number, number];
    confidenceScore: number;
  };
  scenarios: { conservative: number; moderate: number; optimistic: number };
  series: HomeValueProjectionSeriesPoint[];
  attribution: HomeValueAttribution;
  regime: Partial<Record<RegimeName, number>>;
  explanation: string;
  warnings: string[];
  generatedAt: string;
}
