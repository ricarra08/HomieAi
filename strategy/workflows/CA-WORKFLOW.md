# California Real Estate Transaction Workflow

## 1. Transaction Timeline (Acceptance to Close)

**Typical Timeline:** 30 days (financed, 21-45 range) | 14-21 days (cash)

| Day | Milestone | Notes |
|-----|-----------|-------|
| 0 | Contract acceptance | C.A.R. RPA (Residential Purchase Agreement) executed |
| 0-3 | EMD deposit | 3 business days to deposit with escrow company |
| 1-17 | Investigation contingency | 17 calendar days — broadest contingency (covers everything) |
| 1-17 | Appraisal contingency | 17 calendar days — standalone (CA-unique) |
| 1-17 | Title contingency | 17 calendar days |
| 5 cal days | HOA doc review | 5 calendar days from receipt |
| 7-14 | Seller delivers TDS | Transfer Disclosure Statement + all statutory disclosures |
| 14-17 | Contingency removal (CR) | Buyer must actively submit CR forms |
| 1-21 | Financing contingency | 21 calendar days |
| 21-25 | Clear to close | Final underwriting approval |
| 25-28 | Sign closing docs | Parties sign separately (escrow closing) |
| 30 | Fund and record | Same day (usually morning recording) |

**Day Counting:** Calendar days. If deadline falls on weekend/holiday, extends to next business day.

---

## 2. Contract Types and Key Fields to Extract

### C.A.R. RPA (Residential Purchase Agreement)
The single dominant form in California. Substantially revised late 2023. Key fields:

- **Parties:** Buyer name(s), seller name(s), marital status
- **Property:** Address, legal description, APN
- **Price:** Purchase price, loan amount, down payment
- **EMD:** Amount (1-3%, competitive markets 3%+), deposit deadline, escrow holder
- **Financing:** Loan type, loan amount, terms
- **Close of Escrow:** Target date
- **Possession:** At COE or other arrangement
- **Contingency periods:** Investigation (17), financing (21), appraisal (17)
- **Liquidated damages:** Must be separately initialed, capped at 3% of purchase price
- **Addenda:** List of attached forms (30-50+ forms per transaction)

### CR (Contingency Removal)
**Critical CA-specific form.** Active removal required:

- **Contingency type** being removed
- **Date of removal**
- **Buyer signature required**

### RR / RRRR (Request for Repair / Response)
- **Repair items requested**
- **Seller response** (agree, counter, refuse)
- **Credit amounts** (if applicable)

### NBP (Notice to Buyer to Perform)
Seller-initiated pressure mechanism:

- **Contingency referenced**
- **48-hour response deadline**
- **Buyer must:** Remove contingency, cancel, or do nothing (seller gains right to cancel)

### TDS (Transfer Disclosure Statement)
Statutory requirement (Civ. Code §1102):

- **Three-part disclosure:** Seller section, listing agent section, buyer's agent section
- **Property condition details**
- **Known defects and material facts**

### AVID (Agent Visual Inspection Disclosure)
CA-specific agent disclosure:

- **Agent's observations** of property condition
- **Required from both listing and buyer's agents**

---

## 3. Contingency Mechanics and Deadlines

### CRITICAL: Active Contingency Removal Model
California is **unique** in requiring active contingency removal:
- **Buyer must submit CR (Contingency Removal) form** to release each contingency
- **Silence = contingency persists** (opposite of most states)
- Seller cannot force closing while contingencies remain

### NBP (Notice to Buyer to Perform) Mechanism
When buyer fails to remove contingencies on time:
1. Seller issues NBP
2. Buyer has **48 hours** to respond
3. Buyer options: remove contingency, cancel transaction, or do nothing
4. If buyer does nothing: seller gains the **right to cancel** (but is not obligated to)

### Investigation Contingency
- **Duration:** 17 calendar days
- **Scope:** Broadest contingency — covers inspections, disclosures, neighborhood conditions, title, anything the buyer wants to investigate
- **Removal:** Buyer must submit CR form

### Financing Contingency
- **Duration:** 21 calendar days
- **Scope:** Loan approval
- **Removal:** Buyer must submit CR form

### Appraisal Contingency (CA-Unique)
- **Duration:** 17 calendar days — **standalone** (not embedded in financing)
- **Scope:** Property appraises at or above purchase price
- **Removal:** Buyer must submit CR form
- **Waiving:** Common in competitive markets

### Title Contingency
- **Duration:** 17 calendar days
- **Scope:** Review of preliminary title report
- **Removal:** Buyer must submit CR form

### HOA Document Review
- **Duration:** 5 calendar days from receipt
- **Scope:** CC&Rs, financials, rules, reserves

### EMD / Liquidated Damages
- **Amount:** 1-3% (competitive markets: 3%+)
- **Deposit deadline:** 3 business days
- **Holder:** Escrow company
- **Liquidated damages clause:** Must be **separately initialed** by both parties; capped at 3% of purchase price
- **Dispute:** If contested, EMD held by escrow pending mediation/arbitration

---

## 4. Required Inspections and Disclosures

### Common Inspections
- **General home inspection** — standard whole-house
- **Termite (WDO):** Section 1 (active infestation) vs Section 2 (conditions conducive to infestation) — CA-specific distinction
- **Sewer lateral inspection** — city-specific point-of-sale requirement
- **Roof inspection**
- **Foundation inspection** — especially older homes
- **Chimney inspection**
- **HVAC inspection**
- **Pool/spa inspection** (where applicable)

### Statutory Disclosures (Extensive)
- **TDS (Transfer Disclosure Statement):** Civ. Code §1102 — three-part form (seller + listing agent + buyer's agent)
- **AVID (Agent Visual Inspection Disclosure):** CA-specific, required from both agents
- **NHD (Natural Hazard Disclosure):** Earthquake fault zones, flood zones, fire hazard severity zones, landslide zones, dam inundation zones
- **Lead-based paint disclosure:** Pre-1978 homes (federal)
- **Mello-Roos/CFD disclosure:** Gov. Code §53341.5 — $2,000-$10,000+/year in special tax districts
- **Supplemental tax notice:** Buyer will receive supplemental tax bill
- **Smoke/CO detector compliance**
- **Water heater strapping**
- **Energy audit** — city-specific point-of-sale requirement
- **Soft-story retrofit** — city-specific (e.g., Los Angeles)

### City-Specific Point-of-Sale Requirements
Vary by jurisdiction. Examples:
- Sewer lateral inspection/repair
- Energy audit/retrofit
- Soft-story seismic retrofit
- Sidewalk repair

---

## 5. Insurance Requirements

### Homeowner's Insurance
- **Policy type:** HO-3 (standard)
- **Average cost:** $1,000-$3,500/year (non-wildfire areas)
- **Major concerns:**
  - **Earthquake:** CEA (California Earthquake Authority) optional, 10-25% deductible, $800-$5,000+/year
  - **Wildfire:** FAIR Plan for high-risk areas, premiums 2-5x standard
- **Required by:** Lender (for financed purchases)
- **Timing:** Binder required before closing

### Title Insurance
- **Market rate pricing**
- **NorCal vs SoCal customs differ** on who pays
- **Policy types:** CLTA (standard) vs ALTA (extended — typically required by lender)
- **Provider:** Title company

### Homestead Protection
- **Type:** Asset protection only ($300,000-$600,000 depending on circumstances)
- **Tax exemption:** NONE — California homestead does not provide property tax reduction

---

## 6. Tax and Fee Summary

### Transfer Tax
- **County:** $1.10 per $1,000 of sales price
- **City:** Varies significantly:
  - Los Angeles: $4.50 per $1,000
  - San Francisco: Up to $30.00 per $1,000 (tiered)
  - LA Measure ULA ("mansion tax"): 4% on $5M-$10M, 5.5% on $10M+ (effective Apr 2023)
- **Custom:** Varies by locality (seller pays in many areas)

### Mortgage Tax
- **NONE**

### Property Tax
- **Rate:** ~1.1-1.4% of assessed value (Prop 13 base rate: 1%)
- **Prop 13:** Assessed value capped at 2% annual increase from purchase price
- **Fiscal year:** July 1 - June 30
- **Payment:** Two installments (Nov 1 / Feb 1; delinquent Dec 10 / Apr 10)
- **Supplemental tax:** CA-UNIQUE — reassessment at purchase triggers supplemental tax bill 6-12 months after close. Buyer must be warned.
- **Mello-Roos/CFD:** Additional $2,000-$10,000+/year in special tax districts

### Closing Cost Estimates
- **Transfer tax:** Varies significantly by city
- **Title insurance:** Based on purchase price
- **Escrow fees:** Split buyer/seller (customary)
- **Recording fees**
- **NHD report fee:** ~$100-$200
- **County/city-specific fees**

### Non-Resident Withholding
- **State:** 3.33% of gross sales price (Rev. & Tax Code §18662)
- **Federal:** FIRPTA applies to foreign sellers

---

## 7. Closing Process Specifics

### Escrow Closing Model
California uses an **escrow closing** process through an independent escrow company:

1. **Escrow opened** at contract acceptance
2. **Title search and preliminary report** issued
3. **All contingencies actively removed** via CR forms
4. **Lender docs received** by escrow
5. **Parties sign separately** — buyer and seller do not need to attend same signing
6. **Funding** — lender wires funds to escrow
7. **Recording** — deed recorded with county recorder (same day as funding, usually morning)
8. **Disbursement** — escrow disburses funds to seller

### Key Closing Details
- **Fund → Record:** Same day (typically morning recording)
- **Independent escrow company:** Not the title company (though they may be affiliated)
- **RON (Remote Online Notarization):** Effective January 1, 2024 (AB 1093) — limited adoption
- **Community property state:** Both spouses must sign to sell or encumber community property
- **Escrow holder:** Independent escrow company (not attorney)
- **30-50+ forms per transaction:** Document management is critical

---

## 8. Code Mapping

### StateConfig
```typescript
{
  state_code: "CA",
  closing_type: "escrow_company",
  closing_style: "escrow",
  buyer_protection_type: "investigation_contingency",
  option_period: {
    enabled: false
  },
  contingency_removal: {
    active_removal_required: true
  },
  silence_means: "contingency_persists",
  nbp_mechanism: true,
  nbp_response_hours: 48
}
```

### Deadline Types
```typescript
type CADeadlineType =
  | "earnest-money"              // 3 business days
  | "investigation"              // 17 calendar days (broadest)
  | "financing"                  // 21 calendar days
  | "appraisal"                  // 17 calendar days (standalone, CA-unique)
  | "closing"                    // COE date
  | "contingency-removal"        // Active CR submission
  | "nbp-response"              // 48 hours after NBP issued
  | "hoa-doc-review"            // 5 calendar days
  | "loan-application"          // Per contract terms
  | "title-review"              // 17 calendar days
  | "seller-disclosure-delivery" // TDS + all statutory disclosures
  | "insurance-binder";         // Before closing
```

### Document Types
```typescript
type CADocumentType =
  | "purchase_contract"          // C.A.R. RPA
  | "seller_disclosure"          // TDS (Transfer Disclosure Statement)
  | "natural_hazard_disclosure"  // NHD report
  | "mello_roos_disclosure"      // Mello-Roos/CFD disclosure
  | "sewer_lateral"              // City-specific inspection
  | "title_commitment"           // Preliminary title report
  | "insurance_binder"           // HO-3 + optional earthquake/wildfire
  | "contingency_removal"        // CR form
  | "notice_to_perform"          // NBP form
  | "request_for_repair"         // RR form
  | "agent_visual_inspection"    // AVID
  | "supplemental_tax_notice"    // Supplemental tax disclosure
  | "termite_report";            // Section 1 / Section 2
```

### Extraction Schema Targets
Fields to extract from C.A.R. RPA:
- `buyer_names`, `seller_names`
- `property_address`, `legal_description`, `apn`
- `purchase_price`, `loan_amount`, `down_payment`
- `emd_amount`, `emd_deadline`, `emd_holder`
- `investigation_deadline` (17 calendar days)
- `financing_deadline` (21 calendar days)
- `appraisal_deadline` (17 calendar days, standalone)
- `title_deadline` (17 calendar days)
- `coe_date` (close of escrow)
- `liquidated_damages_initialed` (boolean)
- `liquidated_damages_cap` (3% max)
- `hoa_name`, `hoa_fees`
- `mello_roos_amount`
- `addenda_list`
- `nbp_issued` (boolean), `nbp_date`, `nbp_response_deadline`
