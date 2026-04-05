# HomeBuyer Pro — Product Specification
## Version 1.2
### Aligned to MVP Scope Overlay v2.0 — Broad Surface, Narrow Core

---

## 1. Executive Summary

**Product Name:** HomeBuyer Pro
**Product Type:** Web Application (Next.js)
**Target Audience:** Homebuyers in the United States, from serious shopping through close
**Primary Goal:** Give buyers clarity, organization, and confidence across the homebuying journey — with deepest value in escrow, closing, documents, financing, and AI-powered deal intelligence

**Core Value Proposition:**
HomeBuyer Pro v1 is a buyer-first homebuying workspace that helps people move from serious shopping to keys in hand. The product feels complete across the journey but earns its reputation in the escrow-to-close window — where documents arrive fast, deadlines run, financial numbers change, and the buyer is least informed.

The product organizes the journey, explains the deal, keeps the buyer on track, and helps them avoid expensive mistakes.

**Core Promise:**
*From serious shopping to keys in hand, you'll always know where you are, what's due, and what everything means.*

**Product strategy: Broad Surface, Narrow Core**
- Shopping and Offer exist as light but real product surfaces (acquisition, context building, deal setup)
- Escrow, Closing, Documents, Financing, and AI Copilot are built deep (core moat, primary value proof)
- Post-Close exists as thin continuity (completion, archive, future value signal)

**What v1 is:**
- A buyer-facing workspace spanning the homebuying journey
- A document intelligence layer
- A financing clarity layer (LE comparison, LE vs CD, cash-to-close)
- A deadline and contingency tracking layer
- A deal-context AI copilot that adapts depth to the buyer's current phase

**What v1 is not:**
- A home search portal or Zillow replacement
- An agent replacement
- A contract drafting tool or offer strategy engine
- A full post-close homeowner management platform
- A brokerage admin product or marketplace

> **Governing scope rule:** The MVP Scope Overlay v2.0 is the authoritative scope document. Where this spec and the overlay conflict, the overlay wins.

---

## 2. Scope & Version Map

Every feature in this spec is tagged with one of four build tiers. This map governs priority and implementation depth.

### Build Deep — Core moat
Full implementation. This is where the product proves its value and builds defensibility.

| Area | What ships |
|------|-----------|
| Escrow & due diligence dashboard | Full component set (Section 9.4) |
| Closing dashboard | Full component set (Section 9.5) |
| Document ingestion + AI intelligence | Upload, classify, organize, summarize, extract key fields, AI explanation |
| Loan Estimate comparison | Side-by-side LE analysis |
| LE vs CD variance review | Highlight changes, flag what's abnormal, AI narrative |
| Cash-to-close engine | Live calculation updated as documents arrive |
| Contingency / deadline tracker | Earnest money, inspection, appraisal, financing, disclosure deadlines |
| Alerts and urgency states | Color-coded, prioritized, deadline-driven |
| Inspection red-flag summary | AI-powered major findings flagging |
| Title / escrow red-flag summary | Liens, easements, delays |
| Repairs / credits tracker | Item list, negotiation status, dollar impact |
| Wire fraud warning flow | Verbal verification, fraud prevention checklist |
| AI Copilot (Escrow/Closing) | Deal-context grounded, document-aware, action-oriented |

### Build Light — Real but limited
Functional product surface. The user gets value; the team doesn't over-invest.

| Area | What ships |
|------|-----------|
| Shopping phase | Saved/tracked homes, affordability context, pre-approval card, deal creation handoff |
| Offer phase | Offer details workspace, contingency setup, offer checklist, pre-approval upload |
| Homes view | Simple property tracking (manual entry, basic details, link to create deal) |
| Insurance binding | Binder upload + status tracking; no quote comparison |
| Collaborator file intake | Secure upload link, inbound-only; no collaborator dashboard |
| Glossary / educational support | Contextual term explanations inline; no standalone center |
| Funding / recording timeline | Basic multi-step tracker; no API integrations |
| Notifications | In-app urgency indicators; no email/SMS/push |
| AI Copilot (Shopping/Offer) | General education + readiness guidance; lighter grounding |
| Secure collaborator upload link | Lightweight link for agent/lender to send files |

### Thin Continuity — Visible, minimal
Gives the product completeness and signals future value. Minimal implementation cost.

| Area | What ships |
|------|-----------|
| Post-Close phase | Celebration screen, deal summary, document archive/export, first-30-days checklist, "homeowner tools coming soon" |

### Defer — Not in v1
Does not appear in the product UI. Part of the long-term vision.

| Area | Status |
|------|--------|
| RPA / contract drafting | Defer |
| Offer strength analyzer | Defer |
| Counteroffer simulator | Defer |
| Full insurance comparison product | Defer |
| Full loan-type recommendation wizard | Defer |
| Realtor dashboard / brokerage admin | Defer |
| Marketplace / referral features | Defer |
| Post-close deep tools (equity tracker, refi watch, ADU planner, maintenance, property tax) | Defer |
| MLS search infrastructure | Defer |
| Multi-user collaboration system | Defer |
| E-signature integration | Defer |
| Mobile native app | Defer |

---

## 3. Product Identity & Primary User

### 3.1 Product Identity

HomeBuyer Pro v1 is a **buyer-first homebuying workspace** that helps people move from serious shopping to close.

It covers the full buyer journey but builds its moat in escrow, closing, documents, financing, and AI-powered deal intelligence.

Its job:
1. **Organize the journey** — properties, documents, deadlines, financials in one workspace
2. **Explain the deal** — AI-powered plain-English summaries of every document and number
3. **Keep the buyer on track** — contingencies, deadlines, open risks, next steps
4. **Help the buyer avoid expensive mistakes** — red flags, variance detection, fraud prevention

### 3.2 Primary User

The v1 user can enter the product at two points:

**Serious shopper (earlier entry):**
- Actively looking at homes, wants to track properties and understand affordability
- May or may not have a pre-approval
- Builds context in Shopping, transitions through Offer, deepens in Escrow/Closing

**Buyer under contract (mid-journey entry):**
- Already has an accepted offer, entering escrow
- Needs document intelligence, deadline tracking, and financial clarity immediately
- Enters at Escrow and gets full value from day one

Both users are first-time or second-time buyers working with an agent and lender, but lacking a personal comprehension layer for the transaction.

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

*[v1.2 — Palette restored to Wheat/Bronze/Mint with updated token structure. This palette balances warmth and approachability with the seriousness of a financial product.]*

### 4.1 Color Palette

**Palette identity:** Warm, stress-reducing, and guided. Apple/Airbnb-inspired clarity with a calming color palette that builds trust across a high-stakes journey.

#### Core Brand Colors

| Token | Hex Code | Usage |
|-------|----------|-------|
| **Background** | `#F5DEB3` (Wheat) | Main canvas background |
| **Foreground** | `#2D3748` (Charcoal) | Primary text and headings |
| **Muted Foreground** | `#767676` (Gray) | Secondary/muted text, captions, timestamps |
| **Accent** | `#D38E45` (Bronze) | Primary CTA buttons, active states, interactive elements |
| **Accent Foreground** | `#FFFFFF` (White) | Text on bronze buttons |
| **Primary** | `#6EE7B7` (Mint Green) | Completed steps, progress indicators, positive states |
| **Primary Foreground** | `#2D3748` (Charcoal) | Text on mint green backgrounds |
| **Success** | `#10B981` (Green) | Success messages and confirmation states |
| **Card** | `#FFFFFF` (White) | Main card backgrounds, elevated panels |
| **Secondary** | `#FEFCF8` (Off-white) | Sidebar, alternative surfaces, full-width view backgrounds |
| **Border** | `#E8DBBF` (Light tan) | Card borders, dividers, input outlines |
| **Destructive** | `#E53E3E` (Red) | Urgent alerts, critical deadlines, errors |
| **Warning** | `#F59E0B` (Orange) | Warning states, approaching deadlines |

#### Chart Colors

| Token | Hex Code | Usage |
|-------|----------|-------|
| **Chart 1** | `#D38E45` (Bronze) | Primary chart color |
| **Chart 2** | `#6EE7B7` (Mint Green) | Secondary chart color |
| **Chart 3** | `#E8B84E` (Gold) | Tertiary chart color |
| **Chart 4** | `#767676` (Gray) | Neutral chart color |
| **Chart 5** | `#E53E3E` (Red) | Alert chart color |

#### Palette Usage Notes

- **Backgrounds are layered.** Wheat (#F5DEB3) for the page canvas, White (#FFFFFF) for cards and panels, Off-white (#FEFCF8) for sidebar and recessed areas. This creates depth without heavy shadows.
- **Bronze is the action color.** Accent (#D38E45) is reserved for CTAs, active navigation, and the most important interactive element on screen. It should never compete with itself.
- **Mint green signals progress.** Primary (#6EE7B7) is for completed steps, progress bars, and positive states. It is not used for CTAs.
- **Status colors are clear.** Success (#10B981) for confirmations, Warning (#F59E0B) for approaching deadlines, Destructive (#E53E3E) for critical alerts. These are intentionally vivid to stand out against the warm canvas.
- **Text contrast.** Foreground (#2D3748) on Background (#F5DEB3) meets WCAG AA. Muted Foreground (#767676) should only be used on White or Off-white surfaces for adequate contrast.

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
- **Border Radius:** 0.75rem (12px) standard, rounded corners throughout.
- **Card Shadows:** Subtle shadows (`shadow-sm`) with elevation on hover. Border (#E8DBBF) used for card boundaries.
- **Max Content Width:** 1120px for full-width views, 1536px (6xl) for dashboard
- **Padding:** 32px (8 units) standard for page padding

### 4.4 Design Philosophy
- **Minimalist:** Clean, uncluttered interfaces with generous whitespace. Apple/Airbnb-inspired clarity.
- **Stress-reducing:** Calming color palette, gentle animations, clear hierarchy. The product handles high-stakes decisions — it should feel like a trusted guide, not add to the stress.
- **Warm and approachable:** The Wheat/Bronze palette feels inviting without being casual. It avoids the coldness of a banking app while communicating seriousness about the buyer's financial journey.
- **Responsive:** Mobile-first design with breakpoints at sm/md/lg/xl
- **Accessible:** High contrast ratios, semantic HTML, keyboard navigation support. Foreground on Background meets WCAG AA.

---

## 5. Technical Architecture

### 5.1 Technology Stack

- **Framework:** Next.js 15 (App Router) with TypeScript
- **Deployment:** Vercel
- **Backend:** Supabase (Postgres, Auth, Storage, RLS) + Next.js API routes for server logic
- **AI:** OpenAI GPT-4o (extraction, classification, summarization, copilot)
- **PDF Parsing:** `pdf-parse` for digital PDFs, GPT-4o Vision fallback for scanned/image docs
- **Styling:** Tailwind CSS v4.0
- **Icons:** Lucide React
- **Animation:** Motion (formerly Framer Motion) via `motion/react`
- **Charts:** Recharts library
- **Form Management:** React Hook Form
- **UI Components:** Custom component library with shadcn/ui patterns

### 5.1.1 State Architecture

*[v1.2 — the product complexity requires a deliberate split between client state and server state.]*

The v1 product manages deal state, document metadata, extracted fields, deadline computations, financing comparisons, collaborator uploads, AI context assembly, and UI state. This requires a deliberate split between client state and server state.

**Recommended approach:**

| Layer | Tool | Scope |
|-------|------|-------|
| **Server state** | TanStack Query (React Query) | Saved homes, deal data, offer details, documents, deadlines, loan estimates, collaborator uploads, copilot messages — anything persisted in Supabase |
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
├── app/
│   ├── layout.tsx              (Root layout: sidebar, stepper, copilot shell)
│   ├── page.tsx                (Landing / marketing)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/                  (Authenticated app shell)
│   │   ├── layout.tsx          (App layout: sidebar + stepper + copilot)
│   │   ├── dashboard/page.tsx  (Phase-aware dashboard)
│   │   ├── homes/page.tsx      (Saved homes list — Shopping surface)
│   │   ├── documents/page.tsx  (Documents view — Build Deep)
│   │   ├── financing/page.tsx  (Financing view — Build Deep)
│   │   └── insurance/page.tsx  (Insurance binding — Build Light)
│   └── api/
│       ├── documents/
│       │   └── process/route.ts  (PDF extraction + classification)
│       ├── copilot/
│       │   └── chat/route.ts     (Context assembly + OpenAI)
│       ├── deals/route.ts
│       └── collaborate/
│           └── [token]/route.ts  (Public collaborator upload)
├── components/
│   ├── shopping/           (Saved homes, affordability, pre-approval)
│   ├── offer/              (Offer workspace, checklist, contingency setup)
│   ├── deal/               (Deal workspace, phase map, deal setup)
│   ├── documents/          (Document upload, classification, viewer)
│   ├── financing/          (LE comparison, LE vs CD, cash-to-close)
│   ├── escrow/             (Contingency tracker, deadlines, due diligence)
│   ├── closing/            (CD review, wire safety, funding timeline)
│   ├── post-close/         (Completion, archive, first-30-days)
│   ├── copilot/            (AI copilot panel, context engine)
│   ├── collaboration/      (Secure upload link, file intake)
│   └── ui/                 (shadcn/ui primitives)
├── lib/
│   ├── supabase/           (Client + server Supabase helpers)
│   ├── ai/                 (OpenAI prompts, extraction schemas, context builder)
│   ├── store.ts            (Zustand UI state)
│   └── utils.ts            (cn function, formatters, date helpers)
└── styles/
    └── globals.css
```

### 5.3 Core Data Models (v1)

#### SavedHome Model (Shopping — Build Light)
```typescript
interface SavedHome {
  id: string;
  userId: string;
  address: string;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: string;
  notes?: string;
  imageUrl?: string;
  status?: "interested" | "toured" | "offer-pending" | "removed";
  createdAt: string;
}
```

#### Deal Model
```typescript
interface Deal {
  id: string;
  userId: string;
  savedHomeId?: string;
  propertyAddress: string;
  purchasePrice: number;
  contractAcceptanceDate?: string;
  closingDate?: string;
  earnestMoney?: number;
  agentName?: string;
  agentContact?: string;
  currentPhase: "shopping" | "offer" | "escrow" | "closing" | "post-close";
  createdAt: string;
  updatedAt: string;
}
```

#### OfferDetails Model (Offer — Build Light)
```typescript
interface OfferDetails {
  id: string;
  dealId: string;
  offerPrice: number;
  earnestMoney: number;
  closingDate: string;
  contingencyInspectionDays?: number;
  contingencyAppraisalDays?: number;
  contingencyFinancingDays?: number;
  contingencyDisclosureDays?: number;
  preApprovalDocId?: string;
  proofOfFundsDocId?: string;
  checklistItems: Record<string, boolean>;
  status: "draft" | "submitted" | "accepted" | "rejected" | "countered";
  createdAt: string;
}
```

#### Loan Estimate Model
```typescript
interface LoanEstimate {
  id: string;
  dealId: string;
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
  pdfDocumentId?: string;
  createdAt: string;
}
```

#### Document Model
```typescript
interface Document {
  id: string;
  dealId: string;
  name: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  docType: string;
  category: string;
  stage: string;
  status: "required" | "missing" | "uploaded" | "signed" | "acknowledged" | "final" | "read-only";
  version?: string;
  extractedText?: string;
  extractedFields?: Record<string, any>;
  aiSummary?: string;
  confidenceScore?: number;
  sourceType: "buyer-upload" | "collaborator-upload" | "system-generated";
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
}
```

#### Collaborator Link Model
```typescript
interface CollaboratorLink {
  id: string;
  dealId: string;
  recipientRole: "agent" | "lender" | "escrow" | "title" | "inspector" | "other";
  recipientEmail?: string;
  linkToken: string;
  requestedDocuments?: string[];
  expiresAt: string;
  status: "active" | "expired" | "revoked";
  uploadsReceived: number;
  createdAt: string;
}
```

#### CopilotMessage Model
```typescript
interface CopilotMessage {
  id: string;
  dealId: string;
  role: "user" | "assistant";
  content: string;
  citations?: { documentName: string; page?: number; section?: string }[];
  phase: "shopping" | "offer" | "escrow" | "closing" | "post-close";
  createdAt: string;
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
- MLS/search infrastructure or property data APIs
- Full marketplace integrations
- Deep brokerage tooling
- Deep post-close analytics (equity tracking, refi monitoring)
- Broad API integrations (Zillow, Redfin, county recorder)
- Contract generation or e-signature

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
  - Completed steps: Primary (#6EE7B7 Mint Green) fill with checkmark
  - Current step: Primary (#6EE7B7 Mint Green) fill with icon
  - Future steps: Muted Foreground (#767676) with icon
- **v1 Active Experience:** All five phases are interactive. Shopping and Offer are light. Escrow and Closing are deep. Post-Close is thin continuity.

#### Left Sidebar Navigation (v1)
- **Component:** `Sidebar.tsx`
- **Width:** 256px (64 units)
- **Background:** Secondary (#FEFCF8 Off-white)
- **v1 Navigation Items:**
  1. Dashboard (LayoutDashboard icon) — **Build Deep** — Phase-aware: renders Shopping, Offer, Escrow, Closing, or Post-Close dashboard based on `deal.currentPhase`
  2. Homes (Home icon) — **Build Light** — Saved/tracked homes list. Always accessible. Functions as the persistent Shopping surface even after a deal is created.
  3. Documents (FileText icon) — **Build Deep** — Available once a deal exists (Offer phase or later)
  4. Financing (CreditCard icon) — **Build Deep** — Available once a deal exists (Escrow phase or later)
  5. Insurance (Shield icon) — **Build Light** — Thin binding flow, available in Escrow/Closing
- **Active State:** Accent (#D38E45 Bronze) text/icon with Card (#FFFFFF) background, subtle shadow
- **Contextual visibility:** Documents, Financing, and Insurance appear grayed/locked until the buyer has a deal in the appropriate phase. Homes and Dashboard are always accessible.

**Information architecture note:** The Dashboard is the phase-aware hub — it shows the right content for where the buyer is. Homes is a persistent sidebar destination for property tracking that lives outside any specific deal. When the buyer has no deal yet, Dashboard renders the Shopping dashboard (which includes a Homes summary widget). Once a deal is created, Dashboard renders the active phase dashboard. Homes remains accessible for tracking additional properties or starting new deals.

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

### 8.7 Phase-Aware AI Depth

The copilot adapts its behavior to the buyer's current phase:

| Phase | AI Mode | Grounding Level |
|-------|---------|-----------------|
| Shopping | General education | Light — readiness questions, term explanations, affordability guidance. Less deal-specific context available. |
| Offer | Offer-context guidance | Medium — explains contingencies, EMD norms, timelines. Helps buyer understand commitments. |
| **Escrow** | **Full deal-context** | **Deep — grounded in uploaded documents, extracted fields, deadlines, open issues. Specific, actionable.** |
| **Closing** | **Full deal-context** | **Deep — same depth as Escrow. CD comparison, wire safety, signing prep.** |
| Post-Close | Light completion | Light — deal summary, next steps for new homeowners. |

### 8.8 AI-Powered Workflows (v1)

These are the specific AI-driven features that ship in v1:

**Deep (Escrow/Closing):**
1. **Document classification** — Auto-categorize uploaded files by type (LE, CD, inspection, disclosure, etc.)
2. **Document summarization** — Generate a plain-English summary of any uploaded document
3. **Field extraction** — Pull structured data from Loan Estimates, Closing Disclosures, inspection reports
4. **LE comparison narrative** — Explain differences between multiple Loan Estimates in plain English
5. **LE vs CD variance narrative** — Explain what changed, whether it's normal, and whether it needs attention
6. **Red flag identification** — Surface potential issues from inspection reports, title searches, appraisals
7. **Deadline context** — Explain what each deadline means, what happens if missed, and what the buyer should do
8. **Question drafting** — Generate smart questions for the buyer to ask their agent, lender, or escrow officer
9. **Deal status summary** — On-demand summary of where the deal stands across all tracked dimensions

**Light (Shopping/Offer):**
10. **Readiness guidance** — Answer homebuying readiness questions, explain terms, estimate affordability ranges
11. **Offer education** — Explain contingency types, EMD norms, what to expect in each phase ahead

---

## 9. Phase-by-Phase Feature Breakdown

### Phase Treatment Summary

| Phase | Build Tier | Role in v1 |
|-------|-----------|------------|
| Shopping | Build Light | Acquisition surface, context building, deal creation handoff |
| Offer | Build Light | Offer workspace, contingency/EMD setup, checklist, pre-approval upload |
| **Escrow** | **Build Deep** | **Primary deep experience — document intelligence, deadlines, due diligence** |
| **Closing** | **Build Deep** | **Primary deep experience — CD review, wire safety, funding** |
| Post-Close | Thin Continuity | Completion summary, document archive, future value signal |

---

### 9.1 SHOPPING PHASE — [Build Light]

#### Overview
The product's front door for early-stage buyers. The Shopping phase gives buyers a place to track homes they're interested in, understand basic affordability, and organize their readiness before making an offer. It is real and functional, but it is not a deep search or analytics product.

#### Dashboard Layout
```
┌──────────────────────────────────────┐
│  Pre-Approval Status Card            │
├──────────────────┬───────────────────┤
│  Saved Homes     │  Affordability    │
│  List            │  Snapshot         │
├──────────────────┴───────────────────┤
│  "Ready to make an offer?" CTA       │
└──────────────────────────────────────┘
```

#### Components

**1. Saved Homes List** (`SavedHomesList.tsx`) — Build Light
- Manual entry: address, price, beds/baths/sqft, notes, photo (optional)
- Simple card or list layout
- Quick actions: Edit, Remove, "Make an offer on this home" (transitions to Offer)
- No MLS integration, no Zillow/Redfin import, no neighborhood analytics

**2. Affordability Snapshot** (`AffordabilitySnapshot.tsx`) — Build Light
- Simple cash-to-close estimator (purchase price, down payment %, estimated closing costs)
- Monthly payment estimate (P&I from basic rate assumption)
- Not a full calculator product — lightweight orientation tool

**3. Pre-Approval Status Card** (`PreApprovalCard.tsx`) — Build Light
- Upload pre-approval letter (PDF)
- Display: lender name, approved amount, expiration date
- Status: "Pre-approved" / "Not yet" / "Expired"

**4. Shopping Alerts** — Build Light
- Pre-approval expiration warning
- Basic readiness reminders ("Have you talked to a lender?")

#### Phase Transition
**CTA:** "Ready to make an offer?"
- Transitions to Offer phase
- If a saved home is selected, pre-populates the offer form with property address and price

#### What does NOT ship in Shopping
- MLS search or property import
- Market analytics, neighborhood comps, price trends
- Equity appreciation forecast
- BRBC summary or deep financial planning
- Loan type recommendation wizard
- Offer strength prediction

---

### 9.2 OFFER PHASE — [Build Light]

#### Overview
The Offer phase captures the transition from "interested buyer" to "buyer under contract." It provides a structured workspace for the buyer to organize their offer details and prepare for escrow — without deep contract-building tools.

#### Dashboard Layout
```
┌──────────────────┬───────────────────┐
│  Offer Details    │  Offer Checklist  │
│  Form             │                   │
├──────────────────┼───────────────────┤
│  Contingency     │  Pre-Approval /   │
│  Setup           │  Proof of Funds   │
├──────────────────┴───────────────────┤
│  "Offer Accepted — Move to Escrow"   │
└──────────────────────────────────────┘
```

#### Components

**1. Offer Details Form** (`OfferDetailsForm.tsx`) — Build Light
- Property address (pre-populated from Shopping if applicable)
- Offer price
- Earnest money amount
- Closing date
- Agent name / contact
- Basic notes

**2. Offer Checklist** (`OfferChecklist.tsx`) — Build Light
- Pre-approval letter attached (check)
- Proof of funds uploaded (check)
- Earnest money source identified (check)
- Contingencies defined (check)
- Agent contacted (check)
- Checkbox completion tracking with progress indicator

**3. Contingency Setup** (`ContingencySetup.tsx`) — Build Light
- Define contingency periods: inspection, appraisal, financing, disclosure
- These values feed directly into Escrow deadline computation on phase transition
- Simple date or "days from acceptance" inputs

**4. Pre-Approval / Proof of Funds Upload** (`OfferDocUpload.tsx`) — Build Light
- Upload pre-approval letter and/or proof of funds
- These documents appear in the Documents view once deal enters Escrow

#### Phase Transition
**CTA:** "Offer Accepted — Move to Escrow"
- Creates the full deal workspace
- Generates five-phase progress map (set to Escrow active)
- Computes deadlines from contingency setup
- Generates expected document checklist
- Transitions buyer into the deep Escrow experience

#### What does NOT ship in Offer
- RPA / contract builder
- Offer strength analyzer
- Counteroffer simulator
- Escalation clause builder
- AI negotiation guidance
- Detailed market comp analysis

---

### 9.3 DEAL WORKSPACE CREATION — [v1]

#### Overview
The deal workspace is created when the buyer transitions from Offer to Escrow (or enters directly at Escrow for mid-journey users). It is the persistent container for all deal data.

**Entry path 1 (from Shopping/Offer):** Offer Accepted CTA transitions all collected data into the workspace.

**Entry path 2 (direct to Escrow):** Buyer creates workspace directly by entering property address, contract acceptance date, closing date, price, EMD, and contingency dates.

#### Components
**1. Deal Setup Form** (`DealSetupForm.tsx`) — Build Deep
- Multi-step or single-page form (for direct entry)
- Address input with validation
- Date pickers for key dates
- Auto-compute deadline dates from contract acceptance
- Save and create workspace

**2. Deal Summary Card** (`DealSummaryCard.tsx`) — Build Deep
- Persistent card on dashboard
- Property address, price, key dates
- Days to closing countdown
- Current phase indicator
- Quick-edit capability

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
- Color-coded urgency (Primary/green > Warning/orange > Destructive/red)
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

### 9.6 POST-CLOSE PHASE — [Thin Continuity]

Visible in the product to give completeness and maintain the buyer relationship. Minimal implementation.

#### Components

**1. Completion Celebration** (`CompletionCelebration.tsx`) — Thin Continuity
- Congratulatory screen on recording complete
- Deal snapshot: address, purchase price, closing date, total cash to close
- Emotional payoff for the journey

**2. Deal Archive** (`DealArchive.tsx`) — Thin Continuity
- Download all deal documents (ZIP)
- Deal summary PDF export
- Permanent access to deal workspace in read-only mode

**3. First 30 Days Checklist** (`FirstThirtyDays.tsx`) — Thin Continuity
- Utility transfer reminders
- Address change checklist
- Warranty registration prompts
- Simple checkbox list — not a deep management tool

**4. Future Value Prompt** — Thin Continuity
- "Post-close homeowner tools coming soon" card
- Email capture for launch notification
- Keeps the user connected for future product expansion

#### Deferred from Post-Close (v1.0 archive)
- Equity Value Tracker
- Refi Rate Watch
- Insurance Risk Monitor
- Property Tax Exemptions
- Maintenance Planner
- Renovation & ADU Planner
- Post-Close Alerts

---

## 10. Full-Width Specialized Views

### 10.1 DOCUMENTS VIEW — [v1 Core]

**Component:** `DocumentsView.tsx`
**Access:** Sidebar navigation
**Background:** Secondary (#FEFCF8 Off-white)
**Max Width:** 1120px

#### Architecture
- Compact header (minimal height)
- Search toggle (expandable)
- Upload CTA (Accent/Bronze button)
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
**Background:** Secondary (#FEFCF8 Off-white)
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
- "Add Loan Estimate" CTA (Accent/Bronze button)

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
- Winner indicators (Primary/Mint checkmarks)

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

### 10.4 HOMES VIEW — [Build Light]

**Component:** `HomesView.tsx`
**Access:** Sidebar navigation
**Background:** Secondary (#FEFCF8 Off-white)

Simple property tracking for the Shopping phase. Not a search engine.

**v1 features:**
- List of saved/tracked homes (manual entry)
- Per-home: address, price, beds/baths/sqft, notes, photo (optional)
- Quick actions: Edit, Remove, "Make an offer on this home"
- "Add a home" card
- Link to Shopping dashboard

**Deferred:**
- MLS integration or property import (Zillow, Redfin)
- Owned properties section
- Neighborhood analytics or market data
- Property comparison tools

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

### 14.1 v1 Onboarding Flow — Two Entry Paths

**Path A — Early entry (serious shopper):**
```
1. Landing → Sign Up
2. "I'm shopping for a home" → Shopping dashboard
3. Save homes, explore affordability, upload pre-approval
4. "Ready to make an offer?" → Offer workspace
5. Fill in offer details, contingencies, checklist
6. "Offer Accepted" → Deal workspace created → Escrow dashboard
7. Upload documents, track deadlines, use copilot
```

**Path B — Mid-journey entry (buyer under contract):**
```
1. Landing → Sign Up
2. "I already have an accepted offer" → Deal Setup
3. Enter property address, dates, key details
4. Workspace created → Escrow dashboard
5. Upload first documents (contract, LE)
6. AI classifies and summarizes
7. Copilot introduction: "Ask me anything about your deal"
```

Both paths converge at the Escrow dashboard, where the deep product experience begins.

### 14.2 Full v1 Journey (Shopping → Close)

```
SHOPPING (Days/weeks before offer)
├─ Save homes, track properties
├─ Upload pre-approval letter
├─ Explore affordability
├─ Ask copilot readiness questions
└─ CTA: "Ready to make an offer?"

OFFER (1–3 days)
├─ Enter offer details (price, EMD, contingencies)
├─ Complete offer checklist
├─ Upload proof of funds
├─ Set contingency periods
└─ CTA: "Offer Accepted — Move to Escrow"

ESCROW (Days 1–35)
├─ Week 1: Earnest deposit tracking, initial disclosures
├─ Week 2: Inspections, appraisal ordered
├─ Week 3: Inspection findings, repair negotiations, AI red-flag summaries
├─ Week 4: Loan progress, insurance binding
├─ Week 5+: Final conditions, contingency removals
├─ Throughout: Upload documents → AI classifies, summarizes, explains
├─ Throughout: Check deadlines, ask copilot questions
└─ CTA: "All Contingencies Clear? Proceed to Closing"

CLOSING (Days 35–42)
├─ Day 1–3: Receive CD, 3-day wait, LE vs CD variance review
├─ Day 4: Final walkthrough checklist
├─ Day 5: Wire funds (SafeSend flow), final verifications
├─ Day 6: Signing appointment
├─ Day 7: Funding → Recording → Keys
└─ CTA: "Recording Complete!"

POST-CLOSE
├─ Celebration screen
├─ Deal summary / document archive
├─ First 30 days checklist
└─ "Homeowner tools coming soon"
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
- Direct outreach to active homebuyers (real estate communities, forums, first-time buyer groups)
- Agent referrals (agents share the product with clients at any stage)
- Content marketing across the journey — homebuying checklists, escrow explainers, closing guides, "what to expect" content
- SEO-friendly landing pages for high-intent queries ("what is escrow," "loan estimate vs closing disclosure," "home buying checklist")
- The Shopping surface gives earlier-stage buyers a reason to sign up before they have an accepted offer, widening top of funnel

**Not in v1 scope:**
- Paid advertising
- Marketplace / referral marketplace
- Zillow/Redfin integration or MLS data partnerships

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

*[Aligned with MVP Overlay v2.0 Section 12.]*

At 90 days, v1 is successful if:

1. **Real buyers use the product across multiple phases.** Some enter at Shopping, some at Escrow. Both paths show engagement.
2. **The core cluster feels painful to lose.** Document explanation + LE/CD comparison + cash-to-close + deadline tracking is the indispensable center.
3. **User signal:** Users say some version of:
   - "I finally understood what was happening."
   - "This kept me organized from the start."
   - "I caught something I would have missed."
4. **Repeat usage is real.** Document uploads, deadline checks, AI questions happen repeatedly across active deals — not one-time novelty.
5. **Collaboration works.** At least one collaborator proactively uses the secure upload link without heavy instruction.
6. **Shopping/Offer feel like real onboarding.** Users who start early build context that pays off when they enter escrow. The handoff feels seamless.
7. **Clear expansion signal.** The team has data on what to deepen next: Shopping tools, Offer depth, B2B2C collaboration, or Post-Close retention.

### Key Metrics (v1)

| Metric | Target | Measures |
|--------|--------|----------|
| Documents uploaded per deal | 5+ | Workspace adoption |
| Return visits during active deal | 3+ per week | Ongoing value |
| AI copilot questions per deal | 10+ | Comprehension layer value |
| LE/CD comparison usage | 80%+ of deals with LE | Financing clarity value |
| Deadline check frequency | Daily during active escrow | Tracking layer value |
| Collaborator link usage | 1+ per deal | Collaboration viability |
| Shopping → Escrow conversion | Track (no target yet) | Funnel health |
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

- **Full-journey buyer workspace** — no competitor covers shopping through close from the buyer's perspective
- **AI document intelligence** — plain-English explanations grounded in the buyer's actual documents
- **LE vs CD variance review** — automated comparison that surfaces what changed and whether it matters
- **Deal-context copilot** — not a generic chatbot; answers are grounded in the specific deal and adapt depth to the buyer's phase
- **Deadline and risk tracking** — contingencies, deadlines, and open issues in one view
- **Seamless phase transitions** — context builds from shopping through offer into escrow/closing without re-entering data

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
docs: Update product spec to v1.2
```

---

## 22. Deployment & Infrastructure

### 22.1 v1 Target Architecture

**Frontend + Server:**
- Next.js 15 (App Router) deployed on Vercel
- Server Components for data-heavy pages, Client Components for interactive UI
- API routes (`app/api/`) for document processing, copilot chat, collaborator uploads
- CDN distribution via Vercel Edge Network
- Auto-deployment from Git (preview deployments for PRs)

**Backend:**
- Supabase (PostgreSQL + Storage + Auth + Row-Level Security)
- Document storage in Storage buckets (private, scoped to deal)
- RLS policies ensuring deal isolation by `auth.uid()`

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

*[v1 — Retained from v1.0. These terms are relevant across the homebuying journey, with particular importance during escrow and closing.]*

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

### Version 1.2 (Current — Broad Surface, Narrow Core)

**Strategy shift from v1.1:**
- Replaced "escrow-only" positioning with "Broad Surface, Narrow Core" — the product feels complete across the journey but builds its moat in Escrow/Closing/Documents/Financing/AI
- Shopping phase upgraded from Deferred to Build Light — saved homes, affordability context, pre-approval card, deal creation handoff
- Offer phase upgraded from Deferred to Build Light — offer details workspace, contingency setup, checklist, pre-approval upload
- Post-Close phase upgraded from Deferred to Thin Continuity — celebration, deal archive, first-30-days checklist, future value prompt
- Homes view restored as Build Light (simple property tracking, no MLS)
- New 4-tier build taxonomy: Build Deep / Build Light / Thin Continuity / Defer (replaces v1 / v1.5 / Deferred)
- Product promise broadened: "From serious shopping to keys in hand..."
- Primary user definition now supports two entry paths (serious shopper + buyer under contract)
- AI copilot gains phase-aware depth — lighter in Shopping/Offer, deep in Escrow/Closing
- User flows rewritten to include Shopping → Offer → Escrow → Closing → Post-Close journey
- 90-day success definition broadened to measure cross-phase engagement and funnel health
- Competitive positioning updated to emphasize full-journey coverage as differentiator
- All Build Deep features (Escrow, Closing, Documents, Financing, AI) unchanged from v1.1 — no scope reduction in core
- Palette restored to Wheat/Bronze/Mint (#F5DEB3, #D38E45, #6EE7B7) with updated token structure including chart colors, success (#10B981), warning (#F59E0B), destructive (#E53E3E)
- Design philosophy updated: warm, stress-reducing, Apple/Airbnb-inspired — replacing "premium restrained warm"

### Version 1.1 (Previous — Escrow-to-Close Focus)

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
| **MVP Scope Overlay v2.0** | Decision layer — Broad Surface, Narrow Core. What to build deep, light, thin, or defer. | Highest. If conflict, overlay wins. |
| **Product Spec v1.2** (this document) | Product reference — aligned to overlay decisions | Detailed reference for product, design, and engineering. |
| **Build Plan** | Execution doc — sprint breakdown, task order, dependencies | Derived from overlay + this spec. |

---

## Appendix A: Deferred Feature Archive

The following features are part of the long-term product vision but are **not v1 build scope**. They are preserved for future reference.

- Full Shopping depth: MLS integration, property import, market analytics, neighborhood comps, equity forecast
- Full Offer depth: RPA builder, offer strength analyzer, counteroffer simulator, escalation clauses
- Full Post-Close depth: equity tracker, refi rate watch, insurance risk monitor, maintenance planner, ADU planner, property tax
- Full Insurance depth: quote comparison, coverage education, carrier analysis
- Full Loan Type Helper: 3-step recommendation wizard, personalized loan type algorithm
- Marketplace features: lender matching, agent referrals, service provider directory
- Enterprise: brokerage admin, white-label, multi-user collaboration, e-signature integration
- Mobile native app

---

## Appendix B: Color Reference Card

```
Background:        #F5DEB3  Wheat           Main canvas
Foreground:        #2D3748  Charcoal        Primary text, headings
Muted Foreground:  #767676  Gray            Secondary text, captions
Accent:            #D38E45  Bronze          CTAs, active states
Accent Foreground: #FFFFFF  White           Text on bronze
Primary:           #6EE7B7  Mint Green      Completed steps, progress
Primary Foreground:#2D3748  Charcoal        Text on mint
Success:           #10B981  Green           Success messages
Card:              #FFFFFF  White           Card backgrounds
Secondary:         #FEFCF8  Off-white       Sidebar, alt surfaces
Border:            #E8DBBF  Light tan       Borders, dividers
Destructive:       #E53E3E  Red             Critical alerts, errors
Warning:           #F59E0B  Orange          Warning states

Chart 1:           #D38E45  Bronze
Chart 2:           #6EE7B7  Mint Green
Chart 3:           #E8B84E  Gold
Chart 4:           #767676  Gray
Chart 5:           #E53E3E  Red
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

**Document Version:** 1.2
**Last Updated:** April 5, 2026
**Aligned To:** MVP Scope Overlay v2.0 — Broad Surface, Narrow Core
**Purpose:** Product reference document for HomeBuyer Pro v1 — buyer-first homebuying workspace, serious shopping through close
**Audience:** Product managers, developers, designers, stakeholders
**Scope Authority:** MVP Scope Overlay v2.0 governs. Where this spec and the overlay conflict, the overlay wins.

---

*End of Product Specification Document v1.2*
