-- ============================================================
-- 008: Add archived boolean to transactions
--
-- Archive is not a phase — it's a separate dimension. A transaction
-- in any phase can be shelved and later restored to exactly where
-- it was. This replaces the pattern of setting current_phase to
-- "post-close" for archiving.
-- ============================================================

ALTER TABLE transactions ADD COLUMN archived boolean NOT NULL DEFAULT false;
CREATE INDEX idx_transactions_archived ON transactions(archived);
