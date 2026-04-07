export type Phase = "shopping" | "offer" | "escrow" | "closing" | "post-close";

export interface SavedHome {
  id: string;
  user_id: string;
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

export interface Deal {
  id: string;
  user_id: string;
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
  type: "earnest-money" | "inspection" | "appraisal" | "financing" | "disclosure" | "closing" | "custom";
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
