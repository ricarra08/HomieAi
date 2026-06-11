-- Migration 018: Agent → buyer transaction handoff ("claim").
--
-- An agent can set up a client transaction (agent-owned shell: user_id = agent_id) and then
-- invite the buyer to take it over. The buyer claims it via /claim/<token>, which transfers
-- ownership: transactions.user_id flips to the buyer while agent_id stays, turning the shell
-- into a buyer-owned, agent-visible shared workspace (per the full-collaborative model).
--
-- claim_token:         high-entropy capability in the claim link; null once claimed/never-set.
-- claim_token_expires_at: links expire so a leaked/forgotten link can't be claimed forever.
-- claimed_at:          audit timestamp of when the handoff happened.
--
-- Security model: the token is only ever present on an UNCLAIMED shell (user_id = agent_id).
-- The claim API transfers only while a valid token exists, then clears it (single use), and the
-- invite API refuses to (re)generate a token for a transaction that is already buyer-owned —
-- so an agent cannot mint a claim link for a buyer's real workspace and hijack it.
--
-- Run manually via the Supabase SQL editor. No RLS change: the public claim flow uses the
-- service-role client (the buyer can't RLS-read a transaction they don't own yet).

alter table transactions
  add column claim_token text,
  add column claim_token_expires_at timestamptz,
  add column claimed_at timestamptz;

create unique index transactions_claim_token_key
  on transactions (claim_token)
  where claim_token is not null;

comment on column transactions.claim_token is
  'High-entropy token in the /claim/<token> link; present only on an unclaimed agent-created shell, cleared (single-use) on claim.';
