# Phase 1 — Light Surfaces + Deal Pipeline Audit
## Completed: April 5, 2026
## Status: PASS

---

## Summary

Phase 1 delivers functional Shopping and Offer surfaces, deal workspace creation (both from Offer flow and direct entry), document upload with drag-and-drop, PDF text extraction, and AI-powered document classification. The product now has real data flowing through all three state layers (TanStack Query, Zustand, React Hook Form).

---

## Build Verification

```
TypeScript:  0 errors
ESLint:      0 errors, 0 warnings
Build:       ✓ Compiled successfully
Routes:      8 registered (/, /_not-found, /api/documents/process, /dashboard, /documents, /financing, /login, /signup)
```

---

## 1.1 ShoppingView — PASS

### Files created
| File | Lines | Purpose |
|------|-------|---------|
| `components/ui/collapsible-card.tsx` | 49 | Shared CollapsibleCard pattern (used in Shopping, Offer, Closing, Post-Close) |
| `components/shopping/ShoppingView.tsx` | 183 | Shopping dashboard with 4 CollapsibleCards |
| `components/shopping/AddPropertyDialog.tsx` | 143 | Add Property dialog with form |

### Figma alignment
| Figma element | Implementation | Match |
|--------------|---------------|-------|
| "Track homes and prepare your buy box" header | Heading + subtitle | Yes |
| "Add Property" button (Bronze) | DialogTrigger with accent styling | Yes |
| Your Buy Box CollapsibleCard | Static criteria display (Price Range, Bedrooms, Target Area) | Yes |
| Saved Homes CollapsibleCard | Dynamic list from `useSavedHomes()`, "Move to Offer" per row, delete | Yes |
| Affordability Estimate CollapsibleCard | Purchase price + down payment % inputs, computed cash-to-close | Yes |
| Market Snapshot CollapsibleCard | Static data (Median Price, DOM, Trend) | Yes |
| "Active" badge per home | Badge component with Primary styling | Yes |

### State management
| Data | Hook | Pattern |
|------|------|---------|
| Saved homes list | `useSavedHomes(userId)` | TQ query, server state |
| Create home | `useCreateSavedHome(userId)` | TQ mutation → invalidates `savedHomeKeys.all` |
| Delete home | `useDeleteSavedHome(userId)` | TQ mutation (soft delete) → invalidates `savedHomeKeys.all` |
| Affordability inputs | `useState` | Local form state (ephemeral, not persisted) |
| Phase transition | `useUIStore.setCurrentPhase` | Zustand |

### Boundary compliance
- All property data is buyer-entered (no MLS, no enrichment, no API) — **compliant**
- Market Snapshot is static/manual — **compliant**

---

## 1.2 OfferView — PASS

### Files created
| File | Lines | Purpose |
|------|-------|---------|
| `components/offer/OfferView.tsx` | 292 | Offer workspace with 4 CollapsibleCards + phase transition |

### Figma alignment
| Figma element | Implementation | Match |
|--------------|---------------|-------|
| "Offer Workspace" / "Structure and prepare your offer" header | Heading + subtitle | Yes |
| "Offer in Progress" badge (Bronze) | Badge with accent styling | Yes |
| Property card (742 Evergreen Terrace) | Card with address, specs, list price | Yes |
| Offer Details CollapsibleCard | 4 input fields (price, EMD, down payment %, timeline) | Yes |
| Contingencies CollapsibleCard | Checkbox + day input per contingency (Inspection, Loan, Appraisal, Sale) | Yes |
| Supporting Documents CollapsibleCard | Pre-approval + proof of funds upload buttons, file info | Yes |
| Offer Readiness CollapsibleCard | 5-item checklist with progress circle indicators | Yes |
| "Offer Accepted — Start Escrow" CTA | Full-width Bronze button → creates deal + transitions to Escrow | Yes |
| "Review & Submit Offer" button | Full-width Bronze button | Yes |

### State management
| Data | Hook | Pattern |
|------|------|---------|
| Offer form fields | `useState` | Local form state |
| Create deal on accept | `useCreateDeal(userId)` | TQ mutation → invalidates `dealKeys.all` |
| Set active deal | `useUIStore.setActiveDealId` | Zustand |
| Phase transition | `useUIStore.setCurrentPhase("escrow")` | Zustand |
| Checklist computed | Inline object derivation | Computed (not stored) |

### Legal boundary
- "The offer workspace captures buyer-entered terms and uploaded documents. It does not generate, validate, or negotiate legal contract language." — **compliant** (no contract generation, no AI negotiation)

---

## 1.3 Deal Workspace Creation — PASS

### Files created
| File | Lines | Purpose |
|------|-------|---------|
| `components/deal/DealSetupForm.tsx` | 179 | Direct-entry form for mid-journey users |
| `components/deal/DealSummaryCard.tsx` | 67 | Deal summary with days-to-close countdown |

### Two entry paths
| Path | Trigger | Implementation |
|------|---------|---------------|
| From Offer | "Offer Accepted — Start Escrow" CTA | `useCreateDeal` → `setActiveDealId` → `setCurrentPhase("escrow")` |
| Direct entry | DealSetupForm | Same hooks, fields match Figma onboarding screen |

### DealSetupForm fields (matches Figma)
- Property Address
- Offer Acceptance Date
- Scheduled Closing Date
- Purchase Price
- Earnest Money Deposit
- Contingency Periods (Inspection, Appraisal, Loan days)
- "Start Transaction Workspace" CTA (Primary/Mint)
- "Skip setup (use demo data)" link — **not implemented yet** (known gap)

### DealSummaryCard
- Address, closing date, purchase price
- Days-to-close badge (color-coded: green > yellow > red)
- Uses `computeDaysRemaining()` from `lib/computed.ts` — **deterministic computation rule compliant**

---

## 1.4 Document Upload — PASS

### Files created
| File | Lines | Purpose |
|------|-------|---------|
| `components/documents/DocumentUpload.tsx` | 87 | Drag-and-drop + file input upload |
| `components/documents/DocumentRow.tsx` | 65 | Document list row with status badge |

### Modified
| File | Change |
|------|--------|
| `app/(app)/documents/page.tsx` | Wired to `useDocuments`, shows upload zone + document list |

### Upload flow
1. User drags PDF or clicks to browse
2. File validation: PDF only, max 25MB
3. `useUploadDocument(dealId)` mutation:
   - Uploads to Supabase Storage: `deal-documents/{dealId}/{uuid}/{filename}`
   - Creates `documents` row with status "uploaded"
   - Fires async `POST /api/documents/process` for extraction + classification
   - Invalidates `documentKeys.list` on both upload success and processing completion
4. Toast notifications for success/error

### DocumentRow
- File icon, name (truncated), doc_type, date (relative), file size
- Status badge (color-coded: required/missing=red, uploaded=blue, signed/acknowledged/final=green, read-only=gray)
- Click opens document viewer (via `useUIStore.openViewer`)
- Three-dot menu (placeholder)

---

## 1.5 + 1.6 PDF Extraction + Classification — PASS

### Files created
| File | Lines | Purpose |
|------|-------|---------|
| `app/api/documents/process/route.ts` | 190 | API route: extract text + classify document |

### Pipeline
```
POST /api/documents/process { documentId }
  → Download PDF from Supabase Storage
  → pdf-parse for text extraction
  → If text < 50 chars → GPT-4o Vision fallback
  → If text available → GPT-4o classification (JSON mode)
  → Update document row: extracted_text, doc_type, category, stage, confidence_score
```

### Classification taxonomy (11 types)
purchase_contract, loan_estimate, closing_disclosure, inspection_report, appraisal, title_report, disclosure, insurance_binder, pre_approval, proof_of_funds, other

### Category + stage auto-assignment
- Classification prompt returns `{ doc_type, category, stage }`
- Category maps to Smart Tab placement (offer, financing, inspections, escrow_title, disclosures, closing, insurance, other)
- Stage maps to phase context (offer, escrow, closing)

### Build compatibility
- `dynamic = "force-dynamic"` prevents pre-rendering at build time
- Supabase admin client + OpenAI client lazy-initialized (not at module scope)
- Placeholder env vars in CI — build passes without real keys

### Dependencies installed
- `pdf-parse` — PDF text extraction
- `openai` — GPT-4o for Vision fallback + classification

---

## State Management Compliance (vs STATE.md)

| Rule | Status |
|------|--------|
| All Supabase queries go through hooks in `lib/hooks/` | **PASS** — 0 direct `supabase.from()` calls in components |
| One hook per data type | **PASS** — `useSavedHomes`, `useDeal`, `useDocuments` each separate |
| Mutations call `invalidateQueries` on success | **PASS** — all mutations invalidate correct keys |
| Computed values are pure functions | **PASS** — `computeDaysRemaining` used in DealSummaryCard |
| Active deal ID from Zustand | **PASS** — `activeDealId` set on deal creation, read in Documents page |
| No direct Supabase calls in components | **PASS** — grep confirms zero matches |

---

## Style Compliance (vs STYLES.md)

| Rule | Status |
|------|--------|
| Headings use DM Serif Display | **PASS** — h2/h3 render in serif via CSS base rule |
| Body text is `text-base` (16px) | **PASS** — all content, inputs, nav at text-base |
| Cards get `border + shadow-sm + rounded-xl` | **PASS** — all CollapsibleCards and content cards |
| Accent (Bronze) for CTAs only | **PASS** — only on "Add Property", "Offer Accepted", "Review & Submit" |
| Primary (Mint) for progress/positive | **PASS** — completion circles, Active badges, Start Workspace CTA |
| Never below `text-sm` for readable content | **PASS** — smallest is `text-sm` for timestamps and subtitles |

---

## Known Gaps (Expected — Phase 2+)

| Gap | When it ships |
|-----|---------------|
| "Skip setup (use demo data)" link in DealSetupForm | Phase 6 (onboarding polish) |
| Document viewer slide-over panel | Phase 2 (Documents View deep build) |
| Smart Tabs (Essentials, Disclosures, Financing, etc.) | Phase 2 |
| Stage Essentials Card ("0/2 required this stage") | Phase 2 |
| AI document summarization | Phase 2 |
| Bulk selection bar | Phase 2 |
| Three-dot menu actions (download, share, delete) | Phase 2 |
| Offer readiness "Offer expiration date set" always false | Phase 1.5 polish or Phase 2 |
| Buy Box criteria is static (not editable/persisted) | Acceptable for Build Light |
| Market Snapshot is static | Acceptable for Build Light |
| Upload flow doesn't show processing status while AI runs | Phase 2 (polling or realtime) |

---

## File Count Summary

| Category | Count |
|----------|-------|
| New components | 7 |
| New shared UI | 1 (CollapsibleCard) |
| New API routes | 1 |
| Modified files | 4 |
| New dependencies | 2 (pdf-parse, openai) |
| Total new lines | ~1,806 |

---

## Audit Verdict

**Phase 1 is complete and verified.** Shopping and Offer are functional light surfaces with real Supabase data flow. Deal creation works from both entry paths. Document upload, PDF extraction, and AI classification are wired end-to-end. All state management patterns follow STATE.md. All styling follows STYLES.md. Build passes with zero errors and zero warnings.
