# Phazr

AI-powered real estate transaction management for homebuyers and their agents.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Database & Auth:** Supabase (Postgres + RLS + Auth + Storage)
- **State:** React Query (server) + Zustand (client)
- **AI:** OpenAI GPT-4o (document extraction, copilot chat)
- **Styling:** Tailwind CSS 4, DM Sans / DM Serif Display fonts
- **UI:** Shadcn components, Lucide icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
OPENAI_API_KEY=<your-openai-key>
```

### Database Setup

Run migrations in order in the [Supabase SQL Editor](https://supabase.com/dashboard):

```
app/supabase/migrations/001_initial_schema.sql
app/supabase/migrations/002_schema_v2.sql
app/supabase/migrations/003_closing_metadata.sql
app/supabase/migrations/004_rename_deals_to_transactions.sql
app/supabase/migrations/005_profiles_table.sql
app/supabase/migrations/006_fix_status_and_agent_rls.sql
```

## Architecture

### Roles

Users select a role during onboarding:
- **Buyer** — manages their own home purchase through 5 phases
- **Agent** — manages multiple client transactions from a dashboard

### Transaction Phases

Every transaction progresses through: **Shopping** > **Offer** > **Escrow** > **Closing** > **Post-Close**

The DB `transactions.current_phase` is the single source of truth. Zustand stores the phase for reactive rendering but does not persist it — on page load, the phase is synced from the DB.

### Database Schema (11 tables)

| Table | Purpose |
|-------|---------|
| `profiles` | User role (buyer/agent) and display name |
| `saved_homes` | Properties tracked during shopping phase |
| `transactions` | Core container — one per home purchase |
| `offer_details` | Offer terms, contingencies, checklist |
| `documents` | Uploaded files with AI extraction + classification |
| `deadlines` | Contingency and closing date tracking |
| `loan_estimates` | Lender quotes for side-by-side comparison |
| `repair_items` | Inspection findings and repair negotiations |
| `insurance_info` | Homeowners insurance binder tracking |
| `collaborator_links` | Secure upload links for agents/lenders/escrow |
| `copilot_messages` | AI chat history per user and transaction |

All tables use Row Level Security. Child tables reference `transactions` via `deal_id` FK (intentionally preserved column name). Agents access client data via `agent_id` on `transactions`.

### Key Directories

```
app/src/
  app/
    (app)/          # Authenticated routes (dashboard, documents, financing)
    (auth)/         # Login, signup
    (onboarding)/   # Role selection for new users
    (public)/       # Collaborator upload
    api/            # Server routes (copilot, documents, collaborators)
    try/            # Guest demo
  components/
    agent/          # Agent dashboard, add client dialog
    closing/        # Closing phase components
    copilot/        # AI assistant panel
    documents/      # Upload, viewer, collaborator links
    escrow/         # Escrow phase components
    financing/      # Loan estimate comparison
    layout/         # Sidebar, ProgressStepper, Footer
    offer/          # Offer workspace
    onboarding/     # Role selection, journey picker
    post-close/     # Archive view
    shopping/       # Home search, buy box
    transaction/    # PhaseDashboard, setup form, summary card
    ui/             # Shadcn base components
  lib/
    ai/             # Prompts, extraction schemas, context engine
    hooks/          # React Query queries, mutations, query keys
    supabase/       # Client, server, middleware
    store.ts        # Zustand UI state
    types.ts        # All TypeScript interfaces
```

### State Management

- **Server state:** React Query — all DB reads go through query hooks (`useTransaction`, `useDocuments`, etc.)
- **Mutations:** React Query mutations with cache invalidation (`useCreateTransaction`, `useTransitionPhase`, etc.)
- **Client state:** Zustand (`useUIStore`) — persists only `activeTransactionId` to localStorage. Phase, sidebar, viewer state are ephemeral.
- **Phase source of truth:** DB (`transactions.current_phase`). Zustand `currentPhase` is synced from DB on transaction switch and updated optimistically on local navigation.

### AI Features

- **Document Processing:** Upload PDF > text extraction (unpdf + GPT-4o vision fallback) > classification > field extraction > summarization
- **Copilot Chat:** Streaming GPT-4o responses grounded in transaction context (documents, deadlines, loan estimates)
- **Auto-populate:** Loan estimate fields extracted from uploaded LE PDFs
