# Persona Reactions — Document Intelligence + AI Copilot
## Based on Phase 2 build: AI Summary, Extracted Data, Smart Questions, Homie Copilot
## April 7, 2026

---

## Features Under Review

1. **Document Detail View** — PDF preview (left) + sidebar (right) with metadata, AI summary, extracted fields, and smart questions
2. **AI Summary** — Plain-English breakdown of every uploaded document (Loan Estimate, Closing Disclosure, Inspection Report, etc.)
3. **Extracted Data** — Structured key fields pulled from documents (lender, rate, loan amount, contingency days, etc.) with confidence indicators
4. **Smart Questions** — AI-generated contextual questions tailored to the document type, with recipient labels ("Ask your lender," "Ask your agent")
5. **Homie AI Copilot** — Streaming chat assistant grounded in deal data, phase-aware, with full document text access for deep Q&A
6. **Processing Stepper** — Visual progress indicator (Uploaded -> Analyzing -> Ready) on each document row

---

## Persona 1: First-Time Homebuyer (FTHB)

**Profile:** 28-year-old software engineer, buying their first home. Has a pre-approval but has never seen a Loan Estimate or Closing Disclosure before. Overwhelmed by the volume of paperwork.

### Reaction to AI Summary
> "Oh my god, this is exactly what I needed. I uploaded the Loan Estimate and it immediately told me my rate is 3.875%, my monthly payment is $761.78, and that I have a prepayment penalty. I didn't even know what a prepayment penalty was — the summary explained it. I would have signed this without understanding that clause."

**Impact:** The AI summary converts a 5-page financial document into a 2-minute read. For a FTHB who has never seen these documents, this is the difference between informed consent and blind signing.

### Reaction to Extracted Data
> "The sidebar shows all the important numbers in one place — loan amount, rate, APR, cash to close. I don't have to hunt through the PDF to find them. And that little orange dot on 'low confidence' fields? That tells me to double-check with my lender."

**Impact:** Structured data extraction removes the cognitive load of parsing dense financial documents. The confidence indicator builds appropriate trust — the user knows when to verify.

### Reaction to Smart Questions
> "I clicked 'Draft questions about this document' and it gave me three questions I didn't even know I should ask. One was about the 2% prepayment penalty and whether I can avoid it. Another was about why the APR is higher than the interest rate. I sent it straight to Homie and got a detailed explanation."

**Impact:** Smart Questions bridge the knowledge gap that FTHBs don't know they have. They don't know what they don't know — the system surfaces the right questions proactively.

### Reaction to Homie Copilot
> "I asked Homie about the closing costs and it pulled the exact numbers from my Closing Disclosure. It even compared them to my Loan Estimate and pointed out what changed. When I asked about HOA dues, it found the amount in the document text even though it wasn't in the extracted fields. It feels like having a knowledgeable friend sitting next to me."

**Impact:** The copilot with full document text access is the core value proposition for FTHBs. It turns a confusing, isolating process into an interactive learning experience.

### Reaction to Processing Stepper
> "I love that I can see 'Uploaded -> Analyzing -> Ready.' When I first uploaded my Loan Estimate, I wasn't sure if anything was happening. The stepper told me the AI was working on it. When it turned all green, I knew I could click in and read the summary."

**Impact:** Transparency in processing reduces anxiety and sets expectations.

---

## Persona 2: Experienced Buyer (Second or Third Purchase)

**Profile:** 42-year-old marketing director, buying their third home. Familiar with the process but hasn't bought in 8 years. Knows the vocabulary but not the current numbers.

### Reaction to AI Summary
> "I don't need the basics explained to me — I know what a Loan Estimate is. But the summary is still useful because it highlights the specifics of THIS estimate: the rate lock expiration, the prepayment penalty, and the PMI amount. It's a quick scan rather than reading the full document."

**Impact:** Even experienced buyers benefit from summaries because every deal is different. The summary serves as a quick-reference layer, not a tutorial.

### Reaction to Extracted Data
> "This is great for comparison. When I get my second Loan Estimate from a different lender, I can pull up both and compare the extracted fields side by side: rate, APR, fees, cash to close. That's exactly the workflow I need for Phase 3."

**Impact:** Extracted data becomes the foundation for LE comparison (Phase 3). Experienced buyers think in terms of comparison — the extracted fields are their comparison inputs.

### Reaction to Smart Questions
> "The questions are decent but a bit basic for someone who's been through this before. I'd use them more as a checklist to make sure I haven't missed anything. The one about rate lock expiration was actually useful — I hadn't thought about that timeline."

**Impact:** For experienced buyers, Smart Questions serve as a safety net rather than a knowledge builder. They catch blind spots even for people who think they know the process.

### Reaction to Homie Copilot
> "I asked it to compare my Loan Estimate and Closing Disclosure. It pulled the numbers from both documents, showed me the lender fees matched, and flagged that the APR changed slightly. That saved me 20 minutes of manual comparison. I also asked about the prepayment penalty implications for refinancing — it gave a thorough answer with specific dollar amounts from my documents."

**Impact:** The copilot's value for experienced buyers is speed and specificity. They know the right questions to ask — the copilot answers them instantly with their actual deal data.

---

## Persona 3: Realtor (Buyer's Agent)

**Profile:** 35-year-old buyer's agent, 6 years in the business. Manages 8-12 active buyers at any time. Spends significant time explaining documents to clients over the phone.

### Reaction to AI Summary + Smart Questions
> "If my buyers used this, I'd get 60% fewer 'what does this mean?' calls. The AI summary explains the document better than I can in a 5-minute phone call because it has the actual numbers right there. And the Smart Questions? Those are the exact questions I tell my buyers to ask their lender. The system is doing my coaching for me."

**Impact:** The AI summary and Smart Questions reduce the agent's support burden. The buyer comes to conversations informed, which makes the agent's time more productive.

### Reaction to Homie Copilot
> "I tested it by asking questions I know my buyers ask me: 'What happens if I miss my inspection deadline?' and 'Is this rate good?' For the deadline question, it gave a solid general answer since there's no inspection report uploaded yet. For the rate question, it properly said it can't give financial advice but explained what the numbers mean. That's the right boundary."

**Impact:** The copilot's boundary behavior matters for agents — they don't want a tool that gives bad advice and creates liability. Homie's refusal to provide financial recommendations and redirect to professionals is exactly right.

### Reaction to Document Detail View (Overall)
> "The split view — PDF on the left, AI analysis on the right — is exactly how I review documents with my clients in person. I open the PDF on one screen and explain it on the other. This product basically automates that experience. If I could share a read-only link with my buyer, they could self-serve and I'd only need to step in for the complex stuff."

**Impact:** The document detail view mirrors the agent's workflow. The read-only collaborator link (Phase 5) would complete this picture.

---

## Persona 4: Mortgage Broker / Loan Officer

**Profile:** 50-year-old broker, runs a team of 4 loan officers. Processes 15-20 loans per month. Frequently fields questions from buyers who don't understand their Loan Estimates.

### Reaction to Extracted Data
> "The fact that it pulls the rate, APR, monthly P&I, points, and cash to close automatically from the LE is impressive. Those are the exact fields I need to see when a buyer calls and says 'I got an estimate from another lender — is yours better?' If the buyer can show me both sets of extracted data, the comparison conversation takes 2 minutes instead of 15."

**Impact:** Extracted data standardizes how buyers present loan information. It creates a common language between buyer and lender.

### Reaction to Homie Copilot (LE + CD Questions)
> "I love that when the buyer asks about the APR vs interest rate difference, the copilot explains it using THEIR actual numbers — not a generic explanation. And when they ask about closing costs, it pulls the line items from the document. That's the level of specificity that builds buyer confidence. Confident buyers close faster."

**Impact:** The copilot reduces "educational drag" — the time a loan officer spends explaining basics. Buyers arrive at conversations already understanding their numbers.

### Reaction to Smart Questions
> "The question 'Can you explain how the APR of 4.274% is calculated and what specific fees contribute to this figure?' is exactly what I want my borrowers to ask. It shows engagement and understanding. When a borrower asks me that question, I know they're paying attention and I can give them a substantive answer instead of starting from scratch."

**Impact:** Smart Questions train buyers to ask better questions, which improves the quality of buyer-lender interactions.

### B2B2C Opportunity
> "If you could white-label this for my brokerage — same AI summary, same extracted data, but with our branding and maybe a 'Schedule a call with your loan officer' button — I'd give every borrower access. It would reduce my team's phone time by 30% and make our borrowers feel more supported. That's a product I'd pay for per-borrower or per-loan."

---

## Cross-Persona Value Summary

| Feature | FTHB Value | Experienced Buyer Value | Realtor Value | Broker Value |
|---------|-----------|----------------------|--------------|-------------|
| **AI Summary** | Education (critical) | Quick reference | Reduces support calls | Reduces borrower confusion |
| **Extracted Data** | Simplifies complexity | Enables comparison | Standardizes discussions | Standardizes loan data |
| **Smart Questions** | Surfaces unknown unknowns | Safety net / checklist | Coaches buyers automatically | Trains better borrowers |
| **Homie Copilot** | Interactive learning | Speed + specificity | Handles basic questions | Builds borrower confidence |
| **Processing Stepper** | Reduces anxiety | Sets expectations | Professional feel | Trust signal |
| **Document Detail View** | All-in-one understanding | Efficient review | Mirrors agent workflow | Could be white-labeled |

---

## Key Takeaway

The document intelligence layer (AI Summary + Extracted Data + Smart Questions + Homie Copilot) is not just a buyer feature — it's a **platform capability** that creates value across every persona in the transaction:

- **Buyers** understand their deal for the first time
- **Agents** spend less time explaining and more time closing
- **Lenders** get informed borrowers who close faster
- **The product** builds a moat around document comprehension that no other homebuying tool offers

The "Draft a question -> Ask Homie" flow is the signature UX moment. A buyer reads their Loan Estimate, sees a prepayment penalty they don't understand, gets a smart question about it, sends it to Homie, and gets a grounded answer with their actual numbers — all without leaving the app, all without calling anyone. That's the core value loop.

---

# Persona Reactions — Financing Tab (Phase 3)
## Based on: LE Cards, Comparison Table, Optimization Toggle, Ask Homie, Auto-Populate from PDF
## April 7, 2026

---

## Features Under Review

1. **LE Cards** — Auto-generated from uploaded Loan Estimate PDFs. Show lender, product, rate, APR, monthly P&I, PMI, total monthly, cash to close, loan amount, fees, lock status. "Set as Chosen" and "Compare" actions per card.
2. **Auto-Populate from PDF** — Upload a Loan Estimate PDF, the AI extracts all fields and creates an LE card automatically. "Auto-extracted from PDF — Review" banner prompts buyer to verify.
3. **Comparison Table** — Select 2-3 LEs, see them side-by-side across 14 metrics. Optimization toggle: Lowest Monthly, Lowest Cash to Close, Lowest Total Cost (30yr). Best-value highlighting with green checkmark.
4. **Ask Homie Integration** — "Ask Homie about these differences" button at the bottom of the comparison table sends a contextual question to the copilot. Copilot responds with a detailed breakdown using actual numbers from all selected LEs.
5. **Financing-Specific Copilot Chips** — When on the Financing page: "Compare my loan estimates", "Explain APR vs interest rate", "Is my rate competitive?", "What fees can I negotiate?"

---

## Persona 1: First-Time Homebuyer (FTHB)

**Profile:** 28-year-old software engineer, first home purchase. Has 3 loan estimates from different lenders but has never compared them before. Overwhelmed by the numbers.

### Reaction to LE Cards (Auto-Populated)
> "I uploaded three Loan Estimate PDFs and within 15 seconds, I had three cards with all the numbers pulled out. I didn't have to type anything. The rate, the monthly payment, the cash to close — it's all right there. I didn't even know what 'points' meant until I saw the number and asked Homie."

**Impact:** Auto-populate removes the single biggest barrier for FTHBs — they don't know which numbers matter or where to find them in the PDF. The system does it for them.

### Reaction to Comparison Table
> "This is the first time I've actually understood the difference between my three offers. One has a lower rate but higher fees. Another has lower cash to close but includes PMI. The optimization toggle is genius — I can see which is cheapest monthly vs which saves the most over 30 years. Those are completely different answers and I would never have figured that out on my own."

**Impact:** The optimization toggle surfaces a non-obvious truth: the lowest rate isn't always the best deal. FTHBs learn this concept by seeing it, not by being told.

### Reaction to Ask Homie
> "I clicked 'Ask Homie about these differences' and it gave me a full breakdown. It said the Fixed Rate is the safest option, the Adjustable Rate starts lower but has risk, and the Balloon Payment is dangerous for most buyers. It used my actual numbers. I showed it to my dad and he said 'that's exactly what I would have told you.'"

**Impact:** The copilot transforms a comparison table from data into advice. The buyer doesn't just see numbers — they understand what the numbers mean for their situation.

---

## Persona 2: Experienced Buyer (Second or Third Purchase)

**Profile:** 42-year-old marketing director, buying their third home. Knows what a Loan Estimate is but hasn't compared rates in 8 years. Market has changed significantly.

### Reaction to LE Cards
> "I appreciate that I didn't have to manually enter anything. Last time I bought a home, I had a spreadsheet where I typed in all the numbers from each LE. This does it automatically. The 'Locked' badge is a nice touch — I can see at a glance which rates are locked and which are floating."

**Impact:** Even experienced buyers value automation. The auto-populate feature saves 15-20 minutes of manual data entry per LE.

### Reaction to Comparison Table + Optimization Toggle
> "The Total Loan Cost view is what I really care about. Monthly payment is important but I want to know the 30-year cost. The fact that it calculates P&I + PMI over 360 months + cash to close — that's the real number. I can see the Fixed Rate at 3.875% costs $319K total while the Adjustable at 4% costs $429K. That's a $110K difference. Decision made."

**Impact:** Experienced buyers think in total cost, not monthly payment. The optimization toggle lets them see the analysis they would have done manually.

### Reaction to Auto-Extracted Review Banner
> "I like the 'Auto-extracted from PDF — Review' banner. It tells me the numbers came from AI, not from me, so I should double-check. I clicked Review and verified the rate and fees matched my PDF. It was accurate. That builds trust."

**Impact:** The review banner is a trust signal. Experienced buyers are skeptical of automation — the banner acknowledges that and invites verification.

---

## Persona 3: Realtor (Buyer's Agent)

**Profile:** 35-year-old buyer's agent, manages 8-12 active buyers. Spends 30+ minutes per buyer explaining loan estimate differences over the phone.

### Reaction to Comparison Table
> "If every one of my buyers had this, I would save 4-5 hours per week. Right now I get calls like 'I got three estimates, which one should I pick?' and I have to walk them through the numbers line by line. This does it visually. The optimization toggle is exactly how I explain it — 'do you want the lowest monthly payment or the lowest total cost?' Now the product asks that question for me."

**Impact:** The comparison table automates the agent's most repetitive advisory task. The agent's time shifts from explaining numbers to discussing strategy.

### Reaction to Ask Homie + Copilot
> "The Homie response when comparing three LEs was thorough and accurate. It explained the Fixed Rate is safest, the Adjustable has teaser rate risk, and the Negative Amortization is dangerous. That's the exact advice I give. And it cited the actual rates and fees from each estimate. My buyers can get this at 11pm when I'm not available."

**Impact:** The copilot extends the agent's availability to 24/7. Buyers get quality guidance between meetings, and come to the agent with better questions.

### B2B Insight
> "If you could add a 'Share comparison with your agent' button that sends me a link to this view, I'd have my buyers use this before every rate-shopping conversation. I want to see what they're comparing so I can give targeted advice instead of starting from scratch."

---

## Persona 4: Mortgage Broker / Loan Officer

**Profile:** 50-year-old broker, runs a team of 4 loan officers. Processes 15-20 loans per month.

### Reaction to Auto-Populate from PDF
> "The fact that it extracts rate, APR, fees, points, PMI, and cash to close from the PDF automatically is impressive. Those are exactly the fields I look at when a borrower brings me a competitor's estimate. If the borrower shows me their comparison table with our LE vs the competitor, I can respond in 2 minutes instead of asking them to read me numbers over the phone."

**Impact:** Auto-populate standardizes how borrowers present competitive offers. The broker gets structured data instead of a PDF attachment with 'which one is better?'

### Reaction to Comparison Table
> "The side-by-side is clean. I'd want to see a few more fields — monthly escrow, insurance included, whether the rate lock has a float-down option — but for a buyer-facing tool, this covers the essentials. The Total Loan Cost (30yr) number is something most borrowers never see. It changes the conversation from 'which has the lowest rate' to 'which costs the least over time.'"

**Impact:** The comparison table elevates the borrower's financial literacy, which makes the broker's conversations more productive.

### Reaction to Ask Homie
> "I tested the copilot's response when comparing three LEs. It correctly identified that the Negative Amortization loan has the lowest initial payment but the highest risk. It recommended the Fixed Rate for stability. It did NOT say 'you should choose this one' — it explained the tradeoffs and said to consult the lender. That's the right boundary. If it gave specific recommendations, I'd be worried about liability."

**Impact:** The copilot's boundary behavior is critical for lender trust. It educates without recommending, which makes it a tool the broker can endorse rather than fear.

### B2B2C Opportunity
> "If you could show me which LEs the borrower has uploaded and how they rank in the comparison, I'd know exactly what to compete against. A 'Lender Dashboard' view where I see my borrowers' comparison tables would be worth paying for. I'd pay $15-20 per loan for that visibility."

---

## Cross-Persona Value Summary — Financing Tab

| Feature | FTHB Value | Experienced Buyer Value | Realtor Value | Broker Value |
|---------|-----------|----------------------|--------------|-------------|
| **LE Cards (Auto-Populated)** | Removes data entry barrier | Saves 15-20 min per LE | Borrowers come prepared | Standardized competitor data |
| **Comparison Table** | First-time understanding | Total cost analysis | Replaces phone explanations | Elevates borrower literacy |
| **Optimization Toggle** | Surfaces non-obvious tradeoffs | Confirms intuition | Automates advisory | Changes conversation quality |
| **Ask Homie** | Turns data into understanding | Quick deal validation | 24/7 availability extension | Correct boundaries build trust |
| **Review Banner** | Teaches verification habit | Trust signal | Professional feel | Data accuracy assurance |
| **Financing Copilot Chips** | Guided exploration | Quick answers | Reduces support calls | Informed borrowers close faster |

---

## Key Takeaway — Financing Tab

The Financing tab transforms the most stressful financial decision in homebuying — choosing a loan — from a confusing comparison of dense PDFs into a visual, interactive, AI-guided experience.

The signature moment: A buyer uploads three Loan Estimate PDFs, gets auto-populated cards in 15 seconds, selects all three for comparison, sees the side-by-side table, toggles between "Lowest Monthly" and "Lowest Total Cost" and realizes they're different answers, then clicks "Ask Homie" and gets a plain-English explanation of which loan fits their situation and why. That entire flow takes under 2 minutes. Without this product, it takes a phone call, a spreadsheet, and a weekend.

The optimization toggle is the feature that separates this from a simple comparison tool. It teaches buyers that "lowest rate" and "best deal" are not the same thing — a lesson that can save them tens of thousands of dollars over the life of the loan.
