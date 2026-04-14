-- ============================================================
-- 003: Add closing_metadata jsonb column to deals
-- Stores all closing-phase state: walkthrough, signing, wire,
-- underwriting conditions, funding timeline steps.
-- ============================================================

ALTER TABLE deals ADD COLUMN IF NOT EXISTS closing_metadata jsonb DEFAULT '{}';
