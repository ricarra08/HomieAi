# HomeBuyer Pro — Product Improvements Roadmap
## Version 1.0 — April 2026
## Consolidated from: Realtor interviews, demo feedback, expert analysis, and internal planning
## Internal strategy document — Confidential

---

## 1. Sources

This document consolidates insights from:
- **Realtor Demo Feedback** — Direct feedback and follow-up questions from agent demo sessions
- **Realtor Interview Insights** — Post-demo Q&A with buyer's agent (NH, MA, FL), April 11 2026
- **Expert Realtor Vet** — Critical analysis of interview responses from 15+ year, 500+ closing practitioner
- **Phase Improvements** — Internal feature backlog notes
- **State Selection Strategy** — Data-driven analysis of which states to build for first

---

## 2. Priority Matrix

### Tier 1 — Adoption Blockers
Without these, agents won't use the platform consistently and buyer experience has critical gaps.

#### Email-to-Platform Document Ingestion
- **Signal:** Agent's literal #1 priority. "Definitely the documents — uploading documents, being able to email documents directly into the platform, and CCing emails to the platform."
- **What:** Each deal gets a unique inbound email address (e.g., `deal-742elm@docs.homieai.com`). Attachments are auto-extracted, classified, processed through the existing AI pipeline, and appear in the deal's document tab.
- **Why it matters:** Agents live in email. Manual upload works for demos but fails in real practice where agents are CC'd on 15 emails/day with attachments. This is the bridge between agent workflow and our platform.
- **Architecture:** Inbound email service (e.g., SendGrid Inbound Parse, AWS SES) → extract attachments → call existing `/api/documents/process` pipeline → notify buyer.

#### State-Conditional Workflow Engine
- **Signal:** Architecture confirmed by practitioner: "Definitely conditional steps." NOT separate per-state flows.
- **What:** A data-driven `StateConfig` schema that drives conditional steps, required documents, inspection types, disclosure requirements, insurance needs, contingency defaults, and closing entity type per state.
- **Launch states:** FL → TX → AZ (Wave 1, all title-company states, ~20% of US market)
- **Config schema:**
  ```
  StateConfig {
    state_code, closing_type (title_company | attorney | escrow),
    attorney_review_required, attorney_review_days,
    standard_inspection_period_days,
    required_inspections[], required_disclosures[],
    standard_contract_type, insurance_requirements[],
    hoa_requirements[], contingency_defaults{},
    unique_requirements[]
  }
  ```
- **Clustering advantage:** States cluster into groups (Sun Belt Title, West Coast Escrow, Midwest Standard, Southeast Attorney, Northeast Attorney). Once you build one state in a cluster, the next is ~60% cheaper.
- **50-state math:** Wave 1 = 300-400 hrs (includes engine). Full 50 states = ~1,350-1,850 hrs over 9-12 months. But only justified if B2B demands it — the first 10-15 states cover 70%+ of the market.

#### HOA Compliance Tracker + AI Summarization
- **Signal:** "7 out of 10 deals get affected by HOA compliance issues." — 70% deal impact rate.
- **What:** First-class HOA feature, not an afterthought.
  - Document collection tracking: bylaws, rules & regs, budget, meeting minutes, reserve study, estoppel letter
  - AI-powered bylaw summarization (leverage existing document intelligence pipeline)
  - Budget health analysis (reserve ratio — below 30% is a red flag)
  - FL-specific: SIRS compliance status, milestone inspection status
  - Transfer approval requirement tracking (yes/no, timeline)
  - Rental restriction detection (none / limited / strict)
- **HOA Risk Score:** Auto-generated from uploaded HOA docs:
  - Reserve fund ratio (reserves / annual budget)
  - Pending special assessments (parsed from meeting minutes)
  - Rental restriction severity
  - SIRS/Milestone compliance (FL)
  - Estoppel order status and expected delivery date
- **Why it matters:** This alone could be a selling point for FL agents. No platform generates this from uploaded docs.

#### Progressive Cash-to-Close Estimator
- **Signal:** "Before house hunting" — agent confirmed buyers are surprised at contract. The ideal time for the estimate is before they ever look at a property.
- **What:** 3-stage progressive estimator:
  1. **Shopping phase:** Rough range generated automatically when pre-approval letter is uploaded and processed. Uses: purchase price range, estimated rate, down payment %, loan program (FHA/Conv/VA) to model down payment + estimated closing costs (2-5% by state) + prepaids + funding fees.
  2. **Offer/Under Contract phase:** Refined estimate when Loan Estimate arrives. Real numbers replace estimates.
  3. **Closing phase:** Final number when Closing Disclosure arrives. Show delta from LE.
- **Enhancement from expert vet:** Don't wait until "shopping." The moment a pre-approval letter is uploaded and processed by document AI, auto-generate a cash-to-close range. The buyer sees it before they ever look at a property.
- **Must include (expert blind spot corrections):**
  - Seller concessions / credits (negotiated, directly affects CTC)
  - Appraisal gap coverage (cash commitment not on the LE)
  - FHA/VA funding fee (if applicable)

---

### Tier 2 — Differentiators
These make agents recommend the platform to buyers and make the product feel indispensable.

#### Context-Aware Insurance Module
- **Signal:** Expert-level non-obvious insight from agent: "HO-6 policy, wind mitigation insurance."
- **What:** Insurance checklist that adapts to property type + state + financing:
  - Property type: Condo → HO-6, Single family → HO-3
  - State: FL → wind mitigation + 4-point inspection (homes 30+ years), flood zones → flood insurance
  - Financing: <20% down → PMI, FHA → MIP (permanent on 30yr with <10% down)
  - Include: owner's title vs lender's title explanation (with state/county variance — in FL, seller pays in most counties but buyer pays in Dade and Broward)
- **Enhancement:** Evolve from checklist to cost estimator — estimated homeowner's premium, flood zone status (FEMA API), PMI/MIP cost by LTV, wind mitigation discount potential.

#### Full DTI Breakdown with What-If Scenarios
- **Signal:** "Full breakdown" — decisive answer. Expert vet added critical nuance.
- **What:** Not just one number — two DTI ratios displayed together:
  - **Front-end DTI** (housing ratio): monthly housing costs / gross monthly income. Conventional cap ~28%, FHA ~31%.
  - **Back-end DTI** (total debt ratio): all monthly obligations / gross monthly income. Conventional ~43-45%, FHA up to 50%, VA uses residual income.
  - Itemized debts list + income sources
  - What-if scenario modeling: "What if I pay off this credit card?" → show impact on both ratios
  - **Loan program eligibility indicators:** As buyer adjusts debts, show: "At this DTI, you qualify for Conventional, FHA, and VA" vs "At this DTI, only FHA"
- **Surface in:** Shopping phase (pre-qual check) and Financing view

#### Collaborative Shopping Workspace
- **Signal:** "It's all collaborative. There is no handoff." — Fundamental architecture insight.
- **What:** The shopping phase must be a shared workspace from the start:
  - Shared property lists (both buyer and agent can add/dismiss)
  - Agent notes visible to buyer, buyer preferences visible to agent
  - Shared activity feed
  - Phase-aware collaboration model:
    - Early shopping: agent pushes curated properties with notes
    - Mid shopping: co-equal discovery, shared saves/dismissals
    - Late shopping: comparison mode (side-by-side property analysis)
- **Expert nuance:** Collaboration is continuous but the *type* changes. The workspace should reflect whether agent is leading, co-equal, or buyer is leading.

#### AI Shopping with Transparent Stretch
- **Signal:** "Primarily focus on buyer's criteria... but it doesn't hurt to splash in a few challenges with a disclosed reason why."
- **What:** 95% match + occasional stretch algorithm:
  - Hard exclusions (specific cities, communities) are NEVER violated
  - Soft criteria (sq ft, bedrooms, price) can be stretched with visible explanation: "Shown because: $30K under budget, preferred school district"
  - Criteria versioning: track what buyer wanted initially vs what they adjusted to and why
  - Link criteria changes to showings that triggered them

---

### Tier 3 — Engagement Deepeners

#### Property Intelligence Cards
- **What:** Auto-generated card for every saved property with:
  - Pricing Analysis: DOM (with market average comparison), price changes, tax assessment vs list price, comp-based value range
  - Neighborhood Context: school ratings, walkability, crime, pending development/permits
  - Financial Projection: estimated monthly cost, appreciation forecast (from stochastic model)
  - Agent Notes: free-text from buyer's agent
- **Data requirement:** Requires property data API integration (MLS or aggregator). Not available in v1 without external data source.

#### EMD Tracker with Wire Fraud Protection
- **Signal:** "I'm fielding questions about that." Expert vet: EMD is the first large sum sent to a stranger and #1 wire fraud target.
- **What:** More than bookkeeping — security-first:
  - Amount, date wired/delivered, receipt confirmation status
  - Wire instruction verification (does account match title company's instructions?)
  - Confirmation of receipt from escrow/title company
  - Refund conditions tied to contingency deadlines
  - Wire fraud warning with best practices BEFORE the buyer sends money
- **Trust signal:** When a buyer sees the platform warns about wire fraud before they send $10K, they trust it for everything else.

#### Re-inspection Workflow
- **Signal:** Internal backlog (Phase-Improvements.md)
- **What:** After repair negotiations are complete, track the re-inspection:
  - Link to original inspection findings (repair_items)
  - Re-inspection scheduling and status
  - Pass/fail per repair item
  - Credits confirmed if repairs not completed

#### Translations / i18n
- **Signal:** Internal backlog (Phase-Improvements.md)
- **What:** Multi-language support. Priority: Spanish (largest non-English homebuyer demographic in FL, TX, AZ — our Wave 1 states). Consider: Mandarin, Vietnamese, Korean for CA expansion.

---

### Tier 4 — Long-Tail / Post-Core

#### Post-Close Principal Calculator
- **Signal:** Agent said "lump sum" for payment mode. Expert vet: add refi comparison.
- **What:** Build both input modes:
  - Lump sum (default): "What if I put $10K toward principal?"
  - Monthly extra payment: "What if I add $100/month?"
  - **Refi comparison (expert addition):** "What if I refinance in 5 years at X%?" — current terms vs hypothetical refi. Show when refinancing makes sense based on rate environment and remaining principal.

#### Stochastic Home Value Model
- **Signal:** Internal backlog (Phase-Improvements.md)
- **What:** Algorithm predicting future home value using stochastic modeling while accounting for future developments, planning initiatives, and possible gentrification.
  - Three scenarios: conservative, moderate, optimistic
  - Reference the existing `home_value_model.pdf` in repo root
  - Surface in Post-Close phase as a "Your home's projected value" card
- **Dependency:** Requires property data API + local development data sources.

#### Offer Strength Analyzer
- **Signal:** Internal backlog (Phase-Improvements.md). Currently in "Defer" tier per MVP scope.
- **What:** Analyze offer competitiveness based on: list price vs offer, DOM, comps, contingency terms, escalation potential.
- **Status:** Deferred per MVP overlay. Revisit after Offer phase sees real usage.

---

## 3. State Launch Strategy

### Legal Landscape

| Category | States | Implementation Impact |
|----------|--------|----------------------|
| **Title Company States** (33) | FL, TX, AZ, CO, NV, NM, and 27 others | Easiest — standardized workflow, no attorney gate |
| **Escrow States** (subset of title) | CA, OR, WA, HI, NV | Similar to title company, different closing entity |
| **Attorney-Required States** (11) | CT, DE, GA, KY, MA, NH, NY, NC, SC, VT, WV | Requires attorney review phase gate — fundamentally different flow |
| **Partial Attorney States** (7) | AL, LA, ME, MD, MS, ND, RI | Attorneys for specific tasks only |

### Launch Waves

#### Wave 1 — Build the Engine (FL, TX, AZ)
- **Score:** FL=19, TX=19, AZ=18 (out of 20)
- **~700-800K transactions/year** = 20% of US market
- **All title-company states** = simplest implementation, no attorney phase gate
- **Why these three:**
  - FL: highest strategic fit. Every differentiator maximized (HOA, SIRS, wind mit, HO-6, condo market). 344K transactions. $154B annual market.
  - TX: fastest population growth in the US. 300-350K transactions. 67.9% of new builds have HOAs.
  - AZ: highest acquisition potential. Phoenix metro is where CA-priced-out FTHBs migrate. Standard flow.
- **Timeline:** 2-3 months (includes building the state config engine)

#### Wave 2 — Title Company Expansion (CA, CO + 5-8 Midwest/Mountain)
- **CA:** Too big to ignore. Escrow-state mechanics + extensive disclosure requirements (Natural Hazard, Transfer Disclosure, Mello-Roos) add weight. Build after engine is proven.
- **CO:** Title company state, Denver is tech-forward. Low marginal cost.
- **Midwest/Mountain:** OH, IN, MI, MN, WI, UT, ID — title company states, straightforward, expand addressable market by 15-20%.
- **Timeline:** 2 months after Wave 1

#### Wave 3 — Attorney States (GA, NC, SC, VA)
- **Build the attorney review branch once, deploy to all attorney states simultaneously.**
- GA (Atlanta) and NC (Charlotte, Raleigh) are top migration destinations.
- **Timeline:** 2 months after Wave 2

#### Not Prioritized
- **MA:** Small market, unique P&S flow, high prices. Only if a brokerage partnership justifies it.
- **NH:** Tiny market (~15-20K transactions). Only as freebie when MA is built.
- **NY:** Co-op complexity, attorney state, lowest turnover, highest prices. Only if major NYC brokerage partnership.

### Clustering Advantage

| Cluster | States | Once You Build One... |
|---------|--------|----------------------|
| Sun Belt Title | FL, TX, AZ, NV, NM | Next state is ~60% cheaper |
| West Coast Escrow | CA, OR, WA, HI | Share disclosure frameworks |
| Midwest Standard | OH, IN, MI, MN, WI, MO, IA | Nearly identical configs |
| Southeast Attorney | GA, NC, SC, VA | Share legal tradition |
| Northeast Attorney | MA, NH, VT, CT, NY, NJ | Higher complexity, smaller markets |

---

## 4. Blind Spots to Design Around

These were NOT mentioned by the interviewed agent but flagged by the expert vet. They represent gaps in our current product design that will surface with wider usage:

| Blind Spot | Impact | Action |
|------------|--------|--------|
| **New construction workflows** | Different timeline, builder contracts, no standard inspection contingency, CO delays | Add `property_type` flag to deals. Conditional steps for new construction. Defer deep implementation. |
| **VA/FHA-specific friction** | VA: Minimum Property Requirements, termite inspection, funding fee. FHA: repair requirements that can delay closing. Significant % of FTHBs use FHA. | Add loan program type to deal. Conditional inspections and requirements per program. |
| **Seller concessions / credits** | Directly affects cash-to-close. Common in current market. Not on the LE. | Add to cash-to-close estimator as a variable. Track in offer details. |
| **Appraisal gap coverage** | Cash commitment not on the LE. In competitive markets, buyers cover gap between appraised value and purchase price. | Add to offer details and cash-to-close estimator. |
| **Dual agency / transaction brokerage** | Platform assumes buyer's agent + seller's agent. Some states allow dual agency. | Add agent relationship type to deal setup. Adjust collaboration model. |
| **Front-end vs back-end DTI** | Two ratios, not one. Different caps per loan program. | Build DTI module with both ratios (see Tier 2 above). |

---

## 5. New Feature Discoveries

Features that emerged from research that were NOT in the original product spec:

| Feature | Source | Priority |
|---------|--------|----------|
| **Email-to-platform document ingestion** | Agent interview — #1 ask | Tier 1 |
| **HOA Risk Score** (auto-generated from uploaded docs) | Expert vet analysis | Tier 1 |
| **Loan program eligibility indicators** in DTI module | Expert vet analysis | Tier 2 |
| **Refi comparison calculator** (post-close) | Expert vet analysis | Tier 4 |
| **Property Intelligence Cards** | Expert vet analysis | Tier 3 |
| **Criteria versioning** (track buyer preference evolution) | Agent interview + expert | Tier 3 |
| **State-conditional workflow engine** (the architecture, not individual states) | Agent interview — confirmed conditional steps | Tier 1 |

---

## 6. Key Takeaway

> **"The agent's priorities reveal that adoption friction matters more than feature depth. They didn't ask for a better AI or a smarter calculator. They asked for an easier way to get documents in. Build the funnel before you build the features."**
> — Expert Realtor Vet analysis

The order of operations is:
1. Make documents flow in effortlessly (email ingestion + collaborator links)
2. Make the state-specific workflow trustworthy on first use (state config engine)
3. Surface deal-breaking risks early (HOA compliance, cash-to-close surprise)
4. Then deepen the AI, financial tools, and collaborative features

---

*This document should be updated after each agent/buyer interview, demo session, or significant product discovery.*
