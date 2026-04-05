-- HomeBuyer Pro — Schema v2 (fixes ERD issues)
-- Run this in the Supabase SQL Editor AFTER 001_initial_schema.sql

-- ============================================================
-- 1. DROP closing_disclosures (redundant with documents table)
-- CD data lives in documents.extracted_fields where doc_type = 'closing_disclosure'
-- LE vs CD variance is computed in application code
-- ============================================================

drop table if exists closing_disclosures cascade;

-- ============================================================
-- 2. CLEAN UP deals table — remove redundant offer fields
-- offer_price and earnest_money belong in offer_details only
-- deals.purchase_price is the canonical "current price" of the transaction
-- ============================================================

alter table deals drop column if exists offer_price;
alter table deals drop column if exists earnest_money;

-- ============================================================
-- 3. FIX copilot_messages — add user_id, make deal_id nullable
-- Allows pre-deal conversations in Shopping phase
-- ============================================================

alter table copilot_messages add column user_id uuid references auth.users(id) on delete cascade;
alter table copilot_messages alter column deal_id drop not null;

-- Backfill user_id from deal ownership for any existing rows
update copilot_messages cm
  set user_id = d.user_id
  from deals d
  where cm.deal_id = d.id
  and cm.user_id is null;

-- Make user_id not null going forward
alter table copilot_messages alter column user_id set not null;

-- Update RLS to use user_id directly
drop policy if exists "Users can manage copilot messages for their deals" on copilot_messages;
create policy "Users can manage their own copilot messages"
  on copilot_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_copilot_messages_user on copilot_messages(user_id);

-- ============================================================
-- 4. ADD repair_items table
-- Individual line items for RepairsCreditsTracker
-- ============================================================

create table repair_items (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references deals(id) on delete cascade,
  description text not null,
  category text check (category in ('structural', 'electrical', 'plumbing', 'hvac', 'roof', 'pest', 'cosmetic', 'safety', 'other')),
  estimated_cost numeric,
  agreed_cost numeric,
  resolution text check (resolution in ('repair', 'credit', 'as-is', 'pending', 'disputed')),
  status text not null default 'pending' check (status in ('pending', 'requested', 'agreed', 'declined', 'completed')),
  severity text check (severity in ('critical', 'major', 'minor', 'cosmetic')),
  source_document_id uuid references documents(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table repair_items enable row level security;

create policy "Users can manage repair items for their deals"
  on repair_items for all
  using (deal_id in (select id from deals where user_id = auth.uid()))
  with check (deal_id in (select id from deals where user_id = auth.uid()));

create index idx_repair_items_deal on repair_items(deal_id);

create trigger set_repair_items_updated_at
  before update on repair_items
  for each row execute function update_updated_at();

-- ============================================================
-- 5. ADD insurance_info table
-- For InsuranceBinding component in Escrow/Closing
-- ============================================================

create table insurance_info (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references deals(id) on delete cascade,
  carrier text not null,
  policy_type text,
  annual_premium numeric,
  coverage_dwelling numeric,
  deductible numeric,
  effective_date date,
  mortgagee_clause text,
  binder_status text not null default 'pending' check (binder_status in ('pending', 'requested', 'received', 'bound', 'verified')),
  binder_document_id uuid references documents(id) on delete set null,
  is_chosen boolean default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table insurance_info enable row level security;

create policy "Users can manage insurance info for their deals"
  on insurance_info for all
  using (deal_id in (select id from deals where user_id = auth.uid()))
  with check (deal_id in (select id from deals where user_id = auth.uid()));

create index idx_insurance_info_deal on insurance_info(deal_id);

create trigger set_insurance_info_updated_at
  before update on insurance_info
  for each row execute function update_updated_at();

-- ============================================================
-- 6. ADD earnest_money_status to deals (lightweight tracking)
-- For EarnestMoneyDepositTracker — doesn't need its own table
-- ============================================================

alter table deals add column earnest_money_amount numeric;
alter table deals add column earnest_money_status text default 'pending'
  check (earnest_money_status in ('pending', 'sent', 'confirmed', 'held'));
alter table deals add column escrow_company text;
alter table deals add column escrow_contact text;
