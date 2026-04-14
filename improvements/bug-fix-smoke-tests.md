# Bug Fix Smoke Tests
## 10 Fixes Across Phases 2-4
## Created: April 14, 2026

---

## Setup

- Open the app in browser with DevTools **Console + Network** tab open
- Start with a fresh deal or use an existing one

---

## Test 1 — Deal Setup

**Covers:** fix #5 (progress bars), fix #6 (EMD countdown), fix #7 (deadline error handling)

1. Click "Go to Deal Setup" or create a new deal
2. Fill in:
   - Address: any address
   - **Acceptance date: 7 days ago** (so progress bars have elapsed time)
   - Closing date: 30 days from now
   - Purchase price: $500,000
   - EMD: $15,000
   - Inspection: **10** days
   - Appraisal: **17** days
   - Loan: **21** days
3. Submit

**Verify:**
- [ ] Console shows no `[deal-setup] Failed to create deadlines` errors **(fix #7)**
- [ ] Escrow dashboard loads with 4 deadlines

---

## Test 2 — Escrow Dashboard

**Covers:** fix #5 (progress bars), fix #6 (EMD countdown), fix #8 (cash-to-close empty), fix #9 (HOA optional)

### Contingency Countdown — Progress Bars (fix #5)

The bars now compute elapsed time from the deal's **acceptance date** to each deadline's due date, so each bar has a different total period and fills at a different rate.

- [ ] Inspection contingency (10-day period) bar is **further filled** than the others
- [ ] Appraisal (17-day) bar is less filled than inspection
- [ ] Financing (21-day) bar is less filled than appraisal
- [ ] Closing (30-day) bar is the least filled
- [ ] If acceptance date was 7 days ago: inspection ~70%, appraisal ~41%, financing ~33%, closing ~23%

### Earnest Money Tracker — EMD Countdown (fix #6)

EMD due date is now auto-computed as **3 business days after acceptance** when no explicit EMD deadline exists.

- [ ] Below the status stepper, a countdown banner shows: **"Due by [date] (X days left)"**
- [ ] If overdue: shows **"EMD deposit overdue!"** in red
- [ ] Click "Mark as Sent" then "Mark as Confirmed" — countdown banner disappears
- [ ] If no acceptance date was set on the deal, no countdown shows (graceful fallback)

### Cash to Close Summary — Empty State (fix #8)

- [ ] Card is **visible** even though no LE is marked as "Chosen" yet
- [ ] Shows: "Add a Loan Estimate in the Financing tab and mark one as 'Chosen'..."

### Disclosures — HOA Conditional (fix #9)

- [ ] TDS, NHD, Lead Paint show **"Missing"** badge (required)
- [ ] HOA shows **"HOA Documents (if applicable)"** with **"Optional"** badge
- [ ] Optional badge is visually lighter than the Missing badge

---

## Test 3 — Financing Tab

**Covers:** fix #4 (prefill race), fix #10 (footer fallback)

1. Navigate to Financing tab
2. Add 2 Loan Estimates manually:
   - "Wells Fargo" — 6.5% rate, $320k loan, leave Cash to Close **blank**
   - "Chase" — 6.25% rate, $320k loan, fill in Cash to Close as $16,000
3. Mark one as "Chosen"
4. Select both for comparison

### CashToCloseFooter Fallback (fix #10)

- [ ] Sticky footer at bottom shows a cash-to-close value even for the LE with **no explicit cash_to_close** field
- [ ] Footer computes the value from down payment + fees - credits

### Prefill Race Condition (fix #4)

5. **Close the copilot panel** (click X)
6. In the comparison table, click **"Ask Homie about these differences"**
- [ ] Copilot panel opens **AND** the comparison question auto-sends
- [ ] Response starts streaming (not a blank panel)

7. If an LE vs CD panel is visible (requires a processed CD doc):
   - **Close copilot again**
   - Click **"Ask Homie to explain these changes"**
   - [ ] Same result — opens and sends

---

## Test 4 — Document Upload + SlideOver

**Covers:** fix #3 (retry invalidation), fix #4 (prefill from doc viewer)

1. Go to Documents tab
2. Upload any PDF
3. Wait for processing to complete (or fail)

### Retry Invalidation (fix #3) — if processing failed:

4. Click the document row to open detail view
5. Click **"Retry analysis"**
- [ ] In Network tab: **one** Supabase query on click, then **one more** after processing
- [ ] No duplicate simultaneous refetch requests

### Prefill from Doc Viewer (fix #4) — if processing succeeded:

4. Click the document row to open detail view
5. Click **"Draft questions about this document"**
6. **Close the copilot panel**
7. Click one of the generated questions
- [ ] Copilot opens **AND** the question sends

---

## Test 5 — Copilot Streaming

**Covers:** fix #1 (stream errors surfaced), fix #2 (no flash-clear)

1. Open the copilot panel
2. Send any message (e.g., "What should I look for in an inspection?")

### Stream Completion — No Flash (fix #2)

- [ ] Response streams in token-by-token
- [ ] When streaming finishes, text stays visible — **no blank flash** before persisted message loads
- [ ] Final message appears seamlessly in the history

### Stream Error Surfacing (fix #1) — optional, requires temporary breakage:

3. Set an invalid `OPENAI_API_KEY` in `.env.local`, restart dev server
4. Send a message
- [ ] Response shows: **"Sorry, something went wrong while generating a response. Please try again."**
5. Restore the correct API key

---

## Results Matrix

| # | Fix | Test | Pass? |
|---|-----|------|-------|
| 1 | Stream errors surfaced to client | Test 5 (error path) | |
| 2 | No streaming flash-clear | Test 5 (normal message) | |
| 3 | Retry single invalidation | Test 4 (retry analysis) | |
| 4 | Prefill when copilot closed | Test 3 step 6 + Test 4 step 7 | |
| 5 | Dynamic progress bars | Test 2 (contingency bars) | |
| 6 | EMD deadline countdown | Test 2 (earnest money) | |
| 7 | Deadline error handling | Test 1 (console check) | |
| 8 | Cash-to-close empty state | Test 2 (no chosen LE) | |
| 9 | HOA conditional disclosure | Test 2 (disclosures) | |
| 10 | Footer fallback value | Test 3 (blank cash field) | |

---

## Files Modified

| File | Fix |
|------|-----|
| `app/api/copilot/chat/route.ts` | #1 — Stream error message enqueued to response |
| `lib/hooks/use-streaming-chat.ts` | #2 — Await invalidation before clearing streaming text |
| `components/documents/SlideOverViewer.tsx` | #3 — Deduplicated retry invalidation; #4 — Queued prefill |
| `components/copilot/AICopilot.tsx` | #4 — Flush pending prefill on mount |
| `components/financing/LEComparisonTable.tsx` | #4 — Queue prefill before opening panel |
| `components/financing/LEvsCD.tsx` | #4 — Queue prefill before opening panel |
| `components/escrow/ContingencyCountdown.tsx` | #5 — Dynamic scale from acceptance date |
| `components/escrow/EarnestMoneyTracker.tsx` | #6 — Compute EMD due (3 biz days after acceptance) |
| `components/deal/DealSetupForm.tsx` | #7 — Log deadline insert errors |
| `components/deal/PhaseDashboard.tsx` | #5, #6 — Pass acceptance date + EMD deadline props |
| `components/escrow/EscrowCashToClose.tsx` | #8 — Show guidance when no chosen LE |
| `components/escrow/DisclosureTracker.tsx` | #9 — HOA marked optional with lighter badge |
| `components/financing/CashToClose.tsx` | #10 — Fallback to computed cash-to-close |
