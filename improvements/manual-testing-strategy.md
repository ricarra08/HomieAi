# Manual Testing Strategy

## HomieAi -- Comprehensive Workflow Tests

## Last Updated: April 14, 2026

---

This document defines **7 end-to-end workflows** that exercise every major feature in HomieAi. The workflows are designed as realistic user journeys that cut across phases and feature areas, maximizing coverage with minimal redundancy. A single tester should complete all 7 workflows in 2-3 hours.

**How to use this doc:**

1. Complete the Pre-Test Setup once per test session
2. Run Workflow 1 (golden path) first -- it creates the deal state that later workflows depend on
3. Run Workflows 2-7 in any order
4. Record pass/fail in the Results Summary table at the bottom

Checkboxes marked `[ ]` are **verification points**. Each step tells you what to DO and what to VERIFY.

---

## Pre-Test Setup

### Environment

- **Browser:** Chrome (latest) with DevTools open (Console + Network tabs)
- **Viewport:** Start at 1440px wide (desktop), narrow to 768px for responsive checks in Workflow 7
- **Incognito window:** Keep one ready for Workflow 4 (collaborator flow)

### Accounts

- **Test account:** Create a fresh account via `/signup` with a real email you can access (for email confirmation)
- **Supabase dashboard:** Have access at `https://dysmrgcjxisutholidcp.supabase.co` to verify DB state if needed

### Test Files

Prepare these PDFs before starting (any real or mock PDFs will work -- the AI pipeline classifies based on content):

- 1 purchase contract PDF (or any multi-page legal document)
- 2 loan estimate PDFs (different lenders if possible)
- 1 closing disclosure PDF
- 1 inspection report PDF (general home inspection)
- 1 appraisal PDF
- 1 non-PDF file (e.g., a `.docx` or `.png`) for error testing
- 1 large file (>25 MB) for size limit testing

### Reset State

To start clean:

1. Log out of any existing session
2. Optionally: in Supabase dashboard, delete rows from `deals`, `documents`, `deadlines`, `loan_estimates`, `repair_items`, `collaborator_links`, `copilot_messages` for your test user
3. Clear browser localStorage (removes Zustand persisted state)

---

## Workflow 1: First-Time Buyer -- Full Journey (Shopping to Post-Close)

**Goal:** Walk through the entire golden path from signup to keys in hand. This is the most important workflow and covers the widest surface area.

**Estimated time:** 45-60 minutes

### Part A: Authentication

1. Navigate to `/signup`
  - [x] Page loads with wheat background, white card, Bronze CTA button
  - [x] "Your data is encrypted and secure" message visible
  - [x] Link to `/login` present at bottom
2. Enter email, password (min 6 chars), and click **Sign Up**
  - [x] Success state shows "Check your email" message
  - [x] No console errors
3. Confirm email (check inbox, click confirmation link)
  - [x] Redirected to `/dashboard` after confirmation
4. Log out (if available) and navigate to `/login`
  - [x] Login page loads with same styling as signup
  - [x] Enter credentials and click **Sign In**
  - [x] Redirected to `/dashboard`
  - [x] Sidebar shows "Phazr" wordmark with 3 nav items: Dashboard, Documents, Financing
5. Open a new tab, navigate to `/dashboard`
  - [x] Session persists -- user is still logged in (no redirect to `/login`)
6. Navigate to `/login` while logged in
  - [x] Redirected away from login page to `/dashboard` (middleware protection)

### Part B: Shopping Phase

1. Verify the dashboard loads in Shopping phase
  - [x] ProgressStepper at top shows 5 phases: Shopping (active/mint), Offer, Escrow, Closing, Post-Close (gray)
  - [x] Shopping view shows 4 CollapsibleCards: Your Buy Box, Saved Homes, Affordability Estimate, Market Snapshot
  - [x] AI Copilot floating button visible (bottom-right, 56x56, Bronze)
2. Click **Add Property** button (Bronze)
  - [x] Dialog opens with form fields: Address, Price, Beds, Baths, Sqft, Notes
  - [x] Enter: "742 Evergreen Terrace", Price: 2, Beds: 3, Baths: 2, Sqft: 1800
  - [x] Click Add
  - [x] Dialog closes, property appears in Saved Homes list with "Active" badge
  - [x] Toast notification confirms save
3. Add a second property: "123 Oak Street", Price: 380000, Beds: 4, Baths: 2.5
  - [x] Both properties visible in Saved Homes
4. In the Affordability Estimate card, enter:
  - [x] Purchase price: 450000
    - [x] Down payment: 20%
    - [x] Computed values update (cash needed, approximate monthly payment)
5. Click **Move to Offer** on "742 Evergreen Terrace"
  - [x] Phase transitions to Offer
    - [x] ProgressStepper updates: Shopping (completed/mint), Offer (active/mint)

### Part C: Offer Phase

1. Verify Offer workspace loads
  - [x] "Offer Workspace" heading with "Offer in Progress" badge (Bronze)
    - [x] Property card shows "742 Evergreen Terrace"
    - [x] 4 CollapsibleCards: Offer Details, Contingencies, Supporting Documents, Offer Readiness
2. Fill in Offer Details:
  - [x] Offer price: $440,000
    - [x] EMD: $15,000
    - [x] Down payment: 20%
    - [x] Timeline: 30 days
    - [x] Fields accept input and display formatted values
3. In Contingencies card, enable:
  - [x] Inspection: 17 days (checked)
    - [x] Loan: 21 days (checked)
    - [x] Appraisal: 17 days (checked)
    - [x] Each contingency shows checkbox + day count input
4. Check Offer Readiness card
  - [x] Progress indicators show completion state for each checklist item
5. Click **Offer Accepted -- Start Escrow** (Bronze CTA)
  - [x] Deal is created (React Query mutation fires)
    - [x] Phase transitions to Escrow
    - [x] ProgressStepper updates: Shopping + Offer (completed), Escrow (active)

### Part D: Escrow Dashboard

1. Verify Escrow dashboard loads
  - [x] "Escrow & Due Diligence" heading with "Proceed to Closing" button
    - [x] DealSummaryCard shows "742 Evergreen Terrace", closing countdown badge
    - [x] Loading skeletons appear briefly before data loads
2. Check Contingency Countdown card
  - [x] 4 deadlines visible: inspection (17d), appraisal (17d), financing (21d), closing (30d)
    - [x] Progress bars show elapsed time relative to each deadline's total period
    - [x] Urgency colors: green for plenty of time, amber as deadline approaches
    - [x] "Ask Homie about my deadlines" button present
3. Mark the Inspection deadline as **Done**
  - [x] Deadline moves to Resolved section with strikethrough styling
    - [x] Other deadlines remain active
4. Check Earnest Money Tracker
  - [x] Shows $15,000 (from offer) with "Pending" status
    - [x] Wire fraud warning banner visible
    - [x] EMD countdown banner shows "Due by [date] (X days left)"
    - [x] Click **Mark as Sent** then **Mark as Confirmed**
    - [x] Status stepper advances: Pending -> Sent -> Confirmed
    - [x] Wire fraud warning disappears after confirmation
5. Check Escrow Alerts card
  - [x] Wire fraud warning (permanent) displayed
    - [x] Missing purchase contract warning present (we have not uploaded one yet)
    - [x] Alerts sorted by severity
6. Navigate to **Documents** (sidebar)
  - [x] Documents page loads with upload zone
    - [x] "Create a deal first" message NOT shown (deal exists)
    - [x] CollaboratorLinkDialog button ("Share Upload Link") visible in header
7. Upload the **purchase contract PDF** (drag and drop)
  - [x] File validation passes (PDF, under 25 MB)
    - [x] Upload progress/toast shows
    - [x] Document row appears with "uploaded" status badge (blue)
    - [x] Status changes to "processing" (spinner or indicator)
    - [x] After processing: status changes to "processed" (green)
    - [x] `doc_type` column shows "purchase_contract"
    - [x] Category auto-assigned (offer)
8. Upload the **inspection report PDF**
  - [x] Classified as "inspection_report"
    - [x] Category assigned to "inspections"
9. Navigate back to **Dashboard**
  - [x] Escrow dashboard reloads with updated data
    - [x] Escrow Alerts: "Missing purchase contract" warning is GONE
    - [x] Inspection Checklist: General inspection now shows document chip with condition badge and findings count
10. Check Red Flag Summary
  - [x] If inspection report had major findings: card appears with findings listed
    - [x] Each finding shows severity badge, description
    - [x] "Add to repairs" (+) button present per finding
11. Click "+" on a finding to add it to Repairs
  - [x] Repair item appears in Repair Tracker card
    - [x] Change status from pending -> requested -> agreed
    - [x] Enter agreed cost (failing)
    - [x] Total costs update at bottom of card
12. Check Disclosure Tracker
  - [x] TDS, NHD, Lead Paint show "Missing" badge (required)
    - [x] HOA shows "HOA Documents (if applicable)" with "Optional" badge (lighter styling)

### Part E: Financing

1. Navigate to **Financing** (sidebar)
  - [x] Page loads with "Add Loan Estimate" button (Bronze)
    - [x] Empty state: "No loan estimates yet..."
2. Click **Add Loan Estimate**, fill in manually:
  - [x] Lender: "Wells Fargo"
    - [x] Product: "30-Year Fixed"
    - [x] Loan amount: $352,000
    - [x] Rate: 6.5%
    - [x] Down payment: $88,000
    - [x] Lender fees: $3,200
    - [x] Third-party fees: $2,800
    - [x] Points: 0
    - [x] Lock status: Floating
    - [x] Leave cash_to_close **blank**
    - [x] Click Save
    - [x] LE card appears in grid with lender name, rate, loan amount
3. Go to **Documents**, upload **Loan Estimate PDF #1**
  - [x] After processing: LE card auto-created in Financing tab
    - [x] Card shows "Auto-extracted from PDF" banner
    - [x] Fields populated from PDF extraction
4. Go to **Documents**, upload **Loan Estimate PDF #2**
  - [x] Second auto-extracted LE card appears
5. Return to **Financing**
  - [x] 3 LE cards visible in grid (1 manual + 2 auto-extracted)
6. Click **star icon** on Wells Fargo card to mark as **Chosen**
  - [x] Card shows "Chosen" indicator
    - [x] Cash-to-Close section appears below the grid
7. Check Cash-to-Close breakdown
  - [x] Shows down payment ($88,000), lender fees, third-party fees, points
    - [x] Sticky footer at bottom shows total cash-to-close
    - [x] For Wells Fargo with blank cash_to_close field: footer computes fallback from down payment + fees
8. Select 2 LE cards for comparison (click **Compare** checkboxes)
  - [x] Comparison table appears when 2+ selected
    - [x] Side-by-side columns with all fields
    - [x] Toggle optimization modes (Lowest Rate / Lowest Fees / Lowest Monthly)
    - [x] Best-value cells highlighted per mode
9. Click **"Ask Homie about these differences"**
  - [x] Copilot panel opens
    - [x] Question auto-sends with comparison context
    - [x] Response streams in with relevant analysis
10. Monthly P&I verification for Wells Fargo:
  - [x] Loan: $352,000, Rate: 6.5%, 30-year
    - [x] Expected monthly P&I: ~$2,225
    - [x] Displayed value matches (within $5 of $2,225)

### Part F: Closing Phase

1. Navigate to **Dashboard**, click **Proceed to Closing**
  - Phase transitions to Closing
    - ProgressStepper: Shopping/Offer/Escrow (completed), Closing (active)
    - 10 closing cards load in 3-column grid (xl) or single column (smaller)
    - DealSummaryCard at top, Closing Alerts below it
2. Check Closing Alerts
  - Wire fraud warning present
    - "CD not received" alert (no CD uploaded yet)
    - Insurance binder warning
    - Title report missing alert
3. Upload a **Closing Disclosure PDF** in Documents tab
  - Classified as "closing_disclosure"
    - After processing: extracted_fields populated
4. Return to Dashboard (Closing phase)
  - Closing Disclosure Review card now shows CD data
    - 3-business-day waiting period countdown displays
    - "I have received and reviewed the CD" checkbox works and persists
    - LE vs CD variance table shows (since we have a chosen LE)
    - Tolerance flags appear on out-of-range variances
5. Check Cash to Close Finalizer
  - Computed cash-to-close from chosen LE minus EMD credit
    - Wire due date shows (closing date minus 1 day)
    - Wire fraud banner present
    - "Confirm Amount" toggles and shows checkmark
6. Fill in Signing Appointment
  - Date: pick a date
    - Location: "Downtown Title Office"
    - Values save (check: navigate away and back, values persist)
    - "What to Bring" checklist shows 4 items
    - "Confirm Appointment" toggle works
7. Complete Final Walkthrough Checklist
  - Check all 10 rooms one by one
    - Counter updates: "1 of 10", "2 of 10", ... "10 of 10"
    - "Walkthrough complete" banner appears when all 10 checked
    - Checkboxes persist after page refresh
8. Test Underwriting Conditions
  - Type "Pay stub verification" and press Enter (or click +)
    - Condition appears with red "outstanding" icon
    - Click icon: outstanding -> submitted -> cleared
    - Icon changes through 3 states
    - Add 2 more conditions, clear all
    - "Clear to Close" banner appears when all cleared
    - Counter shows "3/3 cleared"
9. Test Wire Transfer SafeSend
  - Wire fraud prevention banner visible
    - Wire amount matches cash-to-close
    - Check all 3 verification steps
    - "Mark as Wired" button enables after all 3 checked
    - Click "Mark as Wired"
    - Checkboxes become disabled
    - "Wire transfer marked as sent" confirmation shows
10. Check Title & Escrow Final Checks
  - Title report shows "Missing" (unless uploaded)
    - "Acknowledge & Continue" toggle works
11. Advance Funding & Recording Timeline
  - Click through all 4 steps: Lender Funds -> Escrow Disburses -> County Records -> Keys Released
    - Each step advances: pending -> in-progress -> complete
    - Completed steps show date stamp
    - Connector lines change color
    - "I've Picked Up the Keys!" button appears when all 4 complete

### Part G: Post-Close

1. Click **"I've Picked Up the Keys!"** (or "Recording Complete -- Keys in Hand!" at top)
  - Phase transitions to Post-Close
    - ProgressStepper: all 5 phases completed (mint)
2. Verify Post-Close view
  - Congratulations banner with property address
    - Deal summary: purchase price ($440,000), down payment, loan amount, rate, monthly P&I, cash-to-close
    - Document archive lists all uploaded documents
    - Download button works (generates signed URL, triggers browser download)
    - "Equity Tracking" and "Homeowner Tools" show "Coming Soon"

---

## Workflow 2: AI Copilot Deep Test

**Goal:** Verify the copilot is phase-aware, context-grounded, streams correctly, and integrates with every card that has an "Ask Homie" button.

**Prerequisite:** Workflow 1 complete (deal exists with documents and data)

**Estimated time:** 20-25 minutes

### Phase-Aware Quick Actions

1. Navigate to Dashboard in **Shopping** phase (create a new deal or use Zustand to switch phase)
  - Open copilot (click Bronze floating button)
  - Quick action chips are Shopping-specific (e.g., general home buying questions)
  - Model used: gpt-4o-mini (check Network tab -- request payload)
2. Switch to **Escrow** phase (navigate to deal in escrow)
  - Quick action chips change: "What are my upcoming deadlines?", "Summarize my inspection findings", "Is my earnest money confirmed?", "What documents am I missing?"
  - Model used: gpt-4o (check Network tab)
3. Navigate to **Documents** page
  - Quick action chips change to document-specific options
4. Navigate to **Financing** page
  - Quick action chips change to financing-specific options

### Streaming Responses

1. Send a message: "What should I look for in a home inspection?"
  - Response streams token-by-token (not all at once)
  - Send button disabled during streaming
  - When streaming finishes, text stays visible -- NO blank flash before persisted message loads
  - Final message appears seamlessly in chat history
  - Scroll follows the streaming text (auto-scroll to bottom)
2. Send a follow-up: "How much earnest money should I put down?"
  - Previous message still visible in history
  - New response streams correctly
  - Chat history scrollable

### Context-Aware Responses

1. In Escrow phase, send: "What is my purchase price?"
  - Response references the actual deal data ($440,000 from Workflow 1)
  - Citations or deal references present in response
2. Send: "Summarize my inspection report"
  - Response references the uploaded inspection document
  - Mentions specific findings from the AI-extracted summary
3. Send: "Compare my loan estimates"
  - Response references actual LE data (Wells Fargo, rates, amounts)

### "Ask Homie" Integration Points

Test each "Ask Homie" button. For each, first **close the copilot**, then click the button:

1. **Contingency Countdown** -- "Ask Homie about my deadlines"
  - Copilot opens AND question auto-sends (prefill works even when panel was closed)
    - Response references actual deadline dates
2. **Red Flag Summary** -- "Ask Homie about these findings"
  - Copilot opens, question sends, response references inspection findings
3. **LE Comparison Table** -- "Ask Homie about these differences"
  - Copilot opens, question sends with comparison context
4. **LE vs CD Variance** -- "Ask Homie to explain these changes" (requires CD upload)
  - Copilot opens, question sends, response references specific variances
5. **Closing Disclosure Review** -- "Explain Differences"
  - Copilot opens, question sends about CD vs LE variance

### Document Viewer Prefill

1. Go to Documents, click a processed document to open detail view
  - Click **"Draft questions about this document"**
    - 3 contextual questions generated (with recipient tags like "agent", "lender")
    - Close the copilot
    - Click one of the generated questions
    - Copilot opens AND question sends

### Error States

1. Send a very long message (500+ characters)
  - Message sends without error, response is relevant
2. Send an empty message (just spaces)
  - Send button disabled or message not sent
3. Rapidly click send 3 times with the same message
  - Only one message sent (no duplicate messages in history)

---

## Workflow 3: Document Intelligence Pipeline

**Goal:** Exercise the full document upload, AI classification, extraction, summarization, and viewer features.

**Prerequisite:** Active deal exists

**Estimated time:** 20 minutes

### Upload and Classification

1. Navigate to **Documents**
  - Upload the **purchase contract PDF** (if not already uploaded)
  - Status progression: uploaded -> processing -> processed
  - `doc_type` auto-classified as "purchase_contract"
  - `category` auto-assigned (e.g., "offer")
  - `stage` auto-assigned (e.g., "offer" or "escrow")
  - Confidence score assigned (visible in detail view)
2. Upload a **loan estimate PDF**
  - Classified as "loan_estimate"
  - Category: "financing"
  - Auto-creates an LE row in the Financing tab
3. Upload the **closing disclosure PDF**
  - Classified as "closing_disclosure"
  - Category: "closing"
4. Upload the **inspection report PDF**
  - Classified as "inspection_report"
  - Category: "inspections"
5. Upload the **appraisal PDF**
  - Classified as "appraisal"

### Smart Tabs Filtering

1. Check Smart Tabs above the document list
  - Tabs appear for categories that have documents (e.g., All, Offer, Financing, Inspections, Closing)
  - Click each tab
  - Document list filters correctly per category
  - "All" tab shows all documents
  - Tab with no matching docs: handled gracefully (either hidden or shows empty)

### Stage Essentials

1. Check Stage Essentials card
  - Shows required document count for current stage (e.g., "X/Y required this stage")
  - Missing documents indicated

### Document Detail Viewer

1. Click on the processed **purchase contract** row
  - SlideOver viewer opens (or detail view replaces list)
  - Extracted fields panel shows key fields (buyer, seller, price, address, dates)
  - Low-confidence fields show amber indicator
  - AI summary displayed
  - "Draft questions about this document" button present
  - Document type and classification visible
2. Click on the processed **loan estimate**
  - Extracted fields show: lender, loan amount, rate, APR, fees, cash to close
  - Fields match the LE card data in Financing tab
3. Click on the **inspection report**
  - Extracted fields show major findings, condition assessments
    - AI summary highlights key issues

### Auto-Population Verification

1. Navigate to **Financing**
  - Auto-extracted LE from step 2 has correct field values matching the PDF
    - "Auto-extracted from PDF" banner on the card
    - Lock status correctly normalized (not "unlocked" mapped to "locked")

### Reclassification / Retry

1. If any document shows "failed" status:
  - Click the document row to open detail
    - Click **"Retry analysis"**
    - Status changes back to "processing"
    - After retry: status changes to "processed" (or "failed" again if PDF is unreadable)
    - Network tab: only ONE Supabase query fires on click, then ONE more after processing (no duplicate refetches)
2. If a document was misclassified:
  - Note the incorrect classification (this is a known limitation -- no manual reclassify UI yet)

### Draft Questions

1. Open any processed document detail, click **"Draft questions about this document"**
  - Loading state while questions generate
    - 3 questions appear, each with a recipient label (e.g., "Ask your agent", "Ask your lender")
    - Questions are contextually relevant to the document type
    - Click a question
    - Question sent to copilot with context

---

## Workflow 4: Collaborator Upload Flow

**Goal:** Test the external collaborator experience end-to-end, including link generation, public upload, and security.

**Prerequisite:** Active deal exists

**Estimated time:** 15-20 minutes

### Generate Collaborator Links

1. Navigate to **Documents**, click **"Share Upload Link"** button in header
  - CollaboratorLinkDialog opens
  - Role selector shows options: agent, lender, escrow, title, inspector, other
  - Optional email field present
2. Select role **"lender"**, optionally enter an email, click **Generate Link**
  - Link appears in the dialog list with "Active" badge
  - Link URL visible
3. Click **Copy** button on the generated link
  - URL copied to clipboard (verify by pasting somewhere)
  - Toast or visual confirmation of copy
4. Generate a second link for role **"agent"**
  - Both links visible in the list
  - Each has independent Active badge and copy button
5. Click **Revoke** (X button) on the agent link
  - Link status changes to "Revoked"
  - Copy button disabled or removed for revoked link

### Public Upload Page

1. Open an **incognito window** (no auth), paste the lender link URL
  - Page loads WITHOUT requiring login
  - Property address displayed
  - Collaborator role shown (e.g., "Lender")
  - Drag-and-drop zone visible
  - Requested documents list shown if specified
2. Drag and drop a PDF onto the upload zone
  - Upload indicator appears
  - "Done" status shows on successful upload
  - File name visible in upload list
3. Upload a second PDF via the **file picker** (click to browse)
  - Both uploads show "Done" status
4. Return to the **main browser** (authenticated), go to Documents
  - Both collaborator-uploaded documents appear in the list
  - Source type indicates "collaborator-upload" (if visible)
  - Documents trigger AI processing pipeline (status progresses to processed)
5. Check the collaborator link in the dialog
  - Upload count updated (shows 2)

### Token Security

1. In incognito, visit the **revoked agent link** URL
  - "Link Unavailable" error page shows
    - No upload zone visible
2. Modify the URL token to a random string (e.g., change last 4 chars)
  - "Link Unavailable" error page shows
3. If possible, test an expired link (change `expires_at` in Supabase to a past date)
  - "Link Unavailable" error page shows

### API Security (via DevTools or curl)

1. `POST /api/collaborator/upload` without a token parameter
  - Returns 400 error
2. `POST /api/collaborator/upload` with the revoked token
  - Returns 410 error
3. `GET /api/collaborator/validate` without a token
  - Returns 400 error
4. `GET /api/collaborator/validate` with a valid token
  - Returns deal info (property address, role)
    - NOTE (known issue): response includes `dealId` which leaks an internal UUID

---

## Workflow 5: Financing Comparison & Cash-to-Close

**Goal:** Deep dive into the financing comparison engine, LE vs CD variance, and cash-to-close calculations.

**Prerequisite:** Active deal with at least one LE

**Estimated time:** 15-20 minutes

### Manual LE Entry

1. Navigate to **Financing**, click **Add Loan Estimate**
  - Fill in all fields:
    - Lender: "Chase Bank"
    - Product: "30-Year Fixed"
    - Loan amount: $320,000
    - Rate: 6.25%
    - APR: 6.45%
    - Down payment: $80,000
    - Lender fees: $2,500
    - Third-party fees: $2,200
    - Points: $1,600
    - PMI monthly: $0
    - Lock status: Locked
    - Lock expires: 30 days from now
    - Cash to close: $16,000
    - Click Save
  - LE card appears with all entered values
  - Rate shown as "6.25%"
  - Lock status shows "Locked" with lock icon
2. Verify monthly P&I for Chase:
  - Loan: $320,000, Rate: 6.25%, 30-year
  - Expected: ~$1,970/month
  - Displayed monthly P&I within $5 of $1,970

### Auto-Populated LE from PDF

1. If not already done: upload a Loan Estimate PDF in Documents
  - Return to Financing -- new LE card auto-created
  - "Auto-extracted from PDF" banner visible
  - Fields populated from extraction (lender, rate, loan amount, fees)

### Edit an Existing LE

1. Click **Edit** (pencil icon) on the Chase card
  - Form modal opens pre-populated with Chase values
  - Change rate from 6.25% to 6.125%
  - Click **Update**
  - Card updates to show 6.125%
  - No duplicate LE card created (verify only one Chase card)

### Set Chosen LE

1. Click the **star icon** on Chase to mark as Chosen
  - Chase card shows "Chosen" indicator
  - Previously chosen LE (if any) loses its chosen indicator
  - Cash-to-Close section appears

### Compare LEs

1. Select **3 LEs** for comparison (click Compare checkboxes)
  - Comparison table appears below the grid
  - 3 columns side by side
2. Toggle **Lowest Rate** optimization mode
  - LE with lowest rate highlighted as best value
3. Toggle **Lowest Fees** optimization mode
  - LE with lowest total fees highlighted
4. Toggle **Lowest Monthly** optimization mode
  - LE with lowest monthly P&I highlighted
5. Deselect one LE (back to 2 selected)
  - Comparison table updates to show 2 columns
    - Deselect another (1 selected)
    - Comparison table disappears (requires 2+ to show)

### LE vs CD Variance

1. Ensure a **Closing Disclosure PDF** has been uploaded and processed
  - Navigate to Financing
    - LE vs CD Variance panel appears below Cash-to-Close (when chosen LE exists)
    - Variance table shows field-by-field comparison: LE value vs CD value vs delta
    - Tolerance flags (TRID) highlight out-of-range variances in red/amber
    - "Ask Homie to explain these changes" button present

### Cash-to-Close Breakdown

1. Check Cash-to-Close section (with Chase as chosen)
  - Line items: down payment ($80,000), lender fees ($2,500), third-party fees ($2,200), points ($1,600), EMD credit
    - Total cash-to-close computed correctly
    - If CD uploaded: CD cash-to-close value shown alongside
2. Check sticky footer
  - Fixed footer at bottom of page shows total cash-to-close
    - Value matches the breakdown total
    - Scroll page up and down
    - Footer stays fixed/sticky
3. Navigate to Documents, then back to Financing
  - Sticky footer reappears with correct value
    - Selected comparison LEs cleared (Zustand behavior)

---

## Workflow 6: Edge Cases & Error States

**Goal:** Verify the app handles failure paths gracefully.

**Estimated time:** 15-20 minutes

### File Upload Errors

1. In Documents, attempt to upload a **non-PDF file** (e.g., .docx, .png)
  - File rejected before upload
  - Error message: indicates PDF only
  - No document row created
2. Attempt to upload a **file larger than 25 MB**
  - File rejected with size limit error
  - No upload initiated
3. Upload a **very small PDF** (1-2 pages, minimal text)
  - Upload succeeds
  - Classification runs (may classify as "other" with lower confidence)
  - No crash if extracted text is very short

### Empty States

1. Navigate to **Financing** with no LEs (or clear all LEs)
  - "No loan estimates yet. Add one manually or upload a Loan Estimate PDF in Documents." message
  - No crash, no blank page
2. Navigate to **Documents** with no deal selected (clear `activeDealId` in Zustand via DevTools)
  - "Create a deal first to start uploading documents." message
  - Upload zone NOT shown
3. Navigate to **Dashboard** in Closing phase with no deal
  - "Create a deal first to access closing." message
4. Check Escrow Cash-to-Close with no chosen LE
  - Card visible with message: "Add a Loan Estimate in the Financing tab and mark one as 'Chosen'..."
  - No crash or hidden card

### Copilot Edge Cases

1. Open copilot with **no deal selected** and send a message
  - Response is still helpful (Shopping-level, no deal context)
  - No error thrown
2. Open copilot and check that **send button is disabled** when user ID has not loaded yet
  - On fresh page load, send button should be disabled momentarily until auth resolves

### Concurrent / Rapid Actions

1. In Financing, rapidly click **Mark as Chosen** on different LE cards (3 fast clicks)
  - Only one LE ends up as chosen
    - No console errors about race conditions
    - UI settles to a consistent state
2. In Closing walkthrough, rapidly toggle the same checkbox 5 times
  - Final state is consistent (toggled or untoggled)
    - No stale state displayed
3. During copilot streaming, navigate to a different page
  - No "setState on unmounted component" warning in console
    - Page navigates cleanly

### URL Direct Access

1. Log in, then directly visit `/documents` in the URL bar
  - Documents page loads correctly (not redirected away)
2. Directly visit `/financing`
  - Financing page loads correctly
3. Directly visit `/dashboard`
  - Dashboard loads in the correct current phase
4. While logged out, directly visit `/dashboard`
  - Redirected to `/login`

---

## Workflow 7: Cross-Cutting Concerns

**Goal:** Verify layout, navigation, responsiveness, state persistence, and query invalidation across the whole app.

**Estimated time:** 15-20 minutes

### Responsive Layout

1. Start at **1440px** wide (desktop)
  - Escrow dashboard: 2-column grid for card pairs
  - Closing dashboard: 3-column grid (3x3 cards)
  - Financing: 3-column LE card grid
2. Narrow to **1024px** (tablet)
  - Grids collapse to fewer columns
  - Sidebar still visible
  - Content remains readable, no horizontal overflow
3. Narrow to **768px** (mobile)
  - All grids collapse to single column
  - Cards stack vertically
  - Copilot button still accessible
  - Sticky footer still visible in Financing
4. Check that CollapsibleCards expand/collapse at all viewport sizes
  - Collapse a card at desktop, narrow to mobile -- card stays collapsed
  - Expand works at mobile width

### Sidebar Navigation

1. Click **Dashboard** in sidebar
  - Dashboard loads, sidebar highlights "Dashboard" with Bronze active state
2. Click **Documents** in sidebar
  - Documents page loads, sidebar highlights "Documents"
3. Click **Financing** in sidebar
  - Financing page loads, sidebar highlights "Financing"
4. Verify sidebar is **256px** wide and shows "Phazr" wordmark
  - Wordmark visible at top of sidebar

### Progress Stepper Accuracy

1. With deal in Escrow phase:
  - Stepper shows: Shopping (completed/mint), Offer (completed/mint), Escrow (current/mint), Closing (future/gray), Post-Close (future/gray)
  - Connected progress bars between phases fill appropriately
2. Transition to Closing:
  - Stepper updates immediately: Escrow now completed, Closing now current
3. Transition to Post-Close:
  - All 5 phases show as completed (mint)

### State Persistence

1. Refresh the page (Ctrl/Cmd + R)
  - User remains logged in (session cookie persists)
    - Active deal ID persists (Zustand persistence)
    - Current phase matches the deal's `current_phase` from DB
    - Copilot panel state (open/closed) may reset -- acceptable
2. Open a **new tab**, navigate to `/dashboard`
  - Same deal loaded, same phase displayed
    - Data matches the other tab
3. In Tab 1, upload a document in Documents
  - Switch to Tab 2, refresh
    - New document appears in Tab 2's document list (React Query refetch on focus)

### Query Invalidation

1. In Financing, add a new LE manually
  - Navigate to Escrow dashboard
    - Loan Progress card reflects the new LE (if chosen)
    - Cash-to-Close summary updates if the new LE is chosen
2. Upload a document in Documents
  - Navigate to Escrow dashboard
    - Relevant card updates (e.g., inspection doc shows in Inspection Checklist)
    - Alerts update (e.g., "missing purchase contract" clears)
3. Mark an LE as Chosen in Financing
  - Navigate to Closing dashboard
    - Cash to Close Finalizer shows the newly chosen LE data
    - Wire amount in SafeSend updates

### Global Footer

1. Scroll to the bottom of any page
  - GlobalFooter visible: 52px, white background, disclaimer text
    - Footer does not overlap with content or sticky elements

### Loading States

1. On a slower connection (throttle in DevTools to "Slow 3G"):
  - Navigate to Dashboard
    - Loading skeletons appear for cards while data fetches
    - No flash of empty state before data loads
    - Content renders progressively as queries resolve

---

## Results Summary


| #         | Workflow                             | Steps   | Pass | Fail | Blocked | Notes |
| --------- | ------------------------------------ | ------- | ---- | ---- | ------- | ----- |
| 1         | First-Time Buyer -- Full Journey     | 51      |      |      |         |       |
| 2         | AI Copilot Deep Test                 | 18      |      |      |         |       |
| 3         | Document Intelligence Pipeline       | 14      |      |      |         |       |
| 4         | Collaborator Upload Flow             | 17      |      |      |         |       |
| 5         | Financing Comparison & Cash-to-Close | 14      |      |      |         |       |
| 6         | Edge Cases & Error States            | 16      |      |      |         |       |
| 7         | Cross-Cutting Concerns               | 19      |      |      |         |       |
| **Total** |                                      | **149** |      |      |         |       |


### Known Issues to Watch For

These are documented bugs from audits that may surface during testing:


| Issue                                                      | Where It Shows Up                      | Audit Ref   |
| ---------------------------------------------------------- | -------------------------------------- | ----------- |
| `normalizeLockStatus` maps "unlocked" to "locked"          | Workflow 3 step 11 (auto-populated LE) | Phase 3 #3  |
| CD missing fields produce false variance (0 vs LE value)   | Workflow 5 step 11 (LE vs CD)          | Phase 3 #4  |
| Reprocessing a doc can create duplicate LE rows            | Workflow 3 step 12 (retry)             | Phase 3 #5  |
| Closing metadata last-write-wins race on concurrent edits  | Workflow 6 step 11 (rapid toggles)     | Phase 5 #8  |
| Business-day countdown may show calendar days              | Workflow 1 step 42 (CD review)         | Phase 5 #7  |
| SigningAppointment fires mutation on every keystroke       | Workflow 1 step 44 (typing location)   | Phase 5 #13 |
| Collaborator validate API leaks `deal_id`                  | Workflow 4 step 17                     | Phase 5 #15 |
| No file-type/size validation on collaborator upload server | Workflow 4 (API security)              | Phase 5 #1  |
| Wire SafeSend allows "wired" without receipt upload        | Workflow 1 step 47                     | Phase 5 #5  |


### Test Environment Record


| Field             | Value |
| ----------------- | ----- |
| Tester            |       |
| Date              |       |
| Browser / Version |       |
| App URL           |       |
| Commit / Deploy   |       |
| Overall Result    |       |
| Time to Complete  |       |


