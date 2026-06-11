-- Migration 017: Agent invite links (/join/[slug]) — Strategy A distribution mechanic.
--
-- profiles.invite_slug: the agent's public, unique, URL-safe handle. Looked up by the
--   public /join/[slug] page and /api/join/resolve via the service-role client (profiles
--   RLS remains own-row only — no client-side cross-profile reads).
-- profiles.referred_by_agent_id: set on a buyer's profile at onboarding when they signed
--   up through an agent's invite link. Transaction creation stamps transactions.agent_id
--   from it, which is what grants the agent visibility under the existing agent RLS
--   policies (migration 006). The buyer always owns the workspace; the agent association
--   only adds the agent to the transaction's RLS scope.
--
-- Run manually via the Supabase SQL editor.

alter table profiles
  add column invite_slug text,
  add column referred_by_agent_id uuid references auth.users(id) on delete set null;

-- Partial unique index: many profiles have no slug; the ones that do must be unique.
create unique index profiles_invite_slug_key
  on profiles (invite_slug)
  where invite_slug is not null;

comment on column profiles.invite_slug is
  'Public URL handle for agent invite links (/join/<slug>). Agents only. Read publicly via service role.';
comment on column profiles.referred_by_agent_id is
  'Agent who invited this buyer (resolved from invite slug at onboarding). Stamped onto transactions.agent_id at creation.';
