-- ============================================================
-- 015: Secure append_seen_phase_guide RPC (audit finding L-1)
--
-- The original (migration 010) was SECURITY DEFINER, took p_user_id from the CALLER, and updated
-- `profiles WHERE user_id = p_user_id` with no auth.uid() guard and no REVOKE — so any caller
-- (authenticated or anon) could pass a victim's UUID and write their seen_phase_guides / bump
-- updated_at (cross-tenant write IDOR).
--
-- Fix: drop the p_user_id parameter and derive the user from auth.uid() inside the function;
-- validate p_phase; pin search_path; and restrict EXECUTE to the authenticated role.
-- ============================================================

-- The replacement has a different signature (text vs uuid,text), so CREATE OR REPLACE would leave
-- the vulnerable 2-arg overload in place. Drop it explicitly.
DROP FUNCTION IF EXISTS append_seen_phase_guide(uuid, text);
DROP FUNCTION IF EXISTS append_seen_phase_guide(text);

CREATE FUNCTION append_seen_phase_guide(p_phase text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  -- Only an authenticated caller, acting on their OWN profile.
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- Validate against the known phase set (mirrors the Phase type / profiles workflow).
  IF p_phase IS NULL OR p_phase NOT IN ('shopping', 'offer', 'escrow', 'closing', 'post-close') THEN
    RAISE EXCEPTION 'invalid phase: %', p_phase;
  END IF;

  UPDATE profiles
  SET seen_phase_guides = CASE
        WHEN NOT seen_phase_guides @> to_jsonb(p_phase)
        THEN seen_phase_guides || to_jsonb(p_phase)
        ELSE seen_phase_guides
      END,
      updated_at = now()
  WHERE user_id = v_uid;
END;
$$;

-- Least privilege: no PUBLIC/anon execute; only authenticated users may call it.
REVOKE ALL ON FUNCTION append_seen_phase_guide(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION append_seen_phase_guide(text) FROM anon;
GRANT EXECUTE ON FUNCTION append_seen_phase_guide(text) TO authenticated;
