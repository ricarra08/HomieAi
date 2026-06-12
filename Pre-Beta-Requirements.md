# Phazr — Pre-Beta Requirements

## Why This Document Exists

Solo founder. Feature-intensive app. No QA team. Can't ship 100% bug-free — but can't ship broken trust either.

The core insight: **not all bugs cost the same.** A layout glitch on the dashboard is annoying. A wrong number on a Loan Estimate explanation destroys trust with the buyer, the agent, and every professional in the transaction. The broker hears about it. Strategy A dies.

This document splits every feature into three tiers based on one question: **if this breaks, what does the user lose trust in?**

---

## Tier 1 — Trust-Critical (Must Work ~99%)

These features touch financial data, professional-facing surfaces, or first impressions. A bug here doesn't just lose a user — it loses the network effect. Test these thoroughly. Manual QA every flow. Edge-case test with real documents.

**The rule: if a bug here makes someone doubt the accuracy of their financial documents or the professionalism of the product, it's Tier 1.**

### 1.1 Document Processing Pipeline

**What it does:** Upload PDF → text extraction → classification → field extraction → AI summary → display results

**Why it's Tier 1:** This IS the product. Every other feature depends on this working correctly. A misclassified document or a wrong extracted number (interest rate, loan amount, cash-to-close) is a trust-breaking event that can't be patched retroactively — the user already saw the wrong answer.

**What to test:**
- [ ] Upload a real Loan Estimate PDF — verify classification, all extracted fields (loan amount, rate, APR, fees, cash-to-close), and AI summary accuracy
- [ ] Upload a real Closing Disclosure PDF — same field verification
- [ ] Upload a real inspection report — verify defect extraction, severity ratings
- [ ] Upload a scanned/image-based PDF — verify vision fallback works
- [ ] Upload a watermarked PDF — verify extraction still succeeds or fails gracefully
- [ ] Upload an HOA document — verify classification as "disclosure" not misclassified
- [ ] Upload a non-real-estate PDF (e.g., a random receipt) — verify it classifies as "other" and doesn't hallucinate fields
- [ ] Upload a 25MB file — verify it processes without timeout
- [ ] Upload a corrupted PDF — verify graceful error, not a crash
- [ ] Upload two documents rapidly — verify both process correctly (no race conditions)
- [ ] Verify AI summary doesn't hallucinate numbers not present in the document
- [ ] Verify extracted fields show `{value, confidence}` and low-confidence fields are visually flagged

**Key files:**
- `app/src/app/api/documents/process/route.ts`
- `app/src/lib/ai/extraction-schemas.ts`
- `app/src/components/documents/SlideOverViewer.tsx`

**Acceptable failure mode:** Processing takes longer than expected, summary is vague but not wrong, classification confidence is low but correct category is shown. **Unacceptable:** wrong numbers, hallucinated fields, silent failure with no error message.

---

### 1.2 LE vs CD Variance Detection

**What it does:** Compares Loan Estimate fields against Closing Disclosure fields, flags tolerance violations per TRID rules ($100 or 10%).

**Why it's Tier 1:** If this flags a false variance ("your lender overcharged you $2,000") or misses a real one, you've either caused unnecessary panic or failed at the core value prop. Either outcome erodes trust in the product's financial intelligence.

**What to test:**
- [ ] Upload a real LE + real CD from the same deal — verify all 7 fields compare correctly
- [ ] Manually create an LE, then upload a CD with known deltas — verify each variance is flagged
- [ ] Test tolerance boundaries: $99 delta (should pass), $101 delta (should flag)
- [ ] Test percentage tolerance: 9.9% delta (should pass), 10.1% delta (should flag)
- [ ] Verify the "no variances" state shows green checkmark, not an empty error
- [ ] Verify "Ask Homie to explain" prefills the copilot with the correct variance context
- [ ] Edge case: CD has fields the LE doesn't (e.g., PMI appears on CD but not LE) — verify graceful handling

**Key files:**
- `app/src/components/financing/LEvsCD.tsx`
- `app/src/lib/computed.ts` (`computeLEVariance()`)

**Acceptable failure mode:** Comparison shows "unable to compare — missing CD data" if fields aren't extracted. **Unacceptable:** wrong delta calculations, missed tolerance violations, false flags.

---

### 1.3 Free `/explain` Tool (Strategy B First Impression)

> **DESCOPED FROM BETA (2026-06-12, strategy ruling):** the public ungated contract-explainer
> is deferred indefinitely — Florida UPL exposure is criminal (Fla. Stat. §454.23), the niche is
> already occupied by free tools, and counsel review is a precondition for any public explainer
> surface. It is NOT part of the launch gate; the Golden Path below does not include it. The
> checklist is preserved for whenever a (likely condo-document) wedge ships post-counsel.

**What it does:** Public, ungated page. Upload any PDF, get instant AI classification + explanation. No signup.

**Why it's Tier 1:** This is likely the first time a buyer or agent encounters Phazr. The simulation showed privacy and accuracy are the top two objections. If the first experience is a broken upload, a wrong classification, or a confusing error — they leave and never come back. There is no second first impression.

**What to test:**
- [ ] Upload without being logged in — verify no auth redirect, no error
- [ ] Upload a Loan Estimate — verify classification, extracted fields, plain-English summary display
- [ ] Upload an inspection report — verify it works for non-financial docs too
- [ ] Upload 3 documents in a row from the same IP — verify rate limit kicks in with a clear, non-hostile message
- [ ] Upload a 4th document — verify rate limit message is helpful ("Come back tomorrow or create a free account")
- [ ] Upload a file > 10MB — verify rejection with clear size message
- [ ] Upload a non-PDF (JPEG, DOCX) — verify rejection with clear format message
- [ ] Verify results are NOT saved — refresh the page, results should be gone
- [ ] Verify the CTA to create a workspace is visible and functional after results display
- [ ] Verify the privacy/accuracy/free messaging (from Section 0.4 of the distribution plan) is visible
- [ ] Test on mobile — this is where most buyers will use it (texted a link from their agent)

**Key files:**
- `app/src/app/(public)/explain/page.tsx` *(to be built)*
- `app/src/app/api/documents/explain/route.ts` *(to be built)*

**Acceptable failure mode:** Slow processing with a loading indicator, vague summary on an unusual document type. **Unacceptable:** crash, blank page, wrong document type, no error message on failure.

---

### 1.4 Collaborator Upload Links (Professional-Facing Surface)

**What it does:** Buyer generates a link, sends it to their lender/inspector/title officer. Professional uploads documents through a branded page without creating an account.

**Why it's Tier 1:** This is what lenders, title officers, and inspectors see. These are the people whose word-of-mouth drives Strategy A. A broken upload link, a confusing page, or a failed upload makes the buyer look bad for recommending the tool — and the professional will never mention it to another agent.

**What to test:**
- [ ] Generate a collaborator link — verify URL is copyable, opens in an incognito window
- [ ] Visit a valid link — verify property address and requested docs display correctly
- [ ] Upload a PDF through the link — verify it appears in the buyer's document list
- [ ] Verify uploaded document auto-triggers processing pipeline (classification + extraction)
- [ ] Visit an expired link (after 7 days) — verify clear expiry message, not a crash
- [ ] Visit a revoked link — verify clear message
- [ ] Upload 10 files rapidly — verify rate limit message is clear
- [ ] Upload from mobile — lenders often forward links to their phone
- [ ] Verify "Powered by Phazr" branding is visible and links somewhere useful
- [ ] Verify the upload confirmation message is professional (this is a lender/title officer seeing it)

**Key files:**
- `app/src/app/(public)/upload/[token]/page.tsx`
- `app/src/app/api/collaborator/upload/route.ts`
- `app/src/app/api/collaborator/validate/route.ts`
- `app/src/components/documents/CollaboratorLinkDialog.tsx`

**Acceptable failure mode:** Upload takes a few seconds with a progress indicator. **Unacceptable:** upload silently fails, page crashes, link shows buyer's personal data to the professional.

---

### 1.5 Wire Fraud SafeSend

**What it does:** 3-step verification checklist before a buyer can mark wire transfer as sent. Requires verbal confirmation, receipt upload, and fraud acknowledgment.

**Why it's Tier 1:** Wire fraud is irreversible. The FBI tracks $400M+ in annual losses. If this feature has a bug that lets a buyer skip verification steps, or if the UI is confusing enough that a buyer doesn't complete the checklist, the consequences are real and catastrophic. This isn't a "trust in the product" issue — it's a "trust in the safety of the buyer's money" issue.

**What to test:**
- [ ] Verify "Mark as Wired" button is disabled until ALL 3 checkboxes are checked AND receipt is uploaded
- [ ] Try to bypass: check 2 of 3 boxes — button must remain disabled
- [ ] Try to bypass: check all 3 boxes but don't upload receipt — button must remain disabled
- [ ] Upload a wire receipt, check all boxes, mark as wired — verify state persists on page reload
- [ ] Verify the wire amount displayed matches the transaction's cash-to-close
- [ ] Verify the fraud warning text is visible and prominent (not hidden below fold)
- [ ] After marking as wired, verify checkboxes are disabled (can't un-wire)

**Key files:**
- `app/src/components/closing/WireTransferSafeSend.tsx`

**Acceptable failure mode:** None. This must work correctly every time. **Unacceptable:** any state where a user can mark "wired" without completing all verification steps.

---

### 1.6 Auth / Login / Signup Flow

**What it does:** Email/password signup, email verification, login, session management, onboarding role selection.

**Why it's Tier 1:** If a buyer can't log in, nothing else matters. If a buyer signs up and gets stuck in a redirect loop, they'll assume the product is broken and leave. Agent Zero's buyer is not going to troubleshoot auth issues.

**What to test:**
- [ ] Sign up with a new email — verify confirmation email arrives
- [ ] Click confirmation link — verify it redirects to login (not a broken page)
- [ ] Log in — verify redirect to onboarding (if no profile) or dashboard (if profile exists)
- [ ] Select role (buyer), enter name, submit — verify redirect to dashboard
- [ ] Log out — verify session is cleared, protected routes redirect to login
- [ ] Try to access `/dashboard` without being logged in — verify redirect to login
- [ ] Try to access `/onboarding` with an existing profile — verify redirect to dashboard (no double onboarding)
- [ ] Login with wrong password — verify clear error message
- [ ] Login with unverified email — verify clear message about checking email

**Key files:**
- `app/src/app/(auth)/login/page.tsx`
- `app/src/app/(auth)/signup/page.tsx`
- `app/src/app/(onboarding)/onboarding/page.tsx`
- `app/src/middleware.ts`
- `app/src/lib/supabase/middleware.ts`

**Acceptable failure mode:** Slow redirect, email takes a minute to arrive. **Unacceptable:** redirect loops, silent failures, stuck on blank page.

---

## Tier 2 — Should Work Reliably (~90%)

These features matter for the day-to-day experience but a bug here is annoying, not trust-breaking. Users will report it, you'll patch it. Ship with confidence that these work in the golden path, but don't burn days on edge cases.

### 2.1 AI Copilot (Homie)

**What to verify works:**
- [ ] Open copilot panel, send a message, get a streaming response
- [ ] Copilot is phase-aware (ask about deadlines in escrow, get escrow-relevant answer)
- [ ] Citations appear when copilot references a document
- [ ] Quick action buttons send the correct prefilled message
- [ ] "Ask Homie" from LEvsCD and ClosingDisclosureReview prefills correctly
- [ ] Message history persists across page reloads

**Acceptable bugs:** Occasional slow response, citations that reference the wrong page number, quick actions that could be more contextual, markdown rendering glitches in complex responses.

**Key files:**
- `app/src/components/copilot/AICopilot.tsx`
- `app/src/app/api/copilot/chat/route.ts`
- `app/src/lib/ai/context-engine.ts`
- `app/src/lib/ai/system-prompts.ts`

---

### 2.2 Deadline / Contingency Tracking

**What to verify works:**
- [ ] Deadlines auto-generate from offer contingency days when transitioning to escrow
- [ ] Urgency colors are correct (green > 3 days, yellow 0-3, red overdue)
- [ ] "Mark as Done" and "Waive" update status and persist
- [ ] Progress bars show reasonable time-elapsed percentages
- [ ] Closing date deadline appears correctly

**Acceptable bugs:** Progress bar off by a pixel, timezone edge case where "due today" shows as "due tomorrow," custom deadline form has a quirky UX.

**Key files:**
- `app/src/components/escrow/ContingencyCountdown.tsx`
- `app/src/lib/computed.ts` (`computeDeadlineUrgency()`)

---

### 2.3 Loan Estimate Comparison Table

**What to verify works:**
- [ ] Manual LE entry form saves correctly with all fields
- [ ] LE auto-populated from uploaded LE PDF matches extracted values
- [ ] Side-by-side comparison displays selected LEs correctly
- [ ] "Choose" button marks the selected LE and persists
- [ ] Cash-to-close calculation is mathematically correct

**Acceptable bugs:** Comparison table column widths off on smaller screens, lock status badge doesn't update immediately, rate formatting shows too many decimals.

**Key files:**
- `app/src/components/financing/LECard.tsx`
- `app/src/components/financing/LEComparisonTable.tsx`
- `app/src/components/financing/LEFormModal.tsx`
- `app/src/components/financing/CashToClose.tsx`

---

### 2.4 Escrow Components (Inspection, Appraisal, Earnest Money, Repairs)

**What to verify works:**
- [ ] Inspection checklist displays extracted defects from uploaded inspection report
- [ ] Repair tracker: add, edit status (pending → requested → agreed → completed), set costs
- [ ] Earnest money tracker: status transitions work (pending → sent → confirmed)
- [ ] Appraisal status shows appraised value from extracted document
- [ ] Red flag summary aggregates critical findings correctly
- [ ] Escrow alerts show for overdue deadlines and missing critical documents

**Acceptable bugs:** Repair cost formatting issues, disclosure tracker checkbox state not persisting on slow connections, earnest money "upload proof" button layout quirk.

**Key files:**
- `app/src/components/escrow/*.tsx` (all 11 components)
- `app/src/lib/hooks/use-escrow-data.ts`

---

### 2.5 Closing Components (CD Review, Signing, Walkthrough, Underwriting)

**What to verify works:**
- [ ] CD review shows 3-business-day waiting period countdown
- [ ] Signing appointment date/time saves and displays
- [ ] Final walkthrough checklist items are checkable and persist
- [ ] Underwriting conditions show status (outstanding → submitted → cleared)
- [ ] Funding/recording timeline renders in correct order

**Acceptable bugs:** Countdown timer off by a few hours, walkthrough checklist reset on page refresh, insurance binder status badge color wrong.

**Key files:**
- `app/src/components/closing/*.tsx` (all 10 components)
- `app/src/lib/hooks/use-closing-data.ts`

---

### 2.6 Phase Transitions

**What to verify works:**
- [ ] Transition from shopping → offer renders offer components
- [ ] Transition from offer → escrow auto-generates deadlines from contingencies
- [ ] Transition from escrow → closing renders closing components
- [ ] Dashboard correctly shows the current phase's components
- [ ] Phase buttons in ProgressStepper highlight the active phase

**Acceptable bugs:** Brief flash of wrong phase content during transition, phase button active state slightly delayed.

**Key files:**
- `app/src/components/transaction/PhaseDashboard.tsx`
- `app/src/components/layout/ProgressStepper.tsx`

---

## Tier 3 — Polish Later (80% Is Fine)

These features are real but secondary. A bug here is a nuisance, not a dealbreaker. Ship them as-is and fix based on user reports.

### 3.1 Dashboard Layout & UI Polish
- Card grid alignment on different screen sizes
- Sidebar collapse/expand animation smoothness
- Skeleton loading states during data fetches
- Empty state messages when no data exists
- Tooltip content and positioning

### 3.2 Shopping / Saved Homes
- Add property form field validation
- Saved homes list sorting/filtering
- Status badge (interested/toured/offer-pending) state management
- Delete a saved home

### 3.3 Post-Close View
- Entire post-close phase — by definition, the transaction is done. Bugs here have zero distribution impact.

### 3.4 Guest / Try Mode (`/try`)
- Transaction preview accuracy
- CTA button placement and messaging
- Form validation edge cases

### 3.5 Landing Page
- Animation performance
- Demo component interactivity
- Responsive layout on unusual screen sizes
- Testimonial section (placeholder content is fine for beta)

### 3.6 Copilot Quick Actions
- Whether the right quick actions show for the right page/phase combination
- Whether all quick actions produce useful copilot responses

### 3.7 Document Smart Tabs
- Whether filtering by category catches every document type correctly
- Tab count badges accuracy

### 3.8 Draft Questions Feature
- Whether generated questions are contextually relevant
- Whether recipient suggestions (agent vs. lender vs. title) are accurate

---

## Pre-Launch Checklist (Do Before Agent Zero's First Buyer)

This is the minimum "does the golden path work?" walkthrough. Do this with a real Loan Estimate and a real inspection report, not test data.

### The Golden Path (30-minute manual test)

1. **Sign up** with a new email → verify email → log in → select "buyer" → land on dashboard
2. **Create a transaction** → enter property address, price, closing date
3. **Upload a Loan Estimate PDF** → verify it classifies correctly, extracted fields look right, summary makes sense
4. **Upload an inspection report PDF** → verify classification, defects extracted
5. **Generate a collaborator link** for "lender" → open in incognito → upload a document through it → verify it appears in the buyer's doc list
6. **Open the copilot** → ask "What does my loan estimate say about my interest rate?" → verify it references the uploaded LE
7. **Manually enter a second LE** → compare side-by-side → verify math
8. **Transition to escrow** → verify deadlines auto-generate
9. **Upload a Closing Disclosure** → verify LE vs CD variance flags the right deltas
10. **Open WireTransferSafeSend** → verify all 3 checkboxes must be checked + receipt uploaded before "Mark as Wired" enables

If all 10 steps work with real documents, ship the beta.

---

## What "Beta" Means Per Audience

| Audience | Label | What they see |
|----------|-------|--------------|
| **Buyers** | "Free" or "Early Access" | Don't call it beta. Anxious homebuyers don't want to beta-test their closing documents. |
| **Agents** | "Beta" is fine | "You're one of the first agents to get access" is a feature, not a warning. |
| **The broker** | Never mention beta | The broker hears "untested tool my agents are experimenting with on real clients." Frame as "new tool that's been working well for Agent Zero's buyers." |
| **Lenders / Title** | Don't label at all | They see the collaborator upload page. It should look polished and professional. No beta badges. |

---

## Bug Response Protocol (Post-Launch)

**Tier 1 bug reported:** Drop everything. Fix within 24 hours. Notify the affected user directly. If it affected extracted financial data, re-process the document and notify the buyer.

**Tier 2 bug reported:** Acknowledge within 24 hours. Fix within the week. Thank the reporter.

**Tier 3 bug reported:** Log it. Fix in the next batch of updates. Don't interrupt Tier 1/2 work.

**How bugs reach you:**
- Agent Zero reports directly (text/call — she's your first line of defense)
- In-app feedback mechanism — ✅ shipped 2026-06-12: "Report an issue" in the sidebar account menu (mailto)
- ~~Monitor PostHog~~ — analytics descoped to fast-follow (first post-launch task); until then:
- Check Supabase logs + Vercel function logs for failed API calls daily during the first 2 weeks (`lib/log.ts` emits structured `route`/`event` errors)
