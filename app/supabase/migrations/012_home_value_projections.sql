-- Per-user projection cache (spec response shape).
-- Cache key: (saved_home_id, model_version, snapshot_id, anchor_price)
-- A fresher snapshot invalidates the projection. A price change creates a new row.

create table home_value_projections (
  id uuid primary key default gen_random_uuid(),
  saved_home_id uuid not null references saved_homes(id) on delete cascade,
  transaction_id uuid not null references transactions(id) on delete cascade,
  model_version text not null,
  anchor_price numeric not null,
  series jsonb not null,
  current_value jsonb not null,
  attribution jsonb not null,
  regime jsonb not null,
  confidence_score int not null,
  explanation text,
  snapshot_id uuid references property_data_snapshots(id) on delete set null,
  generated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index on home_value_projections (saved_home_id, generated_at desc);
create unique index on home_value_projections (saved_home_id, model_version, snapshot_id, anchor_price);

alter table home_value_projections enable row level security;

create policy "Users read projections for their homes"
  on home_value_projections for select
  using (transaction_id in (select id from transactions where user_id = auth.uid()));
