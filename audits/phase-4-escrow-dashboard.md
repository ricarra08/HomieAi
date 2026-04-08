# Phase 4 — Escrow Dashboard Audit
## Completed: April 7, 2026
## Status: PASS WITH NOTES

---

## Summary

Phase 4 delivers the full Escrow Dashboard with contingency countdown, earnest money tracker, due diligence components (appraisal gap analysis, inspection checklist, AI red-flag summary), repairs tracker, computed alerts, loan progress, disclosure tracker, and escrow cash-to-close summary. Inline document upload with AI intelligence is integrated into each card.

---

## Build Verification

```
TypeScript:  0 errors
ESLint:      0 errors, 0 warnings
```

---

## Build Plan Alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| 4.1 Contingency Countdown | PASS | Timeline, urgency colors, mark complete/waive. Progress bar uses fixed 30-day scale (could be improved). |
| 4.2 Earnest Money Tracker | PASS | Amount, status stepper, escrow details, wire fraud warning. Missing: EMD deadline countdown, wire/check instructions fields. |
| 4.3 Due Diligence | PASS | Appraisal gap analysis, inspection checklist with inline upload + AI summaries, red-flag summary. Missing: order/schedule tracking. |
| 4.4 Repairs/Alerts | PASS | Repair CRUD, computed alerts, loan progress, disclosure tracker. Missing: title/lien alerts, 3-day review period, underwriting is placeholder. |
| 4.5 Cash-to-Close | PASS | Chosen LE summary with CD override, link to Financing. Missing: full line items (uses simplified version). |

---

## Files Created/Modified (15)

| File | Lines | Purpose |
|------|-------|---------|
| `escrow/ContingencyCountdown.tsx` | ~155 | Deadline timeline with urgency, actions, Ask Homie |
| `escrow/EarnestMoneyTracker.tsx` | ~127 | EMD status stepper + wire fraud warning |
| `escrow/AppraisalStatus.tsx` | ~95 | Gap analysis + inline doc upload |
| `escrow/InspectionChecklist.tsx` | ~120 | 5 inspection types with inline upload per type |
| `escrow/RedFlagSummary.tsx` | ~120 | Major findings from inspections + add to repairs |
| `escrow/RepairTracker.tsx` | ~130 | Repair CRUD with dollar impact |
| `escrow/EscrowAlerts.tsx` | ~125 | Computed alerts from deal state |
| `escrow/LoanProgress.tsx` | ~90 | Loan financing checklist |
| `escrow/DisclosureTracker.tsx` | ~90 | Required disclosures with inline upload |
| `escrow/EscrowCashToClose.tsx` | ~85 | Cash-to-close summary |
| `escrow/InlineDocUpload.tsx` | ~105 | Reusable inline upload with AI summary preview |
| `deal/PhaseDashboard.tsx` | Modified | Full escrow layout with 2-col grid |
| `deal/DealSetupForm.tsx` | Modified | Deadline creation on direct entry + $ prefixes |
| `ui/collapsible-card.tsx` | Modified | Rounded corners fix for collapsed state |
| `hooks/mutations.ts` | Modified | Insurance CRUD + useUpdateLoanEstimate |

---

## Issues Found

### Fixed

| Issue | Fix |
|-------|-----|
| **HIGH: LoanProgress showed `cash_to_close` as "Monthly P&I"** | Replaced with `computeMonthlyPI(chosen.loan_amount, chosen.rate)` |
| CollapsibleCard side-by-side height mismatch | `items-start` on grids, `rounded-xl` on header |
| DealSetupForm direct entry skipped deadline creation | Added inline deadline insert in `onSuccess` |
| DealSetupForm missing $ prefix on Purchase Price and EMD | Added `$` prefix divs |

### Medium — Fix Before Beta

| # | Issue | Location |
|---|-------|----------|
| 1 | Progress bar uses fixed 30-day scale — misleading for longer/shorter contingencies | `ContingencyCountdown.tsx` |
| 2 | No EMD deadline countdown (plan 4.2 mentions it) | `EarnestMoneyTracker.tsx` |
| 3 | Red-flag "Add to repairs" can create duplicate items for the same finding | `RedFlagSummary.tsx` |
| 4 | DealSetupForm deadline insert has no error handling — silent failure | `DealSetupForm.tsx` |
| 5 | EscrowCashToClose disappears entirely when no chosen LE (no explanation) | `EscrowCashToClose.tsx` |
| 6 | HOA disclosure always shown as "required" — should be conditional | `DisclosureTracker.tsx` |
| 7 | Appraisal gap can show wrong value while deal query is still loading | `AppraisalStatus.tsx` |

### Low — Defer

| # | Issue | Location |
|---|-------|----------|
| 8 | Title/lien/easement alerts from plan 4.4 not represented | `EscrowAlerts.tsx` |
| 9 | Underwriting/Clear-to-Close are hardcoded placeholders | `LoanProgress.tsx` |
| 10 | 3-day disclosure review period not modeled | `DisclosureTracker.tsx` |
| 11 | `InlineDocUpload` relies on classification pipeline — wrong/slow classification can break flows | `InlineDocUpload.tsx` |
| 12 | Disclosure matching uses `name.includes(key)` — fragile | `DisclosureTracker.tsx` |
| 13 | DealSetupForm deadline logic duplicates `computeDeadlinesFromOffer` | `DealSetupForm.tsx` |

---

## State Management Compliance

All data flows through the correct layers per STATE.md:
- Deadlines, repairs, documents, LEs, deal → Server (TanStack Query)
- Deadline urgency, days remaining, alerts → Computed (never stored)
- No new Zustand state needed

---

## Testing Checklist

### Deal Setup + Deadlines
- [ ] Create a deal via direct entry (Shopping → "Go to Deal Setup")
- [ ] Fill in acceptance date, closing date, purchase price ($450,000), earnest money ($20,000)
- [ ] Set contingency days: inspection 17, appraisal 17, loan 21
- [ ] Submit → verify escrow dashboard loads with:
  - [ ] DealSummaryCard showing address and closing countdown
  - [ ] Contingency Countdown showing 4 deadlines (inspection, appraisal, financing, closing)
  - [ ] Earnest Money Tracker showing $20,000 with "Pending" status
- [ ] Verify $ signs appear on Purchase Price and EMD inputs in the setup form

### Contingency Countdown
- [ ] Deadlines show correct urgency colors (green/amber/red based on days remaining)
- [ ] Click "Done" on a deadline → it moves to Resolved section with strikethrough
- [ ] Click "Waive" (X) on a deadline → it shows as Waived
- [ ] "Ask Homie about my deadlines" button opens copilot and sends the question
- [ ] Progress bars reflect time elapsed

### Earnest Money Tracker
- [ ] Shows deposit amount and "Pending" status
- [ ] Click "Mark as Sent" → status advances to Sent
- [ ] Click "Mark as Confirmed" → status advances to Confirmed
- [ ] Wire fraud warning shows when status is Pending or Sent
- [ ] Wire fraud warning disappears when status is Confirmed
- [ ] Escrow company details show if set in deal

### Inspections (Inline Upload)
- [ ] 5 inspection types listed (General, Pest, Roof, HVAC, Foundation)
- [ ] Each type shows "Not uploaded" with a drop zone
- [ ] Drop a PDF on the General inspection drop zone → file uploads, processes, shows "Analyzing..."
- [ ] After processing: condition badge appears, major findings count shows
- [ ] Click the document chip → opens document detail viewer with full AI summary
- [ ] "Ask Homie about findings" button appears when findings exist

### Appraisal (Inline Upload)
- [ ] Shows "Awaiting Appraisal" when no doc
- [ ] Drop an appraisal PDF → uploads and processes
- [ ] After processing: shows appraised value, purchase price, gap analysis
- [ ] If appraised value < purchase price: red "Appraisal Gap" with amount
- [ ] "Ask Homie about the appraisal" button sends contextual question

### Red Flag Summary
- [ ] Appears only when inspection reports have major findings
- [ ] Shows each finding with severity badge, description, cost, location
- [ ] Total estimated repair cost shown
- [ ] Click "+" on a finding → creates a repair item in the Repairs tracker
- [ ] "Ask Homie about these findings" opens copilot

### Repairs Tracker
- [ ] Shows empty state when no repairs
- [ ] Click "Add Repair Item" → inline form appears
- [ ] Enter description and cost → click Add → item appears in list
- [ ] Change status via dropdown (pending → requested → agreed → completed)
- [ ] Total estimated and total agreed costs shown at bottom

### Alerts
- [ ] Wire fraud warning always shown (permanent)
- [ ] Overdue deadlines show as destructive alerts
- [ ] Due-soon deadlines show as warning alerts
- [ ] Missing purchase contract shows as warning
- [ ] Missing inspection report shows as info
- [ ] Rate lock expiring shows when lock_expires is within 7 days
- [ ] Unconfirmed earnest money shows as warning

### Loan Progress
- [ ] Shows pre-approval status (done if doc uploaded)
- [ ] Shows chosen LE with rate and product
- [ ] Shows rate lock status with countdown
- [ ] Monthly P&I shows correct computed amount (NOT cash to close)
- [ ] Lock icon shows when rate is locked

### Disclosures (Inline Upload)
- [ ] Required disclosures listed (TDS, NHD, Lead Paint, HOA)
- [ ] Each shows "Missing" badge or checkmark if uploaded
- [ ] Drop zones work for each disclosure type
- [ ] Uploaded docs show AI summary preview inline

### Cash-to-Close Summary
- [ ] Shows when a chosen LE exists
- [ ] Displays cash to close, monthly P&I, rate, total monthly, loan amount
- [ ] "View full breakdown in Financing" link navigates to Financing tab
- [ ] Hidden when no chosen LE (no crash)

### Copilot Integration
- [ ] On the dashboard page, copilot chips show: "What are my upcoming deadlines?", "Summarize my inspection findings", "Is my earnest money confirmed?", "What documents am I missing?"
- [ ] Each "Ask Homie" button across cards opens the copilot and sends the contextual question
- [ ] Copilot can reference deal data, deadlines, and uploaded documents in responses

### Layout
- [ ] 2-column grid on xl screens, single column on smaller
- [ ] Collapsed cards don't stretch to match neighbor height
- [ ] All cards use consistent styling (rounded-xl, border-border, shadow-sm)
- [ ] CollapsibleCards expand/collapse independently
