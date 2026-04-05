# HomeBuyer Pro — MVP Scope Overlay
## Version 1.0
## Governing document for v1 build scope

## Purpose

This document defines what **HomeBuyer Pro is for v1**, what it is **not**, and what the team should build first.

It sits above the broader Product Specification. If the broader spec conflicts with this overlay, **this overlay wins**.

This overlay narrows the product from a full homebuying platform into a focused MVP with a clear moment of value: **offer accepted through clear to close**. :contentReference[oaicite:0]{index=0} :contentReference[oaicite:1]{index=1}

---

## 1. Product Identity

HomeBuyer Pro v1 is a **homebuyer due-diligence and transaction clarity platform**.

It is built for buyers who already have an accepted offer and are moving through escrow toward closing.

Its job is to help buyers:
- organize their deal
- understand their documents
- compare important financial terms
- track deadlines and contingencies
- stay on top of risks and next steps

### HomeBuyer Pro v1 is
- a buyer-facing deal workspace
- a document intelligence layer
- a financing clarity layer
- a deadline and contingency tracking layer
- a deal-context AI copilot

### HomeBuyer Pro v1 is not
- a home search portal
- a Zillow replacement
- an agent replacement
- a contract drafting tool
- an offer strategy engine
- a post-close homeowner platform
- a brokerage admin product

---

## 2. MVP Moment We Own

**Offer accepted through clear to close.**

This is the primary moment of value for v1.

The product should be optimized for the 21–45 day period when:
- the buyer has a ratified contract
- documents begin arriving quickly
- deadlines are active
- financial numbers change
- the buyer feels the least informed and the least in control

The broader five-phase structure remains part of the product’s emotional identity, but the active v1 experience is centered on:
- Escrow & Due Diligence
- Closing Prep
- Clear to Close / Funding / Recording

---

## 3. Core Promise

**From offer accepted to keys in hand, you’ll always know where you are, what’s due, and what everything means.**

Internal compression:

**Organize the deal. Explain the deal. Keep the buyer on track.**

This promise should guide product, design, engineering, copy, and onboarding decisions.

---

## 4. Primary User

The first ideal user is:
- a first-time or second-time homebuyer
- under contract
- entering escrow
- receiving lender, title, inspection, and disclosure documents
- working with an agent and lender, but lacking a personal comprehension layer for the transaction

This is a **single-player value-first product**.

Collaboration exists in v1 only insofar as it helps the buyer get documents into the workspace.

---

## 5. Launch Motion

### Launch model
**B2C-first. B2B2C-ready.**

### What that means
- the buyer must be able to use the product on their own without brokerage adoption
- the architecture should support later collaborator, agent, lender, and brokerage workflows
- v1 includes a lightweight secure upload/request link for collaborators
- v1 does **not** include a realtor dashboard, brokerage admin console, or full multi-user collaboration system

---

## 6. Must-Build v1 Workflows

These workflows define MVP completion.

### 6.1 Create the Deal Workspace
The buyer creates a deal by entering:
- property address
- contract acceptance date
- closing date
- basic transaction details

The system then generates:
- the five-phase progress map
- active phase state
- expected timeline
- expected document checklist

### 6.2 Ingest and Organize Deal Documents
The buyer uploads deal documents as they arrive, including:
- purchase contract
- Loan Estimate
- disclosures
- inspection reports
- appraisal
- title / escrow documents
- Closing Disclosure

The system should:
- classify documents
- place them in the correct section
- extract key fields
- create a document summary
- surface open questions or missing items

### 6.3 Understand the Financial Picture
The product must give the buyer clarity on:
- side-by-side Loan Estimate comparison
- LE vs CD variance review
- live cash-to-close calculation
- what changed
- what is normal
- what deserves follow-up

This is one of the highest-value parts of v1.

### 6.4 Track Deadlines, Contingencies, and Open Risks
The product must translate the deal into a live checklist and timeline, including:
- earnest money deadlines
- inspection deadlines
- appraisal contingency dates
- financing contingency dates
- disclosure review windows
- key closing tasks

The system should also surface unresolved issues such as:
- appraisal gaps
- major inspection findings
- title / escrow red flags
- lender conditions
- missing documents or acknowledgments

### 6.5 Ask Deal-Specific Questions
The AI Copilot must help the buyer:
- understand documents in plain English
- understand current deal status
- understand next actions
- generate smart questions for agent, escrow, title, or lender
- stay oriented without manually decoding the entire process

---

## 7. Emotional Identity Requirements

These remain in v1 because they make the product feel like a guided system rather than a utility tool.

### Required for emotional clarity
- five-phase progress map
- persistent current-phase visibility
- contextual glossary / explanation patterns
- alerts panel
- clear phase transition CTAs
- funding / recording timeline

These are not optional polish. They are part of the product’s identity and user trust.

---

## 8. AI Copilot Scope and Rule

### Non-negotiable rule
**The AI must always know the deal context before it answers.**

It should be grounded in:
- uploaded documents
- extracted document fields
- current phase
- timeline
- active deadlines
- open issues
- selected or chosen financial scenario
- known missing items

If sufficient context is not available, the AI should request it rather than answer generically.

### AI is allowed to do
- classify documents
- summarize documents
- explain terms in plain English
- compare financial documents
- highlight variances
- identify possible red flags
- explain why deadlines matter
- summarize current deal status
- draft questions for professionals

### AI is not allowed to do
- act as the buyer’s lawyer
- act as the buyer’s lender
- act as the buyer’s real estate agent
- draft or negotiate contract terms
- provide legal advice
- provide personalized financial advice
- imply certainty where underlying document or timeline data is incomplete

The AI should explicitly state its boundary when needed.

---

## 9. v1 Feature Inclusion

### Build in v1
- deal workspace
- five-phase progress map
- document upload and organization
- AI document explanation
- Loan Estimate comparison
- LE vs CD variance review
- live cash-to-close engine
- contingency / deadline tracker
- alerts and urgency states
- inspection red-flag summary
- title / escrow red-flag summary
- repairs / credits tracker
- wire fraud warning flow
- secure collaborator upload/request link

### Keep light in v1
- collaborator file intake
- glossary / educational support
- funding / recording timeline
- document status states
- basic notifications / urgency indicators

### Exclude from v1
- shopping phase product depth
- offer strategy tools
- RPA builder
- offer strength analyzer
- counteroffer simulator
- full insurance comparison product
- full loan-type recommendation wizard
- realtor dashboard
- brokerage admin tools
- marketplace / referral marketplace features
- post-close dashboard
- refi watch
- equity tracker
- ADU / renovation planner
- property tax exemptions
- long-term homeowner management

---

## 10. Phase Treatment in v1

### Shopping
Present only as lightweight context in the phase model. Not a core v1 experience.

### Offer
Limited setup context only. No offer drafting, scoring, or strategic recommendation engine in v1.

### Escrow
Primary v1 experience.

### Closing
Primary v1 experience.

### Post-Close
Explicitly deferred. Kept only as future continuity in the broader product vision.

---

## 11. Technical Scope Implications

The build plan should optimize for:
- structured document ingestion
- field extraction from key transaction docs
- comparison logic for LE and CD
- deal-state persistence
- timeline / deadline computation
- explainable AI outputs grounded in document context
- auditable citations or source references inside document explanation flows

The system does **not** need v1 support for:
- full marketplace integrations
- broad MLS/search infrastructure
- deep brokerage tooling
- extensive post-close data sync
- generalized homeowner analytics

---

## 12. 90-Day Success Definition

At 90 days, v1 is successful if:

1. Real buyers under contract are uploading real documents and returning multiple times during live transactions.
2. The document explanation + LE/CD + cash-to-close workflow cluster feels painful to lose.
3. Users say some version of:
   - “I finally understood what was happening.”
   - “This kept me organized.”
   - “I caught something I would have missed.”
4. Deadline checks, document uploads, and AI questions show repeated usage across active deals.
5. At least one collaborator proactively uses the secure upload link without heavy instruction.
6. The team has clear signal on the next expansion path:
   - backward into offer prep
   - outward into B2B2C collaboration
   - forward into post-close retention

---

## 13. How This Overrides the Broader Product Spec

The broader Product Specification remains useful as the long-term product universe, but for v1:

- sections describing full shopping-through-post-close depth should be treated as future-state framing, not current build scope
- escrow, closing, documents, and financing sections receive highest build priority
- any feature that crosses from explanation into tactical transaction advice is deferred
- post-close remains part of long-term vision, but does not drive initial build order

---

## 14. Immediate Next Deliverables

After this overlay is approved, the next documents should be:

1. **Build Plan**  
   A ruthless implementation plan based only on v1-included features.

2. **AI Copilot Architecture Note**  
   Defines inputs, context model, extraction flow, grounding rules, and response boundaries.

3. **Product Spec Revision v1.1**  
   Updates the broader Product Specification so it reflects this overlay cleanly.