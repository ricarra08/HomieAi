# Texas Real Estate Transaction Workflow

> Product + Engineering reference for TX-specific transaction logic in HomeBuyer Pro.

---

## 1. Transaction Timeline (Acceptance to Close)

### Financed Purchase: 30-45 Days Typical

| Day | Milestone | Notes |
|-----|-----------|-------|
| 0 | Executed contract (mutual acceptance) | TREC 20-17 signed by both parties |
| 0-3 | Option fee delivered to seller | Non-refundable, paid directly to seller (not title co.) |
| 0-3 | Earnest money deposited | 1-2% of price, delivered to title company within 3 calendar days |
| 0-3 | Loan application submitted | Buyer must apply within days specified in Financing Addendum |
| 1-7 | Option period (inspections) | Unrestricted right to terminate for ANY reason |
| 7 | Option period expires | Written notice required before 5:00 PM on last day |
| 1-20 | Title commitment delivered | Title company delivers within 20 days of contract |
| 1-14 | Survey ordered / existing survey reviewed | Survey is STANDARD in TX |
| 3-6 | HOA doc review period | Days counted from receipt of HOA docs, not execution |
| 7-14 | Seller disclosure delivered | TREC OP-H (statutory requirement) |
| 21-30 | Financing contingency deadline | Per Financing Addendum TREC 40-9 |
| 25-35 | Appraisal completed | Embedded in financing contingency |
| 30-40 | Clear to close from lender | Final underwriting approval |
| 35-42 | Signing appointment | Dry funding -- sign docs, then wait for funding |
| 36-45 | Funding + recording | 1-3 business day gap between signing and keys |
| Close day | Keys delivered | After deed records at county clerk |

### Cash Purchase: 14-21 Days Typical

Same structure minus financing contingency and appraisal. Option period still applies.

### Day Counting Rules

- **Calendar days** throughout. No weekend or holiday extensions.
- Deadlines that fall on weekends/holidays are NOT extended to the next business day.
- "Days after execution" means the day after the effective date is Day 1.
- Option period termination: written notice must be received by seller before **5:00 PM local time** on the last day.

---

## 2. Contract Types and Key Fields to Extract

### Primary Contract Forms (TREC-Promulgated)

Agents in Texas are **legally required** to use TREC-promulgated forms. Only attorneys may draft custom contracts.

| Form | Name | Use Case |
|------|------|----------|
| **TREC 20-17** | One-to-Four Family Residential Contract (Resale) | Standard resale -- most common |
| **TREC 23-18** | New Home Contract (Incomplete Construction) | New build, not yet complete |
| **TREC 24-17** | New Home Contract (Completed Construction) | New build, move-in ready |
| **TREC 30-16** | Residential Condominium Contract (Resale) | Condo resale |

### Required Addenda

| Form | Name | When Required |
|------|------|---------------|
| **TREC 40-9** | Third Party Financing Addendum | Any financed deal (conventional, FHA, VA, USDA) |
| **TREC 44-2** | Addendum for Reservation of Oil, Gas, and Other Minerals | When mineral rights are being reserved or conveyed separately |
| **TREC 45-1** | Coastal Area Property Addendum | Properties in coastal areas |
| **TREC 46-0** | Addendum for Property Located Seaward of the Gulf Intracoastal Waterway | Hydrostatic testing / plumbing pressure test |

### TAR Supplementary Forms

| Form | Name | Purpose |
|------|------|---------|
| **TAR 1907** | Buyer's Inspection Notice | Communicate inspection findings / repair requests |
| **TAR 1932** | Notice to Terminate | Formal termination during option period |

### Key Fields to Extract from TREC 20-17

```
- property_address (street, city, county, zip)
- legal_description (lot, block, subdivision, or metes & bounds)
- sales_price
- earnest_money_amount
- earnest_money_deadline (calendar days)
- option_fee_amount ($100-$500 typical)
- option_period_days (5-10, 7 typical)
- financing_type (conventional, FHA, VA, USDA, cash)
- financing_contingency_days (21-30)
- closing_date
- title_company_name
- survey_provision (existing survey / new survey / waived)
- possession_date (typically upon funding and recording)
- seller_contribution_to_closing_costs
- hoa_name
- hoa_transfer_fee
- property_tax_prorations
```

---

## 3. Contingency Mechanics and Deadlines

### Option Period (TX-Unique)

The option period is Texas's primary buyer protection mechanism, replacing the inspection contingency found in most other states.

- **Fee**: $100-$500 non-refundable, paid directly to seller (NOT to title company)
- **Delivery**: Option fee must be delivered within **3 calendar days** of execution
- **Duration**: 5-10 days (7 days typical)
- **Rights**: Buyer may terminate for **ANY reason** -- no justification required
- **Termination**: Written notice (TAR 1932) must be received by seller before **5:00 PM** on the last day of the option period
- **If terminated**: Buyer loses option fee but gets earnest money back
- **If not terminated**: Option fee is typically credited to buyer at closing

### Financing Contingency

- **Form**: TREC 40-9 Third Party Financing Addendum (required for all financed deals)
- **Duration**: 21-30 days from execution
- **Scope**: Includes appraisal (appraisal is embedded, not a separate contingency)
- **Failure to obtain financing**: Buyer may terminate and receive earnest money refund
- **No active removal required** -- contingency expires passively if buyer does not terminate

### Title Contingency

- **Title commitment**: Must be delivered within 20 days
- **Objection period**: Buyer has specified days after receipt to object to title exceptions
- **Survey**: Standard in TX; buyer typically has right to object to survey matters

### HOA Document Review

- **Duration**: 3-6 days from receipt of HOA documents (not from execution)
- **Right to terminate**: Buyer may cancel if HOA docs are unacceptable

### Contingency Removal Style

Texas uses **passive expiration** -- contingencies expire automatically. There is no active removal process like California's. If the buyer does not terminate before the deadline, the contingency is waived.

---

## 4. Required Inspections and Disclosures

### Standard Inspections (During Option Period)

| Inspection | Cost | Priority | Notes |
|------------|------|----------|-------|
| General home inspection | $350-$600 | Required (practical) | TREC-licensed inspector |
| **Foundation / PE inspection** | $400-$800 | **CRITICAL** | Professional Engineer report. TX expansive clay soils make this essential. |
| **Roof certification** | $150-$400 | **CRITICAL** | Hail damage assessment, esp. North TX (DFW, hail alley) |
| Termite / WDI | $75-$150 | Standard | Wood-destroying insect report |
| HVAC | $150-$300 | Recommended | System age and efficiency check |
| **Hydrostatic testing** | $250-$500 | Recommended | Plumbing pressure test (TREC Addendum 46-0). Tests for slab leaks under foundation. |
| Pool / spa | $150-$300 | If applicable | Required if pool present |
| Septic | $250-$500 | If applicable | Rural properties |

### Required Disclosures

| Disclosure | Authority | Notes |
|------------|-----------|-------|
| **Seller's Disclosure Notice** | TREC OP-H, Property Code 5.008 | STATUTORY requirement. Seller must disclose known material defects. |
| **MUD Disclosure** | Water Code 49.452 | **TX-specific.** Municipal Utility District notice. Can add $0.50-$2.00+ per $100 assessed value in taxes. |
| Lead-based paint disclosure | Federal (pre-1978) | Required for homes built before 1978 |
| HOA disclosure | Property Code Ch. 207 | Subdivision information, resale certificate |
| Mineral rights disclosure | TREC 44-2 | TX is an active mineral rights state -- rights may have been previously severed from surface rights |

---

## 5. Insurance Requirements

### Homeowner's Insurance

| Type | Details |
|------|---------|
| **Standard policy** | HO-3 (special form) -- covers dwelling on open-peril basis |
| **Flood insurance** | Common requirement post-Hurricane Harvey. Required in FEMA flood zones. Not included in HO-3. |
| **TWIA (wind/hail)** | Texas Windstorm Insurance Association -- separate policy for coastal TX. Standard HO-3 may exclude wind/hail in Tier 1 coastal counties. |
| **WPI-8 certification** | Required to obtain TWIA coverage. Proves structure meets windstorm building code. |

### Title Insurance

- **Rate**: REGULATED by Texas Department of Insurance (TDI). Every title company charges the **same premium** -- no shopping on price, only on service.
- **Survey required**: Title companies require a current survey to delete the standard survey exception from the policy.
- **Owner's policy**: Buyer purchases (one-time premium at closing)
- **Lender's policy**: Required by lender (buyer pays)

---

## 6. Tax and Fee Summary

### Transfer Taxes and Recording

| Item | Amount |
|------|--------|
| Transfer tax | **NONE** -- Texas has no real estate transfer tax |
| Mortgage tax | **NONE** |
| Recording fees | County-specific, typically $25-$75 per document |

### Property Taxes

| Item | Details |
|------|---------|
| Rate | ~1.6-1.8% of assessed value (statewide average). **Can exceed 3% in MUD areas.** |
| Assessment cycle | Calendar year, paid in arrears |
| Due date | January 31 of following year (penalty after February 1) |
| **Homestead exemption** | $100,000 off school district taxable value (as of 2024 legislation) |
| Homestead filing | Must file within 2 years of acquiring homestead |
| **Tax protest deadline** | **May 15** (or 30 days after notice of appraised value, whichever is later) |
| Proration at closing | Taxes prorated as of closing date. Seller credits buyer for taxes accrued but not yet due. |

### MUD Tax Impact

Municipal Utility Districts (MUDs) are a TX-specific mechanism for financing infrastructure in new developments. MUD taxes are **in addition to** regular property taxes and can add $0.50-$2.00+ per $100 of assessed value. This is a significant cost that buyers frequently miss.

### Income Tax

- **No state income tax** in Texas
- **FIRPTA**: Applies to foreign sellers only (federal withholding)
- **No state-level non-resident withholding**

### Community Property

Texas is a **community property state**. Both spouses must sign the deed of trust for homestead property, even if only one spouse is on the loan.

---

## 7. Closing Process Specifics

### Closing Style: Dry Funding

Texas uses **dry funding** (also called "table funding" in some contexts, though technically distinct):

1. **Signing**: Buyer and seller sign closing documents at the title company
2. **Lender review**: Lender reviews executed documents (1-3 business days)
3. **Funding**: Lender wires funds to title company
4. **Recording**: Title company records deed and deed of trust at county clerk
5. **Keys**: Delivered to buyer after recording is confirmed

**Gap**: Expect a **1-3 business day gap** between signing and receiving keys. This is normal in TX and should be communicated clearly to buyers.

### Closing Entity

- **Title company** handles closing (not attorney-required state)
- Title company acts as escrow agent, closing agent, and title insurer

### Remote Online Notarization (RON)

- Available under Texas Government Code Chapter 406
- Allows fully remote closings with identity verification and audio/video recording
- Particularly useful for out-of-state buyers or relocations

### Typical Closing Costs (Buyer)

| Item | Typical Range |
|------|---------------|
| Title insurance (owner's policy) | Regulated rate (~0.5-0.6% of price) |
| Title insurance (lender's policy) | Regulated rate (simultaneous issue discount) |
| Escrow / closing fee | $400-$800 |
| Survey | $400-$700 |
| Recording fees | $25-$75 per document |
| Loan origination | 0-1% of loan amount |
| Appraisal | $400-$600 |
| Prepaid taxes / insurance | Varies (several months escrowed) |

---

## 8. Code Mapping

### StateConfig

```typescript
{
  state_code: "TX",
  state_name: "Texas",
  closing_type: "title_company",
  closing_style: "dry",
  buyer_protection_type: "option_period",
  option_period: {
    enabled: true,
    default_days: 7,
    fee_range: { min: 100, max: 500 },
    fee_paid_to: "seller",          // NOT title company
    delivery_deadline_days: 3,       // calendar days
    termination_time: "17:00",       // 5:00 PM local
  },
  contingency_removal: {
    active_removal_required: false,  // passive expiration
  },
  transfer_tax: null,               // no transfer tax
  mortgage_tax: null,               // no mortgage tax
  attorney_required: false,
  survey_standard: true,             // survey is standard in TX
  community_property: true,
  day_counting: "calendar",          // no weekend extensions
  ron_available: true,
  title_insurance_regulated: true,
}
```

### Deadline Types

```typescript
type TXDeadlineType =
  | "earnest-money"              // 3 calendar days from execution
  | "option-fee-delivery"        // 3 calendar days from execution
  | "option-period"              // 5-10 days (7 typical)
  | "financing"                  // 21-30 days
  | "disclosure"                 // seller disclosure delivery
  | "title-commitment-delivery"  // 20 days
  | "hoa-doc-review"             // 3-6 days from receipt
  | "loan-application"           // per financing addendum
  | "survey"                     // before closing
  | "insurance-binder"           // before closing
  | "closing";                   // 30-45 days financed, 14-21 cash
```

### Document Types

```typescript
type TXDocumentType =
  | "purchase_contract"    // TREC 20-17, 23-18, 24-17, or 30-16
  | "financing_addendum"   // TREC 40-9
  | "seller_disclosure"    // TREC OP-H (Property Code 5.008)
  | "mud_disclosure"       // Water Code 49.452
  | "mineral_addendum"     // TREC 44-2
  | "coastal_addendum"     // TREC 45-1
  | "foundation_report"    // PE inspection report
  | "roof_inspection"      // Hail / roof certification
  | "survey"               // boundary survey
  | "title_commitment"     // title company commitment
  | "inspection_notice"    // TAR 1907
  | "termination_notice"   // TAR 1932
  | "hoa_docs"             // resale certificate, CC&Rs
  | "lead_paint";          // federal, pre-1978 only
```

### Extraction Schema Mapping

For AI document extraction, the following TREC-specific fields should be mapped:

```typescript
// TREC 20-17 extraction targets
const trecContractFields = {
  // Paragraph 1 -- Parties
  buyer_name: "paragraph_1",
  seller_name: "paragraph_1",

  // Paragraph 2 -- Property
  property_address: "paragraph_2",
  legal_description: "paragraph_2",

  // Paragraph 3 -- Sales Price
  sales_price: "paragraph_3",

  // Paragraph 5 -- Earnest Money
  earnest_money_amount: "paragraph_5",
  earnest_money_to: "paragraph_5",        // title company name

  // Paragraph 6 -- Title
  title_company: "paragraph_6A",
  title_commitment_days: "paragraph_6A",   // default 20

  // Paragraph 7 -- Property Condition
  // (inspection items, seller disclosures)

  // Paragraph 9 -- Closing
  closing_date: "paragraph_9",
  possession: "paragraph_9",

  // Paragraph 23 -- Option Period
  option_fee: "paragraph_23",
  option_period_days: "paragraph_23",

  // Financing Addendum (TREC 40-9)
  financing_type: "addendum_40_9",
  loan_amount: "addendum_40_9",
  financing_deadline_days: "addendum_40_9",
};
```

---

## Quick Reference: TX vs. Other States

| Feature | TX | CA | FL |
|---------|----|----|-----|
| Buyer protection | Option period | Contingencies w/ active removal | Inspection period |
| Day counting | Calendar (strict) | Calendar (some exceptions) | Calendar/business (varies) |
| Closing entity | Title company | Escrow company | Title company / attorney |
| Funding style | Dry | Escrow (wet) | Dry or wet (varies) |
| Transfer tax | None | Yes (~$1.10/$1000) | Yes (doc stamps) |
| Survey | Standard | Rare | Rare |
| Title insurance rate | Regulated (fixed) | Market rate | Regulated (promulgated) |
| Attorney required | No | No | No (but common) |
| Forms | TREC-promulgated (mandatory) | CAR (standard but not mandatory) | FAR/BAR (standard) |
