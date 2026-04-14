# Realtor Interview Insights — Post-Demo Feedback
## Source: Follow-up Q&A with Buyer's Agent (NH, MA, FL)
## Date: April 11, 2026

---

## Raw Responses & Analysis

### 1. State & Regulatory Variance

**Q: Which 3–5 states do you most commonly work in, and biggest workflow differences?**
> New Hampshire, Massachusetts, Florida. Different inspections, different paperwork requirements, different levels of professionalism.

**Verdict: REVISED — The agent told us where *they* work, not where *we* should build first.** Those are fundamentally different questions. State selection must be driven by market size, customer acquisition potential, ease of implementation, and strategic fit — not one agent's geography. See the full State Selection Strategy below.

**Actionable:** See [State Selection Strategy](#state-selection-strategy) for the data-driven analysis.

---

**Q: Separate flows or conditional steps for inspection/appraisal?**
> Definitely conditional steps.

**Verdict: HIGH VALUE** — This is an architecture decision confirmed by the practitioner. We do NOT need to build three separate flows. A single flow with state-driven conditional logic (show/hide steps, swap forms, adjust deadlines) is the right approach. This significantly reduces build complexity.

**Actionable:** Design a conditional step system, not separate per-state flows. State selection at deal creation drives which steps are active.

---

**Q: How do you track state-specific deadlines today?**
> A transaction coordinator.

**Verdict: MODERATE VALUE** — The answer itself is expected and brief, but the implication is important: the TC is the person manually tracking all compliance deadlines. If Homie AI automates deadline tracking per state, we either (a) reduce TC workload, making agents with TCs more efficient, or (b) enable agents *without* TCs to operate at the same level. Both are strong value propositions.

**Actionable:** Position deadline tracking as "your built-in transaction coordinator." Consider a TC-facing view in a future B2B tier.

---

### 2. Financial Visibility & Estimators

**Q: When do buyers get most surprised by cash-to-close?**
> Once we're under contract... I have a lender that will tell them as soon as you're under contract. Before house hunting.

**Verdict: HIGH VALUE** — Two key insights here. First, the surprise hits at contract time — confirming the suggestion to start the cash-to-close estimator at the offer phase. Second, the ideal time for the estimate is *before* house hunting (shopping phase). This means we should introduce a rough cash-to-close range during the shopping phase based on the buyer's pre-approval and target price, then refine it when they go under contract and again at closing.

**Actionable:** Build a 3-stage cash-to-close estimator: (1) rough range in Shopping based on pre-approval + target price, (2) refined estimate in Offer/Under Contract when LE arrives, (3) final in Closing when CD arrives. This is a differentiator — no consumer tool does this progressively today.

---

**Q: DTI — single ratio or full breakdown?**
> A full breakdown.

**Verdict: HIGH VALUE** — Clear and decisive. Don't simplify. Build a complete DTI breakdown: list every debt, show income sources, calculate the ratio, and support "what-if" scenarios (e.g., "what if I pay off this credit card first?"). This aligns with the FTHB persona's need for education and the experienced buyer's need for control.

**Actionable:** Build a full DTI module with itemized debts, income sources, and what-if scenario modeling. Surface it in the Shopping phase (pre-qual check) and refine in Financing.

---

**Q: Principal calculator — what increments?**
> Lump sum.

**Verdict: LOW-MODERATE VALUE** — The answer is useful for UI design (default to lump-sum input rather than monthly increment sliders) but is a narrow implementation detail. The principal calculator itself was already confirmed as wanted; this just tells us the input mode. Most calculators support both — we should too, but default to lump sum.

**Actionable:** Build the post-close principal calculator with lump-sum as the primary input, monthly extra payment as secondary. Low-priority feature — post-close is the least time-sensitive phase.

---

**Q: Do buyers track EMD on their own?**
> I'm fielding questions about that.

**Verdict: MODERATE VALUE** — Confirms EMD is a source of confusion and agent workload. Buyers don't track it well, so the agent fields questions about whether it was received, how much it was, and where it went. A simple EMD tracker (amount, date sent, receipt confirmation, application to closing costs) would reduce these calls.

**Actionable:** Add EMD tracking to the Offer phase: amount, date wired/delivered, receipt confirmation status. Simple feature, clear value.

---

### 3. Insurance & HOA

**Q: Which insurance types confuse buyers most?**
> The HO-6 policy, wind mitigation insurance.

**Verdict: HIGH VALUE** — This is expert-level, non-obvious insight. HO-6 is condo-specific (covers interior/personal property, not the building). Wind mitigation is Florida-specific and can dramatically reduce premiums. These are not the insurance types most apps explain (they default to basic homeowner's and title). This tells us our insurance section needs to be state- and property-type-aware, not generic.

**Actionable:** Build a context-aware insurance checklist that adapts to: (1) property type (condo → HO-6, single family → HO-3), (2) state (FL → wind mitigation, flood zones → flood insurance), (3) financing (< 20% down → PMI). Include educational content for each via Homie AI.

---

**Q: HOA/condo doc bottleneck?**
> The rules, the regulations and the bylaws — the bylaws are a nightmare. Also the HOA budget. In Florida specifically, the SIRS and milestone inspections. The buyer's agent handles collecting them.

**Verdict: HIGH VALUE** — Multiple actionable insights packed in here:
1. **Bylaws** are the biggest pain — they're long, dense, and full of restrictions that can kill deals.
2. **HOA budget** matters because it signals future special assessments (if reserves are low, a big assessment is coming).
3. **SIRS (Structural Integrity Reserve Study) and milestone inspections** are Florida-specific post-Surfside-collapse requirements. This is a regulatory nuance that generic platforms miss entirely.
4. **The buyer's agent** is the one collecting these — so our platform needs to support the agent's workflow for gathering and tracking HOA docs, not just the buyer's.

**Actionable:** Build an HOA/Condo document tracker with required document types (bylaws, rules & regs, budget, meeting minutes, reserve study). For FL, add SIRS and milestone inspection status. Track collection status per document. This is a high-friction area — solving it differentiates us.

---

**Q: How often do HOA issues delay or kill a deal?**
> Extremely often. 7 out of 10 will usually get affected by HOA compliance issues.

**Verdict: CRITICAL VALUE** — 70% of HOA/condo deals are affected. This is not a nice-to-have — it's a core risk factor for a massive segment of the market (condos and planned communities). If Homie AI can surface HOA red flags early (low reserves, pending special assessments, restrictive bylaws, missing SIRS), it could prevent deal delays for the majority of these transactions.

**Actionable:** Prioritize HOA compliance as a first-class feature, not an afterthought. Include: document collection tracking, AI-powered bylaw summarization (leverage existing document intelligence), budget health analysis (reserve ratio), and FL-specific SIRS/milestone status. This alone could be a selling point for FL agents.

---

### 4. Shopping Phase & AI

**Q: How often do buyer criteria change?**
> It literally always changes. Getting a grip on the reality of the market and how much things cost.

**Verdict: MODERATE VALUE** — Confirms what we assumed but adds the *why*: criteria change because of price shock. Buyers enter with a wishlist and reality forces trade-offs. The AI should track criteria evolution and help buyers understand what they're gaining/losing with each adjustment.

**Actionable:** Build criteria versioning — track what the buyer wanted initially vs. what they adjusted to and why. The AI can reference this history: "You originally wanted 4 bedrooms but adjusted to 3 to stay under $400K. Here's a 4-bedroom at $410K in a neighboring town — worth a look?"

---

**Q: Should AI challenge buyer assumptions or strictly match?**
> Primarily focus on the buyer's criteria. If the buyer says they don't want a specific community/city/square footage, respect that. But it doesn't hurt to splash in a few challenges here and there — and if it challenges, there should be a disclosed reason why.

**Verdict: HIGH VALUE** — This is a nuanced product design insight. The AI should NOT aggressively challenge. The default is strict matching with hard exclusions respected. But it can occasionally surface "stretch" options with explicit reasoning (e.g., "This is 50 sq ft smaller than your minimum, but it's $30K under budget and in your preferred school district"). The key is *transparency* — always explain why a non-matching property is being shown.

**Actionable:** Implement a "95% match + occasional stretch" algorithm. Hard exclusions (specific cities, communities) are never violated. Soft criteria (sq ft, bedrooms) can be stretched with a visible explanation tag: "Shown because: $30K under budget, preferred school district."

---

**Q: What data points matter most that buyers don't ask about?**
> Days on market, when it was last sold.

**Verdict: MODERATE VALUE** — These are standard MLS data points, but the insight is that buyers don't proactively look at them. Days on market signals negotiation leverage (high DOM = motivated seller). Last sold date + price signals appreciation and potential equity for the seller. The AI should surface these proactively in property analysis.

**Actionable:** Auto-surface DOM and last-sold-date/price in every property card during shopping. Have the AI comment on what these mean: "This home has been on market 45 days — the average in this zip is 12. The seller may be open to negotiation."

---

**Q: How collaborative is the shopping phase?**
> It's all collaborative. There is no handoff.

**Verdict: HIGH VALUE** — This is a fundamental product architecture insight. The shopping phase is NOT "buyer browses alone, then hands favorites to agent." It's a continuous collaboration. This means the platform must support real-time shared views, agent-buyer co-browsing, shared notes, and mutual visibility into saved/dismissed properties from day one — not as a later feature.

**Actionable:** The shopping phase must be built as a collaborative workspace from the start. Shared property lists, agent notes visible to buyer, buyer preferences visible to agent, shared activity feed. This aligns with the earlier B2B insight about "Share comparison with your agent."

---

### 5. Prioritization

**Q: Top three features for your next closing?**
> Definitely the documents — uploading documents, being able to email documents directly into the platform, and CCing emails to the platform.

**Verdict: CRITICAL VALUE** — The #1 priority from a practicing agent is document management — specifically, email-to-platform ingestion. This is not a feature we currently have. The ability to CC `docs@homieai.com` (or a deal-specific email address) and have attachments auto-ingested, classified, and processed by the AI pipeline would be transformational for the agent workflow. Agents live in email. Meeting them there is essential.

**Actionable (NEW FEATURE):** Build an email-to-platform document ingestion pipeline. Each deal gets a unique inbound email address. Attachments are auto-extracted, classified by document type, processed through the existing AI pipeline, and appear in the deal's document tab. This was the agent's *single highest priority* — it should be treated accordingly.

---

---
---

# State Selection Strategy
## Why "the realtor said NH, MA, FL" is not a strategy

The agent told us where they personally close deals. That's useful for understanding *their* workflow, but it's not a market entry decision. NH has ~15,000-20,000 annual home transactions — it's one of the smallest residential markets in the country. Building state-specific compliance for NH first would be like launching a food delivery app in a town of 5,000 people because the first restaurant owner you talked to lives there.

State selection for a product like Homie AI must be scored on four dimensions:

1. **Market Size** — Annual transaction volume (how many potential deals flow through the platform?)
2. **Customer Acquisition Potential** — FTHB concentration, population growth, price accessibility, digital adoption
3. **Ease of Implementation** — Attorney state vs. title company state, regulatory complexity, number of unique forms/requirements
4. **Strategic Fit** — Does the state play to Homie AI's differentiators (document intelligence, HOA compliance, AI copilot)?

---

## The Legal Landscape: Three Categories of States

Before scoring, you need to understand the fundamental architectural split in U.S. real estate:

### Attorney-Required States (11)
Connecticut, Delaware, Georgia, Kentucky, Massachusetts, New Hampshire, New York, North Carolina, South Carolina, Vermont, West Virginia

A licensed attorney must conduct or supervise the closing. This introduces an **attorney review period** (typically 3-7 days after accepted offer) as a mandatory workflow phase. In MA specifically, the Offer → Attorney-Drafted P&S Agreement → Closing cadence is a fundamentally different flow than most of the country.

### Partial Attorney States (7)
Alabama, Louisiana, Maine, Maryland, Mississippi, North Dakota, Rhode Island

Attorneys required for specific tasks (title certification, document prep) but don't need to run the full closing.

### Title Company States (33)
Florida, Texas, California, Arizona, Colorado, and 28 others

Title companies or escrow agents handle the entire closing. No mandatory attorney involvement. **These are the easiest to implement** because the workflow is more standardized and the closing process has fewer gatekeepers.

### Escrow States (subset of title company states)
California, Oregon, Washington, Hawaii, Nevada

Use independent escrow officers rather than title companies. Functionally similar to title company states but with a different closing entity. CA is the big one here.

**Implementation takeaway:** Title company states require the fewest conditional branches. Attorney states require at minimum an attorney review phase gate and different document flows. Start with title company states.

---

## State Scoring Matrix

### Scoring Criteria (1-5 scale)

| Dimension | 1 (Low) | 5 (High) |
|-----------|---------|----------|
| **Market Size** | < 30K annual transactions | > 250K annual transactions |
| **Acquisition Potential** | High prices, low growth, low FTHB share | Affordable, high growth, strong FTHB pipeline |
| **Ease of Implementation** | Attorney state, unique legal framework, complex disclosures | Title company state, standard contracts, minimal unique requirements |
| **Strategic Fit** | Low HOA density, few condos, minimal doc complexity | High HOA density, condo-heavy, insurance complexity, doc-heavy |

### Top 10 Candidate States — Scored

| State | Market Size | Acquisition | Implementation | Strategic Fit | **Total** | Notes |
|-------|:-----------:|:-----------:|:--------------:|:------------:|:---------:|-------|
| **Florida** | 5 | 4 | 5 | 5 | **19** | 344K transactions. #2 HOA density nationally (50,100 HOAs). Title company state. SIRS/milestone requirements, wind mitigation, HO-6 — maximizes every Homie AI differentiator. Condo market alone is 89K units/yr. |
| **Texas** | 5 | 5 | 5 | 4 | **19** | ~300-350K estimated transactions. Fastest population growth in the US. Affordable. Title company state. 23,000 HOAs and growing rapidly with new construction (67.9% of new builds have HOAs). |
| **California** | 5 | 3 | 4 | 4 | **16** | Largest state by population, ~300-400K transactions. Escrow state (slightly different from title company). Unique: Natural Hazard Disclosure, Transfer Disclosure Statement, extensive seller disclosures. 51,250 HOAs (#1 nationally). High prices limit FTHB entry but massive total addressable market. |
| **Arizona** | 4 | 5 | 5 | 4 | **18** | Phoenix metro is one of the fastest-growing in the US. Very affordable relative to CA (migration destination). Title company state. Growing HOA density. Standard transaction flow. Strong FTHB pipeline. |
| **Colorado** | 3 | 4 | 5 | 3 | **15** | Denver-dominated. Title company state. Moderate HOA density. Good tech adoption. Slightly higher prices limit score. |
| **Georgia** | 4 | 4 | 2 | 3 | **13** | Atlanta is a major growth market (41,986 active listings in Jan 2026). But: attorney state. Attorneys must control closing "from beginning to end." Higher implementation cost. |
| **North Carolina** | 4 | 4 | 2 | 3 | **13** | Charlotte and Raleigh are top migration destinations. But: attorney state. Would require attorney review phase. |
| **Massachusetts** | 2 | 2 | 1 | 2 | **7** | Small market, very high prices ($600K+ median), attorney state with a unique P&S flow that's unlike any other state. The Offer → Attorney P&S → Closing cadence requires a fundamentally different workflow branch. High implementation cost for a small market. |
| **New Hampshire** | 1 | 1 | 1 | 1 | **4** | ~15-20K annual transactions. Tiny market. Attorney state. Minimal HOA density. Building compliance for NH serves almost no one outside this one agent's book of business. |
| **New York** | 4 | 1 | 1 | 3 | **9** | High transaction count but lowest turnover rate in the country. Extremely high prices. Attorney state. NYC adds co-op vs condo complexity (co-ops have board approval, financial vetting, flip taxes) that exists nowhere else. Implementation nightmare for a market where buyers can barely afford to enter. |

---

## Recommended State Launch Order

### Wave 1 — Launch States (Build the engine here)

| Rank | State | Score | Why First |
|------|-------|:-----:|-----------|
| 1 | **Florida** | 19 | Highest strategic fit. Every Homie AI differentiator (doc intelligence, HOA compliance, insurance complexity, AI copilot) is maximized in FL. Massive condo market. Title company state = simplest implementation. The agent we interviewed is FL-heavy, giving us a built-in beta tester. FL alone is a $154B annual market. |
| 2 | **Texas** | 19 | Tied on score, complementary market. Where FL is condo/HOA-heavy, TX is new-construction/growth-heavy. Title company state. Population growth means a constantly expanding buyer pool. TX + FL together cover the two largest migration-destination states in the country. |
| 3 | **Arizona** | 18 | Highest acquisition potential. Phoenix is where CA-priced-out FTHBs are moving. Title company state. Standard transaction flow. Low implementation lift once FL and TX are done because it shares a similar legal framework. |

**Why these three:** All are title company states (no attorney phase gate to build). Together they represent roughly 700,000-800,000 annual transactions — approximately 20% of the national market. They cover the Sun Belt migration corridor that dominates U.S. population growth. The compliance engine built for these three will be reusable for the other 30+ title company states with minimal additional configuration.

### Wave 2 — Expansion States

| Rank | State | Score | Why Next |
|------|-------|:-----:|----------|
| 4 | **California** | 16 | Too big to ignore forever, but escrow-state mechanics and CA's extensive disclosure requirements (Natural Hazard Disclosure, Transfer Disclosure Statement, Mello-Roos, etc.) add implementation weight. Build after the engine is proven. |
| 5 | **Colorado** | 15 | Title company state, straightforward. Denver is a strong tech-forward market. Low marginal cost to add once FL/TX/AZ are live. |

### Wave 3 — Attorney States (only after the title-company engine is battle-tested)

| Rank | State | Why Wait |
|------|-------|----------|
| 6+ | **Georgia, North Carolina** | High-growth markets but attorney-state complexity requires a new workflow branch (attorney review period). Build this branch once, then roll it out to multiple attorney states simultaneously. |
| Later | **Massachusetts** | Small market, unique P&S flow, high prices. Only worth it if the agent we interviewed brings enough deals to justify the build — or if we sign a brokerage partnership in MA. |
| Much Later | **New Hampshire** | Tiny market. Only makes sense as a freebie once MA is built (similar New England legal framework). |
| Probably Never Prioritize | **New York** | Co-op complexity, attorney state, lowest turnover, highest prices. The ROI doesn't justify the implementation cost unless a major NYC brokerage partnership materializes. |

---

## The All-50-States Question: Is It Worth It?

### Short answer: Yes, eventually — but it's a data problem, not a code problem.

### The Architecture Insight

If you build the state-conditional engine correctly, **adding a state is a configuration task, not a development task.** The code doesn't change — you're adding a new entry to a state config that defines:

```
StateConfig {
  state_code: "FL"
  closing_type: "title_company" | "attorney" | "escrow"
  attorney_review_required: boolean
  attorney_review_days: number | null
  standard_inspection_period_days: number
  required_inspections: ["general", "wind_mitigation", "4_point", "radon", ...]
  required_disclosures: ["seller_disclosure", "lead_paint", "HOA_disclosure", ...]
  standard_contract_type: "FR/Bar As-Is" | "FR/Bar Standard" | ...
  insurance_requirements: ["homeowners", "flood_zone_check", "wind_mitigation", ...]
  hoa_requirements: ["estoppel_letter", "SIRS", "milestone_inspection", ...]
  contingency_defaults: { inspection: 15, financing: 30, appraisal: 30 }
  unique_requirements: [...]  // state-specific items that don't fit other categories
}
```

### The Real Cost Breakdown

| Activity | Cost per State | Notes |
|----------|---------------|-------|
| **Legal research** (forms, disclosures, timelines) | 15-25 hours | Can be partially automated by having Homie AI analyze state real estate commission websites |
| **Config data entry** | 2-4 hours | Once the schema exists, it's fill-in-the-blanks |
| **Testing & validation** | 5-10 hours | Ideally validated by an agent in that state |
| **Unique edge cases** | 0-20 hours | Some states have truly unique requirements (NY co-ops, CA Mello-Roos, FL SIRS). Most don't. |
| **Total per state** | **22-59 hours** | Average ~35 hours for a typical title-company state |

### The Clustering Advantage

States aren't all unique. They cluster into groups that share legal frameworks:

| Cluster | States | Shared Characteristics |
|---------|--------|----------------------|
| **Sun Belt Title** | FL, TX, AZ, NV, NM | Title company closings, similar timelines, growing HOA density, similar inspection norms |
| **West Coast Escrow** | CA, OR, WA, HI | Escrow officers, extensive disclosure requirements, higher price points |
| **Midwest Standard** | OH, IN, MI, MN, WI, MO, IA | Title company, straightforward disclosures, lower HOA density, shorter timelines |
| **Southeast Attorney** | GA, NC, SC, VA | Attorney closings, similar legal traditions, growing markets |
| **Northeast Attorney** | MA, NH, VT, CT, NY, NJ | Attorney closings, higher prices, more complex disclosures |
| **Mountain West** | CO, UT, MT, ID, WY | Title company, outdoor recreation markets, newer construction |

**Once you build one state in a cluster, the next state in that cluster is ~60% cheaper to implement** because most of the config carries over with modifications.

### The 50-State Math

| Phase | States | Hours | Calendar Time |
|-------|--------|-------|---------------|
| Wave 1 (build the engine + 3 states) | FL, TX, AZ | 300-400 hrs (includes engine) | 2-3 months |
| Wave 2 (title company expansion) | CA, CO, NV, + 5-8 Midwest/Mountain states | 250-350 hrs | 2 months |
| Wave 3 (attorney state branch) | GA, NC, SC, VA + engine work | 200-300 hrs | 2 months |
| Wave 4 (remaining states) | ~25 remaining states | 600-800 hrs | 3-4 months |
| **Total for all 50** | | **~1,350-1,850 hrs** | **~9-12 months from start** |

### Is It Worth It?

**For the first 3 states: Absolutely.** FL + TX + AZ = ~20% of the national market, all title-company states, all Sun Belt growth markets. This is the highest-ROI configuration work you'll do.

**For states 4-15: Yes, if adoption in Wave 1 validates demand.** Each additional title-company state is cheap to add (~35 hours) and expands the addressable market by 2-5%.

**For all 50: Only if Homie AI becomes a platform play, not just a consumer app.** If you're selling to brokerages (B2B), they'll require "we operate in all 50 states" support. If you stay B2C, the long tail of small states (NH, VT, WV, ND, SD, WY, MT) collectively represent less than 3% of national transactions. The research hours don't justify the market size unless a partnership demands it.

### The Smart Play

1. Build the state config engine during Wave 1 (FL, TX, AZ) — make it data-driven from day one
2. Validate with real agents and real deals in those 3 states
3. Open-source or crowdsource state configs — let agents in other states submit their state's requirements. Verify and publish. This turns a 1,350-hour internal project into a community-driven knowledge base where Homie AI is the platform.
4. Prioritize additional states based on **inbound demand** (which agents are signing up and from where?), not pre-planned waves

---

## What This Means for the Agent's Feedback

The agent's mention of NH, MA, and FL is still valuable — but reframed:

- **Florida: YES.** Confirmed as Wave 1. The agent's FL-condo expertise is a beta-testing asset.
- **Massachusetts: DEFER.** Small market, attorney state, unique P&S flow. Only build if this agent (or a brokerage partner) brings enough MA deal volume to justify it. Revisit in Wave 3.
- **New Hampshire: DEPRIORITIZE.** Tiny market, attorney state, no strategic advantage. If it comes free when MA is built, fine. Otherwise, it's not worth dedicated effort.

The agent's *real* value here isn't the states they named — it's the confirmation that conditional steps (not separate flows) are the right architecture. That answer alone saved months of engineering.

---

## Priority Matrix

### Tier 1 — Build Now (High impact, confirmed by practitioner)

| Feature | Signal Strength | Rationale |
|---------|----------------|-----------|
| **Email-to-platform document ingestion** | CRITICAL — Agent's #1 ask | Meets agents where they work (email). Unlocks frictionless doc upload. |
| **HOA compliance tracker** | CRITICAL — 70% of deals affected | Massive pain point with quantified impact. FL-specific SIRS adds differentiation. |
| **State-conditional workflow engine (FL → TX → AZ)** | HIGH — Architecture confirmed | Foundation for all state-specific features. Conditional steps, not separate flows. Data-driven config schema, not per-state code. Launch with title-company states first. See [State Selection Strategy](#state-selection-strategy). |
| **Cash-to-close progressive estimator** | HIGH — Surprise hits at contract | 3-stage estimator across Shopping → Under Contract → Closing. Unique in market. |
| **Context-aware insurance checklist** | HIGH — HO-6 + wind mitigation | State + property-type adaptive. Non-obvious types confirmed by expert. |

### Tier 2 — Build Next (Clear value, well-defined scope)

| Feature | Signal Strength | Rationale |
|---------|----------------|-----------|
| **Full DTI breakdown with what-if** | HIGH — "Full breakdown" confirmed | Clear ask with clear scope. Surfaces in Shopping and Financing. |
| **AI shopping with transparent stretch** | HIGH — Nuanced design insight | Match criteria strictly, occasionally stretch with disclosed reasoning. |
| **HOA/Condo document AI summarization** | HIGH — "Bylaws are a nightmare" | Leverage existing doc intelligence pipeline on bylaws, budgets, reserve studies. |
| **Collaborative shopping workspace** | HIGH — "All collaborative, no handoff" | Shared lists, notes, activity feed between buyer and agent. |

### Tier 3 — Build Later (Confirmed useful, lower urgency)

| Feature | Signal Strength | Rationale |
|---------|----------------|-----------|
| **EMD tracking** | MODERATE — Agent fields questions | Simple feature, clear value, small scope. |
| **DOM + last-sold surfacing** | MODERATE — Standard but overlooked | Auto-surface with AI commentary in property cards. |
| **Post-close principal calculator** | LOW-MODERATE — Lump sum default | Useful but post-close is lowest urgency phase. |
| **Criteria versioning** | MODERATE — "Always changes" | Track buyer preference evolution over time. Nice-to-have for AI context. |

---

## New Feature Discovery

The interview surfaced one feature that was NOT in our original suggestion list:

**Email-to-Platform Document Ingestion** — The ability to CC or forward emails to a deal-specific address and have attachments auto-processed. This was the agent's single highest priority and represents a new integration surface that connects Homie AI to the agent's primary workflow tool (email). This should be scoped and spec'd immediately.

---

## Open Questions for Next Session

1. What does "different levels of professionalism" mean across states — is this about inspector quality, TC reliability, or title company standards?
2. Can you walk us through a recent FL condo deal where SIRS/milestone inspections caused issues?
3. What email workflows do you currently use for document exchange — who sends what to whom, and what gets lost?
4. For the collaborative shopping phase, do you and the buyer typically use the same MLS portal, or separate tools?
5. What HOA red flags have you seen that killed a deal after the buyer was already emotionally committed?

---
---

# Expert Realtor Vet — Critical Analysis of Interview Responses
## Perspective: 15+ years licensed in multiple states, 500+ closings, brokerage ops experience

The feedback you received is **directionally correct but operationally shallow** in several areas. This agent is clearly FL-condo-heavy (that's where their sharpest insights live), has real experience with buyer pain, but gave you a few answers that either understate complexity, miss industry-standard knowledge, or reveal a gap you should design around rather than design *to*. Below is a response-by-response vet with corrections, expansions, and challenges.

---

## 1. State Variance — What the Agent Got Right and What They Left Out

### NH, MA, FL — The agent's geography, not our market strategy

These three states are not just "different paperwork." They represent **three fundamentally different legal frameworks** for real estate transactions — and critically, two of them (MA, NH) are among the worst choices for a first wave. See [State Selection Strategy](#state-selection-strategy) for the data-driven alternative. That said, understanding the legal differences is still valuable for building the conditional engine:

- **Massachusetts** is an **attorney state**. Buyers must have an attorney at closing. The Purchase & Sale Agreement (P&S) is a separate, attorney-drafted document that follows the initial offer. There's a distinct Offer → P&S → Closing cadence that most other states don't have. Your workflow engine needs to account for the **attorney review period** (typically 3-5 business days after accepted offer) as a mandatory phase gate. If you don't model this, MA agents will immediately see the tool as built for non-attorney states.

- **New Hampshire** is a hybrid — attorneys are common but not mandatory. NH uses a different standard purchase agreement form than MA. The inspection contingency norms differ (NH tends toward 10 days, MA toward 10-17 depending on the P&S). NH also has unique seller disclosure requirements under RSA 477:4-c that are less prescriptive than MA's mandatory disclosures.

- **Florida** is a **title company state** with no attorney requirement for buyers. The standard contract (FR/Bar "As-Is" or standard) has very specific contingency timelines baked in (15 days inspection by default on standard, none on As-Is). FL also has unique requirements: **radon testing** (often skipped but legally relevant), **4-point inspection** (required for insurance on homes 30+ years old), and **wind mitigation inspection** (the agent mentioned this in the insurance context, but it's really an inspection issue that gates insurance eligibility).

**What the agent missed:** They didn't mention the attorney-state distinction for MA. This is not a small detail — it fundamentally changes the offer-to-contract flow. If your conditional step system doesn't account for attorney review as a phase, MA agents won't adopt.

### "Different levels of professionalism" — This is actually about something specific

This phrase almost certainly refers to **Florida's lower barrier to entry for real estate licensure** compared to MA and NH. FL requires 63 hours of pre-license education; MA requires 40 hours but has a harder exam and stricter continuing education. The practical effect: FL has a much wider range of agent competence, and by extension, the inspectors, title companies, and transaction coordinators agents work with in FL vary wildly in quality. 

**What this means for you:** In FL, your platform needs to do *more* hand-holding and quality-checking because the professionals on the other side of the transaction may be less consistent. This is actually an argument for **making the AI smarter in FL** — not just conditional steps, but conditional rigor.

---

## 2. Financial Tools — Where the Agent Was Spot-On and Where They Were Incomplete

### Cash-to-close: The "before house hunting" insight is gold, but incomplete

The agent said buyers are surprised at contract and the ideal time for the estimate is before house hunting. Both true. But there's a critical intermediate step they didn't mention: **the pre-approval letter itself already contains enough data to generate a rough cash-to-close estimate.** The pre-approval tells you: purchase price range, estimated rate, down payment percentage, and loan program (FHA, Conventional, VA). From that alone, you can model:

- Down payment amount
- Estimated closing costs (2-5% of purchase price depending on state and loan type)
- Prepaid items (insurance, taxes, per diem interest)
- FHA/VA funding fee if applicable

**Enhancement:** Don't wait until the buyer is "shopping." The moment a pre-approval letter is uploaded and processed by your document AI, auto-generate a cash-to-close range. The buyer sees it before they ever look at a property. That's the real "before house hunting" moment — and you already have the infrastructure to do it.

### DTI: "Full breakdown" is correct, but you need to understand the lender's DTI vs. the buyer's DTI

There are **two DTIs** that matter:

1. **Front-end DTI** (housing ratio) — monthly housing costs / gross monthly income. Most conventional loans cap this at 28%, FHA at 31%.
2. **Back-end DTI** (total debt ratio) — all monthly debt obligations / gross monthly income. Conventional caps around 43-45%, FHA up to 50% with compensating factors, VA has no hard cap but uses residual income.

The agent said "full breakdown" but didn't specify which DTI. **You need both**, displayed together, with clear labels. The what-if scenario modeling should show how paying off a specific debt affects *both* ratios and whether it moves the buyer into qualification range for a different loan program.

**Enhancement:** Add **loan program eligibility indicators** to the DTI module. As the buyer adjusts debts in the what-if tool, show them: "At this DTI, you qualify for Conventional, FHA, and VA" vs. "At this DTI, only FHA." That's the insight that actually changes behavior.

### Principal calculator: "Lump sum" is a limited answer

The agent defaulted to lump sum, probably because their buyers are more likely to receive windfalls (bonus, inheritance, tax refund) than to consistently add $100/month. But this answer reflects **their** buyer demographics, not a universal truth. First-time homebuyers — who are your primary persona — are *more* likely to have the discipline for $50-100/month extra than to have a $10K lump sum.

**Enhancement:** Build both input modes, but also build the one the agent didn't mention: **"What if I refinance in 5 years?"** That's the scenario most buyers actually face, and a simple refi comparison (current terms vs. hypothetical refi at a lower rate) is far more valuable than either a lump-sum or extra-payment calculator. The post-close phase should help the buyer understand when refinancing makes sense based on rate environment and remaining principal.

### EMD: The agent understated this problem

"I'm fielding questions about that" undersells it. Here's the reality: EMD is the **first large sum of money a buyer sends to a stranger**, and it's the #1 target for wire fraud in real estate. The FBI's IC3 reports over $400M in real estate wire fraud annually. Your EMD tracker shouldn't just show amount/date/status — it should include:

- **Wire instruction verification** (does the account match what the title company provided?)
- **Confirmation of receipt** from the escrow/title company
- **Refund conditions** tied to contingency deadlines (if the buyer exercises the inspection contingency, when does the EMD come back?)
- **A wire fraud warning** with best practices before the buyer sends money

**Enhancement:** EMD tracking is small in scope but massive in liability reduction. Build it with a security-first lens, not just a bookkeeping lens. This is also a trust signal — when a buyer sees that your platform warns them about wire fraud before they send $10K, they trust the platform for everything else.

---

## 3. Insurance & HOA — The Agent's Strongest Answers, and What to Add

### HO-6 and wind mitigation are expert picks. Here's what else they should have said:

- **Flood insurance** — Not mentioned, but critical in FL. FEMA flood zone maps changed significantly in recent years. Many FL buyers discover their "non-flood-zone" property is now in a flood zone at the 11th hour. Flood insurance can add $1,000-5,000/year to carrying costs. Your insurance module should pull flood zone data (available via FEMA's API) and flag it automatically.

- **Title insurance** — Buyers universally don't understand the difference between **owner's title policy** (protects the buyer) and **lender's title policy** (required by the lender, paid by the buyer). In many states (including FL), the seller traditionally pays for the owner's policy — but this is negotiable and varies by county within FL (Dade and Broward: seller pays; most of the rest: buyer pays). State AND county-level variance matters here.

- **PMI removal triggers** — Buyers with less than 20% down pay PMI but rarely understand when it drops off (automatic at 78% LTV on conventional, requestable at 80% LTV). FHA MIP, by contrast, is permanent on 30-year loans with less than 10% down. This is a common source of buyer shock and a perfect Homie AI educational moment.

**Enhancement:** The insurance module should not just be a checklist. It should be a **cost estimator** that pulls in: estimated homeowner's premium (based on property type, age, location), flood zone status, PMI/MIP cost based on LTV, and wind mitigation discount potential. Show the buyer their total insurance burden before they're under contract.

### HOA: 70% is real, but let's break down *why* deals get affected

The "7 out of 10" stat is strong, but you should understand the failure modes to build the right features:

1. **Estoppel letter delays** — The HOA must issue an estoppel letter (statement of what the seller owes) before closing. HOAs are notoriously slow. Some FL HOAs charge $250-500 for this letter and take 10-15 business days. If the agent doesn't order it early enough, closing gets delayed.

2. **Transfer approval delays** — Some HOAs require buyer approval/interview before transfer. This can add 2-4 weeks and is often discovered late in the process.

3. **Special assessments** — A pending or recently passed special assessment can add $5,000-50,000 to the buyer's cost. This information is buried in HOA meeting minutes and budgets.

4. **Rental restrictions** — Buyers who plan to eventually rent the property get blindsided by bylaws that restrict rentals (minimum ownership period, percentage cap on rentals in the building, board approval for tenants).

5. **SIRS/Milestone (FL)** — Post-Surfside (Champlain Towers collapse, 2021), FL now requires buildings 3+ stories and 30+ years old to undergo milestone structural inspections and maintain structural integrity reserve studies. Buildings that fail or haven't completed these inspections are **unlendable** — lenders won't approve mortgages. This kills deals entirely, not just delays them.

**Enhancement:** Build an **HOA Risk Score** that the AI generates from uploaded HOA docs:
- Reserve fund ratio (reserves / annual budget — below 30% is a red flag)
- Pending special assessments (parsed from meeting minutes or budget notes)
- Rental restriction severity (none / limited / strict)
- SIRS/Milestone compliance status (FL only)
- Estoppel order status and expected delivery date
- Transfer approval requirement (yes/no, timeline)

This score becomes a deal-health indicator that neither Zillow, Redfin, nor any existing consumer tool provides.

---

## 4. Shopping Phase & AI — The Agent Confirmed the Right Direction but the Design Needs More Edge

### "Criteria always change because of price shock" — Correct, but there's a second trigger

Price shock is the #1 trigger, but the #2 trigger is **physical reality vs. mental image**. Buyers imagine a "3-bedroom with a big backyard" and then walk into ten 3-bedrooms where the "big backyard" is 800 sq ft of grass abutting a highway. The criteria change isn't just about price — it's about recalibrating what words mean in a specific market.

**Enhancement:** When tracking criteria evolution, don't just track what changed and when — track **the showing that triggered the change**. If the buyer adjusts criteria after viewing a specific property, link that adjustment to the property. Over time, the AI can learn: "After seeing 123 Oak St, you reduced your minimum square footage and added 'quiet street' as a requirement. Properties like these match your updated criteria." That's a recommendation engine with context, not just a filter.

### "No handoff, all collaborative" — True, but there's a nuance they didn't articulate

The collaboration is continuous, but the *type* of collaboration changes:

- **Early shopping:** Agent is leading. They're curating properties, setting up showings, educating the buyer on neighborhoods. The buyer is mostly reacting.
- **Mid shopping:** Co-equal. The buyer is now sending the agent listings they found. The agent is providing feedback. Both are actively searching.
- **Late shopping (decision time):** Buyer is leading. They've narrowed to 2-3 properties. The agent is providing strategic input (offer pricing, competition analysis, neighborhood risks).

**Enhancement:** The collaborative workspace should reflect these phases. Early on, the agent should be able to "push" curated properties to the buyer with notes. Mid-phase, both should see each other's saves/dismissals in a shared feed. Late-phase, the workspace should shift to comparison mode (side-by-side property analysis, similar to how you already do LE comparison).

### DOM and last-sold — Good picks, but the agent left out the most important one

**Tax assessment vs. list price.** This is the data point that seasoned agents use to gauge pricing accuracy. If a home is listed at $500K but the tax assessment is $380K, that doesn't necessarily mean the home is overpriced (assessments lag market value), but it does signal the buyer's future property tax basis. Conversely, if the assessment is $520K and the list is $450K, the seller may be pricing aggressively for a quick sale.

Other data points the agent should have mentioned:
- **Price history** (price drops signal negotiability)
- **Listing agent's sell-to-list ratio** (what percentage of asking does this agent's listings typically close at?)
- **Comparable sales within 0.25 miles in last 90 days** (the comps that will determine appraised value)
- **School ratings** (the #1 driver of property values in suburban markets, and many buyers won't articulate this as a requirement even when it's their actual priority)
- **Pending permits** (upcoming construction nearby that could affect value or livability)

**Enhancement:** Build a **Property Intelligence Card** that auto-generates for every saved property. Sections: Pricing Analysis (DOM, price changes, tax assessment, comp-based value range), Neighborhood Context (school ratings, walkability, crime, pending development), Financial Projection (estimated monthly cost, appreciation forecast from your stochastic model), and Agent Notes (free-text from the buyer's agent).

---

## 5. Prioritization — The Agent's Answer Reveals a Bigger Truth

The agent's #1 priority — email-to-platform document ingestion — is telling. They didn't ask for a fancier AI feature, a better calculator, or a prettier dashboard. They asked for **less friction in getting documents into the system**.

This tells you something critical about agent adoption: **the best feature in the world is worthless if documents don't flow in easily.** Your current upload flow (manual select → upload → process) works for demos but fails in real practice where the agent is CC'd on 15 emails a day with attachments. The email-to-platform feature isn't just a nice integration — it's the **adoption gatekeeper**.

But the agent only named documents. They didn't answer the full prioritization question (they gave one priority, not three). This is common in interviews — the pain that's top of mind dominates. Push harder next time.

### What the agent *would have* said if you pushed for #2 and #3

Based on the interview pattern (FL-condo-heavy, TC-reliant, fielding constant buyer questions), their next two would likely be:

2. **HOA document collection + AI summarization** — because 70% of their deals are affected by HOA issues and they're currently reading 80-page bylaws manually
3. **Cash-to-close estimator** — because they explicitly said "before house hunting" and "under contract" as pain points for buyer surprise

---

## Revised Priority Matrix (Expert-Adjusted)

### Tier 1 — Adoption Blockers (Without these, agents won't use the platform consistently)

| Feature | Why It's an Adoption Blocker |
|---------|------------------------------|
| **Email-to-platform document ingestion** | Agents won't manually upload. This is the bridge between their real workflow and your platform. |
| **State-conditional workflow engine (MA attorney review, FL timelines, NH forms)** | Without state accuracy, agents lose trust on the first deal. You get one chance. |
| **HOA compliance tracker + AI doc summarization** | 70% deal impact. FL agents will adopt specifically for this. |

### Tier 2 — Differentiators (These make agents *recommend* the platform to buyers)

| Feature | Why It Differentiates |
|---------|----------------------|
| **Progressive cash-to-close estimator (pre-approval → offer → closing)** | No consumer tool does this today. "Before house hunting" visibility is a first-mover feature. |
| **Context-aware insurance module (HO-6, wind mit, flood zone, PMI)** | State + property-type intelligence that agents currently carry in their heads. Offloading this earns trust. |
| **Full DTI with dual-ratio display + loan program eligibility** | Turns a dumb number into an actionable decision tool. |
| **HOA Risk Score (reserve ratio, special assessments, SIRS, rental restrictions)** | Completely novel. No platform generates this from uploaded docs. |

### Tier 3 — Engagement Deepeners (These increase session time and retention)

| Feature | Why It Deepens Engagement |
|---------|--------------------------|
| **Collaborative shopping workspace (shared saves, agent notes, phase-aware)** | Keeps both buyer and agent in the platform daily during the longest phase. |
| **AI shopping with transparent stretch + criteria versioning** | Makes the buyer feel understood over time. Builds switching cost. |
| **Property Intelligence Cards (comps, tax assessment, permits, school data)** | Turns Homie into the research layer, not just the document layer. |
| **EMD tracker with wire fraud protection** | Small feature, big trust signal. |

### Tier 4 — Long-Tail Value (Build when core is stable)

| Feature | Notes |
|---------|-------|
| **Post-close principal calculator (lump sum + monthly + refi comparison)** | Low urgency, but strengthens post-close retention. |
| **DOM/last-sold auto-surfacing with AI commentary** | Easy win once MLS data integration exists. |
| **Criteria evolution tracking with showing-linked adjustments** | Rich AI context, but requires mature shopping phase first. |

---

## Blind Spots — What This Agent Didn't Mention That Another Would

This agent is a **buyer's agent working primarily in FL condos with some NH/MA business.** Their feedback is heavily weighted toward:
- Condo/HOA complexity (FL-specific)
- Document management (high-volume practice)
- State variance (multi-state practice)

What they naturally **didn't** cover because it's outside their daily pattern:

1. **New construction workflows** — Entirely different timeline, no inspection contingency in many cases, builder contracts instead of standard purchase agreements, draw schedules, CO (Certificate of Occupancy) delays. If Homie AI targets only resale, that's fine for now — but know the gap.

2. **VA and FHA-specific friction** — VA loans have unique appraisal requirements (Minimum Property Requirements, termite inspection in certain states, VA funding fee). FHA has repair requirements that can delay closing. A significant portion of first-time homebuyers use FHA. This should be in your conditional logic.

3. **Dual agency / transaction brokerage** — In some states, the same agent represents both buyer and seller. The platform's assumption of "buyer's agent + seller's agent" may not hold.

4. **Contingency management** — The agent didn't mention this, but it's the #1 source of legal disputes: did the buyer waive inspection in time? Was the financing contingency deadline met? Did the appraisal contingency kick in? Your platform should have **countdown timers on every contingency with automated alerts** — this is the TC's most stressful job.

5. **Seller concessions / credits** — In many markets (especially now), buyers negotiate seller concessions to cover closing costs. This directly affects cash-to-close and should be a variable in the estimator. The agent didn't mention it, likely because they take it for granted.

6. **Appraisal gap coverage** — In competitive markets, buyers offer to cover the gap between appraised value and purchase price. This is a cash commitment that doesn't show up in the Loan Estimate but absolutely affects cash-to-close. Another estimator variable that was missed.

---

## Final Assessment

**The feedback you received is a B+.** The agent gave you genuinely valuable insights — the 70% HOA stat, the email ingestion priority, the HO-6/wind mitigation specifics, and the "all collaborative" shopping confirmation are all high-signal, product-shaping data points. 

**Where it falls to a B+ instead of an A:** The answers lacked depth in financial tooling (no mention of front-end vs. back-end DTI, no mention of loan-program-specific requirements, no mention of seller concessions or appraisal gap in cash-to-close), and the state variance answer didn't touch on the most important distinction (attorney vs. non-attorney states). This is expected — agents are practitioners, not product designers. It's your job to take their pain and design deeper than their vocabulary.

**The single most important takeaway from this interview:** The agent's priorities reveal that **adoption friction matters more than feature depth.** They didn't ask for a better AI or a smarter calculator. They asked for an easier way to get documents in. Build the funnel before you build the features.
