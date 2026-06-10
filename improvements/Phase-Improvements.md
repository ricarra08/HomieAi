## Client Dashboard
- make Homie AI contextually aware in the client dashboard

## Shopping
- Market Snapshot needs to be wired to pull actual market data (completed)
- we need to bring in the algorithm that predicts the future home value using stochastic modeling while accounting for future developments, planning, initiatives, and possible gentrification (completed)
    - conservative, moderate, and optimistic (although reference)

- About you might need more personalized questions:
    - questions that may affect the sell of the home

## Offer
- offer strength analyzer 

## Escrow
- Re-inpsection workflow after fixes 

## General 
- add translations

## Onboarding (completed)
- support realtor onboarding vs home buyer on boarding

## Wire Fraud Prevention
- architect SafeSend verification which ensures you never wire funds based on fraudulent instructions. (needs to be reviewed )



## cash to close calculator (from offer to closing)
- prevent final number surprises from homebuyers

## some values need to be editable in the case that the transaction requires it (important)

## fix address input to auto fill (completed)

## fix chat push down when homie gives a back a streamed response (completed)

## we need to send an email when we a generate a upload link 

## fix email template from supabase (fix)


## onboarding to dashboard fails (completed)

## H-1 + M-1 together (~2-3h) — wrap document content and filename in the asPromptData nonce delimiter + a system-prompt guard. One coherent fix; closes the highest-impact issue. (completed)

## M-4 + M-5 (~1h) — percent formatter for rate/APR rows + dedicated rate tolerance logic. Small, high-trust-impact, and pure display logic (low regression risk). (completed)

## M-2 (~1-2h) — enforce recipient_role/requested_documents server-side; gate financial auto-population behind owner confirmation. 

## L-1 (~15min) — trivial migration: WHERE user_id = auth.uid() + REVOKE.

## M-6 (~1h) — derive wire amount from CD, or label as LE estimate.

## M-3, L-2, L-3 — batch with the durable-rate-limit work (prior H2).

## Valuation/Market follow-ups (from code review 2026-06-10)
- cache geocode result per saved home (Geoapify call currently fires on every request, even snapshot cache hits) — persist formatted address on saved_homes or memo in lib/geocode
- extract shared route helper for valuation/market (auth → ownership → geocode → ensureSnapshot is still duplicated across both routes)
- extract shared SavedHomePicker + ErrorBlock/ConfidenceChip between MarketSnapshotCard and HomeValueProjectionCard; use lib/utils formatCurrency instead of local formatPrice
- review the "MACRO IS MANDATORY / never null" prompt mandate — model fills gaps with hardcoded late-2025 values (e.g. mortgage ~6.7) that are cached 30 days and indistinguishable from sourced data; constants will go stale
- second-order prompt injection from fetched web pages is unmitigated (only schema/clamp containment)
- migration 011 cleanup query's SQL address normalization must mirror normalizeAddress in JS — consider persisting address_normalized on saved_homes so only one normalizer exists
- PhaseDashboard.tsx:253 still fails react-hooks/set-state-in-effect (pre-existing; CI lint gate)