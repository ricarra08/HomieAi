# Phazr — Monetization Strategy
## Version 1.0 — April 2026
## Internal strategy document — Confidential

---

## 1. Strategic Principles

Before defining tiers and prices, these principles govern all monetization decisions:

1. **Revenue follows product-market fit, not the other way around.** No paywall before the core cluster is proven indispensable.
2. **Align price with the moment of highest willingness to pay.** Homebuying is episodic (30-60 day transaction, then done for 5-10 years). Pricing must reflect that cadence.
3. **The buyer always gets value for free.** The free tier must be genuinely useful, not a crippled demo. This preserves the B2C acquisition funnel and the "buyer truth" product identity.
4. **B2B2C is the scale engine, not B2C.** Direct consumer acquisition in real estate is expensive. Agent/brokerage distribution is the lever. But the buyer product must be proven first.
5. **Don't gate the AI.** The AI copilot is the hook. Let free users taste it. Gate depth and volume, not access.

---

## 2. Phase 1 — Free B2C Beta (Now → 90 Days Post-Launch)

### Price: $0

### Goal
Get 50-100 real buyers through real transactions. Prove the core cluster (document intelligence + LE/CD comparison + cash-to-close + deadline tracking) is indispensable.

### What's included
Everything. No feature gating. No usage limits.

### Why free
- The 90-day success metrics are engagement-based, not revenue-based
- A paywall before PMF is proven kills the data flywheel before it starts
- Every uploaded document makes the AI smarter — users are contributing training data
- Early adopters become evangelists if they get the full experience
- Agent/lender collaborators see the platform via upload links — free exposure to the B2B2C channel

### Success criteria to exit Phase 1
- [ ] 50+ real deals processed through at least the escrow phase
- [ ] Document upload → AI processing pipeline stable at <30s per doc
- [ ] At least 3 users report "I caught something I would have missed"
- [ ] At least 5 collaborators use the upload link without heavy instruction
- [ ] Repeat usage pattern established (multiple sessions per active deal)

---

## 3. Phase 2 — Freemium B2C + Agent Referral Engine (Month 4-9)

### 3.1 Consumer Tiers

| | Free | Pro | Pro+ |
|---|---|---|---|
| **Price** | $0 | $29/deal | $79/deal |
| **Active deals** | 1 | 3 | Unlimited |
| **Document uploads** | 5 per deal | Unlimited | Unlimited |
| **AI copilot** | 5 questions/day | Unlimited | Unlimited + priority |
| **Document intelligence** | Classification + basic summary | Full extraction + field analysis + AI explanation | Full + priority processing |
| **LE comparison** | 2 LEs side-by-side | 3 LEs + full variance analysis | 3 LEs + variance + historical benchmarks |
| **LE vs CD variance** | No | Yes | Yes |
| **Cash-to-close engine** | Basic estimate | Progressive (shopping → offer → closing) | Progressive + scenario modeling |
| **HOA Risk Score** | No | Yes | Yes |
| **Deadline tracking** | Basic (manual entry) | Auto-generated from contingencies | Auto-generated + smart alerts |
| **Collaborator links** | 1 active link | 5 active links | Unlimited links |
| **Email-to-platform ingestion** | No | No | Yes (deal-specific email address) |
| **Deal summary PDF export** | No | No | Yes (shareable with agent/lender) |
| **Wire fraud flow** | Basic checklist | Full 3-step verification | Full + verified wire instructions |

### 3.2 Why Per-Deal Pricing

Homebuying is episodic. A monthly subscription feels wrong for a product used intensely for 2 months then not again for 5-10 years.

| Model | Pros | Cons | Verdict |
|-------|------|------|---------|
| **Per-deal** | Aligns with transaction lifecycle. Easy to justify ("$29 for a $400K purchase"). No recurring charge guilt. | Lower LTV per user. Revenue is lumpy, tied to deal volume. | **Best for B2C.** |
| **Monthly subscription** | Predictable revenue. Familiar SaaS model. | Misaligned with usage pattern. Buyer pays for months they don't use. Churn is guaranteed when deal closes. | Poor fit for consumer. |
| **Annual subscription** | Higher upfront revenue. | Even worse alignment. Nobody plans homebuying a year in advance. | Bad fit. |
| **Freemium + upsell at pain point** | Natural conversion moment (buyer hits doc limit or needs LE/CD comparison). | Can feel manipulative if the gate hits at a stressful moment. | Use carefully — gate features, not crisis moments. |

### 3.3 Price Justification

Buyers spend $8K–$12K in closing costs. The value propositions at each tier:

- **$29 Pro:** Catching a single LE variance saves $200-$2,000. Understanding a single document avoids a $500 mistake. The ROI is 7-70x on a single insight.
- **$79 Pro+:** Email-to-platform ingestion + deal summary export + priority processing saves hours of coordination. For the buyer managing a complex deal (condo, multiple contingencies, HOA), this is a rounding error on the transaction.

### 3.4 Agent Referral Flywheel

Agents who see the platform (via collaborator upload links, email CC, or buyer screenshots) will want their buyers using it.

**Mechanism:**
1. Agent gets a free branded referral link: "Your agent recommends Phazr"
2. Buyer signs up through the link → Pro features unlocked for that deal (buyer doesn't pay)
3. Agent pays nothing at this stage — this is a lead-in to Phase 3
4. Agent sees that their buyers are more organized, ask fewer repetitive questions, and close more smoothly
5. Agent starts sending the link to every buyer → natural B2B2C transition

**Why give Pro away via agent links:** The goal is distribution, not revenue. Every agent-referred buyer is a free marketing channel. The agent becomes dependent on the buyer having the tool. This creates the pull for Phase 3 paid agent tiers.

---

## 4. Phase 3 — B2B2C: The MyChart Layer (Month 9-18)

### 4.1 Agent & Brokerage Tiers

| | Agent Starter | Agent Pro | Brokerage | Enterprise |
|---|---|---|---|---|
| **Price** | Free | $99/mo or $29/closing | $499–$999/mo | Custom |
| **Branded referral link** | Yes | Yes | Yes (brokerage-branded) | Yes |
| **Buyer gets Pro free** | No (buyer pays own Pro) | Yes (agent sponsors) | Yes (brokerage sponsors) | Yes |
| **Milestone visibility** | Basic (phase only) | Full (deadlines, docs, status) | Full + portfolio view | Full + analytics |
| **Active buyer limit** | 3 | 10 | Unlimited | Unlimited |
| **Branding** | Agent name on buyer workspace | Agent name + photo + contact | Brokerage logo + colors + agent | Full white-label |
| **Email-to-platform** | No | Yes (deal-specific addresses) | Yes | Yes |
| **Document request links** | No | Branded to agent | Branded to brokerage | Custom |
| **Default checklists** | No | No | Brokerage-specific templates | Custom workflows |
| **Team management** | No | No | Assign agents to deals | Role-based access, SSO |
| **Portfolio dashboard** | No | No | All active deals, status summary | Analytics, CRM integration |
| **Internal notes** | No | Per-deal (agent-only) | Per-deal (agent-only) | Per-deal + team notes |

### 4.2 The Virtuous Cycle

```
Brokerage sponsors buyer → Buyer gets Pro free →
Buyer is more organized → Fewer repetitive questions →
Agent saves time → Agent recommends to more buyers →
More buyers on platform → More data → Better AI →
Brokerage looks more modern → Competitive advantage →
Brokerage renews subscription
```

### 4.3 Why Agents Will Pay

The agent value proposition is not "another tool." It's **fewer phone calls and fewer confused clients:**

| Agent pain today | How Phazr solves it |
|---|---|
| "Where are we in the process?" calls | Buyer has real-time phase dashboard |
| "What does this document mean?" calls | AI explains every document |
| "How much do I need at closing?" calls | Progressive cash-to-close estimator |
| "Did you get the inspection report?" calls | Collaborator link + email ingestion |
| "Is this normal?" calls | AI copilot answers deal-specific questions |

**Estimated time savings:** 2-4 hours per transaction. At $99/mo with 3-4 closings/month, the agent pays $25-33/closing for 2-4 hours of time back. That's a no-brainer.

### 4.4 Why Brokerages Will Pay

| Brokerage pain today | How Phazr solves it |
|---|---|
| Inconsistent client experience across agents | Standardized branded workspace for every buyer |
| No visibility into deal progress | Portfolio dashboard with milestone tracking |
| New agents struggle without TCs | Platform acts as a built-in transaction coordinator |
| Client retention / referral rates | Premium experience drives loyalty and referrals |
| Competitive differentiation | "We give every client a digital closing workspace" |

---

## 5. Revenue Projections (Conservative)

### Year 1 (Beta + Early Freemium)

| Source | Volume | Price | Revenue |
|--------|--------|-------|---------|
| B2C Pro deals | 500 | $29 | $14,500 |
| B2C Pro+ deals | 100 | $79 | $7,900 |
| Agent Pro (late Year 1) | 50 agents × 3 months | $99/mo | $14,850 |
| **Year 1 Total** | | | **~$37,000** |

*Year 1 is about proving the model, not generating revenue.*

### Year 2 (B2B2C Ramp)

| Source | Volume | Price | Revenue |
|--------|--------|-------|---------|
| B2C Pro deals | 3,000 | $29 | $87,000 |
| B2C Pro+ deals | 500 | $79 | $39,500 |
| Agent Pro subscribers | 300 × 12 months | $99/mo | $356,400 |
| Brokerage subscribers | 30 × 12 months | $749/mo avg | $269,640 |
| **Year 2 Total** | | | **~$750,000** |

### Year 3 (Scale)

| Source | Volume | Price | Revenue |
|--------|--------|-------|---------|
| B2C Pro deals | 8,000 | $29 | $232,000 |
| B2C Pro+ deals | 2,000 | $79 | $158,000 |
| Agent Pro subscribers | 1,000 × 12 months | $99/mo | $1,188,000 |
| Brokerage subscribers | 100 × 12 months | $749/mo avg | $898,800 |
| Enterprise | 5 × 12 months | $2,500/mo avg | $150,000 |
| **Year 3 Total** | | | **~$2.6M ARR** |

---

## 6. The Long Game — Data Moat to Platform Revenue

Every transaction creates structured data. Over thousands of transactions across states, this becomes:

### 6.1 Benchmark Data (Year 3+)
- "The average LE-to-CD variance for Lender X in Florida is $1,200"
- "Deals with Title Company Y close 3 days faster than average"
- "Inspector Z's reports flag 40% more issues than the market average"

This data is valuable to buyers (choosing vendors), agents (recommending vendors), and potentially lenders/title companies (competitive intelligence).

### 6.2 Lender Marketplace (Year 3-4, Deferred)
The Zillow playbook applied to the transaction, not the search:
- Zillow monetizes the top of funnel (lead gen for agents)
- Phazr can monetize the middle/bottom of funnel (lender comparison + transaction intelligence)
- Buyers already compare LEs in the platform → natural insertion point for lender advertising or referral fees
- **This is the $100M+ play.** But it requires volume, trust, and regulatory care. Defer until B2C + B2B2C are proven.

### 6.3 Insurance Marketplace (Year 3-4, Deferred)
- Buyers already track insurance in the platform
- Context-aware insurance module knows property type, state, flood zone, coverage needs
- Natural insertion point for insurance quote comparison or carrier referrals
- Complements the lender marketplace without competing for the same transaction moment

---

## 7. What NOT to Do

| Anti-Pattern | Why It Fails |
|---|---|
| **Gate the AI copilot completely** | The AI is the hook. Killing it for free users kills word-of-mouth. Gate volume (5 questions/day), not access. |
| **Charge agents before they see value** | The free Agent Starter tier is critical. Let agents see buyer engagement before asking for money. Premature monetization kills adoption. |
| **Build enterprise before 10 brokerages pay for basic** | Enterprise is a trap. One client's custom needs drain engineering for months. Get 10 paying brokerages on the standard tier first. |
| **Monthly subscription for consumers** | Misaligned with homebuying cadence. Guaranteed churn at deal close. Per-deal is the right model. |
| **Pursue lender/insurance partnerships before B2C + B2B2C are proven** | The data moat takes time. Marketplace revenue requires volume and trust. Premature partnerships distort the product toward partner needs, not buyer needs. |
| **Race to the bottom on price** | $29/deal is already cheap relative to $8K-$12K closing costs. Don't go lower. Compete on value and depth, not price. |

---

## 8. Key Metrics to Track

| Metric | Phase 1 Target | Phase 2 Target | Phase 3 Target |
|--------|---------------|---------------|---------------|
| Active deals | 50-100 | 500-1,000 | 5,000+ |
| Docs processed per deal | 8+ | 10+ | 12+ |
| AI copilot questions per deal | 15+ | 20+ | 25+ |
| Free → Pro conversion | N/A | 15-25% | 10-20% (more agent-sponsored) |
| Agent referral link creation | N/A | 100+ agents | 1,000+ agents |
| Agent Starter → Agent Pro conversion | N/A | N/A | 20-30% |
| Brokerage monthly churn | N/A | N/A | <5% |
| Net Promoter Score (buyer) | 50+ | 60+ | 65+ |
| Net Promoter Score (agent) | N/A | 40+ | 50+ |

---

*This document is a living strategy. Pricing, tiers, and projections should be revisited monthly during Phase 1 and quarterly thereafter as real usage data replaces assumptions.*
