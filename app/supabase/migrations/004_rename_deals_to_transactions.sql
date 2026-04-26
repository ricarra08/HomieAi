-- ============================================================
-- 004: Rename deals → transactions + add agent_id
-- Part of onboarding/role system: agents will create transactions
-- for their clients via agent_id column.
--
-- IMPORTANT: Only the TABLE is renamed. FK columns (deal_id) on
-- child tables are intentionally preserved to minimize blast radius.
-- The storage bucket (deal-documents) is also unchanged.
-- ============================================================

-- 1. Rename the table
ALTER TABLE deals RENAME TO transactions;

-- 2. Rename the trigger
ALTER TRIGGER set_deals_updated_at ON transactions RENAME TO set_transactions_updated_at;

-- 3. Rename the index
ALTER INDEX idx_deals_user RENAME TO idx_transactions_user;

-- 4. Add agent_id column (must come before RLS policy that references it)
ALTER TABLE transactions ADD COLUMN agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX idx_transactions_agent ON transactions(agent_id);

-- 5. Add client fields
ALTER TABLE transactions ADD COLUMN client_name text;
ALTER TABLE transactions ADD COLUMN client_email text;

-- 6. Drop old RLS policy and create new one (agent_id column now exists)
DROP POLICY IF EXISTS "Users can manage their own deals" ON transactions;
CREATE POLICY "Users can manage their own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id OR auth.uid() = agent_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = agent_id);
