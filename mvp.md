# HomeBuyer Pro — MVP Scope Overlay
## Version 2.0
## Governing document for v1 build scope

## Purpose

This document defines what **HomeBuyer Pro is for v1**, what it is **not**, and what the team should build first.

It sits above the broader Product Specification. If the broader spec conflicts with this overlay, **this overlay wins**.

### Strategy: Broad Surface, Narrow Core

The product should feel like a complete buyer operating system across the homebuying journey. The user should never hit a dead end or feel like they arrived at the wrong product. But the deepest engineering, the strongest differentiation, and the primary value proof all live in a clearly defined core.

**Broad surface** — Shopping, Offer, and Post-Close exist as real product surfaces. They are functional, not placeholders.

**Narrow core** — Escrow, Closing, Documents, Financing, and AI Copilot are where the product earns its reputation, proves its value, and builds its moat.

---

## 1. Product Identity

HomeBuyer Pro v1 is a **buyer-first homebuying workspace** that helps people move from serious shopping to close.

Its job is to help buyers:
- organize their journey across every phase
- understand their documents and financial terms
- track deadlines, contingencies, and open risks
- stay on top of next steps
- avoid expensive mistakes

### HomeBuyer Pro v1 is
- a buyer-facing workspace that spans the homebuying journey
- a document intelligence layer
- a financing clarity layer
- a deadline and contingency tracking layer
- a deal-context AI copilot
- a guided system that adapts depth to the buyer's current phase

### HomeBuyer Pro v1 is not
- a home search portal or Zillow replacement
- an agent replacement
- a contract drafting tool
- an offer strategy or negotiation engine
- a full post-close homeowner management platform
- a brokerage admin product
- a marketplace

---

## 2. MVP Moment We Own

**From serious shopping to keys in hand.**

The product covers the full buyer journey, but the strongest, most differentiated experience lives in the 21–45 day escrow-to-close window. This is where:
- documents arrive quickly
- deadlines are active
- financial numbers change
- the buyer feels the least informed and the least in control

Shopping and Offer are real surfaces that onboard the buyer and build context. Escrow and Closing are where the product proves it is indispensable. Post-Close is where the relationship continues.

---

## 3. Core Promise

**From serious shopping to keys in hand, you'll always know where you are, what's due, and what everything means.**

Internal compression:

**Organize the journey. Explain the deal. Keep the buyer on track. Help them avoid expensive mistakes.**

---

## 4. Primary User

The v1 user can enter the product at two points:

**Entry 1 — Serious shopper (earlier):**
- Actively looking at homes
- Wants to track properties, understand affordability, get organized before making an offer
- May or may not have a pre-approval
- This user builds context in Shopping, transitions through Offer, and deepens in Escrow/Closing

**Entry 2 — Buyer under contract (mid-journey):**
- Already has an accepted offer
- Entering escrow
- Needs document intelligence, deadline tracking, and financial clarity immediately
- This user enters at Escrow and gets full value from day one

Both users are first-time or second-time buyers working with an agent and lender, but lacking a personal comprehension layer for the transaction.

This is a **single-player value-first product**. Collaboration exists in v1 only insofar as it helps the buyer get documents into the workspace.

---

## 5. Launch Motion

### Launch model
**B2C-first. B2B2C-ready.**

### What that means
- The buyer must be able to use the product on their own without brokerage adoption
- The architecture should support later collaborator, agent, lender, and brokerage workflows
- v1 includes a lightweight secure upload/request link for collaborators
- v1 does **not** include a realtor dashboard, brokerage admin console, or full multi-user collaboration system

### Why broader surface helps acquisition
- A buyer can discover the product during shopping (wider top of funnel)
- Content marketing, SEO, and referrals work across more moments
- The product doesn't require explaining "wait until your offer is accepted"
- Investors and partners see a platform, not a feature

---

## 6. Build Depth Taxonomy

Every feature in v1 falls into one of four tiers:

### Build Deep
Core moat. Full implementation. This is where the product proves its value.

- Escrow & due diligence dashboard (full component set)
- Closing dashboard (full component set)
- Document ingestion, classification, AI explanation, field extraction
- Loan Estimate comparison + LE vs CD variance review
- Cash-to-close engine
- Contingency / deadline tracker
- Alerts and urgency states
- AI Copilot (deal-context grounded, document-aware, action-oriented)
- Wire fraud warning flow
- Inspection red-flag summary
- Title / escrow red-flag summary
- Repairs / credits tracker

### Build Light
Real product surface. Functional and useful, but deliberately limited in depth. The user gets value; the team doesn't over-invest.

- **Shopping phase:** Saved/tracked homes, property intake, lightweight affordability context, deal creation handoff to Offer. AI copilot provides general readiness guidance.
- **Offer phase:** Offer details workspace (price, EMD, contingencies, closing date), offer checklist, pre-approval / proof of funds upload, contingency setup. AI copilot provides offer-stage context. No RPA builder, no counteroffer simulator, no offer strength analyzer.
- **Homes view:** Simple property tracking. Add a home, basic details, link to create deal. Not a search engine, not MLS-connected.
- **Insurance binding:** Binder upload, status tracking, mortgagee clause confirmation. No quote comparison.
- **Collaborator file intake:** Secure upload link, inbound-only. No collaborator dashboard.
- **Glossary / educational support:** Contextual term explanations inline. No standalone learning center.
- **Funding / recording timeline:** Basic multi-step tracker. No API integrations.
- **Notifications:** In-app urgency indicators. No email/SMS/push.

### Thin Continuity
Visible in the product. Gives the user a sense of completeness and future value. Minimal implementation.

- **Post-Close phase:** Completion celebration, deal summary, document archive/export, "homeowner tools coming soon" prompt. No equity tracker, no refi watch, no maintenance planner.

### Defer
Not in v1. Does not appear in the product UI.

- Full RPA / contract drafting
- Offer strength analyzer
- Counteroffer simulator
- Full insurance comparison product
- Full loan-type recommendation wizard
- Realtor dashboard / brokerage admin
- Marketplace / referral features
- Post-close deep tools (equity tracker, refi watch, ADU planner, property tax exemptions, maintenance)
- MLS search infrastructure
- Multi-user collaboration system
- E-signature integration
- Mobile native app

---

## 7. Phase Treatment

| Phase | Build Tier | Role in v1 |
|-------|-----------|------------|
| Shopping | Build Light | Acquisition surface, context building, deal creation handoff |
| Offer | Build Light | Offer workspace, contingency/EMD setup, checklist, pre-approval upload |
| **Escrow** | **Build Deep** | **Primary deep experience — document intelligence, deadlines, due diligence** |
| **Closing** | **Build Deep** | **Primary deep experience — CD review, wire safety, funding** |
| Post-Close | Thin Continuity | Completion summary, document archive, future value signal |

### Shopping — Build Light
The Shopping phase is the product's front door for early-stage buyers. It should feel real and useful but is not the value core.

**What ships:**
- Saved/tracked homes list (manual entry — address, price, beds/baths/sqft, notes)
- Lightweight affordability context (simple cash-to-close estimator, monthly payment estimate)
- Pre-approval status card (upload pre-approval letter, display amount/expiration)
- "Ready to make an offer?" CTA that transitions to Offer phase with selected property
- AI Copilot available for general homebuying readiness questions (lighter grounding, general education mode)

**What does not ship:**
- MLS integration or property search
- Zillow/Redfin import
- Market analytics or neighborhood comps
- Equity appreciation forecast
- BRBC summary or deep financial planning
- Loan type recommendation wizard

### Offer — Build Light
The Offer phase captures the transition from "interested buyer" to "buyer under contract." It provides structure without deep tools.

**What ships:**
- Offer details form (property, price, earnest money, contingency periods, closing date, agent info)
- Offer checklist (pre-approval letter attached, proof of funds, earnest money ready, contingencies defined)
- Pre-approval / proof of funds upload
- Contingency setup (inspection, appraisal, financing, disclosure periods — feeds into Escrow deadline tracker)
- Phase transition CTA: "Offer Accepted — Move to Escrow"
- AI Copilot available for offer-stage questions (lighter grounding, "what to expect" mode)

**What does not ship:**
- RPA / contract builder
- Offer strength analyzer
- Counteroffer simulator
- Escalation clause builder
- AI negotiation guidance

### Escrow — Build Deep
Primary v1 experience. Full component set per spec Section 9.4.

### Closing — Build Deep
Primary v1 experience. Full component set per spec Section 9.5.

### Post-Close — Thin Continuity
Visible in the product to give completeness. Minimal implementation.

**What ships:**
- Completion celebration screen
- Deal summary / snapshot card
- Download or archive all deal documents
- "Post-close homeowner tools coming soon" prompt
- Basic first-30-days checklist (utility transfers, address changes)

**What does not ship:**
- Equity value tracker
- Refi rate watch
- Insurance risk monitor
- Maintenance planner
- Renovation / ADU planner
- Property tax exemptions

---

## 8. Emotional Identity Requirements

These remain required because they make the product feel like a guided system across the entire journey, not a utility tool that only works during escrow.

- Five-phase progress map (all phases visible, current phase highlighted)
- Persistent current-phase visibility
- Contextual glossary / explanation patterns
- Alerts panel
- Clear phase transition CTAs
- Funding / recording timeline

These are not optional polish. They are part of the product's identity and user trust.

---

## 9. AI Copilot Scope

### Non-negotiable rule
**The AI must always know the deal context before it answers.**

If sufficient context is not available, the AI should request it rather than answer generically.

### Phase-aware depth

| Phase | AI Behavior |
|-------|------------|
| Shopping | General education mode. Answers readiness questions, explains terms, provides affordability guidance. Lighter grounding — less deal-specific context available. |
| Offer | Offer-context mode. Explains contingencies, EMD, timelines. Helps buyer understand what they're committing to. Still lighter than Escrow. |
| **Escrow** | **Full deal-context mode.** Grounded in uploaded documents, extracted fields, deadlines, open issues. Deep, specific, action-oriented. |
| **Closing** | **Full deal-context mode.** Same depth as Escrow. CD comparison, wire safety, signing prep. |
| Post-Close | Light completion mode. Summarizes the deal. Suggests next steps for new homeowners. |

### AI is allowed to do
- Everything listed in spec Section 8.3
- In Shopping: answer general homebuying readiness questions, explain terms, estimate affordability
- In Offer: explain contingency types, EMD norms, timeline expectations

### AI is not allowed to do
- Everything listed in spec Section 8.4
- In Shopping: provide property valuations, market predictions, investment advice
- In Offer: draft contract terms, recommend offer prices, negotiate

The AI should explicitly state its boundary when needed.

---

## 10. Must-Build v1 Workflows

These workflows define MVP completion, organized by depth tier.

### Deep workflows (Escrow + Closing + Documents + Financing + AI)
1. **Ingest and organize deal documents** — classify, extract fields, summarize, surface gaps
2. **Understand the financial picture** — LE comparison, LE vs CD variance, live cash-to-close
3. **Track deadlines, contingencies, and open risks** — live timeline, color-coded urgency, risk flags
4. **Ask deal-specific questions** — AI copilot grounded in buyer's actual documents and deal state
5. **Navigate closing safely** — CD review, wire fraud prevention, signing prep, funding timeline

### Light workflows (Shopping + Offer)
6. **Track homes and build readiness** — saved homes, affordability context, pre-approval status
7. **Set up the offer workspace** — offer details, contingency setup, checklist, pre-approval upload
8. **Create the deal workspace** — transitions from Offer to Escrow; generates timeline, deadlines, document checklist

### Continuity workflows (Post-Close)
9. **Complete the journey** — celebration, summary, document archive, first-30-days checklist

---

## 11. Technical Scope Implications

The build plan should optimize for:
- Structured document ingestion and field extraction
- Comparison logic for LE and CD
- Deal-state persistence across all phases
- Timeline / deadline computation from contract dates
- Explainable AI outputs grounded in document context
- Phase-aware AI context assembly (lighter in Shopping/Offer, deeper in Escrow/Closing)
- Auditable citations inside document explanation flows

The system does **not** need v1 support for:
- MLS/search infrastructure or property data APIs
- Full marketplace integrations
- Deep brokerage tooling
- Extensive post-close data sync or homeowner analytics
- Contract generation or e-signature

---

## 12. 90-Day Success Definition

At 90 days, v1 is successful if:

1. **Real buyers are using the product across multiple phases** — some enter at Shopping, some at Escrow. Both paths show engagement.
2. **The core cluster feels painful to lose.** Document explanation + LE/CD comparison + cash-to-close + deadline tracking is the indispensable core.
3. **Users say some version of:**
   - "I finally understood what was happening."
   - "This kept me organized from the start."
   - "I caught something I would have missed."
4. **Repeat usage is real** — document uploads, deadline checks, AI questions happen repeatedly across active deals, not just once.
5. **At least one collaborator proactively uses the secure upload link** without heavy instruction.
6. **Shopping and Offer feel like real onboarding** — users who start early build context that pays off when they enter escrow. The handoff feels seamless.
7. **The team has clear signal on expansion:** deepen Shopping, expand Offer tools, grow B2B2C collaboration, or extend Post-Close.

---

## 13. How This Overrides the Broader Product Spec

The broader Product Specification remains the detailed product reference, but for v1:

- Shopping and Offer sections should be built light — functional but limited in depth
- Escrow, Closing, Documents, Financing, and AI Copilot receive highest build priority and deepest implementation
- Post-Close is thin continuity — visible but minimal
- Any feature not listed in the Build Deep or Build Light tiers is deferred
- The old "escrow-only" framing from v1.1 is replaced with "broad surface, narrow core"
- The old "deferred Shopping and Offer" framing is replaced with "light but real"

---

## 14. Immediate Next Deliverables

After this overlay is approved:

1. **Build Plan**
   Phased implementation plan respecting the depth taxonomy. Deep features first, light features woven in for product completeness.

2. **AI Copilot Architecture Note**
   Defines inputs, context model, extraction flow, grounding rules, response boundaries, and phase-aware depth transitions.

3. **Product Spec Revision v1.2**
   Updates the broader Product Specification so it reflects this overlay cleanly.
