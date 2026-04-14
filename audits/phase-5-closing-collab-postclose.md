# Phase 5 — Closing Dashboard, Collaborator Upload Links & Post-Close Audit
## Completed: April 13, 2026
## Status: PASS WITH NOTES

---

## Summary

Phase 5 delivers the full Closing Dashboard with 10 specialized cards (alerts, CD review with 3-business-day TRID tracking, cash-to-close finalizer, signing appointment, final walkthrough checklist, insurance binder verification, underwriting conditions, wire transfer SafeSend with fraud prevention, title/escrow final checks, and funding/recording timeline), a Collaborator Upload Link system (dialog, public upload page, validate + upload API routes, token-based access), and a Post-Close view with deal summary, document archive with download, and "Coming Soon" placeholders for equity tracking and homeowner tools. A new `closing_metadata` JSONB column stores all closing-phase state in a single denormalized field, with a well-typed `ClosingMetadata` interface and `DEFAULT_CLOSING_METADATA` constant. The `useClosingData` composite hook aggregates six parallel queries into a single `ClosingData` shape consumed by every closing card.

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
| 5.1 Closing Dashboard Layout | PASS | 3-column grid on xl, single on mobile. DealSummaryCard + alerts at top, 9 cards in 3x3 grid. "Recording Complete" phase transition button. |
| 5.2 Closing Disclosure Review (TRID) | PASS | 3-business-day wait countdown, LE vs CD variance table with tolerance flags, "Explain Differences" copilot integration. |
| 5.3 Cash to Close Finalizer | PASS | Computed amount from chosen LE minus EMD, line-item breakdown, wire due date, escrow info, wire fraud banner. |
| 5.4 Signing Appointment | PASS | Date/time picker, location field, "What to Bring" checklist, confirm toggle. |
| 5.5 Final Walkthrough Checklist | PASS | 10-room checklist with persistent toggle, completion banner. |
| 5.6 Insurance Binder Verification | PASS | Status display, inline doc upload, mark-as-bound action, carrier/premium/effective date details. |
| 5.7 Underwriting Conditions | PASS | Add/remove conditions, 3-state cycle (outstanding/submitted/cleared), "Clear to Close" banner when all cleared. |
| 5.8 Wire Transfer SafeSend | PASS | Wire fraud prevention banner, 3-step verification gate, wire receipt upload, amount display, disabled-after-wired state. |
| 5.9 Title & Escrow Final Checks | PASS | Title report status + AI summary preview, acknowledge toggle, view report button. |
| 5.10 Funding & Recording Timeline | PASS | 4-step vertical stepper (Lender Funds, Escrow Disburses, County Records, Keys Released), click-to-advance, date stamping. "Pick Up Keys" triggers post-close transition. |
| 5.11 Collaborator Upload Links | PASS | Dialog with role selector + optional email, link generation, copy-to-clipboard, revoke action, active/expired/revoked badges, uploads counter. |
| 5.12 Public Upload Page | PASS | Token validation, drag-and-drop + file picker, upload status per file, property address + role display, requested documents list. |
| 5.13 Collaborator API Routes | PASS | `/api/collaborator/validate` (GET) and `/api/collaborator/upload` (POST). Token validation, expiry/revoke checks, storage upload, document record insert, AI processing trigger. |
| 5.14 Post-Close View | PASS | Congratulations banner, deal summary with financials, document archive with signed-URL download, "Coming Soon" placeholders. |
| 5.15 DB Migration | PASS | `003_closing_metadata.sql` adds `closing_metadata jsonb DEFAULT '{}'` to deals. |

---

## Files Created/Modified (20)

| File | Lines | Purpose |
|------|-------|---------|
| `closing/ClosingAlerts.tsx` | ~153 | Computed alerts from closing state: wire, CD, insurance, title, signing, closing date |
| `closing/ClosingDisclosureReview.tsx` | ~113 | CD review with 3-business-day TRID countdown, LE vs CD variance, copilot explain |
| `closing/CashToCloseFinalizer.tsx` | ~100 | Cash-to-close breakdown, wire due date, escrow details, confirm toggle |
| `closing/SigningAppointment.tsx` | ~80 | Signing date/time/location, what-to-bring checklist, confirm toggle |
| `closing/FinalWalkthroughChecklist.tsx` | ~68 | 10-room walkthrough checklist with persistent toggles |
| `closing/InsuranceBinderVerification.tsx` | ~100 | Insurance binder status, inline upload, mark-as-bound |
| `closing/UnderwritingConditionsFinal.tsx` | ~101 | Condition CRUD with 3-state cycle, clear-to-close banner |
| `closing/WireTransferSafeSend.tsx` | ~114 | Wire fraud prevention, 3-step verification gate, receipt upload |
| `closing/TitleEscrowFinalChecks.tsx` | ~76 | Title report status, AI summary preview, acknowledge toggle |
| `closing/FundingRecordingTimeline.tsx` | ~86 | 4-step funding/recording stepper, keys-received callback |
| `documents/CollaboratorLinkDialog.tsx` | ~142 | Dialog to create, copy, revoke collaborator upload links |
| `(public)/upload/[token]/page.tsx` | ~153 | Public upload page for collaborators (no auth required) |
| `api/collaborator/upload/route.ts` | ~86 | POST handler: validate token, upload to storage, create doc record, trigger AI |
| `api/collaborator/validate/route.ts` | ~54 | GET handler: validate token, return deal info for upload page |
| `post-close/PostCloseView.tsx` | ~151 | Post-close congratulations, deal summary, document archive, coming-soon cards |
| `hooks/use-closing-data.ts` | ~89 | Composite hook aggregating 6 queries into `ClosingData` |
| `hooks/mutations.ts` | Modified | Added `useCreateCollaboratorLink`, `useRevokeCollaboratorLink`, closing phase transition invalidations |
| `lib/types.ts` | Modified | Added `CollaboratorLink`, `ClosingMetadata`, `DEFAULT_CLOSING_METADATA` |
| `deal/PhaseDashboard.tsx` | Modified | Added `ClosingDashboard`, `PostCloseDashboard` sections with phase routing |
| `(app)/documents/page.tsx` | Modified | Integrated `CollaboratorLinkDialog` in header |
| `supabase/migrations/003_closing_metadata.sql` | 8 | Adds `closing_metadata` JSONB column to deals |

---

## Issues Found

### Fixed

| Issue | Fix |
|-------|-----|
| (None found during this audit — no pre-existing regressions) | — |

### High — Fix Before Launch

| # | Issue | Location |
|---|-------|----------|
| 1 | **Collaborator upload route has no file-size or file-type validation.** An attacker with a valid token can upload arbitrarily large files or non-PDF payloads (e.g., `.exe`, `.zip`). Should enforce a max size (e.g., 25 MB) and restrict `mime_type` to `application/pdf`. | `api/collaborator/upload/route.ts` |
| 2 | **Collaborator upload route has no rate limiting.** A valid token allows unlimited rapid-fire uploads. Should add per-token rate limiting or an upload cap per link. | `api/collaborator/upload/route.ts` |
| 3 | **`link_token` generation is not visible in the create mutation.** The `useCreateCollaboratorLink` mutation inserts a row without providing `link_token` — this relies on a database default (likely `gen_random_uuid()`). If the DB default is misconfigured or missing, the insert silently creates a row with a null token. Should explicitly generate a token client-side or verify the DB constraint. | `mutations.ts` L546-570, DB schema |
| 4 | **Collaborator upload processing trigger uses fire-and-forget fetch with no error propagation.** The `fetch(origin + "/api/documents/process")` call discards errors silently (`.catch(() => {})`). If the origin header is missing or the process endpoint fails, the uploaded document remains in `uploaded` status permanently with no retry mechanism. | `api/collaborator/upload/route.ts` L77-83 |
| 5 | **Wire SafeSend allows marking as "wired" without uploading a receipt.** The "Mark as Wired" button is enabled when all 3 verification steps are checked, but does not require a wire receipt upload. For wire fraud compliance, the receipt should be mandatory before marking wired. | `WireTransferSafeSend.tsx` L101-108 |

### Medium — Fix Before Beta

| # | Issue | Location |
|---|-------|----------|
| 6 | **Closing Disclosure 3-business-day calculation counts from `created_at` (upload timestamp), not from the actual CD receipt date.** If the buyer uploads the CD days after receiving it, the waiting period countdown is wrong. Should use a user-confirmed receipt date or `cd_received_confirmed` toggle timestamp. | `ClosingDisclosureReview.tsx` L18-24 |
| 7 | **`computeBusinessDaysRemaining` returns calendar days remaining, not business days remaining.** It correctly calculates the end of the 3-business-day period, but then calls `computeDaysRemaining()` which returns calendar days until that date — this confuses users about whether they see business or calendar days. The label says "3-business-day waiting period" but the number may show calendar days. | `ClosingDisclosureReview.tsx` L18-24 |
| 8 | **Every closing metadata update sends the entire metadata object.** Each `updateMeta()` call in SigningAppointment, WireTransferSafeSend, FinalWalkthroughChecklist, etc. spreads `{ ...meta, ...patch }` and sends the full blob. Rapid concurrent edits from different cards can cause a last-write-wins race condition, overwriting each other. Should use a JSON merge patch or per-field updates. | All closing components using `useUpdateDeal` |
| 9 | **`useClosingData` memo dependencies use `allDocs` array reference.** The `useMemo` for `cdDocument`, `titleReport`, and `insuranceBinder` depends on `allDocs`, which is a new array reference on every render when `documents` is undefined (falls back to `[]`). This triggers unnecessary re-computations. Should stabilize with `documents` directly. | `use-closing-data.ts` L33-47 |
| 10 | **Collaborator upload page only accepts `.pdf` files (input `accept=".pdf"`) but the server has no mime-type check.** A user could bypass the client restriction (e.g., via curl) and upload non-PDF files. Server-side validation is needed. | `(public)/upload/[token]/page.tsx` L127, `api/collaborator/upload/route.ts` |
| 11 | **`PostCloseView` document download creates DOM elements dynamically** (`document.createElement("a")`) instead of using Next.js patterns. Also, the `handleDownload` function has no error handling — if `createSignedUrl` fails, the user gets no feedback. | `PostCloseView.tsx` L21-35 |
| 12 | **CashToCloseFinalizer wire due date is naively calculated as closing_date minus 1 day.** Wire transfers typically need to arrive 1-2 business days before closing (not calendar days). If closing is on a Monday, the wire would need to arrive Friday, not Sunday. | `CashToCloseFinalizer.tsx` L25-27 |
| 13 | **SigningAppointment fires a mutation on every keystroke** in the date and location fields via `onChange`. Should debounce or use `onBlur` to reduce API calls. | `SigningAppointment.tsx` L36-37, L49-50 |
| 14 | **CollaboratorLinkDialog has no error handling for the create mutation.** If `createLink.mutate()` fails, the user sees no error feedback — the button just stops showing "Creating..." with no indication of failure. | `CollaboratorLinkDialog.tsx` L77-81 |
| 15 | **Collaborator validate API leaks `deal_id` to the public.** The response includes `dealId: link.deal_id`, which exposes an internal UUID to unauthenticated users. This is not needed by the upload page and should be removed from the response. | `api/collaborator/validate/route.ts` L46 |

### Low — Defer

| # | Issue | Location |
|---|-------|----------|
| 16 | **Accessibility: No `aria-label` on icon-only buttons** (copy link, revoke link, cycle condition status, advance funding step). Screen readers get no context on what these buttons do. | `CollaboratorLinkDialog.tsx`, `UnderwritingConditionsFinal.tsx`, `FundingRecordingTimeline.tsx` |
| 17 | **Accessibility: Walkthrough and wire verification checkboxes use native `<input type="checkbox">` without `aria-label`.** They rely on label wrapping, which is correct, but the label text is long and the checkbox lacks a short accessible name. | `FinalWalkthroughChecklist.tsx`, `WireTransferSafeSend.tsx` |
| 18 | **FundingRecordingTimeline step icons use `Loader2` with `animate-spin` for "in-progress" status.** This is a spinner, but the step may stay "in-progress" for days — a spinning icon for a days-long state is confusing UX. A static "in-progress" icon (e.g., clock) would be more appropriate. | `FundingRecordingTimeline.tsx` L10 |
| 19 | **ClosingAlerts "all clear" banner uses `text-primary-foreground` on `bg-primary/5` background.** Depending on the theme, `primary-foreground` might be white-on-light-green, causing contrast issues. Should use `text-primary` instead. | `ClosingAlerts.tsx` L118 |
| 20 | **Same color concern for InsuranceBinderVerification and FinalWalkthroughChecklist** — both use `text-primary-foreground` on `bg-primary/5` containers. | `InsuranceBinderVerification.tsx` L92, `FinalWalkthroughChecklist.tsx` L59 |
| 21 | **CollaboratorLinkDialog `<select>` element uses basic HTML styling** rather than a ShadCN Select component, creating visual inconsistency with the rest of the app. | `CollaboratorLinkDialog.tsx` L106-111 |
| 22 | **Missing copilot integration on most closing cards.** Only `ClosingDisclosureReview` has an "Ask Homie" button. Other cards (walkthrough, wire transfer, underwriting conditions, funding timeline) would benefit from contextual copilot questions. | All closing components except `ClosingDisclosureReview.tsx` |
| 23 | **Post-Close view has no copilot chip suggestions.** Users in post-close have no guided questions to ask Homie (e.g., "What documents should I keep?", "When is my first mortgage payment?"). | `PostCloseView.tsx` |
| 24 | **`closing_metadata` JSONB migration has no validation constraint.** Any arbitrary JSON can be stored in the column. Should add a JSON schema check constraint or at minimum a `NOT NULL` constraint with the default. | `003_closing_metadata.sql` |
| 25 | **Collaborator upload page shows "Powered by HomeBuyer Pro"** but the product is branded "HomieAi" elsewhere. Inconsistent branding. | `(public)/upload/[token]/page.tsx` L147 |
| 26 | **`uploads_received` counter update in upload route is not atomic.** `(link.uploads_received ?? 0) + 1` reads the count from the previously-fetched row and writes it back. Concurrent uploads could produce a wrong count. Should use `uploads_received + 1` in a raw SQL increment or use `.rpc()`. | `api/collaborator/upload/route.ts` L72-74 |
| 27 | **No keyboard navigation support for FundingRecordingTimeline step advancement.** The step icons are buttons but have no visible focus ring or keyboard shortcut. | `FundingRecordingTimeline.tsx` L53 |
| 28 | **`WireTransferSafeSend` receipt doc lookup scans all documents on every render.** Uses `.find()` on the full `allDocs` array. For large document lists this is O(n) on every render — could memoize. | `WireTransferSafeSend.tsx` L29-31 |

---

## State Management Compliance

| Layer | Items | Compliance |
|-------|-------|------------|
| **Server (TanStack Query)** | Deal, documents, deadlines, loan estimates, repair items, insurance info, collaborator links | PASS — all fetched via existing query hooks, invalidated on mutation |
| **Computed (never stored)** | Cash-to-close, monthly P&I, LE vs CD variance, business-days remaining, alert generation, walkthrough counts | PASS — derived at render time from server data |
| **Persisted (Supabase)** | `closing_metadata` JSONB on deals table, `collaborator_links` table rows, uploaded documents | PASS — single source of truth |
| **Client (Zustand)** | `currentPhase`, `activeDealId`, `setCopilotOpen`, `openViewer`, `setActiveSidebarItem` | PASS — UI-only state, no business logic |
| **New Zustand state** | None added | PASS — no unnecessary client state |

---

## Testing Checklist

### Closing Dashboard Access
- [ ] Navigate to a deal in escrow phase, click "Proceed to Closing"
- [ ] Verify closing dashboard loads with all 10 cards
- [ ] Verify DealSummaryCard displays at top
- [ ] Verify 3-column layout on xl screens, single column on mobile
- [ ] Verify loading skeleton shows while data is fetching

### Closing Alerts
- [ ] Alerts show wire fraud warning when wire is pending
- [ ] Alerts show "Closing is TODAY" when closing date is today
- [ ] Alerts show "CD not received" when no CD uploaded
- [ ] Alerts show insurance binder warning when not bound
- [ ] Alerts show title report missing when no title doc
- [ ] Alerts sorted by severity (destructive > warning > info)
- [ ] "All on track" banner shows when no alerts

### Closing Disclosure Review
- [ ] Shows "Pending" when no CD uploaded
- [ ] After uploading CD in Documents tab, shows CD review card
- [ ] 3-business-day waiting period countdown displays correctly
- [ ] LE vs CD variance table shows when chosen LE exists
- [ ] Tolerance flags appear on out-of-range variances
- [ ] "I have received and reviewed the CD" checkbox toggles and persists
- [ ] "Open CD" button opens document viewer
- [ ] "Explain Differences" button opens copilot with prefilled question

### Cash to Close Finalizer
- [ ] Shows computed cash-to-close amount from chosen LE
- [ ] Line-item breakdown: down payment, lender fees, third-party fees, points, EMD credit
- [ ] Wire due date shows (closing date minus 1 day)
- [ ] Escrow company info displays if set
- [ ] Wire fraud warning banner always present
- [ ] "Confirm Amount" button toggles state and shows checkmark when confirmed

### Signing Appointment
- [ ] Date/time picker saves value
- [ ] Location text field saves value
- [ ] "What to Bring" checklist displays 4 items
- [ ] "Confirm Appointment" button toggles and shows checkmark

### Final Walkthrough Checklist
- [ ] 10 room categories displayed
- [ ] Checkboxes toggle and persist across page reloads
- [ ] Counter updates ("X of 10 checked")
- [ ] "Walkthrough complete" banner shows when all 10 checked

### Insurance Binder Verification
- [ ] Shows "No insurance information" when none exists
- [ ] Displays carrier, status, premium, effective date when info exists
- [ ] Inline doc upload zone works for binder
- [ ] "Mark as Bound" creates insurance info if none exists
- [ ] Status badge changes to "Bound" after marking
- [ ] Verified banner appears when bound/verified

### Underwriting Conditions
- [ ] Empty state shows message
- [ ] Add a condition via text input + Enter or plus button
- [ ] Condition appears with red "outstanding" icon
- [ ] Click icon to cycle: outstanding -> submitted -> cleared
- [ ] "Remove" button appears on hover
- [ ] Counter shows "X/Y cleared"
- [ ] "Clear to Close" banner appears when all conditions cleared

### Wire Transfer SafeSend
- [ ] Wire fraud prevention banner always visible
- [ ] Wire amount shows computed cash-to-close
- [ ] 3 verification steps listed with checkboxes
- [ ] "Mark as Wired" button disabled until all 3 checked
- [ ] After marking wired, checkboxes become disabled
- [ ] "Wire transfer marked as sent" confirmation shows
- [ ] Wire receipt upload zone available before wiring

### Title & Escrow Final Checks
- [ ] Title report shows "Missing" badge when not uploaded
- [ ] Title report shows "Uploaded" badge with AI summary when present
- [ ] "View Full Report" button opens document viewer
- [ ] "Acknowledge & Continue" button toggles acknowledgment state
- [ ] Escrow company name displays when set

### Funding & Recording Timeline
- [ ] 4 steps shown: Lender Funds, Escrow Disburses, County Records, Keys Released
- [ ] Click step icon to advance: pending -> in-progress -> complete
- [ ] Completed steps show date stamp
- [ ] Connector lines change color when step completes
- [ ] "I've Picked Up the Keys!" button appears when all steps complete
- [ ] Clicking keys button transitions deal to post-close phase

### Collaborator Upload Links
- [ ] "Share Upload Link" button visible on Documents page header
- [ ] Dialog opens with role selector and optional email field
- [ ] Click "Generate Link" creates a new link
- [ ] Link appears in list with "Active" badge
- [ ] Copy button copies URL to clipboard
- [ ] Revoke button (X) changes link status to "Revoked"
- [ ] Expired links show "Expired" badge
- [ ] Upload count updates after collaborator uploads

### Public Upload Page
- [ ] Visit generated link in incognito browser (no auth)
- [ ] Page shows property address and collaborator role
- [ ] Requested documents list shows if specified
- [ ] Drag and drop a PDF — upload indicator appears
- [ ] "Done" status shows on successful upload
- [ ] "Failed" status shows on upload error
- [ ] Click to browse works via file picker
- [ ] Expired link shows "Link Unavailable" error page
- [ ] Revoked link shows "Link Unavailable" error page
- [ ] Invalid token shows "Link Unavailable" error page

### Collaborator API Security
- [ ] `POST /api/collaborator/upload` rejects requests without token (400)
- [ ] `POST /api/collaborator/upload` rejects expired tokens (410)
- [ ] `POST /api/collaborator/upload` rejects revoked tokens (410)
- [ ] `POST /api/collaborator/upload` rejects invalid tokens (404)
- [ ] `GET /api/collaborator/validate` rejects missing token (400)
- [ ] Uploaded document appears in buyer's Documents tab
- [ ] Uploaded document triggers AI processing pipeline

### Post-Close View
- [ ] Congratulations banner shows with property address
- [ ] Deal summary shows purchase price, down payment, loan amount, rate, monthly P&I, cash-to-close
- [ ] Document archive lists all deal documents
- [ ] Download button generates signed URL and triggers download
- [ ] Empty state shows when no documents
- [ ] "Equity Tracking" and "Homeowner Tools" cards show "Coming Soon"
- [ ] Thank-you footer displays

### Phase Transitions
- [ ] "Proceed to Closing" from escrow transitions to closing phase
- [ ] "Recording Complete — Keys in Hand!" transitions to post-close
- [ ] "I've Picked Up the Keys!" in funding timeline also transitions to post-close
- [ ] Phase transition updates deal record and invalidates relevant queries
- [ ] Sidebar phase indicator updates after transition

### Layout & Consistency
- [ ] All cards use `CollapsibleCard` with consistent styling (rounded-xl, border-border, shadow-sm)
- [ ] Cards expand/collapse independently
- [ ] 3-column grid on xl screens, single column on mobile
- [ ] Typography consistent with escrow dashboard phase
- [ ] No flash of content or layout shift during loading
