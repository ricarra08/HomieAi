# Phazr — State Management Reference
## The single source of truth for how data flows through the app

Reference this file when building any feature in any phase. All hooks, stores, and computed functions follow these patterns.

---

## Three-Layer Model

| Layer | Tool | What lives here | Survives refresh? |
|-------|------|----------------|-------------------|
| **Server state** | TanStack Query | All Supabase-persisted data: saved homes, deals, offer details, documents, deadlines, loan estimates, repair items, insurance info, collaborator links, copilot messages | Yes (re-fetched) |
| **Client state** | Zustand | Ephemeral UI state: sidebar collapsed, copilot open, active nav item, current phase, LE comparison selections, document viewer state | No (resets to defaults) |
| **Form state** | React Hook Form | Scoped to individual forms: deal setup, offer details, LE entry, document upload, home entry | No (cleared on submit/unmount) |

**Computed/derived state** is not stored anywhere. It is calculated on-the-fly from server state using pure functions in `lib/computed.ts`. This follows the deterministic computation rule: if a value can be computed, compute it — don't store it.

---

## State Ownership Map

Every data type maps to exactly one state layer. No exceptions.

| Data | State layer | Query key | Phases that use it |
|------|------------|-----------|-------------------|
| `SavedHome[]` | Server (TQ) | `["saved-homes", userId]` | Shopping |
| `Deal` | Server (TQ) | `["deals", dealId]` | All (after creation) |
| `Deal[]` (user's deals) | Server (TQ) | `["deals", "list", userId]` | Dashboard |
| `OfferDetails` | Server (TQ) | `["offer-details", dealId]` | Offer |
| `Document[]` | Server (TQ) | `["documents", dealId]` | Escrow, Closing, Documents view |
| `Deadline[]` | Server (TQ) | `["deadlines", dealId]` | Escrow, Closing |
| `LoanEstimate[]` | Server (TQ) | `["loan-estimates", dealId]` | Escrow, Financing view |
| `RepairItem[]` | Server (TQ) | `["repair-items", dealId]` | Escrow |
| `InsuranceInfo[]` | Server (TQ) | `["insurance-info", dealId]` | Escrow, Closing |
| `CollaboratorLink[]` | Server (TQ) | `["collaborator-links", dealId]` | Escrow, Closing |
| `CopilotMessage[]` | Server (TQ) | `["copilot-messages", dealId]` | All |
| Sidebar collapsed | Client (Zustand) | — | All |
| Copilot open | Client (Zustand) | — | All |
| Active sidebar item | Client (Zustand) | — | All |
| Current phase | Client (Zustand) | — | All (synced from `deal.current_phase`) |
| Active deal ID | Client (Zustand) | — | All (after deal creation) |
| LE comparison selections | Client (Zustand) | — | Financing view |
| Document viewer state | Client (Zustand) | — | Documents view |
| Cash-to-close | **Computed** | — | Escrow, Closing, Financing |
| Deadline urgency | **Computed** | — | Escrow, Closing |
| LE vs CD variance | **Computed** | — | Closing, Financing |
| Offer readiness % | **Computed** | — | Offer |
| Monthly P&I | **Computed** | — | Financing |

---

## Query Key Convention

All query keys use a factory pattern. Never use ad-hoc string arrays in components.

```typescript
// lib/hooks/query-keys.ts

export const savedHomeKeys = {
  all: (userId: string) => ["saved-homes", userId] as const,
};

export const dealKeys = {
  all: (userId: string) => ["deals", "list", userId] as const,
  detail: (dealId: string) => ["deals", dealId] as const,
};

export const offerKeys = {
  detail: (dealId: string) => ["offer-details", dealId] as const,
};

export const documentKeys = {
  list: (dealId: string) => ["documents", dealId] as const,
};

export const deadlineKeys = {
  list: (dealId: string) => ["deadlines", dealId] as const,
};

export const loanEstimateKeys = {
  list: (dealId: string) => ["loan-estimates", dealId] as const,
};

export const repairItemKeys = {
  list: (dealId: string) => ["repair-items", dealId] as const,
};

export const insuranceKeys = {
  list: (dealId: string) => ["insurance-info", dealId] as const,
};

export const collaboratorKeys = {
  list: (dealId: string) => ["collaborator-links", dealId] as const,
};

export const copilotKeys = {
  messages: (dealId: string | null) => ["copilot-messages", dealId] as const,
};
```

---

## Phase Transition Flow

Phase transitions are the most important state mutations. They affect multiple queries and UI state.

```
Shopping → Offer
  trigger: "Ready to make an offer?" CTA
  mutations:
    1. Create deal (if not exists) with current_phase = "offer"
    2. Create offer_details row linked to deal
    3. Update saved_home status to "offer-pending"
  invalidations: dealKeys.all, savedHomeKeys.all
  Zustand: setCurrentPhase("offer"), setActiveDealId(newDealId)

Offer → Escrow
  trigger: "Offer Accepted — Start Escrow" CTA
  mutations:
    1. Update deal.current_phase = "escrow"
    2. Update deal.contract_acceptance_date, closing_date from offer
    3. Update offer_details.status = "accepted"
    4. Auto-generate deadlines from contingency days
  invalidations: dealKeys.detail, offerKeys.detail, deadlineKeys.list
  Zustand: setCurrentPhase("escrow")

Escrow → Closing
  trigger: "All Contingencies Clear? Proceed to Closing" CTA
  mutations:
    1. Update deal.current_phase = "closing"
  invalidations: dealKeys.detail
  Zustand: setCurrentPhase("closing")

Closing → Post-Close
  trigger: "Recording Complete — Keys in Hand!" CTA
  mutations:
    1. Update deal.current_phase = "post-close"
  invalidations: dealKeys.detail
  Zustand: setCurrentPhase("post-close")
```

---

## Cache Invalidation Rules

| Mutation | Invalidates |
|----------|------------|
| Create saved home | `savedHomeKeys.all` |
| Delete saved home | `savedHomeKeys.all` |
| Create deal | `dealKeys.all`, `dealKeys.detail` |
| Update deal | `dealKeys.detail` |
| Phase transition | `dealKeys.detail` + phase-specific keys |
| Create/update offer details | `offerKeys.detail` |
| Upload document | `documentKeys.list` |
| Document processed (AI) | `documentKeys.list` (refetch to get extracted fields) |
| Create loan estimate | `loanEstimateKeys.list` |
| Update loan estimate (set chosen) | `loanEstimateKeys.list` |
| Create/update deadline | `deadlineKeys.list` |
| Create/update repair item | `repairItemKeys.list` |
| Create/update insurance info | `insuranceKeys.list` |
| Send copilot message | `copilotKeys.messages` |
| Collaborator upload received | `documentKeys.list`, `collaboratorKeys.list` |

---

## Optimistic vs Pessimistic Updates

| Mutation type | Strategy | Why |
|--------------|----------|-----|
| Checklist toggles (offer readiness) | **Optimistic** | Instant feel, low risk of failure |
| Deadline status changes | **Optimistic** | Toggle between states, easy rollback |
| Repair item status | **Optimistic** | Simple status flip |
| Saved home CRUD | **Optimistic** | Lightweight data, instant feedback |
| Document upload | **Pessimistic** | File upload can fail, show progress instead |
| Deal creation | **Pessimistic** | Complex mutation, redirect on success |
| Phase transitions | **Pessimistic** | Critical state change, must confirm server success |
| Loan estimate creation | **Pessimistic** | Financial data, must be persisted before display |
| AI extraction/summary | **Pessimistic** | Async server process, polling until complete |

---

## Zustand Store Structure

The Zustand store is sliced by concern. Each slice is independent.

```typescript
// UI Slice — layout and navigation
currentPhase: Phase
sidebarCollapsed: boolean
copilotOpen: boolean
activeSidebarItem: "dashboard" | "documents" | "financing"

// Deal Slice — active deal context
activeDealId: string | null

// Comparison Slice — LE comparison selections (Financing view)
selectedLEIds: string[]           // max 3
toggleLESelection: (id) => void
clearLESelections: () => void

// Document Viewer Slice — slide-over viewer state (Documents view)
viewerDocId: string | null
viewerOpen: boolean
openViewer: (docId) => void
closeViewer: () => void
```

---

## Computed State Rules

These values are NEVER stored. They are computed from server state on every render.

| Value | Inputs | Function | Output |
|-------|--------|----------|--------|
| Cash-to-close | Chosen LE, credits, prorations | `computeCashToClose()` | number |
| Monthly P&I | Loan amount, rate, term | `computeMonthlyPI()` | number |
| Deadline urgency | Deadline due_date, today | `computeDeadlineUrgency()` | "upcoming" / "due-soon" / "overdue" |
| LE vs CD variance | LE fields, CD extracted_fields | `computeLEVariance()` | { field, leValue, cdValue, delta, toleranceOk }[] |
| Offer readiness | OfferDetails checklist_items | `computeOfferReadiness()` | { complete: number, total: number, percent: number } |
| Deal days remaining | Deal closing_date, today | `computeDaysRemaining()` | number |

---

## Hook Usage Rules

1. **All Supabase queries go through hooks in `lib/hooks/`.** Components never call `supabase.from()` directly.
2. **One hook per data type.** `useDocuments(dealId)` returns documents. `useUploadDocument()` returns a mutation. No combined hooks.
3. **Hooks return TanStack Query results directly.** Components destructure `{ data, isLoading, error }`.
4. **Mutations call `queryClient.invalidateQueries()` on success.** Never manually update cache — invalidate and let TQ refetch.
5. **Computed values are called inline.** `const cashToClose = computeCashToClose(chosenLE, credits)` — not a hook, not stored.
6. **The active deal ID comes from Zustand.** All deal-scoped hooks receive `dealId` as a parameter. If no deal exists, hooks are disabled via TQ's `enabled` option.

---

## File Locations

| File | Purpose |
|------|---------|
| `lib/store.ts` | Zustand store (UI + deal + comparison + viewer slices) |
| `lib/hooks/query-keys.ts` | Query key factory |
| `lib/hooks/queries.ts` | TanStack Query hooks (read) |
| `lib/hooks/mutations.ts` | TanStack Query mutation hooks (write) |
| `lib/computed.ts` | Pure deterministic computation functions |
| `lib/types.ts` | TypeScript interfaces for all DB tables |
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/server.ts` | Server Supabase client |
