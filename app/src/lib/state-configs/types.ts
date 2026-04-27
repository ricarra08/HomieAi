// ============================================================
// StateConfig — the single type that drives all state-conditional
// logic in the app. One config object per supported state.
// Adding a state = creating a new file that satisfies this type.
// ============================================================

export type StateCode = "FL" | "TX" | "AZ" | "CA";

// -- Sub-interfaces --

export interface ClosingConfig {
  type: "title_company" | "escrow_company" | "attorney";
  attorney_review_required: boolean;
  attorney_review_days: number | null;
  style: "wet" | "dry" | "escrow";
  parties_sign_together: boolean;
  signing_to_keys_gap_days: number;
  ron_available: boolean;
  typical_close_days_financed: [number, number];
  typical_close_days_cash: [number, number];
}

export interface BuyerProtectionConfig {
  type: "inspection_contingency" | "option_period" | "investigation_contingency";
  label: string;
  description: string;
}

export interface OptionPeriodConfig {
  enabled: boolean;
  default_days: number | null;
  fee_recipient: "seller" | "escrow" | null;
  fee_typical_range: [number, number] | null;
  fee_delivery_days: number | null;
  unrestricted_termination: boolean;
}

export interface ContingencyDefaultsConfig {
  inspection_days: number;
  financing_days: number;
  appraisal_days: number | null;
  title_days: number | null;
  hoa_review_days: number;
  loan_application_days: number;
}

export interface ContingencyRemovalConfig {
  active_removal_required: boolean;
  silence_means: "acceptance" | "contingency_persists";
  nbp_mechanism: boolean;
  nbp_response_hours: number | null;
}

export interface DayCountingConfig {
  type: "calendar" | "business";
  weekend_extension: boolean;
}

export interface ContractVariant {
  name: string;
  description: string;
  key_difference: string;
}

export interface StandardContractConfig {
  name: string;
  variants: ContractVariant[];
  promulgated: boolean;
}

export interface InspectionConfig {
  type: string;
  label: string;
  required_by: "law" | "insurer" | "lender" | "recommended" | "conditional";
  condition?: string;
  typical_cost: [number, number];
  state_specific_form?: string;
  notes?: string;
}

export interface DisclosureConfig {
  name: string;
  short_name: string;
  required: boolean;
  legal_reference: string;
  who_provides: "seller" | "agent" | "third_party";
  delivery_deadline_days?: number;
  buyer_cancel_days?: number;
  condition?: string;
  notes?: string;
}

export interface HOAConfig {
  governing_law: string;
  buyer_cancel_days: number;
  estoppel_delivery_days: number;
  estoppel_max_cost: number | null;
  sirs_required: boolean;
  sirs_building_stories_threshold: number | null;
  milestone_inspection_required: boolean;
  milestone_age_threshold: number | null;
  reserve_study_interval_years: number | null;
}

export interface InsuranceTypeConfig {
  type: string;
  label: string;
  required_by: "law" | "lender" | "recommended" | "conditional";
  condition?: string;
  state_specific: boolean;
  insurer_of_last_resort?: string;
  notes?: string;
}

export interface TitleInsuranceConfig {
  rates_regulated: boolean;
  owner_policy_paid_by: "seller" | "buyer" | "varies_by_county" | "varies_by_region";
  regional_variations?: { region: string; paid_by: "seller" | "buyer" }[];
  policy_types?: string[];
  survey_standard: boolean;
}

export interface EarnestMoneyConfig {
  typical_percent: [number, number];
  deposit_deadline_days: number;
  deposit_deadline_type: "calendar" | "business";
  holder: "title_company" | "escrow_company" | "broker";
  cure_period_days: number | null;
  liquidated_damages_cap_percent: number | null;
}

export interface TransferTaxConfig {
  exists: boolean;
  rate_per_thousand: number | null;
  paid_by: "seller" | "buyer" | "split";
  city_additional: boolean;
  notes?: string;
}

export interface MortgageTaxConfig {
  exists: boolean;
  rate_per_thousand: number | null;
  paid_by: "seller" | "buyer";
}

export interface HomesteadExemptionConfig {
  exists: boolean;
  reduces_taxes: boolean;
  amount: string | null;
  filing_deadline?: string;
  assessment_cap_percent?: number | null;
  portability: boolean;
}

export interface SpecialDistrictConfig {
  type: string;
  label: string;
  exists: boolean;
  typical_annual_range: [number, number] | null;
}

export interface TaxConfig {
  transfer_tax: TransferTaxConfig;
  mortgage_tax: MortgageTaxConfig;
  property_tax_year: "calendar" | "fiscal";
  property_tax_avg_rate: [number, number];
  homestead_exemption: HomesteadExemptionConfig;
  supplemental_tax: boolean;
  special_districts: SpecialDistrictConfig[];
}

export interface NonResidentWithholdingConfig {
  state_withholding: boolean;
  rate_percent: number | null;
}

export interface PostCloseItem {
  item: string;
  description: string;
  deadline?: string;
  priority: "high" | "medium" | "low";
}

export interface UniqueFeatureConfig {
  feature: string;
  description: string;
  affects: string[];
}

// -- Main interface --

export interface StateConfig {
  state_code: StateCode;
  state_name: string;
  closing: ClosingConfig;
  buyer_protection: BuyerProtectionConfig;
  option_period: OptionPeriodConfig;
  contingency_defaults: ContingencyDefaultsConfig;
  contingency_removal: ContingencyRemovalConfig;
  day_counting: DayCountingConfig;
  standard_contracts: StandardContractConfig;
  inspections: InspectionConfig[];
  disclosures: DisclosureConfig[];
  hoa: HOAConfig;
  insurance_types: InsuranceTypeConfig[];
  title_insurance: TitleInsuranceConfig;
  earnest_money: EarnestMoneyConfig;
  taxes: TaxConfig;
  community_property: boolean;
  non_resident_withholding: NonResidentWithholdingConfig;
  post_close: PostCloseItem[];
  unique_features: UniqueFeatureConfig[];
}
