-- ============================================================
-- HomeBuyer Pro — Test Data Seed
-- Run in Supabase SQL Editor AFTER all migrations (001-008)
--
-- Creates test data for:
--   Agent: b8bfaed5-1e92-4ff9-b8c4-4a053d95452f
--   Buyer: ricardocarr0817@gmail.com
-- ============================================================

-- Resolve buyer UUID from email
DO $$
DECLARE
  v_agent_id uuid := 'b8bfaed5-1e92-4ff9-b8c4-4a053d95452f';
  v_buyer_id uuid;

  -- Transaction IDs (pre-generated for FK references)
  v_tx_shopping uuid := gen_random_uuid();
  v_tx_offer uuid := gen_random_uuid();
  v_tx_escrow uuid := gen_random_uuid();
  v_tx_closing uuid := gen_random_uuid();
  v_tx_archived uuid := gen_random_uuid();
  v_tx_buyer uuid := gen_random_uuid();

  -- Document IDs
  v_doc_contract uuid := gen_random_uuid();
  v_doc_inspection uuid := gen_random_uuid();
  v_doc_le uuid := gen_random_uuid();
  v_doc_appraisal uuid := gen_random_uuid();

  -- Saved home IDs
  v_home1 uuid := gen_random_uuid();
  v_home2 uuid := gen_random_uuid();
  v_home3 uuid := gen_random_uuid();
  v_home4 uuid := gen_random_uuid();
  v_home5 uuid := gen_random_uuid();

BEGIN
  -- Find buyer by email
  SELECT id INTO v_buyer_id FROM auth.users WHERE email = 'ricardocarr0817@gmail.com';

  -- ============================================================
  -- PROFILES (upsert to avoid duplicates)
  -- ============================================================
  INSERT INTO profiles (user_id, role, display_name) VALUES
    (v_agent_id, 'agent', 'Sarah Mitchell')
  ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, role = EXCLUDED.role;

  IF v_buyer_id IS NOT NULL THEN
    INSERT INTO profiles (user_id, role, display_name) VALUES
      (v_buyer_id, 'buyer', 'Ricardo Carrasco')
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, role = EXCLUDED.role;
  END IF;

  -- ============================================================
  -- AGENT TRANSACTIONS (5 clients at different phases)
  -- ============================================================

  -- Client 1: Shopping phase — just browsing
  INSERT INTO transactions (id, user_id, agent_id, client_name, client_email, property_address, purchase_price, current_phase, archived)
  VALUES (v_tx_shopping, v_agent_id, v_agent_id, 'Marcus & Jen Rivera', 'rivera.family@gmail.com', 'TBD', 0, 'shopping', false);

  -- Client 2: Offer phase — selected a property
  INSERT INTO transactions (id, user_id, agent_id, client_name, client_email, property_address, purchase_price, current_phase, archived)
  VALUES (v_tx_offer, v_agent_id, v_agent_id, 'David Chen', 'dchen@outlook.com', '742 Evergreen Terrace, Springfield, FL 32801', 485000, 'offer', false);

  -- Client 3: Escrow phase — under contract
  INSERT INTO transactions (id, user_id, agent_id, client_name, client_email, property_address, purchase_price, current_phase, contract_acceptance_date, closing_date, earnest_money_amount, earnest_money_status, escrow_company, escrow_contact, archived)
  VALUES (v_tx_escrow, v_agent_id, v_agent_id, 'Priya & Amit Patel', 'priya.patel@gmail.com', '1284 Ocean Drive, Jacksonville, FL 32225', 625000, 'escrow', '2026-04-15', '2026-05-30', 15000, 'confirmed', 'First American Title', 'Lisa Nguyen (904) 555-0147', false);

  -- Client 4: Closing phase — almost done
  INSERT INTO transactions (id, user_id, agent_id, client_name, client_email, property_address, purchase_price, current_phase, contract_acceptance_date, closing_date, earnest_money_amount, earnest_money_status, escrow_company, escrow_contact, closing_metadata, archived)
  VALUES (v_tx_closing, v_agent_id, v_agent_id, 'Tom & Rachel Williams', 'twilliams@yahoo.com', '556 Palm Bay Road, Melbourne, FL 32904', 389000, 'closing', '2026-03-20', '2026-05-01', 10000, 'held', 'Fidelity National Title', 'Mark Santos (321) 555-0198', '{"walkthrough_items":{},"signing_date":"2026-04-29","signing_location":"Fidelity National Title Office","signing_confirmed":true,"wire_verified_steps":[true,true,false],"wire_status":"pending","wire_receipt_doc_id":null,"cd_received_confirmed":true,"cash_to_close_confirmed":false,"title_acknowledged":true,"funding_steps":[{"step":"Lender Funds","status":"in-progress"},{"step":"Escrow Disburses","status":"pending"},{"step":"County Records","status":"pending"},{"step":"Keys Released","status":"pending"}],"underwriting_conditions":[{"description":"Final employment verification","status":"cleared"},{"description":"Proof of insurance binder","status":"submitted"}]}', false);

  -- Client 5: Archived — deal fell through in escrow
  INSERT INTO transactions (id, user_id, agent_id, client_name, client_email, property_address, purchase_price, current_phase, contract_acceptance_date, earnest_money_amount, earnest_money_status, archived)
  VALUES (v_tx_archived, v_agent_id, v_agent_id, 'Alex Morrison', 'alex.m@proton.me', '203 Magnolia Lane, Orlando, FL 32806', 315000, 'escrow', '2026-02-10', 8000, 'sent', true);

  -- ============================================================
  -- SAVED HOMES (for shopping + offer clients)
  -- ============================================================

  -- Shopping client homes
  INSERT INTO saved_homes (id, user_id, deal_id, address, price, beds, baths, sqft, status) VALUES
    (v_home1, v_agent_id, v_tx_shopping, '4521 Lakewood Dr, Tampa, FL 33611', 425000, 3, 2, '1,850', 'interested'),
    (v_home2, v_agent_id, v_tx_shopping, '891 Bayshore Blvd, Tampa, FL 33606', 515000, 4, 3, '2,200', 'toured'),
    (v_home3, v_agent_id, v_tx_shopping, '2200 Henderson Ave, Tampa, FL 33629', 389000, 3, 2, '1,650', 'interested');

  -- Offer client home (the selected property)
  INSERT INTO saved_homes (id, user_id, deal_id, address, price, beds, baths, sqft, status) VALUES
    (v_home4, v_agent_id, v_tx_offer, '742 Evergreen Terrace, Springfield, FL 32801', 485000, 4, 2.5, '2,100', 'offer-pending');

  -- Update offer transaction to reference the selected home
  UPDATE transactions SET saved_home_id = v_home4 WHERE id = v_tx_offer;

  -- ============================================================
  -- DEADLINES (for escrow + closing clients)
  -- ============================================================

  INSERT INTO deadlines (deal_id, name, type, due_date, status) VALUES
    -- Escrow client (Patel)
    (v_tx_escrow, 'Inspection Contingency', 'inspection', '2026-05-02', 'completed'),
    (v_tx_escrow, 'Appraisal Contingency', 'appraisal', '2026-05-06', 'upcoming'),
    (v_tx_escrow, 'Financing Contingency', 'financing', '2026-05-06', 'upcoming'),
    (v_tx_escrow, 'Closing Date', 'closing', '2026-05-30', 'upcoming'),
    -- Closing client (Williams)
    (v_tx_closing, 'Inspection Contingency', 'inspection', '2026-04-06', 'completed'),
    (v_tx_closing, 'Appraisal Contingency', 'appraisal', '2026-04-10', 'completed'),
    (v_tx_closing, 'Financing Contingency', 'financing', '2026-04-10', 'completed'),
    (v_tx_closing, 'Closing Date', 'closing', '2026-05-01', 'due-soon');

  -- ============================================================
  -- DOCUMENTS (for escrow client — no actual files, just metadata)
  -- ============================================================

  INSERT INTO documents (id, deal_id, name, file_path, file_size, mime_type, doc_type, category, stage, status, source_type, ai_summary) VALUES
    (v_doc_contract, v_tx_escrow, 'Purchase_Contract_Patel.pdf', v_tx_escrow || '/contract/Purchase_Contract_Patel.pdf', 245000, 'application/pdf', 'purchase_contract', 'offer', 'escrow', 'processed', 'buyer-upload', 'Purchase contract for 1284 Ocean Drive. Purchase price $625,000 with 20% down payment. 45-day closing timeline. Standard contingencies for inspection (17 days), appraisal (21 days), and financing (21 days).'),
    (v_doc_inspection, v_tx_escrow, 'Inspection_Report_OceanDr.pdf', v_tx_escrow || '/inspection/Inspection_Report_OceanDr.pdf', 1800000, 'application/pdf', 'inspection_report', 'inspections', 'escrow', 'processed', 'collaborator-upload', 'General home inspection of 1284 Ocean Drive. Overall condition: Good. Minor issues found: aging HVAC system (est. 3-5 years remaining), minor grout cracking in master bath, one GFI outlet non-functional in garage. No major structural concerns.'),
    (v_doc_le, v_tx_escrow, 'Loan_Estimate_WellsFargo.pdf', v_tx_escrow || '/le/Loan_Estimate_WellsFargo.pdf', 320000, 'application/pdf', 'loan_estimate', 'financing', 'escrow', 'processed', 'buyer-upload', 'Loan estimate from Wells Fargo for 30-year fixed at 6.25%. Loan amount $500,000. Monthly P&I: $3,078. Cash to close estimated at $142,500 including down payment, lender fees ($1,850), and third-party fees ($3,200).'),
    (v_doc_appraisal, v_tx_escrow, 'Appraisal_1284OceanDr.pdf', v_tx_escrow || '/appraisal/Appraisal_1284OceanDr.pdf', 950000, 'application/pdf', 'appraisal', 'appraisal', 'escrow', 'processed', 'collaborator-upload', 'Appraisal for 1284 Ocean Drive. Appraised value: $630,000 (above purchase price). Comparable sales support valuation. Property in good condition, 2018 construction.');

  -- ============================================================
  -- LOAN ESTIMATES (for escrow client — 2 competing offers)
  -- ============================================================

  INSERT INTO loan_estimates (deal_id, lender, product, loan_amount, down_payment, rate, apr, points, lender_fees, third_party_fees, pmi_monthly, impounds, cash_to_close, lock_status, lock_expires, is_chosen, pdf_document_id) VALUES
    (v_tx_escrow, 'Wells Fargo', '30-Year Fixed', 500000, 125000, 6.25, 6.41, 0, 1850, 3200, 0, true, 142500, 'locked', '2026-05-15', true, v_doc_le),
    (v_tx_escrow, 'Rocket Mortgage', '30-Year Fixed', 500000, 125000, 6.50, 6.72, 0, 2100, 3400, 0, false, 143800, 'floating', null, false, null);

  -- ============================================================
  -- REPAIR ITEMS (from inspection)
  -- ============================================================

  INSERT INTO repair_items (deal_id, description, category, estimated_cost, severity, status, source_document_id) VALUES
    (v_tx_escrow, 'HVAC system aging — 3-5 years remaining life', 'hvac', 5500, 'major', 'requested', v_doc_inspection),
    (v_tx_escrow, 'GFI outlet non-functional in garage', 'electrical', 150, 'minor', 'agreed', v_doc_inspection),
    (v_tx_escrow, 'Minor grout cracking in master bathroom', 'cosmetic', 300, 'cosmetic', 'pending', v_doc_inspection);

  -- ============================================================
  -- COLLABORATOR LINKS (for escrow client)
  -- ============================================================

  INSERT INTO collaborator_links (deal_id, recipient_role, recipient_email, status) VALUES
    (v_tx_escrow, 'lender', 'loans@wellsfargo.example.com', 'active'),
    (v_tx_escrow, 'inspector', 'mike@floridainspections.example.com', 'active');

  -- ============================================================
  -- BUYER TRANSACTION (if buyer account exists)
  -- ============================================================

  IF v_buyer_id IS NOT NULL THEN
    INSERT INTO transactions (id, user_id, property_address, purchase_price, current_phase, archived)
    VALUES (v_tx_buyer, v_buyer_id, 'TBD', 0, 'shopping', false);

    -- Buyer saved homes
    INSERT INTO saved_homes (id, user_id, deal_id, address, price, beds, baths, sqft, status) VALUES
      (v_home5, v_buyer_id, v_tx_buyer, '3100 Coral Way, Miami, FL 33145', 475000, 3, 2, '1,900', 'interested');
  END IF;

  RAISE NOTICE 'Seed complete! Agent has 5 clients (4 active + 1 archived). Buyer has 1 shopping transaction.';
END $$;
