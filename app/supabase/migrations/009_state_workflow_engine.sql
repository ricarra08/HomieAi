-- ============================================================
-- 009: State Workflow Engine
--
-- Adds state awareness to the transaction model.
-- Supports FL, TX, AZ, CA with state-specific fields for
-- option periods (TX), investigation contingencies (CA),
-- contract types (FL), and expanded deadline/insurance tracking.
-- ============================================================

-- 1. Transactions: add state and property classification fields
alter table transactions add column state text;
alter table transactions add column property_type text check (property_type in ('single_family', 'condo', 'townhome', 'new_construction', 'vacant_land'));
alter table transactions add column loan_program text check (loan_program in ('conventional', 'fha', 'va', 'usda', 'jumbo', 'cash'));
alter table transactions add column property_in_hoa boolean not null default false;
alter table transactions add column property_in_special_district boolean not null default false;
alter table transactions add column special_district_annual_cost numeric;

-- 2. Offer details: add state-specific offer fields
alter table offer_details add column option_period_days integer;
alter table offer_details add column option_fee numeric;
alter table offer_details add column option_fee_delivered boolean not null default false;
alter table offer_details add column option_fee_delivery_date date;
alter table offer_details add column investigation_contingency_days integer;
alter table offer_details add column contract_type text;
alter table offer_details add column seller_repair_cap_percent numeric;

-- 3. Insurance info: add state-specific insurance fields
alter table insurance_info add column insurance_type text check (insurance_type in ('homeowners', 'wind', 'flood', 'earthquake', 'sinkhole', 'title_owner', 'title_lender'));
alter table insurance_info add column flood_zone text;
alter table insurance_info add column flood_insurance_required boolean;
alter table insurance_info add column wind_separate_policy boolean;
alter table insurance_info add column hurricane_deductible_percent numeric;
alter table insurance_info add column wildfire_zone boolean;
alter table insurance_info add column fair_plan boolean;

-- 4. Deadlines: expand type CHECK constraint to include state-specific deadline types
-- First drop the existing constraint, then re-add with expanded values
alter table deadlines drop constraint if exists deadlines_type_check;
alter table deadlines add constraint deadlines_type_check check (
  type in (
    -- Original types
    'earnest-money', 'inspection', 'appraisal', 'financing', 'disclosure', 'closing', 'custom',
    -- State-specific additions
    'option-period',              -- TX: option period expiry
    'option-fee-delivery',        -- TX: option fee delivery deadline
    'investigation',              -- CA: investigation contingency (broader than inspection)
    'title-commitment-delivery',  -- Seller must deliver title commitment
    'title-review',               -- Buyer review period after title receipt
    'hoa-doc-review',             -- HOA document cancellation right window
    'loan-application',           -- Deadline to submit loan application
    'contingency-removal',        -- CA: buyer must affirmatively remove
    'nbp-response',               -- CA: buyer response to Notice to Buyer to Perform
    'insurance-binder',           -- Insurance must be bound before closing
    'survey',                     -- TX: survey delivery deadline
    'seller-disclosure-delivery'  -- Seller must deliver disclosures
  )
);
