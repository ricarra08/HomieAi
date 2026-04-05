# HomeBuyer Pro — Product Specification
## Version 1.1
### Aligned to MVP Scope Overlay v1.0

---

## 1. Executive Summary

**Product Name:** HomeBuyer Pro
**Product Type:** Web Application (React-based SPA)
**Target Audience:** Homebuyers in the United States who are under contract and entering escrow
**Primary Goal:** Give buyers clarity, organization, and confidence from offer accepted through clear to close

**Core Value Proposition:**
HomeBuyer Pro v1 is a buyer-facing deal workspace that helps homebuyers navigate the 21–45 day escrow-to-close window — the period when documents arrive quickly, deadlines are active, financial numbers change, and the buyer feels the least informed.

The product organizes the deal, explains the deal, and keeps the buyer on track.

**Core Promise:**
*From offer accepted to keys in hand, you'll always know where you are, what's due, and what everything means.*

**What v1 is:**
- A buyer-facing deal workspace
- A document intelligence layer
- A financing clarity layer (LE comparison, LE vs CD, cash-to-close)
- A deadline and contingency tracking layer
- A deal-context AI copilot

**What v1 is not:**
- A home search portal or Zillow replacement
- An agent replacement
- A contract drafting tool or offer strategy engine
- A post-close homeowner platform
- A brokerage admin product

> **Governing scope rule:** The MVP Scope Overlay v1.0 is the authoritative scope document. Where this spec and the overlay conflict, the overlay wins.

---

## 2. Scope & Version Map

Every feature and section in this spec is tagged with a version tier. This map governs build priority.

### v1 — Build now (MVP)
These define MVP completion. The product ships when these work.

| Area | What ships |
|------|-----------|
| Deal workspace | Create deal, property address, dates, basic transaction details |
| Five-phase progress map | Visual stepper with emotional identity; active experience centered on Escrow + Closing |
| Document ingestion | Upload, classify, organize, summarize, extract key fields |
| AI document explanation | Plain-English explanations grounded in uploaded docs |
| Loan Estimate comparison | Side-by-side LE comparison |
| LE vs CD variance review | Highlight changes, flag what's abnormal |
| Cash-to-close engine | Live calculation updated as documents arrive |
| Contingency / deadline tracker | Earnest money, inspection, appraisal, financing, disclosure deadlines |
| Alerts and urgency states | Color-coded, prioritized, deadline-driven |
| Inspection red-flag summary | Major findings flagging |
| Title / escrow red-flag summary | Liens, easements, delays |
| Repairs / credits tracker | Item list, negotiation status, dollar impact |
| Wire fraud warning flow | Verbal verification, fraud prevention checklist |
| Secure collaborator upload link | Lightweight link for agent/lender to send files into the workspace |

### v1.5 — Keep light, build thin
These exist in v1 but are deliberately thin. They get depth in v1.5.

| Area | What ships thin |
|------|----------------|
| Collaborator file intake | Inbound-only; no dashboard, no multi-user |
| Glossary / educational support | Contextual term explanations; no standalone learning center |
| Funding / recording timeline | Basic tracker; no county recorder API integration |
| Document status states | Required, uploaded, signed, final; no full workflow engine |
| Basic notifications | Urgency indicators in-app; no email/SMS/push |
| Insurance binding | Binder upload + status tracking only; no quote cards, no comparison table, no coverage education |
| Offer data capture | Offer data (price, EMD, contingency periods) captured in deal setup as input to Escrow; no offer workflows |
| Shopping phase context | Lightweight presence in the phase model; not an active experience |

### Deferred — Not in v1 or v1.5
These are part of the long-term product vision. They do not drive build decisions now.

| Area | Status |
|------|--------|
| Shopping phase product depth | Deferred |
| Offer strategy tools (RPA builder, offer strength analyzer, counteroffer simulator) | Deferred |
| Full insurance comparison product | Deferred |
| Full loan-type recommendation wizard | Deferred |
| Realtor dashboard / brokerage admin | Deferred |
| Marketplace / referral marketplace | Deferred |
| Post-close dashboard (equity tracker, refi watch, ADU planner, maintenance) | Deferred |
| Property tax exemptions | Deferred |
| Homes view (favorites, owned properties, import from Zillow/Redfin) | Deferred |
| Multi-user collaboration system | Deferred |
| E-signature integration | Deferred |
| Mobile native app | Deferred |
| MLS/search infrastructure | Deferred |

---

## 3. Product Identity & Primary User

### 3.1 Product Identity

HomeBuyer Pro v1 is a **homebuyer due-diligence and transaction clarity platform**.

It is built for buyers who already have an accepted offer and are moving through escrow toward closing.

Its job:
1. **Organize the deal** — documents, deadlines, financials in one place
2. **Explain the deal** — AI-powered plain-English summaries of every document and number
3. **Keep the buyer on track** — contingencies, deadlines, open risks, next steps

### 3.2 Primary User

The first ideal user is:
- A first-time or second-time homebuyer
- Under contract
- Entering escrow
- Receiving lender, title, inspection, and disclosure documents
- Working with an agent and lender, but lacking a personal comprehension layer for the transaction

This is a **single-player value-first product**. The buyer gets full value on their own without requiring any professional to adopt the platform.

### 3.3 Launch Motion

**B2C-first. B2B2C-ready.**

What this means for v1:
- The buyer must be able to use the product alone without brokerage adoption
- The architecture should support later collaborator, agent, lender, and brokerage workflows
- v1 includes a lightweight secure upload/request link for collaborators
- v1 does **not** include a realtor dashboard, brokerage admin console, or full multi-user collaboration system

### 3.4 Collaboration Model (v1)

| Capability | v1 | v1.5+ |
|------------|-----|-------|
| Buyer uploads own documents | Yes | Yes |
| Secure link for collaborator to upload files | Yes | Yes |
| Secure link for buyer to request specific docs | Yes | Yes |
| Collaborator dashboard or login | No | Planned |
| Agent-facing tools | No | Planned |
| Lender-facing tools | No | Planned |
| Multi-user real-time collaboration | No | Planned |
| Brokerage admin console | No | Deferred |

The collaborator upload link is a one-way file intake mechanism. The collaborator does not need an account. They receive a link, upload files, and those files appear in the buyer's deal workspace.

---

## 4. Design System & Brand Identity

*[v1.1 — Palette updated to premium restrained warm. The v1.0 Wheat/Bronze/Mint palette has been retired. This palette matches the seriousness of a trust-heavy escrow and financing product.]*

### 4.1 Color Palette

**Palette identity:** Premium restrained warm. Quiet confidence, not playful. The visual language should feel like a high-end financial document, not a consumer lifestyle app.

| Token | Hex Code | RGB | Usage |
|-------|----------|-----|-------|
| **Background** | `#F7F4EE` | 247, 244, 238 | Primary page background |
| **Surface** | `#FFFDFC` | 255, 253, 252 | Card backgrounds, elevated panels |
| **Surface Alt** | `#F1ECE3` | 241, 236, 227 | Secondary surfaces, sidebar, section dividers |
| **Primary Text** | `#2A2723` | 42, 39, 35 | Headings, body text, primary labels |
| **Secondary Text** | `#6F685F` | 111, 104, 95 | Muted text, captions, timestamps, helper text |
| **Border** | `#DDD4C7` | 221, 212, 199 | Card borders, dividers, input outlines |
| **Primary Accent** | `#8C5A3C` | 140, 90, 60 | CTAs, links, active states, phase indicators |
| **Accent Hover** | `#72472F` | 114, 71, 47 | Hover/pressed state for accent elements |
| **Success** | `#617A5D` | 97, 122, 93 | Completed steps, positive indicators, on-track states |
| **Warning** | `#C08A3C` | 192, 138, 60 | Approaching deadlines, items needing attention |
| **Destructive** | `#B85243` | 184, 82, 67 | Overdue deadlines, red flags, critical alerts, errors |

#### Palette Usage Notes

- **Backgrounds are layered, not flat.** Background (#F7F4EE) for the page, Surface (#FFFDFC) for cards and panels, Surface Alt (#F1ECE3) for sidebar and recessed areas. This creates subtle depth without heavy shadows.
- **Accent is earned, not everywhere.** Primary Accent (#8C5A3C) is reserved for CTAs, active navigation, and the most important interactive element on screen. It should never compete with itself.
- **Status colors are muted on purpose.** Success, Warning, and Destructive are desaturated compared to typical UI palettes. This keeps the product calm even when surfacing urgency. The color communicates state; the copy communicates severity.
- **Text contrast ratios.** Primary Text (#2A2723) on Background (#F7F4EE) exceeds 10:1. Secondary Text (#6F685F) on Background exceeds 4.5:1 (WCAG AA). Primary Text on Surface (#FFFDFC) exceeds 12:1.

### 4.2 Typography
- **Base Font Size:** 16px
- **Font Weights:**
  - Normal: 400
  - Medium: 500
  - Semibold: 600 (used sparingly — key financial figures, deal status headings)
- **Heading Hierarchy:**
  - H1: 2xl (1.5rem), semibold, 1.4 line height
  - H2: xl (1.25rem), medium, 1.4 line height
  - H3: lg (1.125rem), medium, 1.5 line height
  - H4: base (1rem), medium, 1.5 line height
  - Body: base (1rem), normal, 1.6 line height
  - Caption/Helper: sm (0.875rem), normal, 1.5 line height — uses Secondary Text color

### 4.3 Spacing & Layout
- **Border Radius:** 0.5rem (8px) standard for cards and inputs; 0.75rem (12px) for larger containers. Slightly tighter than v1.0 to match the restrained aesthetic.
- **Card Shadows:** Minimal. Prefer border (#DDD4C7) over shadow for elevation. Use `shadow-sm` only for floating elements (dropdowns, modals, tooltips).
- **Max Content Width:** 1120px for full-width views, 1536px (6xl) for dashboard
- **Padding:** 32px (8 units) standard for page padding

### 4.4 Design Philosophy
- **Restrained:** Premium, trust-communicating aesthetic. The product handles sensitive financial documents and high-stakes deadlines — it should look and feel like it takes that seriously.
- **Warm, not sterile:** The palette is warm but muted. It avoids the coldness of a banking app without drifting into casual territory.
- **Stress-reducing through clarity:** Calm is achieved through hierarchy, whitespace, and legibility — not through bright colors or playful illustration.
- **Responsive:** Mobile-first design with breakpoints at sm/md/lg/xl
- **Accessible:** Contrast ratios meet WCAG AA across all text/background combinations. Semantic HTML, keyboard navigation, screen reader support.

---

## 5. Technical Architecture

### 5.1 Technology Stack

- **Framework:** React 18+ with TypeScript support
- **Styling:** Tailwind CSS v4.0
- **Icons:** Lucide React
- **Animation:** Motion (formerly Framer Motion) via `motion/react`
- **Charts:** Recharts library
- **Form Management:** React Hook Form 7.55.0
- **UI Components:** Custom component library with shadcn/ui patterns
- **Build Tool:** Modern bundler (Vite-compatible)

### 5.1.1 State Architecture

*[v1.1 update — the product complexity has outgrown component-level useState.]*

The v1 product manages deal state, document metadata, extracted fields, deadline computations, financing comparisons, collaborator uploads, AI context assembly, and UI state. This requires a deliberate split between client state and server state.

**Recommended approach:**

| Layer | Tool | Scope |
|-------|------|-------|
| **Server state** | TanStack Query (React Query) | Deal data, documents, deadlines, collaborator uploads — anything persisted in Supabase |
| **Client state** | Zustand | UI state (active tab, copilot open/closed, edit mode, comparison selections) |
| **Form state** | React Hook Form | Scoped to individual forms (deal setup, LE entry, document upload) |
| **AI context** | Server-side assembly | Deal state + extracted fields + deadlines assembled into prompt context per request |

**Principles:**
- Server state is the source of truth for all deal data. Client never holds stale deal data.
- Client state is ephemeral UI state only. Losing it on refresh is acceptable.
- Forms own their own state until submission. No global form store.
- AI context is assembled server-side from persisted deal state, not from client state.

> The build plan should include a state architecture spike in sprint 1 to validate this approach before component work begins.

### 5.2 File Structure (v1)
```
/
├── App.tsx
├── components/
│   ├── deal/               (Deal workspace, phase map, deal setup)
│   ├── documents/          (Document upload, classification, viewer)
│   ├── financing/          (LE comparison, LE vs CD, cash-to-close)
│   ├── escrow/             (Contingency tracker, deadlines, due diligence)
│   ├── closing/            (CD review, wire safety, funding timeline)
│   ├── copilot/            (AI copilot panel, context engine)
│   ├── collaboration/      (Secure upload link, file intake)
│   ├── overlays/           (Edit mode, step-back system)
│   └── ui/                 (Reusable UI primitives)
├── styles/
│   └── globals.css
└── guidelines/
    └── Guidelines.md
```

### 5.3 Core Data Models (v1)

#### Deal Model
```typescript
interface Deal {
  id: string;
  propertyAddress: string;
  contractAcceptanceDate: string;
  closingDate: string;
  purchasePrice: number;
  currentPhase: "shopping" | "offer" | "escrow" | "closing" | "post-close";
  createdAt: string;
  updatedAt: string;
}
```

#### Loan Estimate Model
```typescript
interface LoanEstimate {
  id: string;
  lender: string;
  product: string;
  loanAmount: number;
  downPayment: number;
  rate: number;
  apr: number;
  points: number;
  lenderFees: number;
  thirdPartyFees: number;
  pmiMonthly: number;
  impounds: boolean;
  cashToClose: number;
  lockStatus: "locked" | "floating";
  lockExpires?: string;
  prepayPenalty: boolean;
  isChosen?: boolean;
  pdfAttached?: boolean;
  createdAt: string;
}
```

#### Document Model
```typescript
interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  stage: string;
  status: "required" | "missing" | "uploaded" | "signed" | "acknowledged" | "final" | "read-only";
  version?: string;
  lastUpdated: string;
  size: string;
  urgent?: boolean;
  required?: boolean;
  extractedFields?: Record<string, any>;
  aiSummary?: string;
  sourceType?: "buyer-upload" | "collaborator-upload" | "system-generated";
}
```

#### Deadline Model
```typescript
interface Deadline {
  id: string;
  dealId: string;
  name: string;
  type: "earnest-money" | "inspection" | "appraisal" | "financing" | "disclosure" | "closing" | "custom";
  dueDate: string;
  status: "upcoming" | "due-soon" | "overdue" | "completed" | "waived";
  notes?: string;
  linkedDocumentIds?: string[];
}
```

#### Collaborator Link Model
```typescript
interface CollaboratorLink {
  id: string;
  dealId: string;
  recipientRole: "agent" | "lender" | "escrow" | "title" | "inspector" | "other";
  recipientEmail?: string;
  linkUrl: string;
  requestedDocuments?: string[];
  expiresAt: string;
  status: "active" | "expired" | "revoked";
  uploadsReceived: number;
}
```

### 5.4 Technical Scope Implications (v1)

The build should optimize for:
- Structured document ingestion and classification
- Field extraction from key transaction documents (LE, CD, inspection reports, disclosures)
- Comparison logic for Loan Estimate and Closing Disclosure
- Deal-state persistence
- Timeline / deadline computation from contract dates
- Explainable AI outputs grounded in document context
- Auditable citations or source references inside document explanation flows

The system does **not** need v1 support for:
- MLS/search infrastructure
- Full marketplace integrations
- Deep brokerage tooling
- Post-close data sync or homeowner analytics
- Broad API integrations (Zillow, Redfin, county recorder)

---

## 6. Application Structure

### 6.1 Global Navigation

#### Top Progress Stepper
*[v1 — Retained as emotional identity element.]*

- **Component:** `ProgressStepper.tsx`
- **Position:** Fixed at top of viewport
- **Purpose:** Shows current phase and overall progress
- **Steps:** 5 stages (Shopping, Offer, Escrow, Closing, Post-Close)
- **Visual Design:**
  - Circular step indicators (40px diameter)
  - Connected by horizontal progress bars
  - Icons: Search, FilePen, ShieldCheck, Key, LineChart
  - Completed steps: Success (#617A5D) fill with checkmark
  - Current step: Primary Accent (#8C5A3C) fill with icon
  - Future steps: Secondary Text (#6F685F) with icon
- **v1 Active Experience:** Escrow and Closing phases. Shopping and Offer appear as completed context. Post-Close appears as future state.

#### Left Sidebar Navigation (v1)
- **Component:** `Sidebar.tsx`
- **Width:** 256px (64 units)
- **Background:** Surface Alt (#F1ECE3)
- **v1 Navigation Items:**
  1. Dashboard (LayoutDashboard icon) — **v1**
  2. Documents (FileText icon) — **v1**
  3. Financing (CreditCard icon) — **v1**
  4. ~~Homes~~ — **Deferred**
  5. ~~Insurance~~ — **v1.5** (accessible but thin)
- **Active State:** Primary Accent (#8C5A3C) text/icon with Surface (#FFFDFC) background

#### AI Copilot Panel
- **Component:** `AICopilot.tsx`
- **Position:** Right-side expandable panel
- **Width:** 30% of viewport when expanded
- **Features:**
  - Collapsible/expandable interface
  - Real-time chat interface
  - **Deal-context grounded** — see Section 8 for full AI spec
  - Rich content support (tables, lists, tips)
  - Message history
  - Send message input with icon

#### Global Footer
- **Component:** `GlobalFooter.tsx`
- **Style:** Frosted glass effect (backdrop-blur)
- **Content:** Legal disclaimer text
- **Text:** "This app provides educational guidance only. We don't provide legal, financial, or brokerage services."

### 6.2 Edit Mode & Step-Back System
*[v1 — Retained.]*

#### Edit Mode Banner
- **Component:** `EditModeBanner.tsx`
- **Trigger:** Clicking completed steps in progress stepper
- **Position:** Below progress stepper
- **Features:**
  - Yellow/amber warning banner
  - Step name indication
  - Three action buttons:
    1. Discard Changes (ghost button)
    2. Save Draft (secondary button)
    3. Apply Changes (primary button)

#### Step-Back Hotspots
- **Component:** `StepBackHotspots.tsx`
- **Mechanism:** Invisible overlays on completed progress steps
- **Interaction:**
  - Hover: Shows tooltip + focus ring
  - Click: Enters edit mode for that step
- **Tooltip:** "Go back to edit [Step Name]"

---

## 7. Emotional Identity Requirements

*[v1 — These are not optional polish. They are part of the product's identity and user trust.]*

These elements make the product feel like a guided system rather than a utility tool. They are required for v1.

| Element | Purpose | Version |
|---------|---------|---------|
| Five-phase progress map | Orientation, emotional grounding | v1 |
| Persistent current-phase visibility | "You are here" confidence | v1 |
| Contextual glossary / explanation patterns | Reduce confusion without leaving context | v1 |
| Alerts panel | Surface what needs attention | v1 |
| Clear phase transition CTAs | Guide the buyer forward | v1 |
| Funding / recording timeline | "Almost there" momentum during close | v1 (light) |

---

## 8. AI Copilot — Behavior, Constraints, and Architecture

*[v1 — This section is significantly expanded from v1.0 to serve as the definitive AI behavior spec.]*

### 8.1 Non-Negotiable Rule

**The AI must always know the deal context before it answers.**

If sufficient context is not available, the AI must request it rather than answer generically. A generic homebuying answer that ignores the buyer's actual documents and deadlines is a product failure.

### 8.2 Context Grounding

The copilot must be grounded in these inputs before generating any response:

| Context source | Description |
|---------------|-------------|
| Uploaded documents | Actual PDFs and extracted text the buyer has uploaded |
| Extracted document fields | Structured data pulled from LE, CD, inspection reports, disclosures |
| Current phase | Where the buyer is in the five-phase model |
| Timeline | Contract acceptance date, closing date, days remaining |
| Active deadlines | Contingency dates, review windows, funding deadlines |
| Open issues | Appraisal gaps, inspection findings, title red flags, lender conditions |
| Chosen financial scenario | Selected Loan Estimate, cash-to-close numbers |
| Known missing items | Documents not yet uploaded, acknowledgments not yet signed |

### 8.3 Allowed Behaviors

The AI copilot **may**:

- Classify and categorize uploaded documents
- Summarize documents in plain English
- Explain real estate terms, processes, and document sections
- Compare Loan Estimates side by side
- Compare Loan Estimate vs Closing Disclosure and highlight variances
- Identify possible red flags in inspection reports, title searches, or appraisals
- Explain why specific deadlines matter and what happens if they're missed
- Summarize current deal status across all tracked dimensions
- Draft questions the buyer should ask their agent, lender, escrow officer, or title company
- Highlight what changed between document versions
- Flag what is normal vs what deserves follow-up
- Provide contextual glossary definitions inline

### 8.4 Prohibited Behaviors

The AI copilot **must not**:

- Act as or replace the buyer's lawyer
- Act as or replace the buyer's lender
- Act as or replace the buyer's real estate agent
- Draft, modify, or negotiate contract terms
- Provide legal advice or opinions
- Provide personalized financial advice (e.g., "you should take this loan")
- Recommend specific professionals, lenders, or service providers
- Imply certainty where underlying document or timeline data is incomplete
- Answer questions about topics outside the buyer's current deal without clearly labeling the response as general education
- Speculate on market conditions, property values, or investment outcomes

### 8.5 Boundary Communication

When the copilot reaches the edge of its allowed behavior, it must:

1. **Explicitly state the boundary.** Example: *"I can explain what this clause means, but I can't advise whether you should agree to it. That's a question for your real estate attorney."*
2. **Suggest the right professional.** When declining to answer, the AI should point the buyer to the correct party (agent, lender, attorney, title officer).
3. **Offer what it can do.** After stating a boundary, the AI should offer an alternative action within its scope. Example: *"I can't tell you whether to waive this contingency, but I can explain what waiving it would mean and draft a question for your agent."*

### 8.6 Response Quality Standards

| Dimension | Standard |
|-----------|----------|
| Grounding | Every factual claim must reference a specific uploaded document or extracted field |
| Citations | Responses should cite the document name and section when explaining document content |
| Uncertainty | If a field is missing or ambiguous, the AI must say so rather than guess |
| Tone | Calm, clear, empowering — never alarmist, never dismissive |
| Length | Concise by default; offer to expand on request |
| Actionability | End substantive responses with a clear next step or suggested action |

### 8.7 AI-Powered Workflows (v1)

These are the specific AI-driven features that ship in v1:

1. **Document classification** — Auto-categorize uploaded files by type (LE, CD, inspection, disclosure, etc.)
2. **Document summarization** — Generate a plain-English summary of any uploaded document
3. **Field extraction** — Pull structured data from Loan Estimates, Closing Disclosures, inspection reports
4. **LE comparison narrative** — Explain differences between multiple Loan Estimates in plain English
5. **LE vs CD variance narrative** — Explain what changed, whether it's normal, and whether it needs attention
6. **Red flag identification** — Surface potential issues from inspection reports, title searches, appraisals
7. **Deadline context** — Explain what each deadline means, what happens if missed, and what the buyer should do
8. **Question drafting** — Generate smart questions for the buyer to ask their agent, lender, or escrow officer
9. **Deal status summary** — On-demand summary of where the deal stands across all tracked dimensions

---

## 9. Phase-by-Phase Feature Breakdown

### Phase Treatment Summary

| Phase | v1 Role | Build Depth |
|-------|---------|-------------|
| Shopping | Lightweight context in phase model | Deferred |
| Offer | Limited setup context only | v1.5 |
| **Escrow** | **Primary v1 experience** | **v1 — Full build** |
| **Closing** | **Primary v1 experience** | **v1 — Full build** |
| Post-Close | Future continuity in phase model | Deferred |

---

### 9.1 DEAL WORKSPACE SETUP — [v1]

#### Overview
The entry point. The buyer creates a deal workspace by entering basic transaction details. This replaces the Shopping and Offer phases as the v1 onboarding flow.

#### Setup Flow
The buyer provides:
- Property address
- Contract acceptance date
- Closing date
- Purchase price
- Earnest money amount
- Key contingency dates (inspection, appraisal, financing, disclosure)

The system generates:
- Five-phase progress map (set to Escrow active)
- Expected timeline with computed deadlines
- Expected document checklist
- Empty workspace ready for document uploads

#### Components
**1. Deal Setup Form** (`DealSetupForm.tsx`) — **v1**
- Multi-step or single-page form
- Address input with validation
- Date pickers for key dates
- Auto-compute deadline dates from contract acceptance
- Save and create workspace

**2. Deal Summary Card** (`DealSummaryCard.tsx`) — **v1**
- Persistent card on dashboard
- Property address, price, key dates
- Days to closing countdown
- Current phase indicator
- Quick-edit capability

---

### 9.2 SHOPPING PHASE — [Deferred]

Present only as a completed step in the five-phase progress map. No active product experience in v1.

**What exists:** A grayed-out or completed step icon in the progress stepper.
**What does not exist:** Saved homes grid, property cards, equity forecast, BRBC summary, loan type helper card, cash-to-close estimator (shopping version), or any shopping-specific dashboard.

*The full Shopping phase spec from v1.0 is preserved in the product vision archive but does not drive v1 build decisions.*

---

### 9.3 OFFER PHASE — [Deferred as a workflow; data capture exists in v1 setup]

The Offer phase has no standalone workflow or dashboard in v1. It appears in the progress stepper as a completed step (the buyer's offer was already accepted before they start using the product).

**Offer data capture exists in v1 only as setup input.** During deal workspace creation (Section 9.1), the buyer enters offer-related data — purchase price, earnest money amount, contingency periods, closing date. These values feed directly into the Escrow phase workflows (deadline computation, EMD tracking, financing comparison). They are not part of an "Offer experience."

**Offer workflows remain out of scope for v1:**
- RPA Draft builder
- Offer Checklist
- Contingency Builder (standalone — contingency *tracking* is in Escrow)
- Offer Strength Analyzer
- Earnest Money Calculator (standalone — EMD *tracking* is in Escrow)
- Counteroffer Simulator
- Offer Alerts Panel

These become candidates for v1.5 expansion backward into offer prep, contingent on 90-day success signals.

---

### 9.4 ESCROW & DUE DILIGENCE PHASE — [v1 Primary]

#### Overview
The primary v1 experience. Manages the 21–45 day period between offer acceptance and closing. This is where the buyer spends most of their time.

#### Dashboard Layout (6 thematic sections)
```
🚨 CRITICAL ACTIONS & DEADLINES
┌──────────────────┬──────────────────┐
│  Earnest Money   │  Contingency     │
│  Deposit Tracker │  Countdown       │
└──────────────────┴──────────────────┘

🔍 DUE DILIGENCE & PROPERTY EVALUATION
┌──────────────────┬──────────────────┐
│  Appraisal       │  Inspection      │
│  Status          │  Checklist       │
└──────────────────┴──────────────────┘

🔧 REPAIRS, CREDITS & ISSUES
┌──────────────────┬──────────────────┐
│  Repairs/Credits │  Escrow/Title    │
│  Tracker         │  Alerts          │
└──────────────────┴──────────────────┘

📋 FINANCING & DOCUMENTATION
┌──────────────────┬──────────────────┐
│  Loan Financing  │  Disclosures &   │
│                  │  Documents       │
└──────────────────┴──────────────────┘

📝 SPECIAL REQUIREMENTS & FINAL STEPS
┌──────────────────┬──────────────────┐
│  Gift Funds      │  Insurance       │
│  Tracker         │  Binding         │
└──────────────────┴──────────────────┘

💰 FINANCIAL SUMMARY
┌──────────────────────────────────────┐
│  Cash-to-Close (Escrow Version)      │
└──────────────────────────────────────┘
```

#### Components

**CRITICAL ACTIONS (Highest Priority)** — v1

**1. Earnest Money Deposit Tracker** (`EarnestMoneyDepositTracker.tsx`)
- Deposit amount display
- Wire/check instructions
- Deadline countdown
- Confirmation tracking
- Escrow company details

**2. Contingency Countdown** (`ContingencyCountdown.tsx`)
- Visual timeline
- Days remaining per contingency
- Color-coded urgency (Success > Warning > Destructive)
- Automatic deadline calculations from contract dates
- Removal/waiver tracking

**DUE DILIGENCE (Property Evaluation)** — v1

**3. Appraisal Status** (`AppraisalStatus.tsx`)
- Order status tracking
- Scheduled appointment
- Preliminary value estimate
- Gap analysis (if value < purchase price)
- Next steps guidance

**4. Inspection Checklist** (`InspectionChecklist.tsx`)
- Inspection types: General, Pest, Roof, HVAC, Foundation
- Schedule tracking
- Report upload (triggers AI red-flag summary)
- Major findings flagging
- Repair negotiation prep

**REPAIRS & ISSUES** — v1

**5. Repairs/Credits Tracker** (`RepairsCreditsTracker.tsx`)
- Item list with costs
- Request/response tracking
- Negotiation status
- Seller credits vs actual repairs
- Total dollar impact

**6. Escrow/Title Alerts** (`EscrowTitleAlerts.tsx`)
- Title issues (liens, easements)
- Document delays
- Underwriting conditions
- Missing signatures
- Wire fraud warnings

**FINANCING & DOCUMENTATION** — v1

**7. Loan Financing** (`LoanFinancing.tsx`)
- Loan progress tracker
- Underwriting status
- Conditions list
- Document requests from lender
- Lock expiration countdown

**8. Disclosures & Documents** (`DisclosuresDocuments.tsx`)
- Required disclosure list
- Receipt/review tracking
- Acknowledgment signatures
- 3-day review period tracking

**SPECIAL REQUIREMENTS** — v1.5 (thin)

**9. Gift Funds Tracker** (`GiftFundsTracker.tsx`) — v1.5
- Gift letter template guidance
- Paper trail requirements
- Lender approval status

**10. Insurance Binding** (`InsuranceBinding.tsx`) — v1 (thin); full Insurance View is v1.5
- Binder upload (drag-and-drop or file select)
- Binding status indicator (pending / bound)
- Mortgagee clause confirmation
- Effective date tracking
- No quote comparison, no multiple carriers, no coverage education — those are v1.5 Insurance View features

**FINANCIAL SUMMARY** — v1

**11. Cash-to-Close (Escrow Version)** (`CashToCloseEscrowVersion.tsx`)
- Updated cost breakdown
- Actual vs estimated
- Credits applied
- Prorations
- Final amount due
- Funding deadline

#### Phase Transition
**CTA Button:** "All Contingencies Clear? Proceed to Closing"
- **Action:** Advances to Closing phase
- **Validation:** Surfaces any unresolved contingencies or open risks

---

### 9.5 CLOSING PHASE — [v1 Primary]

#### Overview
Handles final verifications, document signing, and fund transfer in the 3–7 days before recording. Second primary v1 experience.

#### Dashboard Layout
```
🚨 CRITICAL FINAL STEPS
┌───────────┬──────────────┬───────────┐
│ Closing   │ Cash-to-     │ Signing   │
│ Disclosure│ Close        │ Appoint.  │
│ Review    │ Finalizer    │           │
└───────────┴──────────────┴───────────┘

🔍 PRE-CLOSING VERIFICATION
┌───────────┬──────────────┬───────────┐
│ Final     │ Insurance    │ Under-    │
│ Walk-     │ Binder       │ writing   │
│ through   │ Verification │ Conditions│
└───────────┴──────────────┴───────────┘

💰 FUNDING & TRANSFER
┌───────────┬──────────────┬───────────┐
│ Wire      │ Title/Escrow │ Funding & │
│ Transfer  │ Final Checks │ Recording │
│ SafeSend  │              │ Timeline  │
└───────────┴──────────────┴───────────┘

⚠️ ALERTS
┌──────────────────────────────────────┐
│  Closing Alerts (full-width)         │
└──────────────────────────────────────┘
```

#### Components

**CRITICAL FINAL STEPS** — v1

**1. Closing Disclosure Review** (`ClosingDisclosureReview.tsx`)
- CD receipt confirmation
- 3-business-day waiting period countdown
- Side-by-side LE vs CD comparison (AI-powered variance narrative)
- Variance highlighting (>$100 or >10%)
- Line-item review
- Change request guidance

**2. Cash-to-Close Finalizer** (`CashToCloseFinalizer.tsx`)
- Final dollar amount
- Wire instructions
- Cashier's check alternative
- Timing requirements
- Verification steps
- Fraud prevention checklist

**3. Signing Appointment** (`SigningAppointment.tsx`)
- Notary scheduling info
- Location (office, mobile, remote)
- Document count preview
- What to bring checklist
- ID requirements

**PRE-CLOSING VERIFICATION** — v1

**4. Final Walkthrough Checklist** (`FinalWalkthroughChecklist.tsx`)
- Schedule within 24–48 hours of closing
- Room-by-room inspection list
- Repair verification
- Appliance testing
- Issue documentation

**5. Insurance Binder Verification** (`InsuranceBinderVerification.tsx`) — v1.5
- Binder received by lender
- Mortgagee clause correct
- Effective date matches closing

**6. Underwriting Conditions Final** (`UnderwritingConditionsFinal.tsx`)
- Final approval status
- Outstanding conditions
- Clear-to-close confirmation
- Last-minute document requests

**FUNDING & TRANSFER** — v1

**7. Wire Transfer SafeSend** (`WireTransferSafeSend.tsx`)
- CRITICAL: Fraud prevention flow
- Verbal verification requirement
- Wire instruction confirmation
- Timing guidance
- Never trust emailed wire instructions warning

**8. Title/Escrow Final Checks** (`TitleEscrowFinalChecks.tsx`)
- Clear title confirmation
- Escrow balance sheet
- Proration calculations
- Outstanding liens cleared

**9. Funding & Recording Timeline** (`FundingRecordingTimeline.tsx`) — v1 (light)
- Multi-step visual tracker:
  1. Lender funds escrow
  2. Escrow disburses to seller
  3. Documents record at county
  4. Keys released
- Estimated timing per step
- Basic status updates

**ALERTS** — v1

**10. Closing Alerts** (`ClosingAlerts.tsx`)
- Red flag warnings
- Missing signatures
- Funding delays
- Title issues
- Last-minute issues

#### Phase Transition
**CTA Button:** "Recording Complete — Keys in Hand!"
- **Action:** Marks deal as closed
- **v1 behavior:** Celebratory state. Post-Close dashboard is deferred; user sees a completion summary and option to export/archive deal documents.

---

### 9.6 POST-CLOSE PHASE — [Deferred]

Explicitly deferred from v1. Appears in the progress stepper as a future step to maintain the product's emotional arc ("your journey continues").

**v1 behavior on closing completion:**
- Completion celebration screen
- Deal summary / snapshot
- Option to download or archive all deal documents
- Prompt: "Post-close homeowner tools coming soon"

**Deferred components (from v1.0 spec):**
- Equity Value Tracker
- Refi Rate Watch
- Insurance Risk Monitor
- Property Tax Exemptions
- Documents Vault (ongoing)
- Maintenance Planner
- Renovation & ADU Planner
- Post-Close Alerts

---

## 10. Full-Width Specialized Views

### 10.1 DOCUMENTS VIEW — [v1 Core]

**Component:** `DocumentsView.tsx`
**Access:** Sidebar navigation
**Background:** Background (#F7F4EE)
**Max Width:** 1120px

#### Architecture
- Compact header (minimal height)
- Search toggle (expandable)
- Upload CTA (Primary Accent button)
- Stage Essentials progress strip
- Smart Tabs navigation
- Document list with row design
- Slide-over PDF viewer
- Bulk selection toolbar
- Toast notifications

#### Features

**1. Stage Essentials Card** (`EssentialsCard.tsx`) — v1
- Horizontal strip showing critical documents for current phase
- Progress: X of Y complete
- Urgent document chips (max 2)
- "Continue" CTA to next required doc

**2. Smart Tabs** (`SmartTabs.tsx`) — v1
- Horizontal scrollable tabs
- **v1 Categories:**
  - **Essentials** (required only)
  - Disclosures
  - Financing
  - Inspections
  - Escrow/Title
  - Closing
- Document count badges
- Active state styling

**3. Document Row** (`DocRow.tsx`) — v1
- Checkbox selection
- Document name + type badge
- Status indicator (icon + text)
- Version number
- Last updated timestamp
- File size
- Three-dot menu (download, share, delete)
- Click to preview
- Source indicator (buyer upload vs collaborator upload)

**4. Slide-Over Viewer** (`SlideOverViewer.tsx`) — v1
- Right-side panel (50–60% width)
- PDF preview
- Document metadata sidebar
- **AI Summary panel** — plain-English summary of the document
- Action buttons: Acknowledge, Download, Share
- Navigation between documents

**5. Bulk Selection Bar** (`BulkSelectionBar.tsx`) — v1
- Sticky bottom bar
- Selected count display
- Bulk actions: Download all (ZIP), Mark as reviewed
- Clear selection

**6. AI Document Actions** — v1 (new)
- "Explain this document" button in viewer
- "What should I look for?" contextual prompt
- "Draft a question about this" for generating questions to ask professionals
- Inline term definitions on hover or tap

#### Document Statuses
- 🔴 **Required:** Not yet uploaded
- 🔴 **Missing:** Overdue
- 🟡 **Uploaded:** Received, awaiting review
- 🟢 **Signed:** E-signature complete
- 🟢 **Acknowledged:** Reviewed and accepted
- 🟢 **Final:** Completed and locked
- 🔵 **Read-Only:** Informational, no action required

---

### 10.2 FINANCING VIEW — [v1 Core]

**Component:** `FinancingView.tsx`
**Access:** Sidebar navigation
**Background:** Background (#F7F4EE)
**Max Width:** 1120px

#### v1 Scope
The Financing view in v1 is focused on three high-value workflows:
1. **Loan Estimate comparison** — side-by-side LE analysis
2. **LE vs CD variance review** — what changed and whether it matters
3. **Cash-to-close engine** — live calculation, always current

The Loan Type Helper wizard (3-step recommendation flow) is **deferred to v1.5**. It was a shopping/pre-offer tool and is not relevant to a buyer already under contract with a lender.

#### Features

**1. My Loan Estimates Section** — v1
- Grid layout (3 columns on desktop)
- "Add Loan Estimate" CTA (Primary Accent button)

**2. Loan Estimate Card** (`LoanEstimateCard.tsx`) — v1
- Lender name + product
- Rate (large text)
- APR
- Monthly P&I (calculated)
- Points
- Lock status badge (locked vs floating)
- Lock expiration countdown
- "Chosen" indicator (star badge)
- PDF attachment icon
- Actions: Set as Chosen, Select for Compare, Edit

**3. Loan Estimate Form** (`LoanEstimateForm.tsx`) — v1
- Modal dialog
- Fields: Lender, product, loan amount, down payment %, rate, APR, points, lender fees, third-party fees, PMI, impounds, cash to close, lock status, lock expiration, prepayment penalty, PDF upload
- Save/Cancel with validation

**4. Compare Table** (`CompareTable.tsx`) — v1
- Triggered when 2–3 estimates selected
- Full-width table
- Optimization toggle:
  - Minimize monthly payment
  - Minimize cash to close
  - Minimize total cost (APR-based)
- Highlights best value per column
- Winner indicators (Success checkmarks)

**5. LE vs CD Variance Panel** (`LEvsCD.tsx`) — v1 (new)
- Side-by-side comparison when both LE and CD are uploaded
- AI-powered variance narrative: what changed, is it normal, does it need attention
- Tolerance highlighting (>$100 or >10%)
- TILA tolerance rules reference

**6. Cash-to-Close Engine** (`CashToCloseEngine.tsx`) — v1
- Live calculation pulling from chosen LE and CD
- Updates as new documents arrive
- Breakdown: down payment, closing costs, prepaids, credits, prorations
- Final number prominently displayed
- Historical changes tracked

**7. Sticky Snapshot Footer** (`StickySnapshot.tsx`) — v1
- Fixed bottom of viewport
- Appears when "Chosen" loan exists
- Compact display: Lender + product, Rate, Monthly payment, Cash to close

#### Deferred from Financing View
- Loan Type Helper wizard (3-step recommendation flow) — v1.5
- Loan recommendation summary card — v1.5
- Guardrail notes (AI rate lock timing, points strategy) — v1.5
- Full loan-type recommendation algorithm — Deferred

---

### 10.3 INSURANCE VIEW — [v1.5]

**v1 treatment:** Insurance is accessible but thin. The buyer can upload an insurance binder and track binding status. The full quote comparison product is v1.5.

**v1 features:**
- Insurance Binding status card (bound vs pending)
- Binder upload
- Mortgagee clause confirmation
- Effective date tracking

**v1.5 features (not in initial build):**
- Multiple quote cards
- Quote comparison table
- Coverage education
- Carrier comparison
- Premium optimization suggestions

---

### 10.4 HOMES VIEW — [Deferred]

The Homes view (favorites, owned properties, import from Redfin/Zillow) is entirely deferred. It is a Shopping-phase feature and has no role in the escrow-to-close experience.

---

## 11. Advanced Features & Interactions

### 11.1 Animations
*[v1 — Retained. Same implementation spec as v1.0.]*

**Implementation:** `motion/react` package

**Animation Patterns:**
- Page transitions: fade + slide (300ms)
- Card hover: scale 1.02, y -4 (200ms)
- Button press: scale 0.95
- Stagger children: sequential reveal
- Slide-in panels: spring damping 25

### 11.2 Interactive Calculators — v1

**v1 calculators:**
- Cash-to-close engine (live, document-driven)
- Monthly P&I calculation (from LE data)

**Deferred calculators:**
- Equity appreciation forecast
- ROI calculators (renovation, ADU, solar)
- Refinance savings
- Offer strength gauge

### 11.3 Data Visualization — v1

**v1 charts:**
- Contingency countdown bars (progress bars, color-coded)
- Document completion progress
- LE comparison table
- Cash-to-close breakdown

**Deferred charts:**
- Equity appreciation line chart
- Home value trends
- Market analytics
- Offer strength gauge

### 11.4 Smart Comparisons — v1

**v1 comparisons:**
- Loan Estimates (rate, fees, monthly payment, cash to close)
- LE vs CD (variance review)

**Deferred comparisons:**
- Insurance quotes (full)
- Properties
- Contractor bids

---

## 12. Responsive Design & Breakpoints

*[v1 — No changes from v1.0. These remain the build guide.]*

### 12.1 Breakpoints (Tailwind CSS)
```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### 12.2 Mobile Adaptations
- Sidebar collapses to hamburger menu
- Progress stepper becomes vertical (mobile)
- Tabs become horizontally scrollable
- Multi-column grids → single column
- Modals → full-screen on mobile
- Larger touch targets (44px minimum)

### 12.3 Desktop Optimizations
- Multi-column grids for dashboard cards
- Expanded comparison tables
- Side-by-side document viewer
- Copilot panel doesn't overlap content

---

## 13. Component Library (UI Primitives)

*[v1 — No changes. Full shadcn/ui library retained as build foundation.]*

### 13.1 shadcn/ui Components

Located in `/components/ui/`

**Form Elements:** button, input, textarea, label, select, slider, switch, checkbox, radio-group

**Layout:** card, separator, accordion, collapsible, tabs, scroll-area

**Overlays:** dialog, alert-dialog, sheet, popover, tooltip, hover-card, dropdown-menu, context-menu

**Feedback:** alert, toast/sonner, progress, skeleton, badge

**Navigation:** breadcrumb, pagination, navigation-menu

**Data Display:** table, avatar, chart

**Utilities:** utils.ts (cn function), use-mobile.ts, visually-hidden.tsx

---

## 14. User Flows & Journeys

### 14.1 v1 Onboarding Flow

```
1. Landing → Sign Up
2. "I have an accepted offer" → Deal Setup
3. Enter property address, dates, key details
4. Workspace created → Escrow dashboard
5. Upload first documents (contract, LE)
6. AI classifies and summarizes
7. Copilot introduction: "Ask me anything about your deal"
```

There is no Shopping or Offer flow in v1. The user enters the product with an accepted offer.

### 14.2 Core v1 Journey (Escrow → Close)

```
DEAL SETUP (Day 0)
├─ Enter deal details
├─ Upload purchase contract
├─ AI extracts dates, deadlines, parties
└─ Workspace populated

ESCROW PHASE (Days 1–35)
├─ Week 1: Earnest deposit tracking, initial disclosures
├─ Week 2: Inspections, appraisal ordered
├─ Week 3: Inspection findings, repair negotiations, AI red-flag summaries
├─ Week 4: Loan progress, insurance binding
├─ Week 5+: Final conditions, contingency removals
├─ Throughout: Upload documents → AI classifies, summarizes, explains
├─ Throughout: Check deadlines, ask copilot questions
└─ CTA: "All Contingencies Clear? Proceed to Closing"

CLOSING PHASE (Days 35–42)
├─ Day 1–3: Receive CD, 3-day wait, LE vs CD variance review
├─ Day 4: Final walkthrough checklist
├─ Day 5: Wire funds (SafeSend flow), final verifications
├─ Day 6: Signing appointment
├─ Day 7: Funding → Recording → Keys
└─ CTA: "Recording Complete!"

POST-CLOSE (v1)
├─ Celebration screen
├─ Deal summary / archive
└─ "More tools coming soon"
```

### 14.3 Document Upload Flow (v1)

```
Buyer uploads file
→ AI classifies document type
→ Document placed in correct category/tab
→ Key fields extracted
→ AI summary generated
→ Open questions or missing items surfaced
→ Document appears in workspace with status
→ If LE or CD: feeds into financing comparison engine
→ If inspection report: triggers red-flag summary
```

### 14.4 Collaborator Upload Flow (v1)

```
Buyer generates secure upload link
→ Optionally specifies requested documents
→ Link sent to agent/lender/escrow officer
→ Collaborator opens link (no account needed)
→ Collaborator uploads files
→ Files appear in buyer's workspace
→ Same AI classification and summary pipeline
→ Buyer notified of new uploads
```

---

## 15. Performance & Optimization

*[v1 — No changes from v1.0.]*

### 15.1 Performance Targets
- **Initial Load:** <2 seconds (3G connection)
- **Time to Interactive:** <3 seconds
- **Largest Contentful Paint:** <2.5 seconds
- **First Input Delay:** <100ms
- **Cumulative Layout Shift:** <0.1

### 15.2 Optimization Techniques
- Route-based code splitting
- Component lazy loading
- Image lazy loading with Intersection Observer
- Server state caching via TanStack Query (avoids redundant fetches)
- Memoization with useMemo/useCallback
- Tailwind CSS purging
- Tree-shaking

---

## 16. Accessibility (a11y)

*[v1 — No changes from v1.0. WCAG 2.1 Level AA target retained.]*

- Color contrast ratios >4.5:1 for normal text
- Keyboard navigation for all interactive elements
- Screen reader support with ARIA labels
- Focus indicators and focus trapping in modals
- Semantic HTML throughout

---

## 17. Business Model & Monetization

### 17.1 v1 Model

**Free during beta.** The goal is to prove product-market fit with real buyers in real transactions.

v1 success is measured by engagement and retention, not revenue (see Section 19).

### 17.2 Post-Validation Revenue Model

**B2C-first. B2B2C-ready.**

| Stream | Timing | Description |
|--------|--------|-------------|
| Freemium subscription | v1.5+ | Free: 1 active deal. Pro: $29/mo for unlimited deals + advanced features |
| B2B2C agent/lender partnerships | v2+ | Agents or lenders sponsor buyer access; lead-gen or co-branding model |
| Referral fees | v2+ | Lender, insurance, service provider partnerships |
| Enterprise licensing | Deferred | White-label for brokerages |
| Data insights (anonymized) | Deferred | Market research, industry benchmarks |

### 17.3 Customer Acquisition (v1)

**Primary channels for beta:**
- Direct outreach to buyers under contract (real estate communities, forums)
- Agent referrals (agents share the product with their buyers)
- Content marketing (escrow explainers, closing guides)

**Not in v1 scope:**
- Paid advertising
- Marketplace/referral marketplace
- Zillow/Redfin integration
- Full SEO content strategy

---

## 18. Legal & Compliance

### 18.1 Disclaimers

**Global footer (persistent):**
> "This app provides educational guidance only. We don't provide legal, financial, or brokerage services."

**AI copilot disclaimer (shown on first use and accessible via info icon):**
> "HomeBuyer Pro's AI assistant explains documents and surfaces information from your deal. It does not provide legal, financial, or real estate advice. Always consult your attorney, lender, or agent before making decisions."

### 18.2 AI-Specific Compliance Guardrails

- The AI must never present analysis as advice
- The AI must cite its source (document name, section) for any factual claim
- The AI must disclose when information is incomplete or uncertain
- The AI must not recommend specific lenders, agents, or service providers
- All AI outputs must be reviewable and correctable by the user
- No AI-generated content should be mistaken for a legal document or contractual commitment

### 18.3 Regulatory Awareness

**Relevant regulations (awareness, not full compliance claim in v1):**
- RESPA (Real Estate Settlement Procedures Act)
- TILA (Truth in Lending Act)
- ECOA (Equal Credit Opportunity Act)
- Fair Housing Act
- State-specific disclosure requirements

### 18.4 Data Privacy

- CCPA compliance (California users)
- Data encryption at rest and in transit
- Document storage with access controls
- User data export and deletion capability
- No sharing of user data with third parties without explicit consent

---

## 19. 90-Day Success Definition

*[Aligned directly with MVP Overlay Section 12.]*

At 90 days, v1 is successful if:

1. **Real usage:** Buyers under contract are uploading real documents and returning multiple times during live transactions.
2. **Core value sticks:** The document explanation + LE/CD comparison + cash-to-close workflow cluster feels painful to lose.
3. **User signal:** Users say some version of:
   - "I finally understood what was happening."
   - "This kept me organized."
   - "I caught something I would have missed."
4. **Repeated engagement:** Deadline checks, document uploads, and AI questions show repeated usage across active deals.
5. **Collaboration signal:** At least one collaborator proactively uses the secure upload link without heavy instruction.
6. **Expansion signal:** The team has clear data on the next growth path:
   - Backward into offer prep (v1.5)
   - Outward into B2B2C collaboration (v2)
   - Forward into post-close retention (v2+)

### Key Metrics (v1)

| Metric | Target | Measures |
|--------|--------|----------|
| Documents uploaded per deal | 5+ | Workspace adoption |
| Return visits during active deal | 3+ per week | Ongoing value |
| AI copilot questions per deal | 10+ | Comprehension layer value |
| LE/CD comparison usage | 80%+ of deals with LE | Financing clarity value |
| Deadline check frequency | Daily during active escrow | Tracking layer value |
| Collaborator link usage | 1+ per deal | Collaboration viability |
| Deal completion rate | Track (no target yet) | End-to-end value |

---

## 20. Competitive Positioning

### 20.1 Key Competitors

| Competitor | Strength | Gap HomeBuyer Pro fills |
|------------|----------|----------------------|
| Redfin/Zillow | Property search, market data | No escrow/closing support |
| Better.com / Rocket Mortgage | Loan origination | Lender-centric, not buyer-centric; no deal management |
| Realtor.com / Homes.com | Agent matching | No transaction management |
| Qualia / Snapclose | Title/escrow workflow | Built for professionals, not buyers |

### 20.2 v1 Differentiators

- **Buyer-first escrow clarity** — no existing product gives the buyer a unified deal workspace during escrow
- **AI document intelligence** — plain-English explanations grounded in the buyer's actual documents
- **LE vs CD variance review** — automated comparison that surfaces what changed and whether it matters
- **Deal-context copilot** — not a generic chatbot; answers are grounded in the specific deal
- **Deadline and risk tracking** — contingencies, deadlines, and open issues in one view

---

## 21. Development Guidelines

*[v1 — Retained from v1.0 with minor alignment.]*

### 21.1 Code Standards

**File Naming:**
- PascalCase for components: `LoanEstimateCard.tsx`
- camelCase for utilities: `calculateMonthlyPayment.ts`
- kebab-case for CSS modules: `loan-card.module.css`

**Component Structure:**
```typescript
// 1. Imports (external, then internal)
// 2. Type/Interface definitions
// 3. Constants
// 4. Component function
// 5. Subcomponents (if any)
// 6. Export
```

**Styling:** Tailwind utility classes preferred. Inline styles for dynamic values only. Reference semantic color tokens (Background, Surface, Primary Accent, etc.) rather than raw hex values in component code.

**State Management:** See Section 5.1.1 for the full state architecture. In short: TanStack Query for server state, Zustand for client/UI state, React Hook Form for form state. Component-level useState is appropriate only for truly local, ephemeral UI concerns (toggle visibility, hover state). Do not use useState for deal data, document metadata, or anything that should survive a component unmount.

### 21.2 Git Workflow

**Branch Strategy:**
- `main` — production-ready code
- `develop` — integration branch
- `feature/*` — new features
- `bugfix/*` — bug fixes
- `hotfix/*` — urgent production fixes

**Commit Messages:**
```
feat: Add contingency countdown component
fix: Resolve LE comparison rounding error
refactor: Extract deadline computation logic
docs: Update product spec to v1.1
```

---

## 22. Deployment & Infrastructure

### 22.1 v1 Target Architecture

**Frontend:**
- Vercel or Netlify hosting
- CDN distribution
- Auto-deployment from Git

**Backend:**
- Supabase (PostgreSQL + Storage + Auth + Edge Functions)
- Document storage in Storage buckets
- Row-level security for deal isolation
- Edge functions for AI orchestration

**AI Layer:**
- LLM integration for document classification, summarization, and copilot
- Document field extraction pipeline
- Context assembly engine (pulls deal state, documents, deadlines into prompt context)
- Citation and grounding validation

### 22.2 Deferred Infrastructure
- MLS data feeds
- Zillow/Redfin APIs
- Mortgage rate APIs
- Insurance quote APIs
- E-signature integration
- County recorder APIs
- Native mobile app infrastructure

---

## 23. Technical Debt & Known Limitations

### 23.1 Current Limitations (Prototype)

- All data is static/hardcoded (mock data)
- No persistence between sessions
- No user authentication
- No real-time updates
- Client-side only validation
- No code splitting or lazy loading
- Some components lack ARIA labels

### 23.2 v1 Build Priorities (Addressing Debt)

| Priority | Item |
|----------|------|
| P0 | User authentication (Supabase Auth) |
| P0 | Deal data persistence |
| P0 | Document storage and retrieval |
| P0 | AI document processing pipeline |
| P1 | Field extraction from LE/CD |
| P1 | Deadline computation engine |
| P1 | Collaborator upload link |
| P2 | Code splitting and performance |
| P2 | Full accessibility audit |

---

## 24. Glossary of Real Estate Terms

*[v1 — Retained from v1.0. These terms are directly relevant to the escrow-to-close experience.]*

**APR (Annual Percentage Rate):** True cost of borrowing including interest and fees
**Contingency:** Condition that must be met for transaction to proceed
**EMD (Earnest Money Deposit):** Good faith deposit from buyer
**Escrow:** Neutral third party holding funds and documents
**Loan Estimate (LE):** 3-page disclosure of loan terms and costs
**Closing Disclosure (CD):** Final settlement statement
**PMI (Private Mortgage Insurance):** Required for <20% down payment
**Points:** Upfront fee to reduce interest rate (1 point = 1% of loan)
**Title Insurance:** Protects against ownership defects
**Underwriting:** Lender's risk assessment process
**Clear to Close:** Lender confirmation that all conditions are met and the loan is approved
**Proration:** Division of property expenses (taxes, HOA) between buyer and seller at closing
**Impounds:** Lender-held escrow account for taxes and insurance payments
**Binder:** Proof of insurance coverage provided to the lender before closing

---

## 25. Change Log

### Version 1.1 (Current — Aligned to MVP Overlay)

**Scope changes from v1.0:**
- Rewrote Executive Summary to reflect escrow-to-close focus (removed "entire home buying journey" framing)
- Added Scope & Version Map (Section 2) — every feature tagged v1 / v1.5 / deferred
- Added Product Identity, Primary User, Launch Motion, and Collaboration Model (Section 3)
- Added Emotional Identity Requirements (Section 7)
- Significantly expanded AI Copilot spec (Section 8) — behavior, constraints, grounding, boundaries, response quality
- Rewrote Phase-by-Phase: Escrow + Closing are primary v1; Shopping deferred; Offer deferred as workflow (data capture in setup); Post-Close deferred
- Added Deal Workspace Setup as v1 entry point (replaces Shopping/Offer onboarding)
- Trimmed Financing View: LE comparison, LE vs CD, cash-to-close are v1; Loan Type Helper deferred to v1.5
- Added LE vs CD Variance Panel and AI Document Actions as new v1 features
- Insurance View downgraded to v1.5 (thin binding flow only in v1, scoped within Escrow dashboard)
- Homes View deferred entirely
- Rewrote User Flows to reflect escrow-to-close journey
- Added 90-Day Success Definition with specific metrics (Section 19)
- Rewrote Business Model: free during beta, B2C-first/B2B2C-ready, deferred marketplace/enterprise
- Rewrote Competitive Positioning for escrow-to-close focus
- Updated Deployment section with AI layer architecture
- Removed or deferred: shopping components, offer strategy tools, post-close dashboard, full insurance product, marketplace features, equity tracker, refi watch, ADU planner, maintenance planner, property tax tools

**v1.1 refinements (post-review):**
- Replaced Wheat/Bronze/Mint color palette with premium restrained warm palette — new tokens: Background (#F7F4EE), Surface (#FFFDFC), Surface Alt (#F1ECE3), Primary Text (#2A2723), Secondary Text (#6F685F), Border (#DDD4C7), Primary Accent (#8C5A3C), Accent Hover (#72472F), Success (#617A5D), Warning (#C08A3C), Destructive (#B85243)
- Added palette usage notes and contrast ratio documentation
- Updated Design Philosophy to match restrained premium aesthetic
- Added State Architecture section (5.1.1) — TanStack Query for server state, Zustand for client state, React Hook Form for form state, server-side AI context assembly
- Tightened Offer phase language: "Offer data capture exists in v1 only as setup input. Offer workflows remain out of scope."
- Tightened Insurance Binding scope: binder upload + status tracking in Escrow dashboard (v1); full Insurance View with quotes/comparison is v1.5
- Added semibold (600) font weight for key financial figures
- Reduced default border radius from 12px to 8px for cards/inputs to match restrained aesthetic

### Version 1.0 (Prototype)
- Original broad-scope product specification covering Shopping through Post-Close
- 45+ custom components across 5 phases
- Full-width views for Documents, Financing, Insurance, Homes
- Complete design system and UI primitive library

---

## 26. Document Relationship

This spec exists alongside two other governing documents:

| Document | Purpose | Authority |
|----------|---------|-----------|
| **MVP Scope Overlay v1.0** | Decision layer — what to build, what not to build, what's in/out | Highest. If conflict, overlay wins. |
| **Product Spec v1.1** (this document) | Product reference — aligned to overlay decisions | Detailed reference for product, design, and engineering. |
| **Build Plan** (forthcoming) | Execution doc — sprint breakdown, task order, dependencies | Derived from overlay + this spec. |

---

## Appendix A: v1.0 Archive Reference

The following v1.0 sections are preserved as long-term product vision but are **not v1 build scope**. They are retained in the v1.0 spec document for future reference.

- Section 5.1: Shopping Phase (full component spec)
- Section 5.2: Offer Phase (full component spec)
- Section 5.5: Post-Close Phase (full component spec)
- Section 6.1: Homes View (full spec)
- Section 6.4: Insurance View (full spec)
- Section 7.4: Smart Comparisons (properties, insurance quotes, contractor bids)
- Section 10: Future Enhancements (marketplace, mobile app, enterprise licensing, advanced analytics)
- Section 17: Full business model with referral fees, enterprise licensing, data insights

---

## Appendix B: Color Reference Card

```
Background:      #F7F4EE  rgb(247, 244, 238)  Page background
Surface:         #FFFDFC  rgb(255, 253, 252)  Cards, elevated panels
Surface Alt:     #F1ECE3  rgb(241, 236, 227)  Sidebar, recessed areas
Primary Text:    #2A2723  rgb(42, 39, 35)     Headings, body text
Secondary Text:  #6F685F  rgb(111, 104, 95)   Muted text, captions
Border:          #DDD4C7  rgb(221, 212, 199)  Borders, dividers
Primary Accent:  #8C5A3C  rgb(140, 90, 60)    CTAs, links, active states
Accent Hover:    #72472F  rgb(114, 71, 47)    Hover/pressed accent
Success:         #617A5D  rgb(97, 122, 93)    Completed, on-track
Warning:         #C08A3C  rgb(192, 138, 60)   Approaching deadlines
Destructive:     #B85243  rgb(184, 82, 67)    Overdue, critical alerts
```

## Appendix C: Icon Mapping

```
Shopping:      Search
Offer:         FilePen
Escrow:        ShieldCheck
Closing:       Key
Post-Close:    LineChart

Dashboard:     LayoutDashboard
Documents:     FileText
Financing:     CreditCard

AI Copilot:    MessageCircle
Upload:        Upload
Compare:       GitCompare
Alert:         AlertTriangle
Success:       CheckCircle
Warning:       Clock
```

## Appendix D: Animation Duration Guide

```
Quick interactions:  150-200ms
Standard transitions: 300ms
Panel slides:        400-500ms
Page transitions:    300-400ms
Hover effects:       200ms
Toast notifications: 3000ms (auto-dismiss)
```

---

## Document Information

**Document Version:** 1.1
**Last Updated:** April 4, 2026
**Aligned To:** MVP Scope Overlay v1.0
**Purpose:** Product reference document for HomeBuyer Pro v1 — escrow-to-close buyer deal workspace
**Audience:** Product managers, developers, designers, stakeholders
**Scope Authority:** MVP Scope Overlay v1.0 governs. Where this spec and the overlay conflict, the overlay wins.

---

*End of Product Specification Document v1.1*
