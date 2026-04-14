# HomeBuyer Pro — State Workflow Engine Specification
## Engineering Reference for State-Conditional Workflows
## Version 1.0 — April 2026
## Internal — Confidential

---

## 1. Architecture Principle

**Conditional steps, not separate flows.** One workflow engine with data-driven state configuration. Adding a state is a configuration task, not a development task.

The code doesn't change per state — the `StateConfig` object drives which steps are active, which documents are required, which inspections are relevant, what the default timelines are, and what disclosures must be tracked.

---

## 2. StateConfig Schema

```typescript
interface StateConfig {
  // Identity
  state_code: string;                           // "FL" | "TX" | "AZ" | "CA"
  state_name: string;
  
  // Closing structure
  closing_type: "title_company" | "escrow_company" | "attorney";
  attorney_review_required: boolean;
  attorney_review_days: number | null;
  closing_style: "wet" | "dry" | "escrow";      // wet=table funding, dry=fund after signing, escrow=sign separately
  parties_sign_together: boolean;
  signing_to_keys_gap_days: number;              // 0 for wet, 1-3 for dry/escrow
  ron_available: boolean;                        // Remote Online Notarization
  
  // Buyer protection mechanism
  buyer_protection_type: "inspection_contingency" | "option_period" | "investigation_contingency";
  
  // Option period (TX only)
  option_period: {
    enabled: boolean;
    default_days: number | null;                 // 7 for TX
    option_fee_recipient: "seller" | "escrow" | null;
    option_fee_typical_range: [number, number] | null; // [100, 500] for TX
    unrestricted_termination: boolean;           // true for TX
  };
  
  // Contingency defaults (calendar days from effective date unless noted)
  contingency_defaults: {
    inspection_days: number;                     // FL:15, TX:7(option), AZ:10, CA:17
    financing_days: number;                      // FL:30, TX:21-30, AZ:21-30, CA:21
    appraisal_days: number | null;               // FL:null(embedded), TX:null(embedded), AZ:null(embedded), CA:17
    title_days: number | null;                   // Review period after receipt
    hoa_review_days: number;                     // FL:3, TX:3, AZ:5, CA:5
    loan_application_days: number;               // FL:5, TX:3, AZ:3, CA:3
  };
  
  // Contingency removal behavior
  contingency_removal: {
    active_removal_required: boolean;            // true for CA only
    silence_means: "acceptance" | "contingency_persists";  // AZ:"acceptance", CA:"contingency_persists"
    nbp_mechanism: boolean;                      // CA only — seller can issue Notice to Buyer to Perform
    nbp_response_hours: number | null;           // 48 for CA
  };
  
  // Day counting
  day_counting: {
    type: "calendar" | "business";
    weekend_extension: boolean;                  // If deadline falls on weekend, extend to next biz day
    holidays: "federal" | "state";               // Which holiday calendar to use
  };
  
  // Standard contract
  standard_contracts: {
    name: string;
    variants: { name: string; description: string; key_difference: string }[];
    promulgated: boolean;                        // TX: true (state-mandated). Others: false
  };
  
  // Required & common inspections
  inspections: {
    type: string;                                // e.g., "general", "termite", "wind_mitigation"
    label: string;
    required_by: "law" | "insurer" | "lender" | "recommended";
    condition?: string;                          // e.g., "home_age >= 30" for 4-point
    typical_cost: [number, number];
    state_specific_form?: string;                // e.g., "FDACS 13645" for FL termite
    notes?: string;
  }[];
  
  // Required disclosures
  disclosures: {
    name: string;                                // e.g., "Transfer Disclosure Statement"
    short_name: string;                          // e.g., "TDS"
    required: boolean;
    legal_reference: string;                     // e.g., "Civ. Code §1102"
    who_provides: "seller" | "agent" | "third_party";
    delivery_deadline_days?: number;             // Days from effective date
    buyer_cancel_days?: number;                  // Days buyer can cancel after receipt
    condition?: string;                          // e.g., "pre_1978" for lead paint
    notes?: string;
  }[];
  
  // HOA requirements
  hoa: {
    governing_law: string;
    buyer_cancel_days: number;                   // FL:3, TX:3, AZ:5, CA:5
    estoppel_delivery_days: number;              // Business days for HOA to provide
    estoppel_max_cost: number | null;            // FL:$250, TX:$375, AZ:null, CA:null
    sirs_required: boolean;                      // FL only
    sirs_building_stories_threshold: number | null; // 3 for FL
    milestone_inspection_required: boolean;       // FL only
    milestone_age_threshold: number | null;       // 25 for FL (20 if coastal)
    reserve_study_interval_years: number | null;  // CA:3, FL:per SIRS, others:null
  };
  
  // Insurance
  insurance: {
    type: string;                                // e.g., "homeowners", "wind", "flood", "earthquake", "sinkhole"
    label: string;
    required_by: "law" | "lender" | "recommended" | "conditional";
    condition?: string;                          // e.g., "fema_flood_zone" or "condo"
    state_specific: boolean;
    insurer_of_last_resort?: string;             // FL:"Citizens", CA:"FAIR Plan", TX:"TWIA"
    notes?: string;
  }[];
  
  // Title insurance
  title_insurance: {
    rates_regulated: boolean;                    // FL:true(promulgated), TX:true(regulated), AZ:false, CA:false
    owner_policy_paid_by: "seller" | "buyer" | "varies_by_county" | "varies_by_region";
    regional_variations?: { region: string; paid_by: "seller" | "buyer" }[];
    policy_types?: string[];                     // CA: ["CLTA", "ALTA"]
    survey_standard: boolean;                    // TX:true, FL:false, AZ:false, CA:false
  };
  
  // EMD
  earnest_money: {
    typical_percent: [number, number];           // [1, 3] for FL
    deposit_deadline_days: number;               // Calendar or business days
    deposit_deadline_type: "calendar" | "business";
    holder: "title_company" | "escrow_company" | "broker";
    cure_period_days: number | null;             // AZ:3 business days
    liquidated_damages_cap_percent: number | null; // CA:3%
  };
  
  // Taxes & fees
  taxes: {
    transfer_tax: {
      exists: boolean;
      rate_per_thousand: number | null;          // FL:$7, CA:$1.10 (county base)
      paid_by: "seller" | "buyer" | "split";
      city_additional: boolean;                  // CA:true (varies by city)
      notes?: string;
    };
    mortgage_tax: {
      exists: boolean;
      rate_per_thousand: number | null;          // FL:$5.50 (doc stamps + intangible)
      paid_by: "seller" | "buyer";
    };
    property_tax_year: "calendar" | "fiscal";    // FL/TX:calendar, AZ/CA:fiscal
    property_tax_avg_rate: [number, number];     // Range as percentage [0.9, 1.2]
    homestead_exemption: {
      exists: boolean;
      reduces_taxes: boolean;                    // FL:true, TX:true, AZ:false, CA:false
      amount: string | null;                     // FL:"$50K", TX:"$100K school"
      filing_deadline?: string;
      assessment_cap_percent?: number | null;    // FL:3%, TX:null, CA:2%, AZ:5%
      portability: boolean;
    };
    supplemental_tax: boolean;                   // CA only
    special_districts: {
      type: string;                              // FL:"CDD", TX:"MUD", CA:"Mello-Roos"
      label: string;
      exists: boolean;
      typical_annual_range: [number, number] | null;
    }[];
  };
  
  // Community property
  community_property: boolean;
  spousal_consent_required: boolean;
  
  // Non-resident withholding
  non_resident_withholding: {
    state_withholding: boolean;
    rate_percent: number | null;                 // AZ:2%, CA:3.33%
  };
  
  // Post-close requirements
  post_close: {
    item: string;
    description: string;
    deadline?: string;
    priority: "high" | "medium" | "low";
  }[];
  
  // Unique state features (catch-all for anything that doesn't fit above)
  unique_features: {
    feature: string;
    description: string;
    affects: string[];                           // Which workflow components this affects
  }[];
}
```

---

## 3. What Needs to Change in the Current Codebase

### 3.1 New Table: `state_configs`

Store StateConfig objects in the database (or as JSON config files) so they can be updated without code deploys.

```sql
create table state_configs (
  state_code text primary key,
  state_name text not null,
  config jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 3.2 Deal Model Changes

| Field | Change | Reason |
|-------|--------|--------|
| `state` | **Add** (text, required) | Drive all conditional logic |
| `property_type` | **Add** (`single_family \| condo \| townhome \| new_construction \| vacant_land`) | Drives inspection/insurance/HOA conditions |
| `loan_program` | **Add** (`conventional \| fha \| va \| usda \| jumbo \| cash`) | Drives inspection/appraisal/timeline conditions |
| `property_in_hoa` | **Add** (boolean) | Enables HOA workflow track |
| `property_in_special_district` | **Add** (boolean) | CDD (FL) / MUD (TX) / Mello-Roos (CA) |
| `special_district_annual_cost` | **Add** (numeric, nullable) | For cash-to-close and monthly cost calculations |

### 3.3 OfferDetails Model Changes

| Field | Change | Reason |
|-------|--------|--------|
| `option_period_days` | **Add** (integer, nullable) | TX option period |
| `option_fee` | **Add** (numeric, nullable) | TX option fee |
| `option_fee_delivered` | **Add** (boolean, default false) | TX tracking |
| `option_fee_delivery_date` | **Add** (date, nullable) | TX tracking |
| `appraisal_contingency_days` | **Add** (integer, nullable) | CA has standalone appraisal contingency |
| `investigation_contingency_days` | **Add** (integer, nullable) | CA investigation contingency (broader than inspection) |
| `contract_type` | **Add** (text, nullable) | FL: "standard" vs "as_is". TX: TREC form number |
| `seller_repair_cap_percent` | **Add** (numeric, nullable) | FL Standard: default 1.5% |

### 3.4 Deadline Types — Expand Enum

Current: `earnest-money | inspection | appraisal | financing | disclosure | closing | custom`

**Add:**
- `option-period` — TX option period expiry
- `option-fee-delivery` — TX option fee delivery
- `investigation` — CA investigation contingency (broader than inspection)
- `title-commitment-delivery` — Seller must deliver title commitment
- `title-review` — Buyer review period after receiving title commitment
- `hoa-doc-review` — HOA document cancellation right window
- `loan-application` — Deadline to submit loan application
- `contingency-removal` — CA: buyer must affirmatively remove
- `nbp-response` — CA: buyer response to Notice to Buyer to Perform
- `insurance-binder` — Insurance must be bound before closing
- `survey` — TX: survey delivery deadline
- `seller-disclosure-delivery` — Seller must deliver disclosures

### 3.5 Document Types — Expand Enum

Current: `purchase_contract | loan_estimate | closing_disclosure | inspection_report | appraisal | title_report | disclosure | insurance_binder | pre_approval | proof_of_funds | other`

**Add:**
- `termite_wdo_report` — FL form FDACS 13645, CA Section 1/2
- `wind_mitigation` — FL OIR-B1-1802
- `four_point_inspection` — FL insurer requirement
- `seller_disclosure` — TDS (CA), TREC OP-H (TX), SPDS (AZ), FR/Bar form (FL)
- `natural_hazard_disclosure` — CA NHD report
- `hoa_disclosure_package` — Bylaws, CC&Rs, budget, reserve study, estoppel
- `hoa_estoppel` — FL/TX/AZ estoppel or resale certificate
- `hoa_reserve_study` — Reserve study / SIRS report
- `mello_roos_disclosure` — CA specific
- `mud_disclosure` — TX specific
- `cdd_disclosure` — FL specific
- `affidavit_of_disclosure` — AZ (unincorporated areas)
- `survey` — TX standard
- `title_commitment` — Preliminary title report / title commitment
- `lead_paint_disclosure` — Federal (pre-1978)
- `foundation_report` — TX (PE inspection)
- `pool_inspection` — AZ/FL
- `roof_inspection` — AZ/FL/TX
- `sewer_lateral` — CA (city-specific)

### 3.6 InsuranceInfo Model Changes

| Field | Change | Reason |
|-------|--------|--------|
| `insurance_type` | **Add** (`homeowners \| wind \| flood \| earthquake \| sinkhole \| title_owner \| title_lender \| pmi \| mip`) | Different insurance types per state |
| `flood_zone` | **Add** (text, nullable) | FEMA zone code |
| `flood_insurance_required` | **Add** (boolean) | Computed from flood_zone + loan type |
| `wind_separate_policy` | **Add** (boolean) | FL: often separate from HO-3 |
| `hurricane_deductible_percent` | **Add** (numeric, nullable) | FL: 2%, 5%, or 10% |
| `wildfire_zone` | **Add** (boolean, nullable) | CA: fire hazard severity zone |
| `fair_plan` | **Add** (boolean, nullable) | CA: using FAIR Plan insurer of last resort |

### 3.7 New: Contingency Tracker

The current system tracks deadlines. For CA specifically (and to a lesser extent all states), we need a more granular contingency state machine:

```typescript
interface ContingencyTracker {
  id: string;
  deal_id: string;
  contingency_type: "inspection" | "investigation" | "financing" | "appraisal" | "title" | "hoa_review" | "option_period";
  status: "active" | "expired_not_removed" | "nbp_issued" | "removed" | "cancelled" | "waived";
  start_date: string;          // Effective date
  expiry_date: string;         // Computed from start_date + days
  removal_date: string | null; // When buyer submitted CR (CA) or contingency was satisfied
  nbp_date: string | null;     // CA: when seller issued NBP
  nbp_response_deadline: string | null; // CA: NBP + 48 hours
  days_allocated: number;
  notes: string | null;
}
```

### 3.8 Context Engine Update

`lib/ai/context-engine.ts` must inject state context into the AI copilot:

```typescript
// In assembleContext():
if (deal.state) {
  const stateConfig = await getStateConfig(deal.state);
  contextBlocks.push(formatStateContext(stateConfig, deal));
}
```

The state context should include:
- Relevant disclosure requirements
- Active contingency deadlines with state-specific behavior
- Insurance requirements based on state + property type
- Tax implications (transfer tax, homestead, special districts)
- State-specific warnings (FL: insurance crisis, CA: supplemental tax, TX: option period mechanics)

### 3.9 Deadline Generator Update

`lib/computed.ts → computeDeadlinesFromOffer()` must become state-aware:

```typescript
function computeDeadlinesFromOffer(
  offer: OfferDetails,
  deal: Deal,
  stateConfig: StateConfig
): Deadline[] {
  const deadlines: Deadline[] = [];
  const effectiveDate = deal.contract_acceptance_date;
  
  // EMD deposit
  deadlines.push({
    name: "Earnest Money Deposit Due",
    type: "earnest-money",
    due_date: addDays(effectiveDate, stateConfig.earnest_money.deposit_deadline_days,
                      stateConfig.earnest_money.deposit_deadline_type),
  });
  
  // TX option period
  if (stateConfig.option_period.enabled && offer.option_period_days) {
    deadlines.push({
      name: "Option Period Expires",
      type: "option-period",
      due_date: addDays(effectiveDate, offer.option_period_days, "calendar"),
    });
    deadlines.push({
      name: "Option Fee Delivery",
      type: "option-fee-delivery",
      due_date: addDays(effectiveDate, 3, "calendar"),
    });
  }
  
  // Inspection / Investigation
  const inspectionDays = offer.contingency_inspection_days 
    ?? stateConfig.contingency_defaults.inspection_days;
  deadlines.push({
    name: stateConfig.buyer_protection_type === "investigation_contingency"
      ? "Investigation Contingency Expires" 
      : "Inspection Period Expires",
    type: stateConfig.buyer_protection_type === "investigation_contingency" 
      ? "investigation" : "inspection",
    due_date: addDays(effectiveDate, inspectionDays, stateConfig.day_counting.type),
  });
  
  // Financing
  // Appraisal (CA only as standalone)
  // Title
  // HOA doc review
  // Loan application
  // Insurance binder
  // Closing
  // ... etc. (each driven by stateConfig)
  
  return deadlines;
}
```

---

## 4. Implementation Phases

### Phase 1: Foundation (Sprint 1-2)

- [ ] Add `state` field to `deals` table + UI for state selection at deal creation
- [ ] Create `state_configs` table with FL, TX, AZ, CA JSON configs
- [ ] Add `property_type`, `loan_program`, `property_in_hoa` to deals
- [ ] Expand deadline type enum
- [ ] Make `computeDeadlinesFromOffer()` state-aware
- [ ] Add state context injection to AI copilot context engine

### Phase 2: TX Option Period (Sprint 2-3)

- [ ] Add `option_period_days`, `option_fee`, `option_fee_delivered` to offer_details
- [ ] Add `option-period` and `option-fee-delivery` deadline types
- [ ] ContingencyCountdown component: show option period differently than inspection
- [ ] EscrowAlerts: option period expiry warning

### Phase 3: CA Contingency Removal (Sprint 3-4)

- [ ] Create `contingency_tracker` table (or add columns to deadlines)
- [ ] Implement contingency state machine: active → expired_not_removed → nbp_issued → removed/cancelled
- [ ] Add CR (Contingency Removal) tracking in UI
- [ ] Add NBP (Notice to Buyer to Perform) tracking with 48-hour response deadline

### Phase 4: State-Specific Disclosures (Sprint 4-5)

- [ ] Expand document type enum with state-specific types
- [ ] Build disclosure checklist component that adapts per state
- [ ] StageEssentials component: show state-specific required documents
- [ ] Document AI: add extraction schemas for TDS (CA), TREC OP-H (TX), SPDS (AZ)

### Phase 5: State-Specific Insurance (Sprint 5-6)

- [ ] Add insurance type variants to InsuranceInfo
- [ ] Insurance checklist adapts to state + property type + loan program
- [ ] FL: wind mitigation, 4-point, sinkhole, Citizens
- [ ] CA: earthquake (CEA), wildfire (FAIR Plan)
- [ ] TX: TWIA (coastal wind/hail)
- [ ] All: flood zone detection and insurance requirement flagging

### Phase 6: Taxes & Closing Costs (Sprint 6-7)

- [ ] Transfer tax calculation per state (with city-level for CA)
- [ ] Mortgage tax calculation (FL only)
- [ ] Property tax proration (calendar vs fiscal year)
- [ ] Special district cost tracking (CDD/MUD/Mello-Roos)
- [ ] Homestead exemption filing reminders in post-close
- [ ] CA supplemental tax warning

---

## 5. Immediate StateConfig Data — FL, TX, AZ, CA

### Florida

```json
{
  "state_code": "FL",
  "closing_type": "title_company",
  "attorney_review_required": false,
  "closing_style": "wet",
  "buyer_protection_type": "inspection_contingency",
  "option_period": { "enabled": false },
  "contingency_defaults": {
    "inspection_days": 15,
    "financing_days": 30,
    "appraisal_days": null,
    "title_days": 5,
    "hoa_review_days": 3,
    "loan_application_days": 5
  },
  "contingency_removal": {
    "active_removal_required": false,
    "silence_means": "acceptance",
    "nbp_mechanism": false
  }
}
```

### Texas

```json
{
  "state_code": "TX",
  "closing_type": "title_company",
  "attorney_review_required": false,
  "closing_style": "dry",
  "buyer_protection_type": "option_period",
  "option_period": {
    "enabled": true,
    "default_days": 7,
    "option_fee_recipient": "seller",
    "option_fee_typical_range": [100, 500],
    "unrestricted_termination": true
  },
  "contingency_defaults": {
    "inspection_days": 7,
    "financing_days": 25,
    "appraisal_days": null,
    "title_days": null,
    "hoa_review_days": 3,
    "loan_application_days": 3
  },
  "contingency_removal": {
    "active_removal_required": false,
    "silence_means": "acceptance",
    "nbp_mechanism": false
  }
}
```

### Arizona

```json
{
  "state_code": "AZ",
  "closing_type": "title_company",
  "attorney_review_required": false,
  "closing_style": "escrow",
  "buyer_protection_type": "inspection_contingency",
  "option_period": { "enabled": false },
  "contingency_defaults": {
    "inspection_days": 10,
    "financing_days": 25,
    "appraisal_days": null,
    "title_days": 5,
    "hoa_review_days": 5,
    "loan_application_days": 3
  },
  "contingency_removal": {
    "active_removal_required": false,
    "silence_means": "acceptance",
    "nbp_mechanism": false
  }
}
```

### California

```json
{
  "state_code": "CA",
  "closing_type": "escrow_company",
  "attorney_review_required": false,
  "closing_style": "escrow",
  "buyer_protection_type": "investigation_contingency",
  "option_period": { "enabled": false },
  "contingency_defaults": {
    "inspection_days": 17,
    "financing_days": 21,
    "appraisal_days": 17,
    "title_days": 17,
    "hoa_review_days": 5,
    "loan_application_days": 3
  },
  "contingency_removal": {
    "active_removal_required": true,
    "silence_means": "contingency_persists",
    "nbp_mechanism": true,
    "nbp_response_hours": 48
  }
}
```

---

## 6. State Clustering for Future Expansion

| Cluster | States | Shared Characteristics | Effort After First State |
|---------|--------|------------------------|--------------------------|
| **Sun Belt Title** | FL, TX, AZ, NV, NM | Title company closings, similar timelines, growing HOA density | ~60% of first state |
| **West Coast Escrow** | CA, OR, WA, HI | Escrow closings, extensive disclosures, higher prices | ~60% of CA |
| **Midwest Standard** | OH, IN, MI, MN, WI, MO, IA | Title company, straightforward disclosures, short timelines | ~40% of TX |
| **Southeast Attorney** | GA, NC, SC, VA | Attorney closings, attorney review phase gate needed | New workflow branch |
| **Northeast Attorney** | MA, NH, VT, CT, NY, NJ | Attorney closings, complex disclosures, unique contract flows | Highest per-state cost |

---

*This spec should be updated as state-specific features are implemented and validated with real agents in each state.*
