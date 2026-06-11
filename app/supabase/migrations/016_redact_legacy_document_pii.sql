-- Migration 016: Purge legacy document-derived text written before PII redaction (audit H3).
--
-- Documents processed before lib/security/pii-redaction.ts existed may hold SSNs, bank
-- account numbers, routing numbers, or wire instructions in plaintext inside
-- extracted_text / ai_summary / extracted_fields. The uploaded PDF in Storage remains
-- the system of record, so these derived columns are safely re-derivable.
--
-- This nulls the derived columns (preserving underscore-prefixed metadata keys such as
-- _inspection_slot and _scope_warning) and sets status = 'failed' so the existing
-- "Retry analysis" button in the document viewer re-runs each document through the
-- new redacting pipeline.
--
-- Run manually via the Supabase SQL editor. Idempotent: already-purged rows have null
-- extracted_text/ai_summary and are not matched again.

update documents
set extracted_text = null,
    ai_summary = null,
    extracted_fields = nullif((
      select coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
      from jsonb_each(coalesce(extracted_fields, '{}'::jsonb))
      where key like '\_%' escape '\'
    ), '{}'::jsonb),
    status = 'failed',
    updated_at = now()
where extracted_text is not null
   or ai_summary is not null;
