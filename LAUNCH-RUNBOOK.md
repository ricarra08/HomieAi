# Phazr — Beta Launch Runbook (2026-06-12)

Everything code-side is done and committed. This is the founder's manual checklist, in
order. Allow ~2 hours including the golden path. Do not send invites until every
section is checked.

---

## 1. Supabase dashboard (~20 min)

- [ ] **Migrations**: confirm 001–015 are applied, then apply **016, 017, 018, 019, 020**
      manually in the SQL editor (in order). Verify with:
      `select proname from pg_proc where proname in ('consume_rate_limit','increment_uploads_received','append_seen_phase_guide');`
      ⚠️ 016 is destructive to legacy docs (sets them `status='failed'` for re-processing) —
      it was run 2026-06-11 per the AI-Data-Processing-Record; just confirm, don't re-run blindly.
- [ ] **Auth → SMTP (the most likely launch-day failure)**: Supabase's built-in sender
      allows ~2–4 auth emails/hour. Multiple buyers signing up the same afternoon WILL
      hit it and confirmation emails silently stop. Configure **custom SMTP via Resend**
      (smtp.resend.com, same verified phazr.co domain) before invites go out.
- [ ] **Auth → URL configuration**: Site URL = `https://phazr.co`; add
      `https://phazr.co/auth/callback` to Additional Redirect URLs.
- [ ] **Auth → Email provider**: "Confirm email" = ON (the signup flow assumes it).
- [ ] **Auth → Passwords**: minimum length = **12** (client enforces it; the server
      policy must match — currently unset).
- [ ] **Storage**: `deal-documents` bucket exists, is **private**, global upload limit ≥ 25MB.
- [ ] **No password-reset flow exists in the app.** If a beta user is locked out, send a
      recovery link from Authentication → Users. (Fast-follow item.)
- [ ] **Prod data hygiene**: confirm no seed/test transactions are visible (do NOT run
      `seed.sql` against prod — it's test data wired to your own email).

## 2. Vercel (~15 min)

- [ ] Project **Root Directory = `app`**, framework Next.js, Node 20+.
- [ ] **Env vars (Production), set BEFORE the deploy build** (NEXT_PUBLIC_* are inlined):
      `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
      `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `GEOAPIFY_KEY`,
      `INTERNAL_API_SECRET` (generate: `openssl rand -hex 32`),
      `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL=https://phazr.co`, `EMAIL_FROM` (optional —
      defaults to `Phazr <notifications@phazr.co>`).
- [ ] **Function duration**: routes need 60s (`documents/process`, `copilot/chat`,
      `valuation`, `market`). Confirm Fluid Compute is enabled (default on new projects);
      legacy Hobby's 10s cap kills document processing mid-flight. **Go/no-go check.**
- [ ] **Deployment Protection = OFF for Production.** If Vercel Authentication guards
      prod, lender upload links break AND the internal documents/process self-call gets
      an interstitial → every collaborator doc fails.
- [ ] Domain: `phazr.co` on Production; www → apex redirect; must match
      `NEXT_PUBLIC_SITE_URL` exactly (email links + same-origin CSRF check use it).

## 3. External services (~10 min)

- [ ] **Resend**: phazr.co domain verified (SPF + DKIM green) — sends fail or land in
      spam otherwise. Sender mailbox/domain must match `EMAIL_FROM`.
- [ ] **OpenAI**: set a **hard monthly budget cap ($50–100)** + email alerts at 50/75%.
      Per-user rate limits exist in code; the cap is the real backstop. Confirm the key
      has gpt-4o + web_search access (one valuation call post-deploy proves it).
- [ ] **Inbound legal mail**: terms/privacy cite `legal@phazr.co` / `privacy@phazr.co` —
      set up forwarding or accept they bounce for now (your call for a 5-user beta).

## 4. Post-deploy smoke test (~15 min, before any invite)

1. Fresh-email signup → confirmation arrives → callback lands on dashboard.
2. Upload a small PDF → reaches "processed".
3. Create a collaborator link → open in **incognito** → upload a <4MB PDF → appears in
   the buyer's doc list and processes. (Incognito matters: the bug class we fixed today
   only appears logged-out.)
4. Run one Home Value Scenarios card → verifies OpenAI key + 60s budget end-to-end.
5. Check Vercel function logs: no `durable_limiter_unavailable` (would mean migration
   019 or the service key is wrong).

## 5. The Golden Path (30 min, real documents)

Run the 10 steps in Pre-Beta-Requirements.md §Pre-Launch Checklist with a real LE and a
real inspection report. **If all 10 pass → send the first invite.**

## 6. Known-and-accepted for this beta (don't be surprised)

- **Collaborator uploads >4.5MB get a raw platform 413** (Vercel body cap; the page
  says 25MB). Inspection reports are the likely offender — pre-brief vendors to keep
  PDFs under ~4MB. Fix post-launch (direct-to-storage upload like the buyer path).
- No analytics (fast-follow #1), no in-app password reset, no e2e for Repair Tracker
  agreed-cost glitch (Tier 2, ships as known bug).
- `/signup?role=agent` doesn't preselect the agent role at onboarding (cosmetic).
- Support email is your personal Gmail (sidebar "Report an issue") — swap to
  support@phazr.co when inbound mail exists.

## 7. First 2 weeks (Bug Response Protocol)

- Check Supabase logs + Vercel function logs daily (structured `route`/`event` errors).
- Tier 1 bug: drop everything, fix in 24h, notify the affected user directly.
- Agent Zero is the first line of defense — she texts you, you triage against the tiers.
