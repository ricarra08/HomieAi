-- ============================================================
-- 014: Associate collaborator-uploaded documents with their originating link
--
-- Audit finding M-2: collaborator uploads are unauthenticated (token-only) and their per-link
-- recipient_role / requested_documents scope was never enforced. Recording which link produced a
-- document lets the processing pipeline check that scope server-side after classification, and
-- gives an audit trail of which collaborator submitted each file.
--
-- Nullable + ON DELETE SET NULL: only collaborator uploads set it; buyer/agent uploads leave it
-- null, and revoking/deleting a link must not cascade-delete the documents it produced.
-- ============================================================

ALTER TABLE documents
  ADD COLUMN collaborator_link_id uuid REFERENCES collaborator_links(id) ON DELETE SET NULL;

CREATE INDEX idx_documents_collaborator_link ON documents(collaborator_link_id);
