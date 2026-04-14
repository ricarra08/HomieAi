# HomeBuyer Pro — State-by-State Comparison
## FL, TX, AZ, CA — Complete Differences Analysis
## Version 1.0 — April 2026
## Internal reference — Confidential

---

## 1. Structural Classification

| Dimension | Florida | Texas | Arizona | California |
|-----------|---------|-------|---------|------------|
| **Closing entity** | Title company | Title company | Title/escrow company | Independent escrow company |
| **Attorney required** | No | No | No | No |
| **Attorney review period** | None | None | None | None |
| **Security instrument** | Mortgage | Deed of Trust | Deed of Trust | Deed of Trust |
| **Foreclosure type** | Judicial | Non-judicial (trustee's sale) | Non-judicial (trustee's sale) | Non-judicial (trustee's sale) |
| **Community property** | No | Yes | Yes | Yes |
| **Standard contract** | FR/Bar (Standard or As-Is) | TREC 20-17 (promulgated — mandatory) | AAR Resale Purchase Contract | C.A.R. RPA |
| **Contract forms** | Industry-standard (FR/Bar) | State-mandated (TREC) | Industry-standard (AAR) | Industry-standard (C.A.R.) |

---

## 2. Contract Types & Key Differences

### Florida
- **FR/Bar Standard** — Full contingency, seller must repair up to 1.5% of price
- **FR/Bar As-Is** — Buyer inspects but only remedy is to cancel (no repairs). 70%+ of FL market uses As-Is
- **FR/Bar Condo Rider** — Mandatory for condos (addresses SIRS, milestone, estoppel)
- **FR/Bar HOA Rider** — For HOA properties

### Texas
- **TREC 20-17** (One-to-Four Family Resale) — Mandatory state form. Agents MUST use TREC forms.
- **TREC 23-18** — New construction (incomplete)
- **TREC 24-17** — New construction (complete)
- **TREC 30-16** — Condo resale
- **TREC 40-9** — Third Party Financing Addendum (required for financed deals)
- **TREC 40-9** — HOA Addendum
- **TAR forms** — Supplementary (not mandatory). TAR 1907 (Buyer Inspection Notice), TAR 1932 (Notice to Terminate)

### Arizona
- **AAR Residential Resale Purchase Contract** — Single dominant form
- **AAR BINSR** (Buyer's Inspection Notice and Seller's Response) — Critical inspection negotiation form
- **AAR Loan Contingency Addendum** — Not automatically included in base contract

### California
- **C.A.R. RPA** (Residential Purchase Agreement) — Single dominant form, substantially revised late 2023
- **CR** — Contingency Removal form (active removal required)
- **RR / RRRR** — Request for Repair / Response to Request for Repair
- **NBP** — Notice to Buyer to Perform (seller's tool for expired contingencies)
- 30-50+ individual forms/disclosures per transaction

---

## 3. Buyer Protection Mechanism — Critical State Difference

| State | Primary Buyer Protection | How It Works | Typical Days | Buyer Can Cancel For... |
|-------|--------------------------|--------------|-------------|------------------------|
| **Florida** | Inspection contingency | During period, buyer inspects and either negotiates repairs OR cancels | 15 days | Any inspection-related reason (As-Is: any reason) |
| **Texas** | **Option period** (unique) | Buyer pays non-refundable option fee to seller for unrestricted right to cancel | 5-10 days (typically 7) | **ANY reason whatsoever** — unrestricted |
| **Arizona** | Inspection period | Buyer inspects, submits BINSR. If no BINSR filed, buyer waives (silence = acceptance) | 10 days | Any reason during period |
| **California** | Investigation contingency | Broadest — covers inspections, disclosures, neighborhood, anything. **Active removal required** | 17 days | Any reason during period |

### Texas Option Period — Unique Data Requirements

| Field | Detail |
|-------|--------|
| `option_fee` | Typically $100-$500 (non-refundable, credited at closing) |
| `option_fee_delivery` | Within 3 calendar days of effective date |
| `option_period_days` | 5-10 days (7 typical) |
| `option_fee_recipient` | Seller (paid directly, NOT through escrow) |
| Termination method | Written notice before 5:00 PM on last day (TAR 1932) |

### California Active Contingency Removal — Unique Flow

```
Contingency period expires →
  Buyer submits CR form (contingency removed) → Done
  OR
  Buyer does NOT submit CR →
    Seller can issue NBP (Notice to Buyer to Perform) →
      Buyer has 2 days (48 hours) to either:
        - Remove contingency (CR form) → Done
        - Cancel contract → EMD refunded
        - Do nothing → Seller gains right to cancel
```

**This is different from all other states where contingencies simply expire.**

---

## 4. Contingency Periods — Default Timelines

| Contingency | Florida | Texas | Arizona | California |
|-------------|---------|-------|---------|------------|
| **Inspection/Investigation** | 15 calendar days | 5-10 days (option period) | 10 calendar days | 17 calendar days |
| **Financing/Loan** | 30 calendar days | 21-30 days (Financing Addendum) | 21-30 days (separate addendum) | 21 calendar days |
| **Appraisal** | Embedded in financing | Embedded in financing | Embedded in loan contingency | 17 calendar days (standalone) |
| **Title** | 15 days before closing (delivery) + 5 days review | 20 days (commitment delivery) | 5 business days after receipt | 17 calendar days |
| **HOA/Condo doc review** | 3 calendar days from receipt | 3-6 days from receipt | 5 calendar days from receipt | 5 calendar days from receipt |
| **Day counting** | Calendar days | Calendar days | Calendar days (weekends → next biz day) | Calendar days (weekends → next biz day) |

---

## 5. Required & Common Inspections

| Inspection | FL | TX | AZ | CA |
|-----------|----|----|----|----|
| **General home** | Optional (universal) | Optional (universal) | Optional (universal) | Optional (universal) |
| **Termite/WDO** | FL form FDACS 13645. Lenders often require | Optional. Lenders require for FHA/VA | Very common (high termite activity) | Section 1 vs Section 2 system (CA-specific) |
| **Wind mitigation** | **Yes** — Required for insurance discounts. OIR Form OIR-B1-1802. Valid 5 years | N/A | N/A | N/A |
| **4-point** | **Yes** — Required by insurers for homes 30+ years (some 20+) | N/A | N/A | N/A |
| **Foundation** | Standard | **Critical** — Expansive clay soils. PE inspection common ($400-$800) | Expansive soils in East Valley | Standard |
| **Pool** | Common (FL has many pools) | Common | **Very common** — Highest pool density in US | Common |
| **Radon** | Disclosure required (§404.056). Testing optional but recommended in central FL | Not common | Not common | Not common |
| **Sewer lateral** | Not standard | Not standard | Older homes | **City-specific requirements** (Berkeley, Oakland, SF) |
| **Roof** | Common (hurricane damage) | **Critical** — Hail damage (esp. North TX) | **Critical** — UV/heat damage to flat roofs | Common |
| **Septic** | If applicable (lenders require) | If applicable (TCEQ regulated) | If applicable (ADEQ regulated) | If applicable |

### FL-Specific Inspections
- Wind mitigation (OIR-B1-1802) — 20-50% insurance savings
- 4-point inspection (roof, electrical, plumbing, HVAC) — insurer requirement
- Chinese drywall testing (homes built 2001-2009, esp. SW FL)

### TX-Specific Inspections
- Foundation (PE inspection) — critical due to expansive clay soils
- Hydrostatic testing (TREC Addendum 46-0) — plumbing pressure test
- Hail damage / roof certification

### AZ-Specific Inspections
- Flat roof inspection (UV/heat degradation)
- Scorpion/pest assessment
- Well water quality testing (arsenic, nitrates — naturally occurring in AZ groundwater)

### CA-Specific Inspections
- Termite Section 1 vs Section 2 (active infestation vs conditions leading to)
- City-specific point-of-sale requirements (sewer lateral, energy audit, soft-story retrofit)
- Natural Hazard Zone assessment

---

## 6. Disclosure Requirements

| Disclosure | FL | TX | AZ | CA |
|-----------|----|----|----|----|
| **Seller property disclosure** | Not statutory (Johnson v. Davis common law duty). FR/Bar form used in practice | **Statutory** — TREC OP-H form required (§5.008 Prop Code) | Common law duty (Hill v. Jones). AAR SPDS form standard | **Statutory** — TDS required (Civ. Code §1102 et seq.) |
| **Lead paint (pre-1978)** | Federal requirement | Federal requirement | Federal requirement | Federal requirement |
| **Natural hazard** | Not required (radon disclosure only) | Not required | Not required | **Extensive** — NHD report required (earthquake, flood, fire, landslide, dam inundation) |
| **HOA** | §720.401 / §718.503 | §207.003 (Resale Certificate) | §33-1260 / §33-1806 | Davis-Stirling Act (Civ. Code §4525) |
| **Flood zone** | Part of general disclosure | Part of Seller's Disclosure Notice | Part of SPDS | Part of NHD report |
| **Transfer disclosure statement** | N/A | N/A | N/A | **CA-specific** — 3-part TDS (seller, listing agent, buyer's agent) |
| **Agent visual inspection** | N/A | N/A | N/A | **CA-specific** — AVID form |
| **Mello-Roos / CFD** | N/A (CDDs are FL equivalent) | N/A | N/A | **CA-specific** — Gov. Code §53341.5 |
| **MUD disclosure** | N/A | **TX-specific** — Water Code §49.452. Can add $0.50-$2.00+ per $100 assessed value | N/A | N/A |
| **CDD disclosure** | **FL-specific** — Community Development Districts. On property tax bill ($1,000-$4,000+/yr) | N/A | N/A | N/A |
| **Radon** | **FL-specific** — §404.056(5) mandatory contract language | Not required | Not required | Not required |
| **Energy efficiency** | §553.996 | Not required | Not required | Energy conservation retrofit (Civ. Code §1101.3) |
| **Coastal area** | CCCL disclosure (§161.57) | TREC Addendum 45-1 (coastal) | N/A | N/A |
| **Mineral rights** | Not common issue | **TX-specific** — Active mineral rights state. TREC 44-2 addendum | Can be severed from surface | N/A for most transactions |
| **Total disclosure documents** | 10-15 | 8-12 | 10-15 | **40-80+ pages** |

---

## 7. HOA/Condo Requirements

| Dimension | FL | TX | AZ | CA |
|-----------|----|----|----|----|
| **Governing law** | §718 (Condo), §720 (HOA) | Prop Code Ch. 207, 209 | ARS §33-1201 (Condo), §33-1801 (Planned Community) | Davis-Stirling Act (Civ. Code §4000-6150) |
| **Buyer cancel right after HOA doc review** | **3 days** | **3 days** | **5 days** | **5 days** |
| **Estoppel/Resale cert delivery** | 10 business days | 10 business days | 10 business days | Per HOA (no statutory timeline for provision, but seller must provide) |
| **Estoppel/Resale cert cost** | $250 max ($500 for rush) | $375 max | $200-$600 (no statutory cap) | $200-$600 (limited by Civ. Code §4530(b)) |
| **SIRS (Structural Integrity Reserve Study)** | **FL-specific** — Required for buildings 3+ stories. Must fund reserves for SIRS items. Cannot waive reserve funding. | N/A | N/A | Reserve study every 3 years (Civ. Code §5550) |
| **Milestone inspections** | **FL-specific** — 3+ story buildings at 25 years (20 years if within 3 miles of coast). Phase 1 → Phase 2 if deterioration found | N/A | N/A | SB 326 — balcony/deck inspection for condos by Jan 1, 2025 |
| **Reserve study requirement** | SIRS (post-Surfside) | No statutory requirement | No statutory requirement | Every 3 years (Civ. Code §5550) |
| **Transfer approval** | Varies by governing docs. 30 days typical | Cannot foreclose for fines alone. Governed by CC&Rs | Cannot unreasonably restrict sale | Per CC&Rs |

---

## 8. Insurance

| Dimension | FL | TX | AZ | CA |
|-----------|----|----|----|----|
| **Standard policy** | HO-3 (single family), HO-6 (condo) | HO-3 | HO-3 | HO-3 |
| **Avg annual premium** | $2,500-$6,000+ (crisis market) | $1,500-$4,500 | $800-$2,500 | $1,000-$3,500 (non-wildfire) |
| **Wind/hurricane** | Often excluded from standard. Separate or high deductible (2-10% of dwelling). Citizens = insurer of last resort | Coastal TX: TWIA provides wind/hail (separate policy, requires WPI-8 cert). Inland: included | Included in standard | Included in standard |
| **Flood** | FEMA zones. Very common in FL. $500-$3,000+/yr | FEMA zones. Post-Harvey awareness. $500-$3,000+/yr | Rare in metro. Monsoon risk near washes | FEMA zones. Required in SFHA |
| **Earthquake** | N/A | N/A | N/A | **CA-specific** — CEA. Optional. 10-25% deductible. $800-$5,000+/yr |
| **Sinkhole** | **FL-specific** — Insurers must offer. Optional add-on. 10-30% surcharge | N/A | N/A | N/A |
| **Wildfire** | N/A | N/A | Not a major concern | **CA-specific** — Major crisis. FAIR Plan as last resort. 2-5x normal premiums |
| **Title insurance: Who pays** | County-specific. Most counties: seller. Miami-Dade/Broward/Sarasota: buyer | Customarily seller (owner's) / buyer (lender's). Regulated rate state | Customarily seller (owner's) / buyer (lender's). Maricopa County standard | NorCal vs SoCal customs differ. Negotiable |
| **Title insurance rates** | Promulgated (state-set). $5.75/$1K first $100K, $5.00/$1K above | **Regulated rate** — TDI sets all premiums. Every company charges the same rate | Market rate | Market rate (CLTA standard vs ALTA extended) |

---

## 9. Earnest Money & Fees

| Dimension | FL | TX | AZ | CA |
|-----------|----|----|----|----|
| **Typical EMD** | 1-3% of price | 1-2% of price | 1% of price | 1-3% (competitive: 3%+) |
| **Deposit deadline** | 3 calendar days | 3 calendar days | 3 business days | 3 business days |
| **EMD holder** | Title company or broker escrow | Title company | Title/escrow company | Escrow company |
| **Option fee** | N/A | **TX-specific** — $100-$500 paid directly to seller. Non-refundable | N/A | N/A |
| **Cure period for late EMD** | Varies by contract | Not automatic termination (seller must give notice) | 3 business days after notice | Per contract |
| **Liquidated damages** | Per contract default remedy | Per TREC 20-17 §15 — EMD to seller | Per AAR contract — EMD to seller | Must be separately initialed. Capped at 3% of price (1-4 units) |

---

## 10. Taxes & Government Fees

| Dimension | FL | TX | AZ | CA |
|-----------|----|----|----|----|
| **Transfer tax (deed)** | $7.00/$1K (most counties). Miami-Dade: $10.50/$1K. Seller pays | **None** | **None** (Affidavit of Value: $2 filing fee) | $1.10/$1K county + city transfer tax (varies wildly: LA $4.50/$1K, SF up to $30/$1K, plus LA Measure ULA "mansion tax") |
| **Mortgage tax** | Doc stamps: $3.50/$1K + Intangible tax: $2.00/$1K = **$5.50/$1K total on mortgage**. Buyer pays | **None** | **None** | **None** |
| **Property tax rate** | ~0.9-1.2% effective | ~1.6-1.8% (can exceed 3% in MUDs) | ~0.7-1.2% effective | ~1.1-1.4% effective (Prop 13 base of 1%) |
| **Property tax year** | Calendar (Jan-Dec), paid in arrears | Calendar (Jan-Dec), paid in arrears | Fiscal (Jul-Jun), paid in arrears | Fiscal (Jul-Jun), paid in arrears |
| **Homestead tax exemption** | $50,000 off assessed + SOH 3% cap | $100,000 off school taxes (as of 2024) | **None** (asset protection only: $400K) | **None** (asset protection only: $300K-$600K) |
| **Supplemental tax** | N/A | N/A | N/A | **CA-specific** — Reassessment triggers supplemental bill within 6-12 months |
| **Prop 13 / SOH** | Save Our Homes: assessed value capped at 3%/yr increase. Portability within FL | N/A | Limited Property Value: 5%/yr cap | Prop 13: 2%/yr cap on assessed value increase |
| **Special district taxes** | CDD ($1,000-$4,000+/yr on tax bill) | MUD ($0.50-$2.00+ per $100 assessed) | N/A | Mello-Roos ($2,000-$10,000+/yr) |

---

## 11. Closing Process

| Dimension | FL | TX | AZ | CA |
|-----------|----|----|----|----|
| **Closing style** | Wet closing (table funding) | Dry funding (sign → lender reviews → funds → records) | Escrow closing (sign separately → fund → record) | Escrow closing (sign separately → fund → record) |
| **Parties sign together?** | Often, but split closings common | Often sign separately | Always sign separately | Always sign separately |
| **Gap: signing → keys** | Same day typically | 1-3 business days (lender review after signing) | 1-3 business days | 1-3 business days |
| **Recording** | 1-2 business days after closing | Same day or next day after funding | Same day or next day after funding | Same day as funding (usually morning) |
| **RON (Remote Online Notarization)** | Yes (§117.265 — early adopter) | Yes (Gov. Code Ch. 406) | Limited / evolving | Effective Jan 1, 2024 (AB 1093), limited |
| **Typical close timeline (financed)** | 30-45 days | 30-45 days | 30-35 days | 30 days (21-45 range) |
| **Cash timeline** | 14-21 days | 14-21 days | 14-21 days | 14-21 days |

---

## 12. Non-Resident Seller Withholding

| State | Requirement |
|-------|-------------|
| **FL** | FIRPTA only (federal 15% if foreign seller). No state withholding |
| **TX** | FIRPTA only. No state income tax |
| **AZ** | **2% of gross sales price** withheld for non-resident sellers (ARS §43-1072) + FIRPTA |
| **CA** | **3.33% of gross sales price** withheld for non-resident sellers (Rev. & Tax Code §18662) + FIRPTA |

---

## 13. Community Property Implications

| State | Community Property? | Impact on Transactions |
|-------|:-------------------:|------------------------|
| **FL** | No | Standard title vesting. No spousal consent required unless homestead |
| **TX** | Yes | Both spouses must sign deed of trust for homestead. Marital Status Affidavit required | 
| **AZ** | Yes | Both spouses must sign deed of trust (ARS §33-452). Quit claim may be needed for sole-and-separate |
| **CA** | Yes | Both spouses must sign to sell/encumber community property. Multiple vesting options |

---

## 14. Post-Close Requirements

| Item | FL | TX | AZ | CA |
|------|----|----|----|----|
| **Homestead filing** | By March 1 (Property Appraiser). SOH portability within 3 years | Within 2 years (County Appraisal District). $100K school tax exemption | N/A (no tax exemption) | N/A (no tax exemption) |
| **Property tax surprise** | SOH reassessment: taxes WILL increase for new owner | Property tax protest (deadline May 15 annually) | Limited Property Value resets on transfer | Prop 13 reassessment + supplemental tax bill (6-12 months) |
| **Insurance follow-up** | Wind mitigation inspection for discounts | None specific | None specific | Defensible space compliance (wildfire zones) |

---

*This comparison document should be referenced when building the StateConfig schema and conditional workflow engine. Every difference listed here represents a conditional branch, data field, or workflow step that must be configurable per state.*
