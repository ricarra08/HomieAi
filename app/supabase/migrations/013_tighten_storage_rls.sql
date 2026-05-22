-- ============================================================
-- 013: Tighten storage RLS for the deal-documents bucket
--
-- The original policies in 001_initial_schema.sql only checked
-- `auth.role() = 'authenticated'`, meaning ANY logged-in user could
-- read/upload/delete ANY file in the bucket. Files are laid out at
-- "{transaction_id}/{uuid}/{filename}", so we can scope access by
-- joining the first folder back to transactions and verifying the
-- caller is the buyer or the assigned agent.
--
-- The service-role client (used by /api/collaborator/upload to receive
-- files from unauthenticated collaborators) bypasses RLS, so that path
-- is unaffected by these policies.
-- ============================================================

DROP POLICY IF EXISTS "Users can upload documents to their deals" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their deal documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their deal documents" ON storage.objects;

-- Helper: extract the transaction id from a storage object key, returning NULL when the leading
-- segment isn't a valid uuid (defensive against unexpected key shapes).
CREATE OR REPLACE FUNCTION public.deal_documents_txn_id(object_name text)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  first_segment text;
BEGIN
  first_segment := (storage.foldername(object_name))[1];
  IF first_segment IS NULL THEN
    RETURN NULL;
  END IF;
  BEGIN
    RETURN first_segment::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN NULL;
  END;
END;
$$;

CREATE POLICY "Users and agents can upload to their deal storage"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'deal-documents'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = public.deal_documents_txn_id(name)
        AND (t.user_id = auth.uid() OR t.agent_id = auth.uid())
    )
  );

CREATE POLICY "Users and agents can read their deal storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'deal-documents'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = public.deal_documents_txn_id(name)
        AND (t.user_id = auth.uid() OR t.agent_id = auth.uid())
    )
  );

CREATE POLICY "Users and agents can delete their deal storage"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'deal-documents'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = public.deal_documents_txn_id(name)
        AND (t.user_id = auth.uid() OR t.agent_id = auth.uid())
    )
  );
