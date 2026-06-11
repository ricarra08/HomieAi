# Phazr — Distribution Playbook

## Table of Contents

1. [Context](#1-context)
2. [Three Concurrent Distribution Strategies](#2-three-concurrent-distribution-strategies)
   - [Strategy A: Agent-Led Product Distribution](#strategy-a-agent-led-product-distribution)
   - [Strategy B: Free Document Intelligence Tool (Viral Wedge)](#strategy-b-free-document-intelligence-tool-viral-wedge)
   - [Strategy C: FL-First Content & Community Engine](#strategy-c-fl-first-content--community-engine)
   - [How the Three Strategies Reinforce Each Other](#how-the-three-strategies-reinforce-each-other)
   - [Simulation-Tested Risk: The Broker Veto](#simulation-tested-risk-the-broker-veto) *(new)*
   - [Simulation-Tested Objections: What Users Actually Push Back On](#simulation-tested-objections-what-users-actually-push-back-on) *(new)*
3. [Phase 0: Launch-Ready (Now to May Launch)](#3-phase-0-launch-ready-now--may-launch)
   - [0.7 — Broker Inoculation Kit](#07--broker-inoculation-kit-critical--protects-strategy-a) *(new)*
4. [Phase 1: Agent Zero + Wedge Launch (Weeks 1-4)](#4-phase-1-agent-zero--wedge-launch-weeks-1-4)
   - [4.6 — Title Company Early Engagement](#46--title-company-early-engagement-simulation-informed) *(new)*
5. [Phase 2: Local Network Effect (Weeks 4-12)](#5-phase-2-local-network-effect-weeks-4-12)
   - [5.1 — Brokerage Pitch (Simulation-Revised)](#51--brokerage-pitch-strategy-a-expansion--simulation-revised) *(rewritten)*
6. [Phase 3: Scalable Channels (Months 3-6)](#6-phase-3-scalable-channels-months-3-6)
7. [What NOT To Do](#7-what-not-to-do)
8. [Technical Requirements](#8-technical-requirements)
9. [Key Files to Modify](#9-key-files-to-modify)
10. [Success Metrics](#10-success-metrics)
11. [Pitches & Scripts](#11-pitches--scripts)
12. [Bottom Line](#12-bottom-line)

---

## 1. Context

Phazr is a fully-built MVP (Phases 0-5) with zero distribution infrastructure. No landing page, no analytics, no email service, no referral loops, no SEO. The product is strong — document intelligence, LE/CD variance detection, AI copilot, wire fraud prevention — but invisible. The founder is solo, FL-based, has a realtor friend (8 years experience) who's been begging for this, an advisor who built PadX, and a May launch deadline. Other income covers runway. Goal: organic, delegatable growth.

**The problem isn't product. It's visibility.**

---

## 2. Three Concurrent Distribution Strategies

Most startups bet on one channel and pray. We're running three concurrently because they serve different buyer intent stages and reinforce each other. Each can operate independently, but together they create a compounding engine.

### Strategy A: Agent-Led Product Distribution

**Channel type:** Relationship-driven, high-trust, recurring
**Buyer intent:** Mid-funnel (already has an agent, actively in a transaction)
**CAC:** Near-zero (agents distribute for free because it saves them time)
**Time to impact:** Weeks 1-4

**The thesis:** Most prop-tech startups die trying to acquire buyers directly. Buyers are transient (2-month usage, then gone for 5-10 years), expensive to acquire ($50-200 CAC via paid), and don't know they need you until they're drowning in documents.

Agents are the recurring distribution engine. One agent does 10-30 transactions/year. One happy agent = 10-30 buyers/year, every year, for free. Your realtor friend isn't just your first user — she's your first distribution channel. If she loves it, she tells her brokerage. If her brokerage loves it, 20-50 agents start sending buyers. That's 200-1,500 buyers/year from a single brokerage relationship.

**The viral mechanic already exists** — collaborator upload links. Every time a buyer sends an upload link to their agent, lender, or escrow officer, those professionals see Phazr. But right now it's buried and manual. We need to make it effortless and visible.

**The flywheel:**
```
Agent sends invite link to buyer
  → Buyer creates workspace, uploads docs
  → Buyer sends collaborator links to lender, inspector, title
  → Those professionals see an organized buyer (and the brand)
  → Professionals mention it to other agents
  → New agents want it for THEIR buyers
  → More agents = more buyers = more professionals exposed
  → Flywheel accelerates
```

**Why this is primary:** Highest conviction, fastest to validate, lowest cost, and you already have Agent Zero (your realtor friend).

---

### Strategy B: Free Document Intelligence Tool (Viral Wedge)

**Channel type:** Product-led, self-serve, viral
**Buyer intent:** High-intent moment of confusion ("I just got this document, what does it mean?")
**CAC:** Zero (organic discovery + sharing)
**Time to impact:** Weeks 2-6

**The thesis:** The single highest-anxiety moment in homebuying is when a buyer receives a document they don't understand — a Loan Estimate, a Closing Disclosure, an inspection report, HOA bylaws. Right now they Google "what does my loan estimate mean" and get 2,000-word articles. What if they could just **upload the PDF and get an instant, personalized explanation?**

**The wedge product:** A free, ungated tool at `/explain` (or similar):

1. Buyer uploads a PDF (no signup required)
2. AI classifies the document, extracts key fields, generates a plain-English summary
3. Buyer sees: document type, key numbers highlighted, AI explanation of what matters
4. Below the results: "Want to track your full deal? Create your free workspace →"

**This already exists in your backend.** The `/api/documents/process` route does classification, extraction, and summarization. You just need a public-facing UI that exposes it without requiring auth.

**Why this is powerful:**
- Captures buyers at their moment of highest need (just received a confusing document)
- Zero-friction (no signup to get value)
- Naturally shareable ("I uploaded my LE and it told me my lender fees are 40% higher than average")
- Converts to full product ("Now track all your documents in one place")
- Creates a data flywheel (every uploaded document improves extraction models)
- SEO-friendly landing page ("Free Loan Estimate Analyzer", "Upload Your Closing Disclosure")

**The conversion funnel:**
```
Buyer Googles "what does my loan estimate mean"
  → Finds /explain page (SEO) or gets link from Reddit/community
  → Uploads PDF, gets instant AI explanation (no signup)
  → Sees: "Track your full deal — deadlines, documents, financing →"
  → Signs up → Creates workspace → Sends collaborator links
  → Agent sees the product → Flywheel A activates
```

**Key insight:** This wedge feeds Strategy A. Every buyer who discovers Phazr through the free tool and then shares a collaborator link with their agent creates an entry point for agent-led distribution.

---

### Strategy C: FL-First Content & Community Engine

**Channel type:** Organic/SEO, community, compounding
**Buyer intent:** Early-funnel (researching, anxious, preparing)
**CAC:** Time-only (content creation, community participation)
**Time to impact:** Weeks 4-12 (SEO), immediate (community)

**The thesis:** Florida is the perfect launch market. Post-Surfside SIRS legislation has created massive confusion in the condo market. 67% of FL homes have HOAs. 344K transactions/year. First-time buyers in FL are Googling questions nobody is answering well. The content that exists is generic, national, and written by SEO farms. There's a void for authoritative, FL-specific homebuying content — and you have the domain expertise to fill it.

**Two parallel tracks:**

#### Track 1: SEO Content (Compounding)

Write 10-15 high-intent articles targeting FL homebuyers. Each article ends with a CTA to the free document tool (Strategy B) or the full workspace.

| Query | Monthly Volume | Competition | Content Type |
|-------|---------------|-------------|--------------|
| "what is SIRS florida condo" | 2-5K | Very Low | Explainer + tool CTA |
| "florida hoa red flags" | 3-5K | Low | Checklist + tool CTA |
| "loan estimate vs closing disclosure" | 8K | Low | Comparison + tool CTA |
| "first time home buyer checklist florida" | 3K | Low | Guide + workspace CTA |
| "what is escrow florida" | 5-8K | Medium | Explainer + workspace CTA |
| "closing costs florida 2026" | 4-6K | Medium | Calculator + workspace CTA |
| "home inspection checklist florida" | 3-5K | Low | Checklist + workspace CTA |
| "wire fraud real estate" | 2-3K | Low | Safety guide + product CTA |

**Publish on:** Your domain `/blog` (SEO ownership), cross-post to Medium (extra distribution), share on LinkedIn (professional reach).

**Delegatable:** This is the most delegatable channel. Your realtor friend can co-author or review articles for credibility. You can hire a freelance writer ($50-100/article) who specializes in real estate content. You provide the domain expertise, they provide the writing.

#### Track 2: Community Presence (Immediate)

Go where anxious homebuyers already are:

- **Reddit:** r/FirstTimeHomeBuyer (200K+ members), r/RealEstate (800K+), r/FloridaMan (lol, but r/florida is real)
- **Facebook Groups:** "First Time Home Buyers Florida", "Miami Real Estate", "Tampa Bay Home Buyers"
- **TikTok/Reels:** Short-form "Did you know?" content about closing costs, escrow, wire fraud

**You don't need to be the face.** Your realtor friend posting "Here's what I tell my buyers about closing disclosures" with a link to your tool is 10x more credible than you posting as the founder.

**Community rules:**
- NEVER spam. Provide genuine value first. Answer questions. Share knowledge.
- Only mention Phazr when it's genuinely relevant ("I use this tool with my buyers to explain their LE")
- Build reputation over 2-4 weeks before any product mentions
- Let the community discover the product through your helpfulness

**The conversion funnel:**
```
Buyer finds FL-specific article via Google
  → Reads article, sees CTA for free document tool
  → Uploads their LE/CD, gets AI explanation
  → Signs up for full workspace
  → Sends collaborator link to agent
  → Agent discovers product → Flywheel A activates
```

---

### How the Three Strategies Reinforce Each Other

```
                    ┌──────────────────────┐
                    │    STRATEGY A         │
                    │  Agent-Led            │
                    │  (Relationship)       │
                    │                       │
                    │  Agent invites buyer  │
                    │  Buyer uses product   │
                    │  Collaborator links   │
                    │  expose professionals │
                    └──────┬───────┬────────┘
                           │       │
              Agents see   │       │  Organized buyers
              the product  │       │  share on social
                           │       │
    ┌──────────────────────▼─┐   ┌─▼──────────────────────┐
    │    STRATEGY B           │   │    STRATEGY C           │
    │  Free Document Tool     │   │  Content & Community    │
    │  (Product-Led)          │   │  (Organic/SEO)          │
    │                         │   │                         │
    │  Buyer uploads doc      │   │  Buyer finds article    │
    │  Gets instant value     │   │  Gets FL-specific help  │
    │  Converts to workspace  │◄──┤  CTA → document tool    │
    │  Sends collab links ────┼──►│  Testimonials → content │
    │                         │   │                         │
    └─────────────────────────┘   └─────────────────────────┘

    Each strategy feeds the others:
    • A produces testimonials → fuel for C
    • B captures confused buyers → some have agents → feeds A
    • C drives traffic to B → B converts to workspaces → generates collab links → feeds A
    • A generates collaborator exposure → professionals Google the product → find C
```

**No single point of failure.** If agent adoption is slow, the free tool still captures organic demand. If SEO takes time to rank, agent distribution fills the gap. If content creation stalls, the product's built-in virality (collaborator links) keeps working.

---

### Simulation-Tested Risk: The Broker Veto

We pressure-tested Strategy A through agent-network simulations. The baseline scenario projected 10-15 organic agent sign-ups at Agent Zero's brokerage over 12 weeks, with lenders inquiring after 2-3 exposures and title companies advocating unprompted. Promising.

Then we ran the same scenario with one variable changed: **the broker is actively skeptical.** The results were stark.

**70-80% of projected Strategy A growth disappears under broker skepticism.**

Here's why. The broker doesn't need to ban anything. A single offhand comment — "I'm not sure that's compliant with our E&O policy" or "let's not have agents sending random tools to clients without legal review" — is enough to:

1. **Neutralize Agent Zero.** She keeps using the product personally but stops recommending it to colleagues. The flywheel's engine goes silent.
2. **Freeze the brokerage.** Other agents sense leadership's stance and avoid adoption. A few independents still try it, but the 10-15 organic sign-ups collapse to 2-3.
3. **Poison the broader network.** The broker's skepticism leaks into Facebook groups, board meetings, and hallway conversations. It shapes the narrative about Phazr across the local agent community — not just inside one brokerage.

This is the **single biggest external veto point** the distribution plan must account for. It applies to any brokerage, not just Agent Zero's.

**Four levers that unlock the broker:**

| Lever | What It Is | When to Deploy |
|-------|-----------|----------------|
| **Compliance one-pager** | Pre-built doc addressing E&O, liability, data privacy, "not legal advice" disclaimers | Before the broker forms an opinion (Phase 0) |
| **Concrete deal data** | "3 buyers used it. After-hours calls dropped X%. Zero compliance incidents." | After first 3-5 deals close (Phase 1, Week 4) |
| **Peer broker reference** | A second brokerage where agents are using the product without issues | Phase 1-2 (seed early) |
| **Community narrative** | Enough positive chatter in Facebook groups that ignoring the product feels like falling behind | Phase 2+ (organic, but can be seeded) |

The compliance one-pager is the only lever you fully control pre-launch. Build it. The rest require real usage data and time — which is why the Phase 1 playbook now includes explicit data collection and multi-brokerage seeding.

---

### Simulation-Tested Objections: What Users Actually Push Back On

The Strategy B simulation (free `/explain` tool launch) surfaced a consistent set of objections from both homebuyers and agents. These are ranked by frequency and intensity — the landing page, `/explain` page, and agent-facing messaging must address the top four head-on.

**Buyer objections (from Reddit, Facebook, and organic sharing):**

| # | Objection | Intensity | What They Actually Say |
|---|-----------|-----------|----------------------|
| 1 | **Privacy** | High | "What happens to my document? Who sees it? Is my data sold?" |
| 2 | **AI accuracy** | High | "Can AI really understand complex legal documents? What if it's wrong?" |
| 3 | **Hidden costs** | Medium | "Is this actually free or is there a paywall after I upload?" |
| 4 | **Distrust of 'free'** | Medium | "If it's free, I'm the product. What's the real business model?" |

**Agent objections (from Florida Facebook groups):**

| # | Objection | Intensity | What They Actually Say |
|---|-----------|-----------|----------------------|
| 1 | **Job displacement** | Medium-High | "Tools like this undermine the value we bring to clients." |
| 2 | **Compliance/E&O** | High (see Broker Veto above) | "Is this compliant? What if the AI gives bad advice and we're liable?" |

**Where each objection is addressed in this plan:**
- Privacy, accuracy, hidden costs, distrust → `/explain` page copy (Section 0.4)
- Compliance/E&O → Broker Inoculation Kit (Section 0.7) + compliance scripts (Section 11)
- Job displacement → Agent Empowerment Response (Section 11)

These objections aren't hypothetical — they emerged from simulated interactions with realistic personas. Treat them as the messaging checklist for launch.

---

## 3. Phase 0: Launch-Ready (Now → May Launch)

**Goal:** Remove friction so all three strategies can activate on day one.

### 0.1 — Build a Real Landing Page (CRITICAL)

The root page currently redirects to `/login`. Nobody knows what this product is. Build a single-page landing that serves all three strategies:

- **Hero:** "Finally understand your home purchase." + screenshot/demo
- **For Buyers CTA:** "Start Your Free Workspace" → /try
- **For Agents CTA:** "Send this to your buyers" → /join (agent signup)
- **Free Tool CTA:** "Upload a document — get instant AI analysis" → /explain
- **Social proof section:** (placeholder for testimonials from Agent Zero phase)

**Key files:**
- `app/src/app/page.tsx` — replace redirect with landing page
- `app/src/app/layout.tsx` — add OG meta tags, Twitter cards

**Messaging:**
- **Headline:** "Finally understand your home purchase."
- **Subhead:** "Phazr organizes your escrow, explains your documents, tracks your deadlines, and catches costly mistakes — so you close with confidence."
- **Agent hook:** "Send this to your buyers. They'll stop calling you at 10pm."

### 0.2 — OG Tags & Social Preview (CRITICAL)

When your realtor friend texts the link to a buyer, it needs to look professional in iMessage/WhatsApp. Right now it shows nothing.

- OpenGraph image (1200x630), title, description
- Twitter Card meta tags
- Simple OG image (wheat/bronze brand colors, "Phazr" + tagline)

**Key file:** `app/src/app/layout.tsx`

### 0.3 — Agent Invite Flow (CRITICAL — Enables Strategy A)

Your realtor friend needs to text a link to her buyer that says: "Use this for our deal." Right now there's no mechanism for agents to invite buyers. The collaborator links go the WRONG direction (buyer → agent).

**Build:**
- Agent signs up, creates profile (name, brokerage, photo)
- Agent gets personal referral URL: `phazr.co/join/[agent-slug]`
- Buyer lands on: "[Agent Name] from [Brokerage] invited you to track your home purchase"
- Buyer signs up, agent auto-associated with deal
- Agent sees deal milestone status (phase, next deadline — read-only)

**New files:**
- Agent profile table or extension of auth.users
- `/join/[slug]` public page
- Agent mini-dashboard (list of invited buyers + deal phase)

### 0.4 — Free Document Analyzer Page (CRITICAL — Enables Strategy B)

Build `/explain` — a public, ungated page where anyone can upload a document and get AI analysis.

**Flow:**
1. User uploads PDF (no auth)
2. Backend: classify → extract fields → summarize (reuse existing `/api/documents/process` pipeline)
3. Display: document type badge, key extracted fields, plain-English AI summary
4. CTA: "Want to track your full deal? Create your free workspace →"
5. Secondary CTA: "Upload another document"

**Constraints:**
- Rate limit: 3 documents/day per IP (prevent abuse without requiring auth)
- Max file size: 10MB (lighter than authenticated 25MB)
- Results are ephemeral (not saved — must sign up to persist)

**Objection-Handling Copy (Simulation-Informed — must be designed into the page, not bolted on):**

The Strategy B simulation surfaced four objections that users raise repeatedly. The `/explain` page must address all four visually, before and after the upload:

| Objection | Where to Address | Copy Direction |
|-----------|-----------------|----------------|
| **Privacy** — "What happens to my document?" | Above the upload area | "Your document is analyzed in real time and **not stored**. We don't save your file, sell your data, or require an account. [Privacy details →]" |
| **Accuracy** — "Can AI really understand legal docs?" | Below the AI summary | "This is a **plain-English explanation**, not legal or financial advice. Always consult your agent, lender, or attorney for guidance." |
| **Hidden costs** — "Is this actually free?" | Near the upload CTA | "**100% free. No signup. No credit card. No catch.** We built this so first-time buyers can understand what they're signing." |
| **Distrust of free tools** — "What's the catch?" | Social proof area below results | Testimonial quotes from real buyers once available. Until then: "Built by a Florida homebuyer who wished this existed during their own closing." |

These aren't footnotes — they're primary page copy. The simulation showed that users who feel reassured on privacy and accuracy share the tool at significantly higher rates.

**Key reuse:** The entire extraction pipeline (`extractFields`, `summarizeDocument`, classification) already exists in `app/src/app/api/documents/process/route.ts`. You just need a new public-facing API route and UI.

### 0.5 — Analytics (Day 1 Requirement)

Add PostHog (free tier, 1M events/month).

**Track across all three strategies:**
- Landing page → /try, /join, /explain conversion (which CTA wins?)
- /explain → document uploaded → signup conversion (Strategy B funnel)
- /join/[slug] → buyer signup → deal created (Strategy A funnel)
- Signup → first document uploaded → collaborator link generated
- Blog article → /explain click → signup (Strategy C → B → conversion)
- Collaborator link clicked by professional

**Key file:** `app/src/app/layout.tsx` (PostHog script)

### 0.6 — Email Service (Week 1)

Add Resend (free tier, 3K emails/month). Four emails to start:

1. **Welcome email** — "Here's what to do first" (upload a document, set your closing date)
2. **Collaborator link email** — Send the upload link directly to the professional
3. **Deadline reminder** — "Your inspection contingency expires in 3 days"
4. **Free tool follow-up** — "You analyzed a Loan Estimate yesterday — want to track your full deal?"

**New file:** `app/src/app/api/email/route.ts` + Resend SDK

### 0.7 — Broker Inoculation Kit (CRITICAL — Protects Strategy A)

The simulation showed that an unprepared first impression with a brokerage principal kills 70-80% of agent adoption. These artifacts must exist before Agent Zero's broker hears about the product through the grapevine.

**Deliverable 1: Compliance One-Pager (PDF or hosted page)**

A single document Agent Zero can hand to her broker, forward to a skeptical colleague, or reference in a Facebook group thread. Contents:

- Phazr is a **document explanation tool**, not an advisory service
- All AI-generated explanations include a visible disclaimer: *"This is not legal, financial, or real estate advice. Consult your agent, lender, or attorney for guidance."*
- The tool **does not replace agent guidance** — it supplements it by reducing "what does this mean?" calls
- Buyer documents are encrypted at rest and in transit
- No buyer data is shared with third parties or used for marketing
- Agents are not liable for AI-generated explanations — the tool is buyer-initiated
- The tool does not originate loans, provide insurance quotes, or make referrals

**Deliverable 2: E&O FAQ (3-4 answers)**

| Objection | Response |
|-----------|----------|
| "Is this compliant with our E&O policy?" | Phazr doesn't provide advice — it explains documents in plain English with a disclaimer on every response. Agents aren't liable for what the tool says, just as they aren't liable for what Google says. |
| "What if the AI gives wrong advice?" | The tool explicitly states it's not advice. It's a reading aid, like a glossary. If a buyer has questions after reading the explanation, they call their agent — which is the existing workflow. |
| "Are we liable if a buyer relies on this?" | No. The buyer initiates usage. The tool carries its own disclaimers. Agents recommend it the same way they'd recommend a mortgage calculator — it's a resource, not a professional opinion. |
| "Why should I trust a new SaaS tool?" | Fair question. Here's the data from [X] deals where buyers used it: [link to deal data summary]. Zero compliance incidents. Fewer after-hours calls. More organized closings. |

**Deliverable 3: Agent Zero Coaching Script**

Roleplay this with Agent Zero before launch. When someone raises compliance:

> "It doesn't give advice — it explains what the document says in plain English. My buyers use it to understand their Loan Estimate before they call me, so I spend less time on 'what does this mean?' calls and more time on actual guidance. There's a compliance sheet if you want to see it."

The goal isn't to win a debate. It's to give Agent Zero a confident 30-second response so she doesn't self-censor when pushback comes.

---

## 4. Phase 1: Agent Zero + Wedge Launch (Weeks 1-4)

**Goal:** Strategy A live with 3-5 real buyers. Strategy B live and capturing organic demand. Strategy C seeds planted.

### 4.1 — The "Agent Zero" Playbook (Strategy A)

Your realtor friend is not a beta tester. She's your **co-founder for distribution.** Treat her like one.

**Week 1:**
- Sit with her (in person) and walk through the product with a real deal
- She creates her agent profile, gets her invite link
- She texts the link to her next buyer under contract
- You watch the buyer's first session (screen share or over-the-shoulder)
- Document every point of confusion, every "this is amazing," every "I wish it did X"
- **Walk her through the compliance one-pager.** She needs to know it exists and where to find it.
- **Roleplay pushback:** "Your broker says 'I'm not sure that's compliant with our E&O.' What do you say?" Practice until she has a confident 30-second response (see Section 0.7).
- **Agree on data to collect per deal:** number of after-hours calls (before vs. after using the tool), document-related questions per transaction, buyer confusion incidents, time from first doc upload to closing

**Week 2-3:**
- She sends to 2-3 more buyers (different deal stages)
- She starts sending collaborator upload links to her lender partners
- Those lenders see the product for the first time
- Track: Do lenders mention it? Do they ask about it?
- **Begin tracking quantitative data per deal.** Simple spreadsheet: deal ID, after-hours calls, document questions, days-to-close. This data becomes the broker unlock artifact.
- **Identify one agent at a DIFFERENT brokerage** — through Agent Zero's conference network, local board contacts, or the PadX advisor. This is a hedge. If Agent Zero's brokerage principal turns skeptical, you need a second distribution node already seeded.

**Week 4:**
- Debrief: What do buyers say? What do lenders say? What would make her recommend this to every client?
- Key question: "Would you pay to give this to every buyer?"
- If yes → agent-product-market fit confirmed
- If no → what's missing?
- **Compile deal data into a one-page summary:** "X buyers used Phazr. After-hours calls dropped from Y to Z. Zero compliance incidents. Documents were organized before closing." This is your broker unlock — don't present it to the broker yet, just have it ready.
- **Check the narrative:** Has the broker heard about Phazr yet? If not, now is the time for Agent Zero to casually mention it with the compliance doc in hand — before it comes through the grapevine.

### 4.2 — Launch the Free Document Tool (Strategy B)

**Week 1:** Ship `/explain` page. Share in 2-3 places:
- r/FirstTimeHomeBuyer: "I built a free tool that explains your Loan Estimate in plain English — just upload the PDF"
- Your personal social media
- Ask your realtor friend to share: "Found this tool that explains closing docs — my buyers love it"

**Track:** Uploads/day, signup conversion rate, which document types are most common

### 4.3 — Seed Content (Strategy C)

**Week 1-2:** Publish first 3 articles:
- "What Florida Homebuyers Need to Know About SIRS in 2026"
- "Loan Estimate vs Closing Disclosure: A Florida Buyer's Guide"
- "The First-Time Florida Homebuyer Checklist (2026)"

Each article links to the free document tool (/explain) as the CTA.

**Week 3-4:** Start participating in Reddit/Facebook communities. Answer questions. Build credibility. Don't promote yet.

### 4.4 — Capture the Testimonial

If even ONE buyer says "I finally understood what was happening" or "this caught something I would have missed" — that's your marketing. Get it in writing. Video if possible. First-time homebuyers are emotional — they WILL share if asked.

### 4.5 — The Lender Exposure Play

Every transaction involves a lender. When a buyer sends an upload link to their loan officer, that LO sees:

> "[Buyer Name]'s Deal — Upload documents to Phazr"
> "Powered by Phazr"

That LO does 15-20 closings/month. If they see ONE organized buyer, they'll wonder why their others aren't. Passive distribution — you don't sell to lenders, buyers do it for you.

### 4.6 — Title Company Early Engagement (Simulation-Informed)

Both simulations showed title companies as **organic accelerators** — they start recommending Phazr to buyers unprompted after just a few exposures. The original plan deferred title company engagement to Phase 2. That's too late. Title officers field 3-5 "what does this mean?" calls per buyer during escrow. A tool that reduces those calls earns goodwill fast.

**Week 2-3:**
- When Agent Zero's buyers send collaborator upload links to title/escrow contacts, follow up with a soft touch: "Did the upload link work okay for you? Any issues on your end?"
- This isn't a pitch. It's quality assurance for the professional-facing experience. But it opens a conversation.
- Track: Do title officers mention the tool to other buyers? Do they ask what it is?

**Week 4:**
- If any title officer has responded positively, ask: "Would it be helpful if I set up a direct upload page for your office? Your buyers could upload docs straight to their workspace through your branded page."
- Title officers who see fewer inbound "what does this mean?" calls become natural advocates — they'll start telling buyers to use the tool before the buyer even asks.

---

## 5. Phase 2: Local Network Effect (Weeks 4-12)

**Goal:** Expand from 1 agent to 5-10. Free tool generating consistent organic signups. Content ranking.

### 5.1 — Brokerage Pitch (Strategy A Expansion — Simulation-Revised)

The original plan assumed the broker would be receptive when Agent Zero introduces the product. The simulation showed this is dangerously optimistic. **By the time you pitch the broker, they may have already formed a negative opinion from hallway chatter.** The compliance objection requires zero evidence — just a raised eyebrow and "I'm not sure that's compliant" is enough to freeze adoption across the entire brokerage.

**The revised approach: control the first impression.**

**Step 1: Agent Zero introduces it early (Week 3-4, not Week 8+).**
Don't wait for the broker to hear about it organically. Agent Zero casually mentions it first:

> "I've been using this tool with my last few buyers — they're way more organized. Here's the compliance info in case you want to look at it."

Hand the broker the compliance one-pager (from Section 0.7) **before** they form an opinion. The goal is to make the first thing they associate with Phazr be "compliance-aware," not "random SaaS tool."

**Step 2: Lead with data, not enthusiasm (Week 4-6).**
Present the deal data summary from Phase 1:

> "3 of my buyers used it. After-hours calls dropped by X%. Documents were organized before closing. Zero compliance incidents. Here's the data."

Brokers respond to measurable operational improvements, not feature lists.

**Step 3: Have a peer reference ready.**
If you've seeded a second brokerage (from Phase 1, Week 2-3), mention it:

> "[Agent name] at [other brokerage] has been using it with her buyers too. No issues on their end either."

A peer broker's neutral-to-positive stance is the strongest unlock the simulation identified.

**Step 4: Prepare for the E&O objection.**
Don't be caught off guard. When the broker says "I'm not sure that's compliant," Agent Zero's rehearsed response (from Section 0.7) should land immediately. Hesitation here is what the simulation showed leads to self-censorship.

**Step 5: If the broker says no — don't push.**
Strategy A can operate through individual agents even without top-down broker endorsement. Not ideal, but not fatal. Shift energy to:
- Multi-brokerage seeding (grow through other brokerages where leadership is neutral/positive)
- Strategies B and C (which don't depend on broker buy-in at all)
- Waiting for community narrative momentum to make ignoring the product feel like falling behind

**What you need before this conversation:**
- Compliance one-pager (Section 0.7)
- Deal data summary (3-5 deals with quantitative metrics)
- At least one agent at a different brokerage using the product
- 1-2 buyer testimonials
- A simple brokerage page: branded portal, agent seat management

### 5.2 — Free Tool Optimization (Strategy B Scaling)

By week 4, you have data on which documents are uploaded most. Double down:
- If Loan Estimates dominate → build a dedicated "LE Analyzer" landing page for SEO
- If inspection reports dominate → build "Inspection Report Red Flag Finder"
- Add "Share your results" button (generates a shareable summary link)
- Add email capture: "Get your full analysis emailed to you" (captures lead even without signup)

### 5.3 — Content Flywheel (Strategy C Compounding)

**Articles 4-10:** Target the queries your free tool data reveals are most common.

**Agent Facebook/Instagram Groups:** Your realtor friend posts:

> "I've been using this app with my buyers and it's a game-changer. They actually understand their closing disclosure now. Anyone else tried Phazr?"

Not you posting. A real agent with 8 years of credibility. One post in a 5,000-member agent group = 20-50 agent signups.

### 5.4 — Title Company Partnerships (Builds on Phase 1, Section 4.6)

By now, title officers have already been exposed through collaborator upload links (Phase 1) and some may already be recommending the tool unprompted. Formalize what started organically:

> "Your buyers call 3-5 times during escrow asking 'what does this mean?' — this answers those questions before they call you."

- Co-branded collaborator upload pages (the ask from 4.6, now at scale)
- Fewer support calls for the title company
- Start with your realtor friend's preferred title company — they've already seen the product
- Expand to title companies connected to agents at the second brokerage

### 5.5 — PadX Advisor Session

Schedule a 1-hour strategy session focused on distribution. Ask: "If you were launching PadX today with one agent champion, what would you do differently?"

Leverage their:
- Investor connections (for when you're ready)
- Prop-tech founder network
- Distribution lessons learned
- Warm intros to brokerages or platforms

---

## 6. Phase 3: Scalable Channels (Months 3-6)

**Goal:** Repeatable, scalable distribution across all three strategies.

### 6.1 — Agent Referral Program (Strategy A at Scale)

Formalize:
- **Agent Starter (Free):** Invite link, basic buyer visibility
- **Agent Pro ($99/mo or $29/closing):** Sponsors buyer Pro, full deal visibility, branded
- Agent-to-agent referral: 1 month free per referral

Economics: $99/mo ÷ 2 closings = $49.50/closing. Saves 2 hrs at $125/hr = $250 saved. **5x ROI.**

### 6.2 — Free Tool as Top-of-Funnel Machine (Strategy B at Scale)

By month 3, the free tool should be generating 50-100 document uploads/week. Optimize:
- A/B test signup CTAs after document analysis
- Add comparison feature ("Upload your LE AND your CD — see the variances")
- SEO landing pages per document type
- Retargeting via email (for users who uploaded but didn't sign up)

### 6.3 — SEO Engine (Strategy C at Scale)

Build 10-15 total SEO pages. Each targeting a high-intent query:

| Query | Volume | Article → Tool → Signup Path |
|-------|--------|------------------------------|
| "what is escrow" | 40K/mo | Explainer → /explain CTA → signup |
| "loan estimate explained" | 8K/mo | Guide → LE analyzer → signup |
| "home inspection checklist" | 22K/mo | Checklist → workspace CTA → signup |
| "closing costs calculator" | 18K/mo | Calculator → cash-to-close → signup |
| "wire fraud real estate" | 2-3K/mo | Safety guide → wire SafeSend → signup |

### 6.4 — Lender Partnerships

By month 3, lenders have seen the product through collaborator links. Approach:

> "Borrowers who use Phazr close 20% faster. They understand their LE, track conditions, don't delay on docs. Want to recommend it?"

Lender gets branded invite link. Borrowers are more organized = fewer basic questions = faster close.

### 6.5 — FL Conference Circuit

- Florida Realtors Conference & Trade Expo
- Local board meetings (Miami, Tampa, Orlando, Jacksonville)
- Title company partner events

**You don't need a booth.** Your realtor friend (or 2-3 agent champions) demo the app during networking. Real agents showing real deals to other agents is 100x more effective than a banner.

---

## 7. What NOT To Do

1. **Don't run paid ads.** CAC of $50-200/buyer for a $29/deal product doesn't work until agent-led distribution subsidizes acquisition.

2. **Don't build a marketplace.** No lender marketplace, no insurance marketplace, no agent matching. Distractions requiring massive volume.

3. **Don't chase investors before 50 real deals.** 50 deals with retention data is worth 10x more than a polished deck with projections.

4. **Don't go national.** FL first. Win FL. Then TX, then AZ. State complexity means going wide = going shallow.

5. **Don't hire a marketing person.** Your realtor friend IS your marketing. Your product IS your marketing. Every dollar on a "growth marketer" before PMF is wasted.

6. **Don't build mobile.** Desktop/tablet is fine for v1. Buyers sit down to review documents.

7. **Don't let a broker hear about the product through the grapevine first.** The simulation showed that uncontrolled first impressions trigger compliance objections that poison an entire brokerage. Agent Zero should be the one to introduce it to her broker — on her terms, with the compliance doc in hand. This applies to every brokerage you enter, not just the first one.

---

## 8. Technical Requirements

### Must-Have for Launch (This Week)

| # | Feature | Effort | Enables |
|---|---------|--------|---------|
| 1 | **Landing page** (replace root redirect) | 1 day | All strategies — nobody can discover the product without it |
| 2 | **OG meta tags + social preview image** | 2 hours | All strategies — links shared via text/WhatsApp look professional |
| 3 | **PostHog analytics** | 2 hours | All strategies — can't optimize what you can't measure |
| 4 | **Agent invite link** (`/join/[slug]`) | 1-2 days | Strategy A — agents need to send buyers to the product |
| 5 | **Free document analyzer** (`/explain`) | 1-2 days | Strategy B — ungated product wedge that captures organic demand |

### Should-Have for Weeks 2-4

| # | Feature | Effort | Enables |
|---|---------|--------|---------|
| 6 | **Resend email integration** | 1 day | All strategies — engagement, collaborator delivery, retention |
| 7 | **Agent mini-dashboard** | 1-2 days | Strategy A — agents need visibility to stay engaged |
| 8 | **Blog section** (`/blog`) | 1 day | Strategy C — SEO starts compounding immediately |
| 9 | **"Powered by Phazr"** enhanced branding on public pages | 2 hours | Strategy A — every collaborator page is a passive ad |
| 10 | **Share results** button on /explain | 4 hours | Strategy B — makes document analysis shareable |

### Nice-to-Have for Month 2+

| # | Feature | Effort | Enables |
|---|---------|--------|---------|
| 11 | Brokerage-branded portal (logo + colors) | 3-5 days | Strategy A — required for brokerage tier |
| 12 | Agent referral tracking + rewards | 2-3 days | Strategy A — incentivizes agent spread |
| 13 | Email-to-platform document ingestion | 1-2 weeks | All strategies — reduces friction for email-heavy agents |
| 14 | FL state-specific workflow engine (HOA/SIRS) | 2-3 weeks | Strategy C — deepens FL competitive moat |
| 15 | /explain per-document-type landing pages | 3-5 days | Strategy B + C — SEO for "free loan estimate analyzer" |

---

## 9. Key Files to Modify

**Landing page:**
- `app/src/app/page.tsx` — replace redirect with marketing page
- `app/src/app/layout.tsx` — OG tags, analytics script

**Agent invite system (Strategy A):**
- New: `app/src/app/(public)/join/[slug]/page.tsx` — agent invite landing
- New: `app/src/app/api/agent/profile/route.ts` — agent profile CRUD
- New DB migration: `agent_profiles` table (user_id, slug, name, brokerage, photo_url)
- Modify: `app/src/components/deal/DealSetupForm.tsx` — accept agent association

**Free document analyzer (Strategy B):**
- New: `app/src/app/(public)/explain/page.tsx` — upload UI + results display
- New: `app/src/app/api/documents/explain/route.ts` — public processing endpoint (rate-limited, ephemeral)
- Reuse: extraction pipeline from `app/src/app/api/documents/process/route.ts`
- Reuse: `extractFields()`, `summarizeDocument()`, classification logic

**Analytics:**
- `app/src/app/layout.tsx` — PostHog snippet
- New: `app/src/lib/analytics.ts` — event tracking helper

**Email:**
- New: `app/src/app/api/email/route.ts` — Resend integration
- Modify: `app/src/lib/hooks/mutations.ts` — trigger emails on key events

**Blog (Strategy C):**
- New: `app/src/app/(public)/blog/page.tsx` — blog index
- New: `app/src/app/(public)/blog/[slug]/page.tsx` — article pages
- Content: MDX or static articles with FL-specific homebuying guides

**Public pages branding:**
- `app/src/app/(public)/upload/[token]/page.tsx` — enhance "Powered by" footer

---

## 10. Success Metrics

### Week 1-2 (Launch)

| Metric | Target | Strategy |
|--------|--------|----------|
| Agent invite links sent | 3+ | A |
| Buyers signed up via agent link | 2+ | A |
| Documents uploaded (authenticated) | 1+ per deal | A |
| Compliance one-pager ready | Yes | A (Broker) |
| Agent Zero coached on pushback response | Yes | A (Broker) |
| Free tool (/explain) uploads | 10+ | B |
| Free tool → signup conversion | Track (no target) | B |
| First 3 blog articles published | 3 | C |

### Week 4 (Validation)

| Metric | Target | Strategy |
|--------|--------|----------|
| Active deals in system | 5+ | A |
| Buyer testimonials captured | 1+ | A |
| Professional asks "what is this?" | 1+ | A |
| Deal data summary compiled (3+ deals) | Yes | A (Broker) |
| Second brokerage agent identified | Yes | A (Broker) |
| Title officer positive response | 1+ | A (Title) |
| Free tool uploads/week | 20+ | B |
| Free tool → signup rate | 10%+ | B |
| Blog articles organic impressions | Track | C |

### Week 8 (Network Effect)

| Metric | Target | Strategy |
|--------|--------|----------|
| Agents beyond your friend | 2-3 | A |
| Active deals | 10+ | A |
| Organic collaborator link generation | Yes | A |
| Broker has seen compliance doc | Yes | A (Broker) |
| Broker stance (positive/neutral/negative) | Track | A (Broker) |
| Free tool uploads/week | 50+ | B |
| Blog articles ranking page 1 | 1+ | C |
| Inbound from professional who saw product | 1+ | A+B |

### Week 12 (Flywheel)

| Metric | Target | Strategy |
|--------|--------|----------|
| Active agents | 5-10 | A |
| Total deals (active + completed) | 20-50 | A |
| Brokerages with active agents | 2+ | A (Broker) |
| Broker stance at primary brokerage | Neutral or positive | A (Broker) |
| Free tool monthly uploads | 200+ | B |
| Free tool → workspace conversion | 15%+ | B |
| Blog articles ranking page 1 | 3+ | C |
| Monthly organic signups (non-agent-referred) | 10+ | B+C |
| Willingness-to-pay signal | Clear | All |

---

## 11. Pitches & Scripts

### For Your Realtor Friend (to send to buyers):

> "Hey [Buyer Name]! I'm using a new tool to keep your transaction organized. It tracks your deadlines, explains your documents, and keeps everything in one place. Here's your invite link — takes 2 minutes to set up: [link]"

### For Your Realtor Friend (to post in agent groups):

> "I've been using this app called Phazr with my last few buyers and it's been a game-changer. They actually understand their closing disclosure now, and I'm getting way fewer 'what does this mean?' calls. It reads their documents and explains everything in plain English. Has anyone else tried it? [link]"

### Agent Empowerment Response (Simulation-Informed — counters "will this replace me?" fear)

The Strategy B simulation surfaced a recurring concern among agents: *"We need to ensure that tools like this don't undermine the value we bring to our clients."* This isn't a compliance objection — it's a gut-level fear that the tool replaces agent expertise. It needs a direct, confident counter:

**When an agent says "doesn't this replace what we do?":**

> "It's the opposite — it handles the 'what does this mean?' calls so I can focus on actual strategy. My buyers come to me with better questions now, not basic ones I've answered a hundred times. It makes me look more organized, not less necessary."

**When posting in agent groups, weave this in naturally.** Don't lead with "it won't replace you" (that makes people think it will). Lead with how it upgrades the agent's role:

> "My buyers used to call me at 10pm asking what their LE means. Now they read the explanation first and call me with real questions — 'should I push back on this origination fee?' That's the kind of conversation I want to be having."

**Key framing principle:** The tool handles *information* (what does this document say?). The agent provides *judgment* (what should I do about it?). Phazr elevates the agent from reading documents out loud to providing strategic guidance. Every agent-facing message should reinforce this distinction.

### The 90-Second Pitch (for your friend to use in person):

> "You know how your buyers call you at 10pm asking what their closing disclosure means? Or they miss a deadline because they didn't know it existed? Phazr is like a personal assistant for your buyer's transaction. It reads their documents, explains what everything means, tracks their deadlines, and catches mistakes — like when the closing disclosure doesn't match the loan estimate. You send them a link, they sign up, and suddenly they're organized. Fewer calls for you, fewer surprises for them. And honestly — your buyers start asking you better questions. Instead of 'what does escrow mean?' they ask 'should I push back on this fee?' That's the upgrade."

### For Reddit/Community (Strategy B + C):

> "I built a free tool that explains real estate documents in plain English. Just upload your Loan Estimate, Closing Disclosure, or inspection report and get an instant AI breakdown of what it all means. No signup required. [link to /explain]"

### For Title Companies:

> "Your buyers call 3-5 times during escrow asking 'what does this mean?' This tool answers those questions before they call you. Fewer support calls, same great service. Want to see a demo?"

### Agent Zero's Compliance Response (30 seconds — simulation-tested):

> "It doesn't give legal or financial advice — it just explains what the document says in plain English. My buyers use it to understand their Loan Estimate before they call me. I spend less time on 'what does this mean?' and more time on real guidance. Here's the compliance sheet if you want to look at it."

Use this when a colleague, broker, or anyone raises the "is this compliant?" question. The goal isn't to debate — it's to answer confidently and move on.

### Broker-Facing Pitch (for when Agent Zero introduces it to her principal):

> "I've been using this tool with my last [X] buyers. It reads their documents and explains what everything means, so they're not calling me at 10pm confused. After-hours calls dropped by [X]%. Zero compliance issues — it explicitly says it doesn't replace agent or legal advice. Here's the compliance info."

Lead with operational results. Brokers don't care about features — they care about "does this cause problems or solve them?"

### Compliance One-Pager (content outline for the PDF/page):

> **What Phazr Is:**
> - A document explanation tool that helps homebuyers understand their closing documents
> - A deadline tracker and deal organizer
>
> **What Phazr Is NOT:**
> - Not legal advice, financial advice, or real estate advice
> - Not a replacement for agent, lender, or attorney guidance
> - Not a referral service or marketplace
>
> **Every AI explanation includes a visible disclaimer:**
> *"This is not legal, financial, or real estate advice. Consult your agent, lender, or attorney for guidance."*
>
> **Data & Privacy:**
> - Buyer documents are encrypted at rest and in transit
> - No buyer data is shared with third parties or used for marketing
> - Agents are not liable for AI-generated explanations
> - The tool is buyer-initiated — agents recommend it, buyers choose to use it
>
> **Questions?** Contact [founder email/phone]

---

## 12. Bottom Line

You don't have a marketing problem. You have a **distribution channel activation problem** — three channels, running concurrently:

| Strategy | Channel | Captures | Speed | Compounds |
|----------|---------|----------|-------|-----------|
| **A: Agent-Led** | Relationships | Mid-funnel buyers (active transactions) | Fast (weeks) | Through brokerage expansion |
| **B: Free Tool** | Product-led | High-intent confused buyers | Medium (weeks) | Through SEO + sharing |
| **C: Content** | Organic/SEO | Early-funnel researching buyers | Slow (months) | Through search rankings |

**Strategy A** gets you your first 10-50 deals through warm relationships.
**Strategy B** gets you your first organic signups without any relationships.
**Strategy C** builds a compounding engine that grows while you sleep.

All three feed each other. None require paid acquisition. All are delegatable once the infrastructure is built.

Your realtor friend lights Strategy A. The free document tool lights Strategy B. Three FL-focused articles light Strategy C. All three can ignite in the same week.

**Light all three matches.**
