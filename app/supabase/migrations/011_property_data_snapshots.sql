-- Cross-user cache for DataProvider snapshots (property attrs, comps, neighborhood signals, macro snapshot)
-- Keyed by normalized address so multiple users saving the same listing share one snapshot.
-- RLS on, no policies: this table is service-role only by design and never read directly by clients.
--
-- GDPR / right-to-deletion: snapshots have no FK to saved_homes by design (cross-user dedup).
-- To purge orphans, run this cleanup query (e.g., daily via Vercel/Supabase cron). Snapshots
-- whose address hasn't appeared in any active saved_home are eligible for deletion alongside the
-- natural expires_at TTL.
--
-- IMPORTANT: the normalization here MUST match `normalizeAddress` in
-- app/src/lib/valuation/data-provider/types.ts. Current JS impl:
--   raw.toLowerCase().replace(/\s+/g, " ").replace(/[.,]/g, "").trim();
-- Order: lowercase → collapse whitespace → strip "." and "," → trim. Mirrored below.
--
--   delete from property_data_snapshots
--   where expires_at < now()
--      or address_normalized not in (
--        select trim(regexp_replace(
--                 regexp_replace(lower(sh.address), '\s+', ' ', 'g'),
--                 '[.,]', '', 'g'
--               ))
--        from saved_homes sh
--        join transactions t on t.id = sh.deal_id
--        where t.archived = false and sh.status != 'removed'
--      );

create table property_data_snapshots (
  id uuid primary key default gen_random_uuid(),
  address_normalized text not null,
  snapshot jsonb not null,
  provider text not null,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null,
  unique (address_normalized, provider)
);

create index on property_data_snapshots (address_normalized);
create index on property_data_snapshots (expires_at);

alter table property_data_snapshots enable row level security;
