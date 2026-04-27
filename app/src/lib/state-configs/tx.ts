import type { StateConfig } from "./types";

export const TEXAS_CONFIG: StateConfig = {
  state_code: "TX",
  state_name: "Texas",

  closing: {
    type: "title_company",
    attorney_review_required: false,
    attorney_review_days: null,
    style: "dry",
    parties_sign_together: false,
    signing_to_keys_gap_days: 2,
    ron_available: true,
    typical_close_days_financed: [30, 45],
    typical_close_days_cash: [14, 21],
  },

  buyer_protection: {
    type: "option_period",
    label: "Option Period",
    description: "Buyer pays a non-refundable option fee for an unrestricted right to cancel for any reason during the option period.",
  },

  option_period: {
    enabled: true,
    default_days: 7,
    fee_recipient: "seller",
    fee_typical_range: [100, 500],
    fee_delivery_days: 3,
    unrestricted_termination: true,
  },

  contingency_defaults: {
    inspection_days: 7,   // covered by option period
    financing_days: 25,
    appraisal_days: null, // embedded in financing
    title_days: null,     // 20-day commitment delivery, no separate buyer review
    hoa_review_days: 3,
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
    weekend_extension: false,
  },

  standard_contracts: {
    name: "TREC",
    variants: [
      {
        name: "TREC 20-17",
        description: "One-to-Four Family Residential Contract (Resale)",
        key_difference: "Mandatory state-promulgated form. Agents MUST use TREC forms.",
      },
      {
        name: "TREC 23-18",
        description: "New Home Contract (Incomplete Construction)",
        key_difference: "For homes not yet complete at time of contract.",
      },
      {
        name: "TREC 24-17",
        description: "New Home Contract (Completed Construction)",
        key_difference: "For newly built homes ready for occupancy.",
      },
      {
        name: "TREC 30-16",
        description: "Residential Condominium Contract (Resale)",
        key_difference: "Specific to condo resales with HOA provisions.",
      },
    ],
    promulgated: true,
  },

  inspections: [
    {
      type: "general",
      label: "General Home Inspection",
      required_by: "recommended",
      typical_cost: [300, 600],
    },
    {
      type: "foundation",
      label: "Foundation / PE Inspection",
      required_by: "recommended",
      typical_cost: [400, 800],
      notes: "Critical due to expansive clay soils. Professional Engineer (PE) inspection common.",
    },
    {
      type: "roof",
      label: "Roof Inspection / Hail Certification",
      required_by: "recommended",
      typical_cost: [150, 400],
      notes: "Critical esp. North TX. Hail damage is common.",
    },
    {
      type: "termite_wdo",
      label: "Termite / WDO Report",
      required_by: "lender",
      typical_cost: [75, 150],
      notes: "Required for FHA/VA loans.",
    },
    {
      type: "hydrostatic",
      label: "Hydrostatic Testing (Plumbing Pressure Test)",
      required_by: "recommended",
      typical_cost: [200, 500],
      state_specific_form: "TREC Addendum 46-0",
      notes: "Tests sewer lines for leaks under the slab.",
    },
    {
      type: "pool",
      label: "Pool Inspection",
      required_by: "recommended",
      condition: "has_pool",
      typical_cost: [150, 350],
    },
    {
      type: "septic",
      label: "Septic Inspection",
      required_by: "lender",
      condition: "has_septic",
      typical_cost: [200, 500],
      notes: "TCEQ regulated.",
    },
    {
      type: "survey",
      label: "Property Survey",
      required_by: "recommended",
      typical_cost: [400, 700],
      notes: "Standard in TX. Title company typically requires. Existing survey may be acceptable if recent.",
    },
  ],

  disclosures: [
    {
      name: "Seller's Disclosure Notice",
      short_name: "SDN",
      required: true,
      legal_reference: "TX Prop Code §5.008",
      who_provides: "seller",
      notes: "TREC OP-H form. Statutory requirement.",
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
      name: "MUD Disclosure",
      short_name: "MUD",
      required: true,
      legal_reference: "TX Water Code §49.452",
      who_provides: "seller",
      condition: "property_in_special_district",
      notes: "Municipal Utility District — can add $0.50-$2.00+ per $100 assessed value to taxes.",
    },
    {
      name: "HOA Resale Certificate",
      short_name: "HOA",
      required: true,
      legal_reference: "TX Prop Code Ch. 207",
      who_provides: "seller",
      buyer_cancel_days: 3,
      condition: "property_in_hoa",
    },
    {
      name: "Mineral Rights Addendum",
      short_name: "Minerals",
      required: false,
      legal_reference: "TREC 44-2",
      who_provides: "seller",
      notes: "TX is an active mineral rights state. Rights can be severed from surface.",
    },
    {
      name: "Coastal Area Disclosure",
      short_name: "Coastal",
      required: false,
      legal_reference: "TREC Addendum 45-1",
      who_provides: "seller",
      condition: "coastal_property",
    },
  ],

  hoa: {
    governing_law: "TX Prop Code Ch. 207, 209",
    buyer_cancel_days: 3,
    estoppel_delivery_days: 10,
    estoppel_max_cost: 375,
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
    },
    {
      type: "wind",
      label: "Wind / Hail Insurance (TWIA)",
      required_by: "conditional",
      condition: "coastal_property",
      state_specific: true,
      insurer_of_last_resort: "TWIA (Texas Windstorm Insurance Association)",
      notes: "Coastal TX: TWIA provides wind/hail as separate policy. Requires WPI-8 certification. Inland: included in standard HO-3.",
    },
    {
      type: "flood",
      label: "Flood Insurance (NFIP)",
      required_by: "conditional",
      condition: "fema_flood_zone",
      state_specific: false,
      notes: "Post-Harvey awareness high. $500-$3,000+/yr.",
    },
  ],

  title_insurance: {
    rates_regulated: true,
    owner_policy_paid_by: "seller",
    policy_types: ["Owner's", "Lender's"],
    survey_standard: true,
  },

  earnest_money: {
    typical_percent: [1, 2],
    deposit_deadline_days: 3,
    deposit_deadline_type: "calendar",
    holder: "title_company",
    cure_period_days: null, // not automatic — seller must give notice
    liquidated_damages_cap_percent: null,
  },

  taxes: {
    transfer_tax: {
      exists: false,
      rate_per_thousand: null,
      paid_by: "seller",
      city_additional: false,
    },
    mortgage_tax: {
      exists: false,
      rate_per_thousand: null,
      paid_by: "buyer",
    },
    property_tax_year: "calendar",
    property_tax_avg_rate: [1.6, 1.8],
    homestead_exemption: {
      exists: true,
      reduces_taxes: true,
      amount: "$100,000 off school taxes",
      filing_deadline: "Within 2 years of purchase",
      assessment_cap_percent: null,
      portability: false,
    },
    supplemental_tax: false,
    special_districts: [
      {
        type: "MUD",
        label: "Municipal Utility District",
        exists: true,
        typical_annual_range: [500, 5000],
      },
    ],
  },

  community_property: true,

  non_resident_withholding: {
    state_withholding: false,
    rate_percent: null,
  },

  post_close: [
    {
      item: "File Homestead Exemption",
      description: "File with County Appraisal District within 2 years. $100K off school taxes.",
      deadline: "Within 2 years of purchase",
      priority: "high",
    },
    {
      item: "Property Tax Protest",
      description: "Deadline to protest property tax assessment is May 15 annually.",
      deadline: "May 15 annually",
      priority: "medium",
    },
  ],

  unique_features: [
    {
      feature: "Option Period",
      description: "Buyer pays non-refundable option fee ($100-$500) directly to seller for unrestricted right to cancel for any reason. Unique to TX.",
      affects: ["offer", "inspection", "deadlines"],
    },
    {
      feature: "TREC Promulgated Forms",
      description: "State-mandated contract forms. Agents MUST use TREC forms — unlike FL/AZ/CA where forms are industry-standard.",
      affects: ["contract_extraction", "offer"],
    },
    {
      feature: "Dry Funding",
      description: "Sign → lender reviews → funds → records. 1-3 business day gap between signing and keys.",
      affects: ["closing"],
    },
    {
      feature: "Foundation Risk",
      description: "Expansive clay soils make foundation inspection critical. PE inspection common ($400-$800).",
      affects: ["inspections"],
    },
    {
      feature: "MUD Tax Districts",
      description: "Municipal Utility Districts can add $0.50-$2.00+ per $100 assessed value to property taxes.",
      affects: ["taxes", "closing_costs"],
    },
    {
      feature: "Mineral Rights",
      description: "TX is an active mineral rights state. Rights can be severed from surface ownership.",
      affects: ["disclosures", "title"],
    },
  ],
};
