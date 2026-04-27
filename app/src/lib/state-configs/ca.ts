import type { StateConfig } from "./types";

export const CALIFORNIA_CONFIG: StateConfig = {
  state_code: "CA",
  state_name: "California",

  closing: {
    type: "escrow_company",
    attorney_review_required: false,
    attorney_review_days: null,
    style: "escrow",
    parties_sign_together: false,
    signing_to_keys_gap_days: 2,
    ron_available: true, // effective Jan 1, 2024 (AB 1093), limited
    typical_close_days_financed: [21, 45],
    typical_close_days_cash: [14, 21],
  },

  buyer_protection: {
    type: "investigation_contingency",
    label: "Investigation Contingency",
    description: "Broadest protection — covers inspections, disclosures, neighborhood, anything. Active removal required via CR form.",
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
    inspection_days: 17,
    financing_days: 21,
    appraisal_days: 17,  // CA has standalone appraisal contingency
    title_days: 17,
    hoa_review_days: 5,
    loan_application_days: 3,
  },

  contingency_removal: {
    active_removal_required: true,
    silence_means: "contingency_persists",
    nbp_mechanism: true,
    nbp_response_hours: 48,
  },

  day_counting: {
    type: "calendar",
    weekend_extension: true,
  },

  standard_contracts: {
    name: "C.A.R.",
    variants: [
      {
        name: "C.A.R. RPA (Residential Purchase Agreement)",
        description: "Single dominant form. Substantially revised late 2023.",
        key_difference: "Includes active contingency removal mechanism. 30-50+ forms/disclosures per transaction.",
      },
    ],
    promulgated: false,
  },

  inspections: [
    {
      type: "general",
      label: "General Home Inspection",
      required_by: "recommended",
      typical_cost: [400, 800],
    },
    {
      type: "termite_wdo",
      label: "Termite Report (Section 1 / Section 2)",
      required_by: "recommended",
      typical_cost: [100, 250],
      notes: "CA-specific Section 1 (active infestation) vs Section 2 (conditions leading to infestation) system.",
    },
    {
      type: "sewer_lateral",
      label: "Sewer Lateral Inspection",
      required_by: "conditional",
      condition: "city_requires",
      typical_cost: [200, 500],
      notes: "City-specific requirements (Berkeley, Oakland, SF). Point-of-sale requirement.",
    },
    {
      type: "roof",
      label: "Roof Inspection",
      required_by: "recommended",
      typical_cost: [200, 500],
    },
    {
      type: "natural_hazard",
      label: "Natural Hazard Zone Assessment",
      required_by: "law",
      typical_cost: [50, 100],
      notes: "Part of required NHD report. Covers earthquake, flood, fire, landslide, dam inundation zones.",
    },
    {
      type: "pool",
      label: "Pool Inspection",
      required_by: "recommended",
      condition: "has_pool",
      typical_cost: [200, 400],
    },
  ],

  disclosures: [
    {
      name: "Transfer Disclosure Statement",
      short_name: "TDS",
      required: true,
      legal_reference: "CA Civ. Code §1102 et seq.",
      who_provides: "seller",
      notes: "3-part disclosure: seller, listing agent, buyer's agent. Statutory requirement.",
    },
    {
      name: "Agent Visual Inspection Disclosure",
      short_name: "AVID",
      required: true,
      legal_reference: "CA Civ. Code §2079",
      who_provides: "agent",
      notes: "CA-specific — agents must visually inspect and disclose findings.",
    },
    {
      name: "Natural Hazard Disclosure",
      short_name: "NHD",
      required: true,
      legal_reference: "CA Civ. Code §1103",
      who_provides: "third_party",
      notes: "Extensive report covering earthquake, flood, fire, landslide, dam inundation zones.",
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
      name: "Mello-Roos / CFD Disclosure",
      short_name: "Mello-Roos",
      required: true,
      legal_reference: "CA Gov. Code §53341.5",
      who_provides: "seller",
      condition: "property_in_special_district",
      notes: "Community Facilities District — $2,000-$10,000+/yr on tax bill.",
    },
    {
      name: "HOA Disclosure Package",
      short_name: "HOA Docs",
      required: true,
      legal_reference: "CA Civ. Code §4525 (Davis-Stirling Act)",
      who_provides: "seller",
      buyer_cancel_days: 5,
      condition: "property_in_hoa",
    },
    {
      name: "Energy Conservation Retrofit Disclosure",
      short_name: "Energy",
      required: true,
      legal_reference: "CA Civ. Code §1101.3",
      who_provides: "seller",
    },
  ],

  hoa: {
    governing_law: "Davis-Stirling Act (CA Civ. Code §4000-6150)",
    buyer_cancel_days: 5,
    estoppel_delivery_days: 10,
    estoppel_max_cost: null, // limited by Civ. Code §4530(b), typically $200-$600
    sirs_required: false,
    sirs_building_stories_threshold: null,
    milestone_inspection_required: false,
    milestone_age_threshold: null,
    reserve_study_interval_years: 3, // Civ. Code §5550
  },

  insurance_types: [
    {
      type: "homeowners",
      label: "Homeowner's Insurance (HO-3)",
      required_by: "lender",
      state_specific: false,
      notes: "$1,000-$3,500/yr (non-wildfire areas).",
    },
    {
      type: "earthquake",
      label: "Earthquake Insurance (CEA)",
      required_by: "recommended",
      state_specific: true,
      notes: "California Earthquake Authority. Optional. 10-25% deductible. $800-$5,000+/yr.",
    },
    {
      type: "wildfire",
      label: "Wildfire Insurance",
      required_by: "conditional",
      condition: "wildfire_zone",
      state_specific: true,
      insurer_of_last_resort: "FAIR Plan",
      notes: "Major crisis in fire hazard zones. FAIR Plan as last resort. 2-5x normal premiums.",
    },
    {
      type: "flood",
      label: "Flood Insurance (NFIP)",
      required_by: "conditional",
      condition: "fema_flood_zone",
      state_specific: false,
      notes: "Required in Special Flood Hazard Areas.",
    },
  ],

  title_insurance: {
    rates_regulated: false,
    owner_policy_paid_by: "varies_by_region",
    regional_variations: [
      { region: "Northern California", paid_by: "buyer" },
      { region: "Southern California", paid_by: "seller" },
    ],
    policy_types: ["CLTA (standard)", "ALTA (extended)"],
    survey_standard: false,
  },

  earnest_money: {
    typical_percent: [1, 3],
    deposit_deadline_days: 3,
    deposit_deadline_type: "business",
    holder: "escrow_company",
    cure_period_days: null,
    liquidated_damages_cap_percent: 3,
  },

  taxes: {
    transfer_tax: {
      exists: true,
      rate_per_thousand: 1.1,
      paid_by: "split", // varies — negotiable, NorCal vs SoCal customs differ
      city_additional: true,
      notes: "County base $1.10/K. City varies wildly: LA $4.50/K, SF up to $30/K. LA Measure ULA 'mansion tax' adds 4% above $5M.",
    },
    mortgage_tax: {
      exists: false,
      rate_per_thousand: null,
      paid_by: "buyer",
    },
    property_tax_year: "fiscal",
    property_tax_avg_rate: [1.1, 1.4],
    homestead_exemption: {
      exists: true,
      reduces_taxes: false, // asset protection only
      amount: "$300,000-$600,000 asset protection",
      assessment_cap_percent: 2, // Prop 13
      portability: false,
    },
    supplemental_tax: true, // CA-specific — reassessment triggers supplemental bill 6-12 months later
    special_districts: [
      {
        type: "Mello-Roos",
        label: "Mello-Roos / Community Facilities District",
        exists: true,
        typical_annual_range: [2000, 10000],
      },
    ],
  },

  community_property: true,

  non_resident_withholding: {
    state_withholding: true,
    rate_percent: 3.33,
  },

  post_close: [
    {
      item: "Supplemental Property Tax Bill",
      description: "Expect a supplemental tax bill in 6-12 months due to Prop 13 reassessment. This catches many buyers off guard.",
      deadline: "6-12 months after close",
      priority: "high",
    },
    {
      item: "Defensible Space Compliance",
      description: "Properties in wildfire zones must maintain defensible space per PRC §4291.",
      priority: "medium",
    },
  ],

  unique_features: [
    {
      feature: "Active Contingency Removal",
      description: "Buyer must submit CR form to remove contingencies. Silence = contingency persists. Seller can issue NBP with 48-hour deadline. Fundamentally different from all other states.",
      affects: ["contingencies", "deadlines", "escrow"],
    },
    {
      feature: "Notice to Buyer to Perform (NBP)",
      description: "Seller's tool when contingency period expires and buyer hasn't removed. Gives buyer 48 hours to remove, cancel, or do nothing (seller gains right to cancel).",
      affects: ["contingencies", "deadlines"],
    },
    {
      feature: "Standalone Appraisal Contingency",
      description: "CA has appraisal as a separate contingency (17 days) — not embedded in financing like FL/TX/AZ.",
      affects: ["deadlines", "offer"],
    },
    {
      feature: "Volume of Disclosures",
      description: "40-80+ pages of disclosures per transaction. TDS (3-part), AVID, NHD, Mello-Roos, and dozens more.",
      affects: ["disclosures", "documents"],
    },
    {
      feature: "Supplemental Property Tax",
      description: "Prop 13 reassessment triggers a supplemental tax bill 6-12 months after purchase. CA-specific surprise for buyers.",
      affects: ["taxes", "post_close"],
    },
    {
      feature: "City-Level Transfer Tax Variation",
      description: "Transfer tax varies wildly by city — from $1.10/K county base to $30/K in SF. LA Measure ULA adds 4% above $5M.",
      affects: ["closing_costs"],
    },
    {
      feature: "Wildfire Insurance Crisis",
      description: "Properties in fire hazard zones face 2-5x normal premiums or FAIR Plan as last resort.",
      affects: ["insurance"],
    },
  ],
};
