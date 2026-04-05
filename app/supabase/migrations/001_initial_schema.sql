-- HomeBuyer Pro — Initial Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/dysmrgcjxisutholidcp/sql)

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Saved homes (Shopping phase — Build Light)
create table saved_homes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  address text not null,
  price numeric,
  beds integer,
  baths numeric,
  sqft text,
  notes text,
  image_url text,
  status text not null default 'interested' check (status in ('interested', 'toured', 'offer-pending', 'removed')),
  created_at timestamptz not null default now()
);

-- Deals (core container for the entire transaction)
create table deals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  saved_home_id uuid references saved_homes(id) on delete set null,
  property_address text not null,
  purchase_price numeric not null,
  offer_price numeric,
  earnest_money numeric,
  contract_acceptance_date date,
  closing_date date,
  agent_name text,
  agent_contact text,
  current_phase text not null default 'shopping' check (current_phase in ('shopping', 'offer', 'escrow', 'closing', 'post-close')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Offer details (Offer phase — Build Light)
create table offer_details (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references deals(id) on delete cascade,
  offer_price numeric not null,
  earnest_money numeric not null,
  closing_date date,
  contingency_inspection_days integer,
  contingency_appraisal_days integer,
  contingency_financing_days integer,
  contingency_disclosure_days integer,
  pre_approval_doc_id uuid,
  proof_of_funds_doc_id uuid,
  checklist_items jsonb not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'submitted', 'accepted', 'rejected', 'countered')),
  created_at timestamptz not null default now()
);

-- Documents (Build Deep — core of the product)
create table documents (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references deals(id) on delete cascade,
  name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  doc_type text,
  category text,
  stage text,
  status text not null default 'uploaded' check (status in ('required', 'missing', 'uploaded', 'signed', 'acknowledged', 'final', 'read-only')),
  version text,
  extracted_text text,
  extracted_fields jsonb,
  ai_summary text,
  confidence_score numeric,
  source_type text not null default 'buyer-upload' check (source_type in ('buyer-upload', 'collaborator-upload', 'system-generated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add foreign keys from offer_details to documents (after documents table exists)
alter table offer_details
  add constraint fk_pre_approval_doc foreign key (pre_approval_doc_id) references documents(id) on delete set null,
  add constraint fk_proof_of_funds_doc foreign key (proof_of_funds_doc_id) references documents(id) on delete set null;

-- Deadlines (Build Deep — escrow/closing tracking)
create table deadlines (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references deals(id) on delete cascade,
  name text not null,
  type text not null check (type in ('earnest-money', 'inspection', 'appraisal', 'financing', 'disclosure', 'closing', 'custom')),
  due_date date not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'due-soon', 'overdue', 'completed', 'waived')),
  notes text,
  linked_document_ids uuid[],
  created_at timestamptz not null default now()
);

-- Loan estimates (Build Deep — financing comparison)
create table loan_estimates (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references deals(id) on delete cascade,
  lender text not null,
  product text not null,
  loan_amount numeric not null,
  down_payment numeric,
  rate numeric not null,
  apr numeric,
  points numeric,
  lender_fees numeric,
  third_party_fees numeric,
  pmi_monthly numeric,
  impounds boolean default false,
  cash_to_close numeric,
  lock_status text check (lock_status in ('locked', 'floating')),
  lock_expires date,
  prepay_penalty boolean default false,
  is_chosen boolean default false,
  pdf_document_id uuid references documents(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Closing disclosures (Build Deep — LE vs CD comparison)
create table closing_disclosures (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references deals(id) on delete cascade,
  loan_estimate_id uuid references loan_estimates(id) on delete set null,
  extracted_fields jsonb,
  variance_summary text,
  pdf_document_id uuid references documents(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Collaborator links (Build Light — secure upload)
create table collaborator_links (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references deals(id) on delete cascade,
  recipient_role text not null check (recipient_role in ('agent', 'lender', 'escrow', 'title', 'inspector', 'other')),
  recipient_email text,
  link_token text not null unique default encode(gen_random_bytes(32), 'hex'),
  requested_documents text[],
  expires_at timestamptz not null default (now() + interval '7 days'),
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  uploads_received integer not null default 0,
  created_at timestamptz not null default now()
);

-- Copilot messages (AI chat history)
create table copilot_messages (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references deals(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  citations jsonb,
  phase text not null check (phase in ('shopping', 'offer', 'escrow', 'closing', 'post-close')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_saved_homes_user on saved_homes(user_id);
create index idx_deals_user on deals(user_id);
create index idx_documents_deal on documents(deal_id);
create index idx_deadlines_deal on deadlines(deal_id);
create index idx_deadlines_due_date on deadlines(due_date);
create index idx_loan_estimates_deal on loan_estimates(deal_id);
create index idx_closing_disclosures_deal on closing_disclosures(deal_id);
create index idx_collaborator_links_deal on collaborator_links(deal_id);
create index idx_collaborator_links_token on collaborator_links(link_token);
create index idx_copilot_messages_deal on copilot_messages(deal_id);
create index idx_offer_details_deal on offer_details(deal_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table saved_homes enable row level security;
alter table deals enable row level security;
alter table offer_details enable row level security;
alter table documents enable row level security;
alter table deadlines enable row level security;
alter table loan_estimates enable row level security;
alter table closing_disclosures enable row level security;
alter table collaborator_links enable row level security;
alter table copilot_messages enable row level security;

-- Saved homes: user can only access their own
create policy "Users can manage their own saved homes"
  on saved_homes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Deals: user can only access their own
create policy "Users can manage their own deals"
  on deals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Offer details: user can access via their deal
create policy "Users can manage offer details for their deals"
  on offer_details for all
  using (deal_id in (select id from deals where user_id = auth.uid()))
  with check (deal_id in (select id from deals where user_id = auth.uid()));

-- Documents: user can access via their deal
create policy "Users can manage documents for their deals"
  on documents for all
  using (deal_id in (select id from deals where user_id = auth.uid()))
  with check (deal_id in (select id from deals where user_id = auth.uid()));

-- Deadlines: user can access via their deal
create policy "Users can manage deadlines for their deals"
  on deadlines for all
  using (deal_id in (select id from deals where user_id = auth.uid()))
  with check (deal_id in (select id from deals where user_id = auth.uid()));

-- Loan estimates: user can access via their deal
create policy "Users can manage loan estimates for their deals"
  on loan_estimates for all
  using (deal_id in (select id from deals where user_id = auth.uid()))
  with check (deal_id in (select id from deals where user_id = auth.uid()));

-- Closing disclosures: user can access via their deal
create policy "Users can manage closing disclosures for their deals"
  on closing_disclosures for all
  using (deal_id in (select id from deals where user_id = auth.uid()))
  with check (deal_id in (select id from deals where user_id = auth.uid()));

-- Collaborator links: user can access via their deal
create policy "Users can manage collaborator links for their deals"
  on collaborator_links for all
  using (deal_id in (select id from deals where user_id = auth.uid()))
  with check (deal_id in (select id from deals where user_id = auth.uid()));

-- Copilot messages: user can access via their deal
create policy "Users can manage copilot messages for their deals"
  on copilot_messages for all
  using (deal_id in (select id from deals where user_id = auth.uid()))
  with check (deal_id in (select id from deals where user_id = auth.uid()));

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_deals_updated_at
  before update on deals
  for each row execute function update_updated_at();

create trigger set_documents_updated_at
  before update on documents
  for each row execute function update_updated_at();

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

insert into storage.buckets (id, name, public)
values ('deal-documents', 'deal-documents', false);

-- Storage RLS: users can upload/read files scoped to their deals
create policy "Users can upload documents to their deals"
  on storage.objects for insert
  with check (
    bucket_id = 'deal-documents'
    and auth.role() = 'authenticated'
  );

create policy "Users can read their deal documents"
  on storage.objects for select
  using (
    bucket_id = 'deal-documents'
    and auth.role() = 'authenticated'
  );

create policy "Users can delete their deal documents"
  on storage.objects for delete
  using (
    bucket_id = 'deal-documents'
    and auth.role() = 'authenticated'
  );
