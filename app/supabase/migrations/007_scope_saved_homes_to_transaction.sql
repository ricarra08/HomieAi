-- ============================================================
-- 007: Scope saved_homes to transactions
--
-- saved_homes was scoped by user_id only, causing agents' saved
-- homes to pool across all clients. Add deal_id FK so homes are
-- scoped per-transaction, matching every other child table.
-- ============================================================

-- 1. Add deal_id FK (nullable — homes can exist before transaction link)
ALTER TABLE saved_homes ADD COLUMN deal_id uuid REFERENCES transactions(id) ON DELETE CASCADE;
CREATE INDEX idx_saved_homes_deal ON saved_homes(deal_id);

-- 2. Update RLS to include agent access via transaction
DROP POLICY IF EXISTS "Users can manage their own saved homes" ON saved_homes;
CREATE POLICY "Users and agents can manage saved homes"
  ON saved_homes FOR ALL
  USING (
    auth.uid() = user_id
    OR deal_id IN (SELECT id FROM transactions WHERE agent_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id
    OR deal_id IN (SELECT id FROM transactions WHERE agent_id = auth.uid())
  );
