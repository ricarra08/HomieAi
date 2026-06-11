# AI Data Processing Record — OpenAI

Operational record backing Compliance Brief §4.2 (AI Processing and Third-Party Data
Transmission). Update whenever the AI provider, agreement, or data-control settings change.

## Provider

- **Provider:** OpenAI (API platform)
- **Models in use:** gpt-4o, gpt-4o-mini (document classification/extraction/summarization,
  copilot chat, draft questions, valuation web-search data provider)
- **Training default:** API inputs/outputs are NOT used for model training by default
  (OpenAI policy since 2023-03-01); abuse-monitoring retention up to ~30 days, then deleted.

## Data Processing Addendum (DPA)

- **Executed via:** https://openai.com/policies/data-processing-addendum/ (self-serve form;
  countersigned PDF returned by email)
- **Date executed:** _[fill in]_
- **Signatory:** _[name, title]_
- **Legal entity:** _[fill in]_
- **Countersigned PDF stored at:** _[fill in — keep a copy outside the repo]_

## Organization data-control settings

- **Verified at:** https://platform.openai.com/settings/organization/data-controls
- **Date verified:** 2026-06-11 — all data-sharing controls set to disabled by the founder
- **"Share inputs/outputs to improve models":** disabled
- **Evaluation / fine-tuning data sharing:** disabled
- **Evidence:** _[screenshot recommended — capture the data-controls page showing all toggles off]_

## Platform-side technical controls (in code, commit `15aa85a`)

- Automated PII redaction (SSNs, bank account, ABA routing, card numbers, wire-instruction
  digits) applied to document text BEFORE transmission to OpenAI and before storing any
  derived text/summaries/fields — `app/src/lib/security/pii-redaction.ts`.
- Known residual: scanned/image PDFs transit OpenAI as images for optical text extraction
  before redaction can occur (documented in Brief §4.2).
- Prompt-injection containment on all document-derived prompt content
  (`fenceUntrustedContent`, commit `ce96972`).

## Revisit triggers

- Brokerage/enterprise due diligence → request OpenAI Zero Data Retention (ZDR) eligibility
  and consider app-level encryption of `documents.extracted_text`.
- Provider or policy change → re-verify training defaults and re-execute DPA as needed
  (Brief §4.2 commits to migrating providers if policies become inconsistent).
