# Phase 2 — AI Extraction + Copilot Core Audit
## Completed: April 6, 2026
## Status: PASS WITH NOTES

---

## Summary

Phase 2 delivers the AI extraction pipeline (Tier 1 field extraction + summarization), a fully wired copilot chat with streaming responses, a phase-aware context assembly engine, citation support, and a document question-drafting feature. The copilot is now grounded in deal data for Escrow/Closing phases.

---

## Build Verification

```
TypeScript:  0 errors
ESLint:      0 errors, 0 warnings
Build:       ✓ Compiled successfully
```

---

## Files Created / Modified

### New Files (8)

| File | Lines | Purpose |
|------|-------|---------|
| `lib/ai/extraction-schemas.ts` | ~170 | OpenAI structured output schemas for Tier 1 doc types |
| `lib/ai/prompts.ts` | ~90 | Extraction and summarization system prompts per doc type |
| `lib/ai/context-engine.ts` | ~140 | Server-side context assembly (deal + docs + deadlines + LEs + repairs) |
| `lib/ai/system-prompts.ts` | ~65 | Phase-specific copilot system prompts with boundary rules |
| `app/api/copilot/chat/route.ts` | ~115 | Streaming copilot chat endpoint with context engine |
| `app/api/copilot/draft-question/route.ts` | ~95 | Smart question generation from document context |
| `lib/hooks/use-streaming-chat.ts` | ~75 | Client-side streaming response consumption hook |

### Modified Files (5)

| File | Change |
|------|--------|
| `app/api/documents/process/route.ts` | Extended with parallel extraction + summarization, staged saves, model downgrades |
| `components/copilot/AICopilot.tsx` | Full rewrite: message history, streaming, phase-aware chips, prefill events |
| `components/documents/SlideOverViewer.tsx` | Added extracted fields panel, AI summary states, draft question button |
| `components/documents/DocumentRow.tsx` | Processing/failed/processed status indicators with retry |
| `lib/types.ts` | Added `processing`, `processed`, `failed` to Document status union |

---

## Batch 1 — Document Processing Pipeline

### Architecture: PASS

- Pipeline: text extraction → reconstruction fallback → classification (gpt-4o-mini) → staged save → parallel extraction (gpt-4o) + summarization (gpt-4o-mini) via `Promise.allSettled`
- Status machine: `uploaded → processing → processed | failed`
- `maxDuration = 60` for Vercel timeout
- Outer try/catch sets `status: "failed"` on unhandled errors

### Extraction Schemas: PASS

- All 4 Tier 1 types covered: purchase_contract, loan_estimate, closing_disclosure, inspection_report
- `strict: true`, `additionalProperties: false` on all schemas
- Per-field `{ value, confidence }` pattern matches build plan
- Field sets align with AI Extraction Contract

### Issues Found

| Severity | Issue | Location |
|----------|-------|----------|
| **Medium** | Step 4 "processing" DB update doesn't check for Supabase error — if it fails, extraction/summarization still runs against a row that may not reflect classification results | `process/route.ts` L216-226 |
| **Medium** | CD schema missing `estimated_total_closing` field (present in LE schema) — may cause gaps in Phase 3 LE vs CD variance comparison | `extraction-schemas.ts` |
| **Low** | Reconstruction "UNREADABLE" check is exact string match — a response like "UNREADABLE (image PDF)" would be stored as valid text | `process/route.ts` L147-149 |
| **Low** | Concurrent POST for same documentId could produce interleaved updates | `process/route.ts` |

---

## Batch 2 — Copilot Chat + Streaming

### Architecture: PASS

- Streaming via OpenAI async iterator → ReadableStream → client `reader.read()` loop
- Model selection: gpt-4o-mini for Shopping/Offer, gpt-4o for Escrow/Closing
- User message persisted client-side via mutation before stream starts
- Assistant message persisted server-side after stream completes
- AbortController for canceling in-flight requests

### Issues Found

| Severity | Issue | Location |
|----------|-------|----------|
| **High UX** | Send button not disabled when `userId` is null (async `getUser()` hasn't resolved) — silent no-op on fast sends | `AICopilot.tsx` |
| **High UX** | Auto-scroll targets inner `div` inside `ScrollArea`, but shadcn `ScrollArea` uses a viewport wrapper — scroll-to-bottom may not work | `AICopilot.tsx` L105-109 |
| **Medium** | Assistant message `insert` doesn't check for Supabase error — persistence can fail silently | `copilot/chat/route.ts` |
| **Medium** | Stream errors are logged but not surfaced to client — user gets truncated response with HTTP 200 | `copilot/chat/route.ts` |
| **Medium** | `useStreamingChat` doesn't abort on component unmount — can trigger setState on unmounted component | `use-streaming-chat.ts` |
| **Medium** | Streaming text cleared in `finally` before query refetch completes — brief empty flash possible | `use-streaming-chat.ts` |
| **Low** | Maximize button has no onClick handler — dead control | `AICopilot.tsx` L125 |
| **Low** | `parseCitations` returns `citations.length > 0 ? citations : []` — redundant | `copilot/chat/route.ts` |

---

## Batch 3 — Context Assembly Engine

### Architecture: PASS

- `assembleContext(dealId, phase)` fetches all deal data in a single `Promise.all`
- Phase gating: Shopping = no context, Offer = deal summary only, Escrow/Closing = full context
- Truncation at 12K chars with prioritized block ordering (deal → deadlines → documents → LEs → repairs)
- Document summaries capped at 300 chars, up to 8 key fields per doc
- Deadline sorting by urgency (overdue first)

### System Prompts: PASS

- All 5 phases covered with tailored prompts
- Boundary rules applied to all phases
- Citation rules enforced for Escrow and Closing only
- Wire fraud emphasis in Closing prompt
- Warm, buyer-friendly tone consistent throughout

### Issues Found

| Severity | Issue | Location |
|----------|-------|----------|
| **Medium** | Supabase query errors in `Promise.all` (docs, deadlines, etc.) are silently ignored — context is built with missing sections but no logging | `context-engine.ts` |
| **Low** | `phase === "shopping"` returns empty string even if `dealId` exists — intentional per plan, but could confuse a shopper who already has a deal | `context-engine.ts` L106-108 |

---

## Batch 4 — Question Drafting + Documents View Polish

### Architecture: PASS

- `/api/copilot/draft-question` generates 3 contextual questions via gpt-4o-mini
- Questions tailored per doc type with recipient (agent, lender, escrow, etc.)
- Extracted fields displayed with per-doc-type field prioritization
- Low-confidence fields show amber indicator
- Questions sent to copilot via `CustomEvent("copilot:prefill")`

### Issues Found

| Severity | Issue | Location |
|----------|-------|----------|
| **Medium** | SlideOver "Retry analysis" doesn't invalidate queries — UI won't update until manual refresh (unlike DocumentRow retry which does invalidate) | `SlideOverViewer.tsx` L174-180 |
| **Medium** | `DraftQuestionPanel` doesn't check `res.ok` — 4xx/5xx responses are silently treated as empty questions | `SlideOverViewer.tsx` |
| **Low** | `formatFieldValue` treats all numbers >= 1000 as currency ($) — incorrect for non-currency fields like sqft | `SlideOverViewer.tsx` |
| **Low** | DocumentRow retry does double invalidation (once immediately, once in `.then`) — redundant refetches | `DocumentRow.tsx` |
| **Low** | `extracted_fields` typed as `Record<string, unknown>` but UI assumes `{ value, confidence }` shape — works if API always returns that shape, but no runtime validation | `SlideOverViewer.tsx` |

---

## Issue Priority Matrix

### Fix Before Testing (High)

1. **AICopilot send without userId** — disable send button + chips when `userId` is null
2. **AICopilot auto-scroll** — target the ScrollArea viewport element instead of inner div

### Fix Before Beta (Medium)

3. Process route Step 4 error check
4. Copilot assistant insert error check
5. Streaming hook unmount abort
6. SlideOver retry query invalidation
7. Draft question `res.ok` check
8. Context engine error logging
9. CD schema `estimated_total_closing` field

### Defer / Cosmetic (Low)

10. Reconstruction UNREADABLE strictness
11. Maximize button handler
12. formatFieldValue currency heuristic
13. DocumentRow double invalidation
14. parseCitations redundant return

---

## Model Usage Summary

| Task | Model | Cost Estimate |
|------|-------|---------------|
| Classification | gpt-4o-mini | ~$0.001/doc |
| Reconstruction fallback | gpt-4o | ~$0.01/doc (rare) |
| Field extraction (Tier 1) | gpt-4o | ~$0.03/doc |
| Summarization | gpt-4o-mini | ~$0.003/doc |
| Copilot (Shopping/Offer) | gpt-4o-mini | ~$0.002/msg |
| Copilot (Escrow/Closing) | gpt-4o | ~$0.015/msg |
| Draft questions | gpt-4o-mini | ~$0.002/call |

---

## State Management Compliance

| Data | Layer | Status |
|------|-------|--------|
| `Document.extracted_fields` | Server (TQ) | Populated by process route, read via `useDocuments` |
| `Document.ai_summary` | Server (TQ) | Populated by process route, displayed in SlideOverViewer |
| `Document.status` (processing/processed/failed) | Server (TQ) | Updated by process route, reflected in DocumentRow + SlideOverViewer |
| `CopilotMessage[]` | Server (TQ) | User msgs via mutation, assistant msgs via API route insert |
| Streaming content | Client (local useState) | Ephemeral, cleared after stream completes |
| Copilot open/closed | Client (Zustand) | `copilotOpen` in UIStore |
| Current phase | Client (Zustand) | `currentPhase` drives model selection + quick actions |

All state follows the three-layer model from STATE.md. No violations detected.
