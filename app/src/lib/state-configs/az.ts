import type { StateConfig } from "./types";

export const ARIZONA_CONFIG: StateConfig = {
  state_code: "AZ",
  state_name: "Arizona",

  closing: {
    type: "title_company",
    attorney_review_required: false,
    attorney_review_days: null,
    style: "escrow",
    parties_sign_together: false,
    signing_to_keys_gap_days: 2,
    ron_available: false,
    typical_close_days_financed: [30, 35],
    typical_close_days_cash: [14, 21],
  },

  buyer_protection: {
    type: "inspection_contingency",
    label: "Inspection Period",
    description: "Buyer inspects, submits BINSR. If no BINSR filed during the period, buyer waives inspection objections (silence = acceptance).",
  },

  option_period: {
    enabled: false,
    default_days: null,
    fee_recipient: null,
    fee_typical_range: null,
    fee_delivery_days: null,
    unrestricted_termination: false,
  },

  contingency_defaults: {
    inspection_days: 10,
    financing_days: 25,
    appraisal_days: null, // embedded in loan contingency
    title_days: 5,        // 5 business days after receipt
    hoa_review_days: 5,
    loan_application_days: 3,
  },

  contingency_removal: {
    active_removal_required: false,
    silence_means: "acceptance",
    nbp_mechanism: false,
    nbp_response_hours: null,
  },

  day_counting: {
    type: "calendar",
    weekend_extension: true,
  },

  standard_contracts: {
    name: "AAR",
    variants: [
      {
        name: "AAR Residential Resale Purchase Contract",
        description: "Single dominant form for residential resales",
        key_difference: "Industry-standard (not state-mandated). Includes BINSR process.",
      },
    ],
    promulgated: false,
  },

  inspections: [
    {
      type: "general",
      label: "General Home Inspection",
      required_by: "recommended",
      typical_cost: [300, 600],
    },
    {
      type: "roof",
      label: "Flat Roof Inspection",
      required_by: "recommended",
      typical_cost: [150, 400],
      notes: "Critical — UV/heat degradation to flat roofs common in AZ.",
    },
    {
      type: "pool",
      label: "Pool Inspection",
      required_by: "recommended",
      condition: "has_pool",
      typical_cost: [150, 350],
      notes: "Very common — AZ has highest pool density in the US.",
    },
    {
      type: "pest",
      label: "Scorpion / Pest Assessment",
      required_by: "recommended",
      typical_cost: [100, 250],
      notes: "Scorpion activity common in many AZ areas.",
    },
    {
      type: "termite_wdo",
      label: "Termite / WDO Report",
      required_by: "recommended",
      typical_cost: [75, 150],
      notes: "High termite activity in AZ.",
    },
    {
      type: "well_water",
      label: "Well Water Quality Testing",
      required_by: "recommended",
      condition: "has_well",
      typical_cost: [150, 400],
      notes: "Arsenic, nitrates naturally occurring in AZ groundwater.",
    },
    {
      type: "septic",
      label: "Septic Inspection",
      required_by: "lender",
      condition: "has_septic",
      typical_cost: [200, 500],
      notes: "ADEQ regulated.",
    },
  ],

  disclosures: [
    {
      name: "Seller's Property Disclosure Statement",
      short_name: "SPDS",
      required: false, // common law duty (Hill v. Jones), not statutory
      legal_reference: "Hill v. Jones (1986)",
      who_provides: "seller",
      notes: "AAR SPDS form is standard practice. Seller has common law duty to disclose known defects.",
    },
    {
      name: "Lead-Based Paint Disclosure",
      short_name: "Lead Paint",
      required: true,
      legal_reference: "42 U.S.C. §4852d",
      who_provides: "seller",
      condition: "pre_1978",
    },
    {
      name: "Affidavit of Disclosure",
      short_name: "Affidavit",
      required: true,
      legal_reference: "ARS §33-422",
      who_provides: "seller",
      condition: "unincorporated_area",
      notes: "Required for properties in unincorporated areas of the county.",
    },
    {
      name: "HOA Disclosure Package",
      short_name: "HOA Docs",
      required: true,
      legal_reference: "ARS §33-1260 / §33-1806",
      who_provides: "seller",
      buyer_cancel_days: 5,
      condition: "property_in_hoa",
    },
  ],

  hoa: {
    governing_law: "ARS §33-1201 (Condo), §33-1801 (Planned Community)",
    buyer_cancel_days: 5,
    estoppel_delivery_days: 10,
    estoppel_max_cost: null, // no statutory cap, typically $200-$600
    sirs_required: false,
    sirs_building_stories_threshold: null,
    milestone_inspection_required: false,
    milestone_age_threshold: null,
    reserve_study_interval_years: null,
  },

  insurance_types: [
    {
      type: "homeowners",
      label: "Homeowner's Insurance (HO-3)",
      required_by: "lender",
      state_specific: false,
      notes: "Average $800-$2,500/yr. No major wind/earthquake/wildfire concerns in metro areas.",
    },
    {
      type: "flood",
      label: "Flood Insurance (NFIP)",
      required_by: "conditional",
      condition: "fema_flood_zone",
      state_specific: false,
      notes: "Rare in metro. Monsoon risk near washes.",
    },
  ],

  title_insurance: {
    rates_regulated: false,
    owner_policy_paid_by: "seller",
    survey_standard: false,
  },

  earnest_money: {
    typical_percent: [1, 1],
    deposit_deadline_days: 3,
    deposit_deadline_type: "business",
    holder: "title_company",
    cure_period_days: 3, // 3 business days after notice
    liquidated_damages_cap_percent: null,
  },

  taxes: {
    transfer_tax: {
      exists: false,
      rate_per_thousand: null,
      paid_by: "seller",
      city_additional: false,
      notes: "Affidavit of Value: $2 filing fee only.",
    },
    mortgage_tax: {
      exists: false,
      rate_per_thousand: null,
      paid_by: "buyer",
    },
    property_tax_year: "fiscal",
    property_tax_avg_rate: [0.7, 1.2],
    homestead_exemption: {
      exists: true,
      reduces_taxes: false, // asset protection only
      amount: "$400,000 asset protection",
      assessment_cap_percent: 5, // Limited Property Value
      portability: false,
    },
    supplemental_tax: false,
    special_districts: [],
  },

  community_property: true,

  non_resident_withholding: {
    state_withholding: true,
    rate_percent: 2.0,
  },

  post_close: [
    {
      item: "Limited Property Value Reset",
      description: "Property tax Limited Property Value resets on transfer. Expect higher tax bill than previous owner.",
      priority: "medium",
    },
  ],

  unique_features: [
    {
      feature: "BINSR Process",
      description: "Buyer's Inspection Notice and Seller's Response — critical inspection negotiation form. If buyer doesn't file BINSR during inspection period, they waive objections.",
      affects: ["inspection", "deadlines"],
    },
    {
      feature: "Silence = Acceptance",
      description: "If buyer doesn't act during inspection period, contingency is waived automatically. Different from CA where silence means contingency persists.",
      affects: ["contingencies"],
    },
    {
      feature: "Non-Resident Withholding",
      description: "2% of gross sales price withheld for non-resident sellers (ARS §43-1072).",
      affects: ["closing_costs", "disclosures"],
    },
    {
      feature: "Weekend Extension",
      description: "If deadline falls on Saturday or Sunday, it extends to the next business day (Monday).",
      affects: ["deadlines"],
    },
  ],
};
