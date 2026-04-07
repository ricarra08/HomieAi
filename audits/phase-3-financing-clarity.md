# Phase 3 — Financing Clarity Audit
## Completed: April 7, 2026
## Status: PASS WITH NOTES

---

## Summary

Phase 3 delivers the Financing page with LE cards (auto-populated from PDF extraction), manual LE entry, a 3-way comparison table with optimization toggle, LE vs CD variance panel, and a cash-to-close breakdown engine. The copilot is wired with financing-specific quick actions and contextual "Ask Homie" buttons.

---

## Build Verification

```
TypeScript:  0 errors
ESLint:      0 errors, 0 warnings
Build:       Compiled successfully
```

---

## Build Plan Alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| 3.1 LE Entry + Cards | PASS | Cards, form modal, grid layout, chosen/compare, PDF link all working |
| 3.2 Auto-Populate from Extraction | PASS | Auto-creates LE row after extraction; lock_status normalization fixed |
| 3.3 LE Comparison Table | PASS | 3 optimization modes, best-value highlighting, side-by-side, Ask Homie |
| 3.4 LE vs CD Variance Panel | PASS | Tolerance highlighting, TRID reference, Ask Homie |
| 3.5 Cash-to-Close Engine | PARTIAL | Breakdown works; credits/prorations not fully modeled; no historical tracking |

---

## Files Created (7)

| File | Lines | Purpose |
|------|-------|---------|
| `components/financing/LECard.tsx` | ~160 | LE card with chosen/compare states, auto-extracted banner |
| `components/financing/LEFormModal.tsx` | ~190 | Add/edit LE form modal with all fields |
| `components/financing/LEComparisonTable.tsx` | ~200 | Side-by-side comparison with optimization toggle |
| `components/financing/LEvsCD.tsx` | ~110 | LE vs CD variance panel with tolerance highlighting |
| `components/financing/CashToClose.tsx` | ~140 | Cash-to-close breakdown + sticky footer |
| `lib/ai/le-auto-populate.ts` | ~60 | Extraction-to-LE field mapping |
| `lib/computed.ts` (updated) | +30 | `unwrapCDValue`, updated `computeLEVariance`, new `computeTotalLoanCost` |

## Files Modified (3)

| File | Change |
|------|--------|
| `app/(app)/financing/page.tsx` | Full rewrite: card grid, inline PDF viewer, comparison, variance, cash-to-close |
| `app/api/documents/process/route.ts` | Step 7: auto-create LE row after extraction |
| `components/copilot/AICopilot.tsx` | PAGE_QUICK_ACTIONS for /financing and /documents |

---

## Issues Found

### High Priority — Fix Now

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | **LEFormModal "Update" uses insert only** — clicking Edit then Save creates a duplicate LE instead of updating the existing one. No `useUpdateLoanEstimate` mutation exists. | `LEFormModal.tsx` | Duplicate LE rows on edit |
| 2 | **copilot:prefill lost when panel was closed** — `setCopilotOpen(true)` then synchronous `dispatchEvent` fires before the panel mounts its listener. "Ask Homie" buttons on comparison table and variance panel may silently fail if copilot was closed. | `LEComparisonTable.tsx`, `LEvsCD.tsx`, `AICopilot.tsx` | Ask Homie does nothing when copilot was closed |

### Medium Priority — Fix Before Beta

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 3 | **normalizeLockStatus: "unlocked" maps to "locked"** — `"unlocked".includes("lock")` is true, so the "lock" check fires before the "unlocked" check | `le-auto-populate.ts` | Incorrect lock status for some LEs |
| 4 | **computeLEVariance: missing CD fields → 0 → fake variances** — `unwrapCDValue` returns 0 for missing fields, creating false deltas against LE values | `computed.ts` | Misleading variance display |
| 5 | **Step 7 duplicate LEs on reprocess** — no upsert/dedup by `pdf_document_id`, so reprocessing a doc creates another LE row | `process/route.ts` | Duplicate LE cards |
| 6 | **Comparison table reimplements `totalCost` locally** — doesn't use `computeTotalLoanCost` from computed.ts, drift risk | `LEComparisonTable.tsx` | Potential calculation inconsistency |

### Low Priority — Defer

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 7 | Total loan cost assumes 30-year term always | `LEComparisonTable.tsx`, `computed.ts` | Wrong for 15-year/ARM products |
| 8 | Cash-to-close doesn't model seller credits, lender credits, prepaids, prorations as separate line items | `CashToClose.tsx` | Less detailed than plan 3.5 spec |
| 9 | No historical change tracking for cash-to-close | `CashToClose.tsx` | Deferred feature |
| 10 | `CashToCloseFooter` shows nothing when `cash_to_close` is null even if computed value exists | `CashToClose.tsx` | Minor inconsistency |
| 11 | `LEvsCD` `formatCurrency` uses `Math.abs` — hides negative signs on credit amounts | `LEvsCD.tsx` | Cosmetic for edge cases |
| 12 | `formatCurrency` duplicated across 4 financing components | Multiple | Maintainability |

---

## State Management Compliance

| Data | Layer | Status |
|------|-------|--------|
| `LoanEstimate[]` | Server (TQ) | `useLoanEstimates(dealId)` — correct |
| `selectedLEIds` | Client (Zustand) | `toggleLESelection`, `clearLESelections` — correct |
| Cash-to-close | Computed | Inline computation in `CashToClose.tsx` — correct pattern, should use `computeCashToClose` |
| Monthly P&I | Computed | `computeMonthlyPI()` — correct |
| LE vs CD variance | Computed | `computeLEVariance()` — correct |
| Total loan cost | Computed | `computeTotalLoanCost()` exists but not used in comparison table |
| `viewerDocId` | Client (Zustand) | Reused from documents — correct |

---

## Copilot Integration

- Page-aware quick actions: `/financing` shows financing-specific chips — working
- "Ask Homie about these differences" on comparison table — intent works but prefill may be lost (Issue #2)
- "Ask Homie to explain these changes" on variance panel — same prefill issue
- Context engine already includes LE data in Escrow/Closing — copilot can reference actual numbers

---

## Model Usage (Phase 3 additions)

| Task | Model | Cost |
|------|-------|------|
| LE field extraction | gpt-4o (existing) | ~$0.03/doc |
| Auto-populate mapping | No AI (pure function) | Free |
| Cash-to-close | No AI (deterministic math) | Free |
| LE comparison | No AI (deterministic math) | Free |
| LE vs CD variance | No AI (deterministic math) | Free |
| Ask Homie (contextual) | gpt-4o (existing copilot) | ~$0.015/msg |
