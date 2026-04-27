-- ============================================================
-- 006: Fix document status constraint + agent RLS on child tables
--
-- A. The document processing pipeline uses "processing", "processed",
--    and "failed" statuses that were missing from the CHECK constraint.
-- B. Child table RLS policies only checked user_id, blocking agents
--    from accessing their clients' data entirely.
-- ============================================================

-- ============================================================
-- A. Fix document status CHECK constraint
-- ============================================================

ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_status_check;
ALTER TABLE documents ADD CONSTRAINT documents_status_check
  CHECK (status IN (
    'required', 'missing', 'uploaded', 'processing', 'processed', 'failed',
    'signed', 'acknowledged', 'final', 'read-only'
  ));

-- ============================================================
-- B. Update child table RLS policies to include agent_id access
-- ============================================================

-- offer_details
DROP POLICY IF EXISTS "Users can manage offer details for their deals" ON offer_details;
CREATE POLICY "Users and agents can manage offer details"
  ON offer_details FOR ALL
  USING (deal_id IN (SELECT id FROM transactions WHERE user_id = auth.uid() OR agent_id = auth.uid()))
  WITH CHECK (deal_id IN (SELECT id FROM transactions WHERE user_id = auth.uid() OR agent_id = auth.uid()));

-- documents
DROP POLICY IF EXISTS "Users can manage documents for their deals" ON documents;
CREATE POLICY "Users and agents can manage documents"
  ON documents FOR ALL
  USING (deal_id IN (SELECT id FROM transactions WHERE user_id = auth.uid() OR agent_id = auth.uid()))
  WITH CHECK (deal_id IN (SELECT id FROM transactions WHERE user_id = auth.uid() OR agent_id = auth.uid()));

-- deadlines
DROP POLICY IF EXISTS "Users can manage deadlines for their deals" ON deadlines;
CREATE POLICY "Users and agents can manage deadlines"
  ON deadlines FOR ALL
  USING (deal_id IN (SELECT id FROM transactions WHERE user_id = auth.uid() OR agent_id = auth.uid()))
  WITH CHECK (deal_id IN (SELECT id FROM transactions WHERE user_id = auth.uid() OR agent_id = auth.uid()));

-- loan_estimates
DROP POLICY IF EXISTS "Users can manage loan estimates for their deals" ON loan_estimates;
CREATE POLICY "Users and agents can manage loan estimates"
  ON loan_estimates FOR ALL
  USING (deal_id IN (SELECT id FROM transactions WHERE user_id = auth.uid() OR agent_id = auth.uid()))
  WITH CHECK (deal_id IN (SELECT id FROM transactions WHERE user_id = auth.uid() OR agent_id = auth.uid()));

-- repair_items
DROP POLICY IF EXISTS "Users can manage repair items for their deals" ON repair_items;
CREATE POLICY "Users and agents can manage repair items"
  ON repair_items FOR ALL
  USING (deal_id IN (SELECT id FROM transactions WHERE user_id = auth.uid() OR agent_id = auth.uid()))
  WITH CHECK (deal_id IN (SELECT id FROM transactions WHERE user_id = auth.uid() OR agent_id = auth.uid()));

-- insurance_info
DROP POLICY IF EXISTS "Users can manage insurance info for their deals" ON insurance_info;
CREATE POLICY "Users and agents can manage insurance info"
  ON insurance_info FOR ALL
  USING (deal_id IN (SELECT id FROM transactions WHERE user_id = auth.uid() OR agent_id = auth.uid()))
  WITH CHECK (deal_id IN (SELECT id FROM transactions WHERE user_id = auth.uid() OR agent_id = auth.uid()));

-- collaborator_links
DROP POLICY IF EXISTS "Users can manage collaborator links for their deals" ON collaborator_links;
CREATE POLICY "Users and agents can manage collaborator links"
  ON collaborator_links FOR ALL
  USING (deal_id IN (SELECT id FROM transactions WHERE user_id = auth.uid() OR agent_id = auth.uid()))
  WITH CHECK (deal_id IN (SELECT id FROM transactions WHERE user_id = auth.uid() OR agent_id = auth.uid()));
