# Florida (FL) Real Estate Transaction Workflow
## Product + Engineering Reference
## Version 1.0 — April 2026
## Internal — Confidential

---

## 1. Transaction Timeline

Florida financed transactions typically close in **30-45 days**; cash deals close in **14-21 days**. All deadlines use **calendar days** with no weekend or holiday extensions.

### Standard Financed Timeline (Acceptance to Close)

| Day | Milestone | Notes |
|-----|-----------|-------|
| 0 | Effective date (last party signs/initials) | Contract is binding |
| 0-3 | EMD deposit deadline | **3 calendar days** from effective date |
| 0-5 | Loan application deadline | Buyer must apply within 5 days |
| 1-15 | **Inspection period** | 15 calendar days; buyer orders all inspections |
| 1-15 | Wind mitigation inspection (OIR-B1-1802) | Critical for insurance discounts |
| 1-15 | 4-point inspection | Required for homes 30+ years (some insurers: 20+) |
| 1-15 | WDO/termite inspection | Standard practice during inspection window |
| 1-15 | Radon testing | Disclosure required under FL §404.056 |
| ~15 | Inspection contingency expires | Buyer must cancel or proceed; no repair negotiation on As-Is |
| Receipt + 3 | HOA/Condo doc review deadline | 3 calendar days from buyer's receipt of docs |
| ~20-25 | Title commitment delivered | Must be delivered 15 days before closing |
| Delivery + 5 | Title review period expires | 5 days to review and raise objections |
| ~25-30 | Insurance binder secured | HO-3 + wind + flood as needed |
| 0-30 | **Financing contingency expires** | 30 calendar days from effective date |
| ~30-35 | Clear to close | Lender issues CTC |
| ~35-45 | **Closing day** | Wet closing — funds and keys same day |

### Cash Transaction Timeline

| Day | Milestone | Notes |
|-----|-----------|-------|
| 0 | Effective date | |
| 0-3 | EMD deposit | |
| 1-15 | Inspection period | Same as financed |
| ~7-10 | Title commitment delivered | Faster without lender requirements |
| ~14-21 | **Closing day** | |

---

## 2. Contract Types and Key Fields

### FR/Bar Standard Contract
The jointly developed Florida Realtors/Florida Bar Residential Contract for Sale and Purchase. Used in roughly 30% of transactions.

**Key mechanic:** Seller is obligated to repair items up to **1.5% of purchase price**. If repairs exceed 1.5%, buyer can cancel or accept the property with seller contributing 1.5%.

### FR/Bar As-Is Contract
The dominant contract form, used in **70%+ of Florida transactions**.

**Key mechanic:** Buyer accepts property in its current condition. Buyer's **only remedy** during inspection is to cancel the contract entirely. No repair requests or negotiations.

### Key Fields to Extract

| Field | Description | Extraction Priority |
|-------|-------------|-------------------|
| Purchase price | Total agreed price | Critical |
| Effective date | Date last party signs/initials | Critical |
| Closing date | Contractual closing deadline | Critical |
| EMD amount | Typically 1-3% of price | Critical |
| EMD escrow agent | Title company name and address | Critical |
| Contract type | Standard vs. As-Is | Critical |
| Inspection period days | Default 15 calendar days | Critical |
| Financing contingency days | Default 30 calendar days | Critical |
| Loan application deadline | Default 5 days | High |
| Title evidence deadline | Default 15 days before closing | High |
| Title review period | Default 5 days after delivery | High |
| HOA/Condo review period | Default 3 days from receipt | High |
| Repair limit (Standard only) | Default 1.5% of price | High |
| Property address and legal description | Full legal + parcel ID | Critical |
| Buyer/seller names | All parties | Critical |
| Closing agent / title company | Who handles closing | High |
| Special clauses / addenda | Custom terms, rider references | Medium |
| CDD disclosure (if applicable) | Community Development District | High |
| Who pays title insurance | Varies by county | High |

---

## 3. Contingency Mechanics and Deadlines

### Inspection Contingency (15 Calendar Days)

| Attribute | Detail |
|-----------|--------|
| Default period | 15 calendar days from effective date |
| Applies to | Both Standard and As-Is contracts |
| Buyer's rights (As-Is) | Inspect and cancel only; no repair requests |
| Buyer's rights (Standard) | Request repairs up to 1.5% of price |
| Seller obligation (Standard) | Must repair up to 1.5%; excess triggers buyer's right to cancel |
| Expiration behavior | Silence = contingency waived; buyer proceeds |
| Day counting | Calendar days, no weekend extension |

### Financing Contingency (30 Calendar Days)

| Attribute | Detail |
|-----------|--------|
| Default period | 30 calendar days from effective date |
| Loan application deadline | 5 days from effective date |
| Buyer's obligation | Apply in good faith, provide lender docs promptly |
| Failure to obtain financing | Buyer may cancel and receive EMD refund |
| Expiration behavior | Silence = contingency waived |

### Appraisal

There is **no standalone appraisal contingency** in the FR/Bar contracts. Appraisal protection is **embedded within the financing contingency**. If the property appraises below the purchase price and the lender will not fund at the contract price, the buyer's remedy flows through the financing contingency.

### Title Review

| Attribute | Detail |
|-----------|--------|
| Delivery deadline | Title evidence must be delivered **15 days before closing** |
| Review period | **5 days** from delivery to raise objections |
| Seller's cure period | Per contract terms (typically 30 days) |
| Buyer's remedy if defects uncured | Cancel contract and receive EMD refund |

### HOA/Condo Document Review

| Attribute | Detail |
|-----------|--------|
| Trigger | Receipt of HOA/condo association documents |
| Review period | **3 calendar days** from receipt |
| Buyer's remedy | Cancel within the review window |
| Key documents | Budget, rules, reserves, meeting minutes, SIRS (if applicable) |

### Contingency Removal Behavior

Florida uses **passive removal**. Active removal is **not required**. When a contingency deadline passes without buyer action, the contingency is considered waived and the buyer proceeds. There is no Notice to Buyer to Perform (NBP) mechanism.

---

## 4. Required Inspections and Disclosures

### Common Inspections

| Inspection | Required? | Details |
|------------|-----------|---------|
| General home inspection | Recommended, not mandatory | Whole-house evaluation |
| **Wind mitigation (OIR-B1-1802)** | Effectively required | Standard form; yields **20-50% insurance savings**; valid for **5 years** |
| **4-point inspection** | Required by insurers | Roof, electrical, plumbing, HVAC; required for homes **30+ years** (some insurers at 20+) |
| WDO/termite inspection | Standard practice | Wood-Destroying Organism report |
| Radon testing | Disclosure required | FL §404.056 requires radon disclosure |
| Sinkhole/geological | Area-dependent | Central FL especially |
| **SIRS (Structural Integrity Reserve Study)** | Required for condos | Buildings **3+ stories**; must be completed and funded |
| **Milestone inspection** | Required for condos | Buildings **3+ stories** at **25 years** (or **20 years if within 3 miles of coast**) |

### Required Disclosures

| Disclosure | Statute / Source | Notes |
|------------|-----------------|-------|
| Seller property disclosure | Johnson v. Davis (common law) | Not statutory; FR/Bar form used in practice; seller must disclose known material defects |
| Radon gas disclosure | FL §404.056 | Prescribed language must be included in contract |
| Lead-based paint (pre-1978) | Federal (42 USC §4852d) | 10-day inspection right |
| Coastal Construction Control Line | FL §161.57 | Required for coastal properties |
| Energy efficiency disclosure | FL §553.996 | Buyer informed of right to energy efficiency info |
| CDD disclosure | FL §190.048 | Required if property is in a Community Development District |
| HOA/Condo disclosure | FL §720 / §718 | Association docs, budgets, rules |
| Property tax disclosure | Standard practice | Including any CDD assessments on tax bill |

---

## 5. Insurance Requirements

### Homeowners Insurance (HO-3)

Florida's insurance market is uniquely challenging. Buyers must secure coverage before closing.

| Coverage Type | Details |
|---------------|---------|
| **HO-3 (standard)** | Dwelling, personal property, liability; wind often **excluded** from standard policy |
| **Wind / hurricane** | Frequently requires **separate policy**; may be from a different carrier |
| **Citizens Property Insurance** | State-created **insurer of last resort**; used when private coverage unavailable or unaffordable |
| **Flood insurance** | Common requirement; separate NFIP or private policy; required if in FEMA flood zone |
| **Sinkhole coverage** | Optional add-on; particularly relevant in Central FL |

### Key Insurance Interactions

- **Wind mitigation inspection (OIR-B1-1802)** is the single most impactful cost-saving step: **20-50% premium reduction**
- **4-point inspection** is a prerequisite for obtaining coverage on older homes
- Insurance binder must be in place before closing (lender requirement for financed deals)
- Shopping for wind coverage early in the transaction is critical; delays in binding insurance are a common cause of closing delays

---

## 6. Tax and Fee Summary

### Transfer Tax (Documentary Stamps on Deed)

| Jurisdiction | Rate | Paid By |
|-------------|------|---------|
| All FL counties (except Miami-Dade) | **$7.00 per $1,000** of sale price | Seller |
| Miami-Dade County | **$10.50 per $1,000** of sale price | Seller |

### Mortgage Tax (Buyer Pays) — FL-Unique

| Component | Rate | Notes |
|-----------|------|-------|
| Documentary stamps on mortgage | **$3.50 per $1,000** of loan amount | |
| Intangible tax on mortgage | **$2.00 per $1,000** of loan amount | |
| **Combined mortgage tax** | **$5.50 per $1,000** of loan amount | FL-unique; not found in most states |

**Example:** On a $400,000 loan, mortgage tax = $400 x $5.50 = **$2,200**

### Title Insurance (Promulgated Rates)

FL title insurance rates are **state-regulated** (promulgated). There is no shopping on premium — only on service quality.

| Bracket | Rate |
|---------|------|
| First $100,000 of purchase price | **$5.75 per $1,000** |
| Amount above $100,000 | **$5.00 per $1,000** |

**Who pays for title insurance varies by county:**

| Convention | Counties |
|------------|----------|
| **Seller pays** | Most FL counties (default) |
| **Buyer pays** | Miami-Dade, Broward, Sarasota |

### Property Tax

| Attribute | Detail |
|-----------|--------|
| Effective rate | **~0.9-1.2%** of assessed value |
| Tax year | Calendar year (Jan-Dec) |
| Payment timing | Paid in **arrears** (Nov 1 for current year; delinquent April 1) |
| Early payment discount | Up to 4% if paid in November |
| CDD assessments | **$1,000-$4,000+/year** additional; appears on tax bill; FL-specific |

### Homestead Exemption

| Attribute | Detail |
|-----------|--------|
| Exemption amount | **$50,000** off assessed value (first $25K off all taxes; next $25K off non-school taxes) |
| Save Our Homes (SOH) cap | Annual assessed value increase capped at **3% or CPI**, whichever is lower |
| Filing deadline | **March 1** of the tax year |
| Portability | Exemption difference is portable **within Florida** |
| Eligibility | Primary residence; FL resident as of January 1 |

### Other Tax Notes

- **No state income tax** in Florida
- **FIRPTA** withholding applies only to **foreign sellers** (15% of sale price withheld)
- **No community property** — Florida is a separate property state

---

## 7. Closing Process Specifics

### Closing Style: Wet Closing (Table Funding)

Florida uses **wet closings**. This means:

| Attribute | Detail |
|-----------|--------|
| Funding timing | Funds are disbursed **at the closing table** |
| Key delivery | Buyer typically receives keys **same day** |
| Signing | Parties **often sign together** at the title company |
| Closing agent | **Title company** (not attorney-required, though attorneys may be involved) |
| Remote Online Notarization (RON) | Available under **FL §117.265** |

### Typical Closing Flow

1. **Pre-closing:** Title company prepares closing disclosure (CD), coordinates with lender
2. **Signing:** Buyer and seller sign at title company (or via RON); notarization of deed
3. **Funding:** Lender wires funds to title company; title company disburses
4. **Recording:** Deed and mortgage recorded with county clerk
5. **Key transfer:** Keys delivered to buyer, typically same day
6. **Post-closing:** Title policy issued; homestead exemption filing reminder sent to buyer

### Closing Cost Responsibility Summary

| Item | Typically Paid By |
|------|-------------------|
| Title insurance premium | Varies by county (see Section 6) |
| Title search and exam | Buyer |
| Documentary stamps on deed | Seller |
| Documentary stamps on mortgage | Buyer |
| Intangible tax on mortgage | Buyer |
| Recording fees | Buyer (mortgage); Seller (deed satisfaction) |
| Survey | Buyer (if required) |
| Lender fees | Buyer |
| Real estate commission | Seller (negotiable) |
| Property tax proration | Prorated at closing |
| HOA/CDD prorations | Prorated at closing |

---

## 8. Code Mapping

This section maps Florida's transaction rules to the application's data model, configuration fields, and domain types.

### StateConfig Fields

```typescript
const FL_CONFIG: StateConfig = {
  // Identity
  state_code: "FL",
  state_name: "Florida",

  // Closing structure
  closing_type: "title_company",
  attorney_review_required: false,
  attorney_review_days: null,
  closing_style: "wet",
  parties_sign_together: true,
  signing_to_keys_gap_days: 0,
  ron_available: true,

  // Buyer protection mechanism
  buyer_protection_type: "inspection_contingency",

  // Option period (not applicable in FL)
  option_period: {
    enabled: false,
    default_days: null,
    option_fee_recipient: null,
    option_fee_typical_range: null,
    unrestricted_termination: false,
  },

  // Contingency defaults (calendar days)
  contingency_defaults: {
    inspection_days: 15,
    financing_days: 30,
    appraisal_days: null,           // Embedded in financing
    title_days: 5,                  // Review period after receipt
    hoa_review_days: 3,
    loan_application_days: 5,
  },

  // Contingency removal behavior
  contingency_removal: {
    active_removal_required: false,
    silence_means: "acceptance",
    nbp_mechanism: false,
    nbp_response_hours: null,
  },
};
```

### Deadline Types

The following deadline types are active for FL transactions:

| Deadline Type | Calendar Days | Counted From | Notes |
|---------------|---------------|-------------|-------|
| `earnest-money` | 3 | Effective date | EMD deposit to escrow agent |
| `inspection` | 15 | Effective date | All inspections within this window |
| `financing` | 30 | Effective date | Loan approval deadline |
| `disclosure` | — | Various | Seller disclosures (radon, CDD, coastal) |
| `closing` | Per contract | Effective date | Contractual closing date |
| `hoa-doc-review` | 3 | Receipt of HOA docs | Buyer review and cancel right |
| `loan-application` | 5 | Effective date | Buyer must apply for financing |
| `title-review` | 5 | Receipt of title commitment | Objection window |
| `insurance-binder` | Before closing | — | Must be in place for lender |

### Document Types

The following document types are relevant to FL transactions:

| Document Type Key | Description | Extraction? | Notes |
|-------------------|-------------|-------------|-------|
| `purchase_contract` | FR/Bar Standard or As-Is contract | Yes | Primary contract; extract all key fields (Section 2) |
| `wind_mitigation` | Wind Mitigation Inspection (OIR-B1-1802) | Yes | Extract rating features, roof type, opening protection |
| `four_point_inspection` | 4-Point Inspection Report | Yes | Extract condition ratings for roof, electrical, plumbing, HVAC |
| `termite_wdo_report` | WDO/Termite Inspection Report | Yes | Extract findings, treatment recommendations |
| `cdd_disclosure` | Community Development District Disclosure | Yes | Extract annual assessment amount, bond balance |
| `seller_disclosure` | Seller Property Disclosure (FR/Bar form) | Yes | Extract disclosed defects, material facts |
| `insurance_binder` | Insurance Binder / Evidence of Coverage | Yes | Extract carrier, policy number, coverage amounts, premium |
| `title_commitment` | Title Commitment / Title Search | Yes | Extract exceptions, requirements, vesting |

### Contract Type Detection

When processing a FL purchase contract, the system should detect the contract variant:

```typescript
type FLContractType = "fr_bar_standard" | "fr_bar_as_is";

// Detection signals in document text:
// - "AS IS" in title or paragraph 1 → fr_bar_as_is
// - "Repair Limit" / "1.5%" language → fr_bar_standard
// - Form identifier: "ASIS-6" vs "Residential-6" (revision numbers vary)
```

The contract type determines repair negotiation logic:

| Contract Type | Repair Behavior |
|---------------|----------------|
| `fr_bar_standard` | Seller must repair up to **1.5% of price**; system should calculate and track this cap |
| `fr_bar_as_is` | No repairs; buyer's only option is **cancel or proceed**; system should suppress repair request workflows |

### Title Insurance Payment Logic

Title insurance payer determination requires county-level configuration:

```typescript
const FL_TITLE_PAYER: Record<string, "seller" | "buyer"> = {
  "miami-dade": "buyer",
  "broward": "buyer",
  "sarasota": "buyer",
  // All other FL counties default to "seller"
};
```

### Transfer Tax Calculation

```typescript
function calculateFLTransferTax(salePrice: number, county: string): number {
  const rate = county === "miami-dade" ? 10.5 : 7.0;
  return Math.ceil(salePrice / 1000) * rate;
}

function calculateFLMortgageTax(loanAmount: number): number {
  const docStamps = Math.ceil(loanAmount / 1000) * 3.5;
  const intangibleTax = Math.ceil(loanAmount / 1000) * 2.0;
  return docStamps + intangibleTax; // Combined $5.50 per $1,000
}
```

---

## Appendix: FL-Specific Product Considerations

1. **As-Is contract prevalence** — 70%+ of FL deals use As-Is. The inspection workflow should default to a cancel-or-proceed decision tree, not a repair negotiation flow.

2. **Wind mitigation is a money event** — The OIR-B1-1802 form directly saves the buyer 20-50% on insurance. The product should prominently surface this inspection and its financial impact.

3. **CDD is invisible until it's not** — CDD assessments of $1,000-$4,000+/year appear on the tax bill and surprise buyers. The product should flag CDD communities early and include assessments in affordability calculations.

4. **Insurance is a closing blocker** — In Florida's difficult insurance market, delayed insurance binding is one of the most common causes of closing delays. The product should prompt buyers to begin insurance shopping immediately after going under contract.

5. **Mortgage tax is FL-unique** — The combined $5.50/K mortgage tax is a significant cost that buyers from other states do not expect. The product should surface this clearly in closing cost estimates.

6. **County-level variation matters** — Title insurance payer and transfer tax rates vary by county. The product must capture the county to calculate costs accurately.

7. **Homestead exemption is post-close but high-value** — Filing by March 1 saves the buyer significant ongoing tax. The product should generate a post-close reminder with filing instructions.

8. **SIRS and milestone inspections for condos** — Buildings 3+ stories face additional reserve and structural requirements. The product should flag these for condo transactions and surface SIRS compliance status from HOA docs.
