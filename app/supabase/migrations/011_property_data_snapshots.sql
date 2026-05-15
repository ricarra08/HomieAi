-- Cross-user cache for DataProvider snapshots (property attrs, comps, neighborhood signals, macro snapshot)
-- Keyed by normalized address so multiple users saving the same listing share one snapshot.
-- Service-role only; no client read/write policies.

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
