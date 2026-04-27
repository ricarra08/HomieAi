import type { StateConfig } from "./types";

export const FLORIDA_CONFIG: StateConfig = {
  state_code: "FL",
  state_name: "Florida",

  closing: {
    type: "title_company",
    attorney_review_required: false,
    attorney_review_days: null,
    style: "wet",
    parties_sign_together: true,
    signing_to_keys_gap_days: 0,
    ron_available: true,
    typical_close_days_financed: [30, 45],
    typical_close_days_cash: [14, 21],
  },

  buyer_protection: {
    type: "inspection_contingency",
    label: "Inspection Contingency",
    description: "During the inspection period, buyer inspects and either negotiates repairs or cancels.",
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
    inspection_days: 15,
    financing_days: 30,
    appraisal_days: null, // embedded in financing
    title_days: 5,        // 5 days review after receipt
    hoa_review_days: 3,
    loan_application_days: 5,
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
    name: "FR/Bar",
    variants: [
      {
        name: "FR/Bar Standard",
        description: "Full contingency contract with seller repair obligations",
        key_difference: "Seller must repair up to 1.5% of purchase price",
      },
      {
        name: "FR/Bar As-Is",
        description: "Buyer inspects but only remedy is to cancel (no repairs). 70%+ of FL market.",
        key_difference: "No seller repair obligation — buyer's only remedy is to cancel during inspection period",
      },
      {
        name: "FR/Bar Condo Rider",
        description: "Mandatory addendum for condo purchases",
        key_difference: "Addresses SIRS, milestone inspections, and estoppel requirements",
      },
      {
        name: "FR/Bar HOA Rider",
        description: "Addendum for HOA properties",
        key_difference: "HOA document review and cancellation rights",
      },
    ],
    promulgated: false, // industry-standard, not state-mandated
  },

  inspections: [
    {
      type: "general",
      label: "General Home Inspection",
      required_by: "recommended",
      typical_cost: [300, 600],
    },
    {
      type: "wind_mitigation",
      label: "Wind Mitigation Inspection",
      required_by: "insurer",
      typical_cost: [75, 150],
      state_specific_form: "OIR-B1-1802",
      notes: "Required for insurance discounts (20-50% savings). Valid 5 years.",
    },
    {
      type: "four_point",
      label: "4-Point Inspection (Roof, Electrical, Plumbing, HVAC)",
      required_by: "insurer",
      condition: "home_age >= 30",
      typical_cost: [100, 200],
      notes: "Required by insurers for homes 30+ years (some require at 20+).",
    },
    {
      type: "termite_wdo",
      label: "Termite / WDO Report",
      required_by: "lender",
      typical_cost: [75, 150],
      state_specific_form: "FDACS 13645",
      notes: "Lenders often require for FHA/VA loans.",
    },
    {
      type: "roof",
      label: "Roof Inspection",
      required_by: "recommended",
      typical_cost: [150, 400],
      notes: "Common due to hurricane damage history.",
    },
    {
      type: "pool",
      label: "Pool Inspection",
      required_by: "recommended",
      condition: "has_pool",
      typical_cost: [150, 350],
      notes: "FL has high pool density.",
    },
    {
      type: "radon",
      label: "Radon Testing",
      required_by: "recommended",
      typical_cost: [100, 250],
      notes: "Disclosure required (§404.056). Testing recommended in central FL.",
    },
    {
      type: "septic",
      label: "Septic Inspection",
      required_by: "lender",
      condition: "has_septic",
      typical_cost: [200, 500],
      notes: "Required by lenders when property has septic system.",
    },
  ],

  disclosures: [
    {
      name: "Seller Property Disclosure",
      short_name: "SPD",
      required: false, // not statutory in FL (Johnson v. Davis common law)
      legal_reference: "Johnson v. Davis (1985)",
      who_provides: "seller",
      notes: "Not statutory but FR/Bar form used in practice. Seller has common law duty to disclose known material defects.",
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
      name: "Radon Disclosure",
      short_name: "Radon",
      required: true,
      legal_reference: "FL §404.056(5)",
      who_provides: "seller",
      notes: "Mandatory contract language about radon gas.",
    },
    {
      name: "HOA Disclosure Package",
      short_name: "HOA Docs",
      required: true,
      legal_reference: "FL §720.401 / §718.503",
      who_provides: "seller",
      buyer_cancel_days: 3,
      condition: "property_in_hoa",
      notes: "Bylaws, CC&Rs, budget, financials. 3-day cancellation right after receipt.",
    },
    {
      name: "CDD Disclosure",
      short_name: "CDD",
      required: true,
      legal_reference: "FL Chapter 190",
      who_provides: "seller",
      condition: "property_in_special_district",
      notes: "Community Development District — appears on property tax bill ($1,000-$4,000+/yr).",
    },
    {
      name: "Coastal Construction Control Line Disclosure",
      short_name: "CCCL",
      required: true,
      legal_reference: "FL §161.57",
      who_provides: "seller",
      condition: "coastal_property",
      notes: "Required for properties near the coastline.",
    },
    {
      name: "Energy Efficiency Disclosure",
      short_name: "Energy",
      required: true,
      legal_reference: "FL §553.996",
      who_provides: "seller",
    },
  ],

  hoa: {
    governing_law: "FL §718 (Condo), §720 (HOA)",
    buyer_cancel_days: 3,
    estoppel_delivery_days: 10,
    estoppel_max_cost: 250, // $500 for rush
    sirs_required: true,
    sirs_building_stories_threshold: 3,
    milestone_inspection_required: true,
    milestone_age_threshold: 25, // 20 if within 3 miles of coast
    reserve_study_interval_years: null, // per SIRS requirements
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
      label: "Wind / Hurricane Insurance",
      required_by: "lender",
      state_specific: true,
      insurer_of_last_resort: "Citizens Property Insurance",
      notes: "Often excluded from standard HO-3. Separate policy or high deductible (2-10% of dwelling). FL insurance market in crisis.",
    },
    {
      type: "flood",
      label: "Flood Insurance (NFIP)",
      required_by: "conditional",
      condition: "fema_flood_zone",
      state_specific: false,
      notes: "Very common in FL. $500-$3,000+/yr.",
    },
    {
      type: "sinkhole",
      label: "Sinkhole Coverage",
      required_by: "recommended",
      state_specific: true,
      notes: "Insurers must offer. Optional add-on. 10-30% surcharge.",
    },
  ],

  title_insurance: {
    rates_regulated: true, // promulgated (state-set)
    owner_policy_paid_by: "varies_by_county",
    regional_variations: [
      { region: "Most FL counties", paid_by: "seller" },
      { region: "Miami-Dade", paid_by: "buyer" },
      { region: "Broward", paid_by: "buyer" },
      { region: "Sarasota", paid_by: "buyer" },
    ],
    survey_standard: false,
  },

  earnest_money: {
    typical_percent: [1, 3],
    deposit_deadline_days: 3,
    deposit_deadline_type: "calendar",
    holder: "title_company",
    cure_period_days: null,
    liquidated_damages_cap_percent: null,
  },

  taxes: {
    transfer_tax: {
      exists: true,
      rate_per_thousand: 7.0,
      paid_by: "seller",
      city_additional: false,
      notes: "Miami-Dade: $10.50/K.",
    },
    mortgage_tax: {
      exists: true,
      rate_per_thousand: 5.5, // doc stamps $3.50 + intangible $2.00
      paid_by: "buyer",
    },
    property_tax_year: "calendar",
    property_tax_avg_rate: [0.9, 1.2],
    homestead_exemption: {
      exists: true,
      reduces_taxes: true,
      amount: "$50,000 off assessed value",
      filing_deadline: "March 1",
      assessment_cap_percent: 3, // Save Our Homes
      portability: true,
    },
    supplemental_tax: false,
    special_districts: [
      {
        type: "CDD",
        label: "Community Development District",
        exists: true,
        typical_annual_range: [1000, 4000],
      },
    ],
  },

  community_property: false,

  non_resident_withholding: {
    state_withholding: false,
    rate_percent: null,
  },

  post_close: [
    {
      item: "File Homestead Exemption",
      description: "File with County Property Appraiser by March 1. Saves $50K off assessed value + SOH 3% annual cap.",
      deadline: "March 1 (following purchase year)",
      priority: "high",
    },
    {
      item: "Wind Mitigation Inspection",
      description: "Schedule wind mitigation inspection for 20-50% insurance savings. Valid 5 years.",
      priority: "high",
    },
    {
      item: "SOH Portability Transfer",
      description: "If transferring from another FL homestead, file portability within 3 years.",
      priority: "medium",
    },
  ],

  unique_features: [
    {
      feature: "As-Is Contract Dominance",
      description: "70%+ of FL market uses FR/Bar As-Is contract. No seller repair obligation — buyer's only remedy is to cancel.",
      affects: ["offer", "inspection", "contract_extraction"],
    },
    {
      feature: "Wind Mitigation / 4-Point Inspections",
      description: "FL-specific insurer requirements. Wind mitigation (OIR-B1-1802) saves 20-50% on premiums. 4-point required for homes 30+ years.",
      affects: ["inspections", "insurance"],
    },
    {
      feature: "SIRS & Milestone Inspections",
      description: "Post-Surfside: buildings 3+ stories require Structural Integrity Reserve Study. Milestone inspection at 25 years (20 if coastal).",
      affects: ["hoa", "condo"],
    },
    {
      feature: "Insurance Crisis",
      description: "FL homeowner's insurance market in crisis. Citizens is insurer of last resort. Premiums $2,500-$6,000+/yr.",
      affects: ["insurance", "closing_costs"],
    },
    {
      feature: "Mortgage Tax (Doc Stamps + Intangible)",
      description: "FL charges $5.50/K on mortgage ($3.50 doc stamps + $2.00 intangible). Unique among target states.",
      affects: ["closing_costs"],
    },
    {
      feature: "Wet Closing",
      description: "FL uses table funding — sign at closing table, fund same day, keys same day. Different from dry/escrow states.",
      affects: ["closing"],
    },
  ],
};
