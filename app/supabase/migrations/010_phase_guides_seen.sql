-- Add seen_phase_guides to profiles for walkthrough persistence
ALTER TABLE profiles
  ADD COLUMN seen_phase_guides jsonb NOT NULL DEFAULT '[]'::jsonb;

-- RPC to append a phase idempotently
CREATE OR REPLACE FUNCTION append_seen_phase_guide(p_user_id uuid, p_phase text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE profiles
  SET seen_phase_guides = CASE
    WHEN NOT seen_phase_guides @> to_jsonb(p_phase)
    THEN seen_phase_guides || to_jsonb(p_phase)
    ELSE seen_phase_guides
  END,
  updated_at = now()
  WHERE user_id = p_user_id;
$$;
