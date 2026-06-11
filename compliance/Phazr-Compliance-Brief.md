# Phazr — Compliance & Liability Brief

**Prepared by:** Phazr, Inc.
**Effective Date:** May 2026
**Document Classification:** Compliance Reference — For Brokerage Review
**Version:** 2.0

---

## 1. Product Description and Regulatory Classification

Phazr is a consumer-facing software application that provides **document summarization, transaction organization, deadline tracking, and general market information functionality** to residential homebuyers during the purchase process.

The platform utilizes artificial intelligence to parse buyer-uploaded closing-related documents (including but not limited to Loan Estimates, Closing Disclosures, inspection reports, title commitments, HOA governing documents, and insurance binders) and generate plain-language restatements of their contents.

### 1.1 Classification

Phazr is a **consumer information technology platform.** It restates document contents, organizes transaction data, tracks buyer-entered deadlines, and displays clearly-disclaimed automated market statistics and value estimates (Section 2.4). It does not interpret, evaluate, or render professional judgment on the merits, risks, or suitability of any transaction term, document provision, or financial product.

The platform is not, and does not hold itself out to be, any of the following:

- A licensed real estate brokerage, agent, or referral service
- A mortgage lender, loan originator, or mortgage broker
- A provider of legal, tax, financial, or investment advice
- An insurance agency, comparison platform, or insurance broker
- A title company, escrow agent, or settlement service provider
- An appraisal management company or licensed appraiser
- A credit counseling agency or debt advisory service

### 1.2 Licensing

The platform does not engage in any activity requiring licensure under:

- Florida Statute Chapter 475 (Real Estate Brokers and Sales Associates)
- Texas Occupations Code Chapter 1101 (Real Estate Brokers and Sales Agents)
- Arizona Revised Statutes Title 32, Chapter 20 (Real Estate)
- California Business and Professions Code Division 4 (Real Estate)
- The Real Estate Settlement Procedures Act (RESPA), 12 USC § 2601 et seq.
- The Truth in Lending Act (TILA), 15 USC § 1601 et seq.
- The Secure and Fair Enforcement for Mortgage Licensing Act (SAFE Act)

---

## 2. Scope of AI-Generated Output

All AI-generated content within Phazr — including document summaries, field identifications, variance comparisons, and conversational copilot responses — constitutes **automated informational output only.** Such output is presented subject to the following disclosure, which appears on every AI-generated response surface within the application:

> *"This is not legal, financial, or real estate advice. This is a plain-language restatement of what this document contains. Consult your real estate agent, lender, or attorney for guidance on any decisions related to your transaction."*

### 2.1 What AI-Generated Output Does

- Restates the contents of buyer-uploaded documents in plain language
- Identifies and displays key financial fields present in uploaded documents (e.g., loan amount, interest rate, closing costs) without characterizing whether such values are favorable, unfavorable, or appropriate
- Displays numerical differences between Loan Estimate and Closing Disclosure field values, noting where such differences exceed the tolerance thresholds established under the TILA-RESPA Integrated Disclosure Rule (TRID), 12 CFR § 1026.19(e)(3), for the buyer's informational awareness
- Tracks contractual deadlines derived from data manually entered by the buyer
- Responds to buyer questions with answers grounded in the text of uploaded documents

### 2.2 What AI-Generated Output Does Not Do

- Does not recommend, endorse, or advise for or against any transaction, term, counterparty, or course of action
- Does not characterize any document term, fee, or rate as favorable, unfavorable, excessive, competitive, or appropriate
- Does not provide appraisals, broker price opinions, comparative market analyses, or individualized advice regarding the value of any property. Automated, clearly-disclaimed value estimates and public market statistics are displayed as general consumer information only, as described in Section 2.4
- Does not draft, modify, interpret, or execute contracts, addenda, or legal instruments
- Does not originate, process, underwrite, or broker mortgage loans or any extension of credit
- Does not recommend, compare, or evaluate insurance products, coverage levels, or carriers
- Does not render opinions on title status, title defects, survey matters, or zoning compliance
- Does not make representations regarding the suitability of any loan product, interest rate, or term
- Does not provide tax advice, tax projections, or guidance on tax implications of any transaction

### 2.3 Variance Detection and Consumer Alerts

The platform's Loan Estimate vs. Closing Disclosure comparison feature displays numerical differences between corresponding fields in the two documents. Where a difference exceeds TRID regulatory tolerance thresholds ($100 or 10% of the original estimate, as applicable under 12 CFR § 1026.19(e)(3)), the platform visually denotes the difference. Where a difference exceeds $250 but falls within regulatory tolerance, the platform notes the difference for the buyer's awareness.

**In all cases, variance displays are factual presentations of numerical differences. The platform does not advise the buyer on whether any variance is acceptable, actionable, or indicative of lender error.** The platform's informational footer directs buyers to consult their lender or attorney regarding any variance.

### 2.4 Automated Value Estimates and Market Information Displays

The platform's pre-transaction Shopping surface includes two display-only informational cards: a **Market Snapshot** (locally relevant statistics such as median price, days on market, and prevailing mortgage rates, derived from third-party market data) and **Home Value Scenarios** (an automated, statistically modeled estimate of a saved property's current value, with conservative/moderate/optimistic scenario ranges over 5-, 10-, and 15-year horizons).

These displays are automated estimates of the kind courts have treated as nonactionable statements of opinion where they are clearly disclosed as estimates (see *Patel v. Zillow, Inc.*, 915 F.3d 446 (7th Cir. 2019), affirming dismissal of deceptive-practices claims over published automated value estimates because such estimates are statements of opinion, and affirming dismissal of the unlicensed-appraisal claim on the ground that the state appraiser-licensing statute conferred no private right of action; the court did not reach whether an automated estimate constitutes an appraisal). The platform's forward-looking scenario ranges extend beyond the current-value estimates at issue in *Patel* and in incumbent AVM practice, and are accordingly presented with uncertainty disclosure that exceeds incumbent practice. Consistent with that treatment, the platform observes the following controls:

- Every estimate is displayed with an in-context disclosure stating that it is an automated estimate, **not an appraisal**, not a guarantee or forecast of value, and not advice on what to offer or pay, and directing the buyer to their agent or a licensed appraiser for an opinion of value
- Values are presented as scenario **ranges** accompanied by a displayed model-confidence score; the model's self-reported confidence is capped (at 75/100) pending validation against realized outcomes, and data-sparsity warnings are surfaced directly to the buyer
- The platform makes **no accuracy claims** for these estimates, in-product or in marketing
- These displays appear only on the pre-transaction Shopping surface. They are not presented within offer, escrow, or closing workflows; are not connected to any offer, negotiation, or financing feature; and are never characterized as a basis for a transaction decision
- The conversational copilot is expressly prohibited from rendering value opinions or applying these estimates to offer, negotiation, or other transaction decisions (Section 2.2); it may describe only what the display is and how to read it
- The platform is not engaged by any party to develop an opinion of value for any specific transaction, holds no appraisal license, and does not perform appraisals or appraisal services as defined under applicable state law (e.g., Fla. Stat. Ch. 475, Part II)

> *[FLAGGED FOR COUNSEL REVIEW: confirm the Section 2.4 posture under Fla. Stat. Ch. 475 Part II and analogous TX/AZ/CA appraisal statutes — including whether paid display of value estimates constitutes "providing valuation services for compensation" under Fla. Stat. § 475.612 — the sufficiency of the in-context disclosure language, and the treatment of the forward-looking scenario ranges, which extend beyond the current-value AVM fact pattern addressed in Patel.]*

---

## 3. Agent and Brokerage Liability Posture

### 3.1 No Agency Relationship With Platform

Phazr does not create, imply, or establish any agency, fiduciary, advisory, or joint-venture relationship between the platform and any homebuyer, referring agent, or brokerage. The platform is a **third-party information technology product** that the buyer accesses and uses independently.

When an agent provides a buyer with a link to Phazr, the agent is providing a reference to a third-party consumer technology product. The buyer independently creates an account, agrees to the platform's Terms of Service, and controls all interactions with the platform. The agent does not control, direct, or participate in the buyer's use of the platform.

### 3.2 Agent Referral — Scope and Limitations

When a licensed real estate agent recommends Phazr to a buyer client, such recommendation constitutes a referral to a third-party consumer technology product. This is functionally equivalent to an agent recommending that a buyer use a mortgage calculator, review a home inspection checklist, or consult educational materials published by the Consumer Financial Protection Bureau (CFPB) or the Department of Housing and Urban Development (HUD).

**However, unlike government-published materials, Phazr's AI-generated output is produced by machine learning systems that may contain errors.** The platform's disclaimers, not the agent's professional obligations, govern the accuracy and reliability of AI-generated output. The referring agent does not thereby:

- Warrant or guarantee the accuracy, completeness, or reliability of any AI-generated output
- Assume liability for the buyer's reliance on any AI-generated restatement or summary
- Create a duty to supervise, review, verify, or correct the platform's output
- Alter or expand the scope of their existing agency obligations under applicable state law

### 3.3 Shared Workspace and Agent Access

When a buyer connects their workspace to an agent — by signing up through the agent's invite link, or by claiming a transaction the agent set up for them — the transaction becomes a **shared workspace**. The buyer always owns the workspace; the connected agent is granted collaborative access to the same transaction so that buyer and agent can stay coordinated, consistent with the ordinary working relationship between a homebuyer and their real estate agent.

Within a shared transaction, the connected agent can view and help maintain transaction data, including the current phase and deadlines, uploaded documents and their plain-language summaries and extracted fields, offer and financing details, and repair and insurance records. Access is enforced by per-transaction, row-level database security: an agent can only access transactions to which they are connected, and only the buyer can connect or, by deleting the workspace, disconnect.

**Two categories of information are never accessible to the agent:**

- **The buyer's private conversations with the AI assistant (Homie).** Copilot messages are scoped to the buyer alone at the database level and are not part of the shared workspace.
- **Other buyers' workspaces.** An agent sees only the specific transactions buyers have connected to them.

The buyer controls this access. Connecting a workspace to an agent reflects the buyer's existing professional relationship and does not transfer ownership of the buyer's data. The availability of shared access does not impose upon the agent any duty to monitor, audit, or respond to information displayed by the platform, and the agent's professional obligations to their client remain governed by applicable state licensing statutes and brokerage policies, independent of the platform. The platform is a workspace the buyer and agent share; it does not create, alter, or expand any agency, fiduciary, or supervisory duty.

### 3.4 Errors and Omissions (E&O) Considerations

Phazr's AI-generated output constitutes automated informational content produced by a third-party technology platform. It is not a professional service rendered by, through, or on behalf of the referring agent or their brokerage. Because the platform:

- Does not operate under any agent's or brokerage's real estate license
- Does not hold itself out as an extension, agent, or representative of any brokerage's services
- Maintains its own disclaimers, Terms of Service, and limitation of liability provisions independent of any agent or brokerage relationship
- Is accessed by the consumer through an independent account subject to the platform's own terms
- Does not grant the referring agent control over, editorial authority over, or responsibility for AI-generated output

...the platform's output falls outside the scope of professional services typically covered under a real estate agent's or brokerage's Errors and Omissions insurance policy.

**Phazr maintains its own technology errors and omissions (Tech E&O) insurance coverage.** Claims arising from AI-generated output are addressed through the platform's own liability framework, not the referring agent's or brokerage's E&O policy.

**Brokerages are encouraged to confirm this analysis with their own E&O carrier.** Phazr will cooperate with any brokerage's E&O insurer to provide documentation of the platform's independent liability posture upon request.

---

## 4. Data Handling and Privacy

### 4.1 Document Storage and Encryption

- All buyer-uploaded documents are encrypted at rest using AES-256 encryption
- All data in transit is encrypted via TLS 1.2 or higher
- Documents are stored in isolated, per-transaction storage paths with access enforced by row-level database security policies
- Access to stored documents is limited to the authenticated buyer and, where the buyer has explicitly granted access, designated collaborators

### 4.2 AI Processing and Third-Party Data Transmission

Document contents are transmitted to AI processing services (currently OpenAI's API) for the purpose of generating plain-language summaries and field extraction. Additionally, where the buyer uses the market information features described in Section 2.4, the street address of a buyer-saved home (with basic listing facts such as price, beds, and baths) is transmitted to the AI provider solely to retrieve market statistics for that area. **Regardless of any third-party AI provider's data policies, Phazr commits to the following:**

- Buyer documents are transmitted solely for the purpose of generating the buyer's requested analysis
- Before any document text is transmitted for AI processing, the platform applies automated redaction of sensitive identifiers (Social Security numbers, bank account numbers, ABA routing numbers, payment card numbers, and wire-instruction details). One exception applies: scanned or image-based documents that cannot be read as text are transmitted as images for optical text extraction before redaction can occur; the extracted text is then redacted before all further processing and storage
- Phazr does not authorize, permit, or consent to the use of buyer document content for AI model training by any third-party provider
- If the platform's AI processing provider changes its data handling policies in a manner inconsistent with this commitment, Phazr will migrate to an alternative provider or implement data processing agreements that preserve these protections
- The platform selects AI processing providers whose API terms, as of the effective date of this document, exclude API input data from model training

### 4.3 Data Sharing

- **No buyer data is sold, licensed, rented, or shared with third parties** for marketing, lead generation, advertising, or any commercial purpose unrelated to the buyer's direct use of the platform
- No buyer data is shared with the referring agent, brokerage, lender, title company, or any other transaction counterparty unless the buyer explicitly initiates such sharing through the platform's collaborator link feature
- The platform does not request Social Security numbers, bank account numbers, routing numbers, or credit report data from buyers. Documents uploaded by buyers may incidentally contain such identifiers; the platform applies automated redaction to document text before AI processing and before storing any derived text, summaries, or extracted fields. Original uploaded documents are retained encrypted at rest and are not shared except as described in this section

### 4.4 Data Retention and Deletion

- Buyer data is retained for the duration of the buyer's active account and for a period of [12 months / to be determined by counsel] following account closure or transaction completion, after which it is permanently deleted
- Buyers may request deletion of their account and all associated data at any time by contacting the platform
- Upon deletion, all uploaded documents, AI-generated summaries, and transaction data are permanently removed from the platform's systems within 30 days
- **California residents:** The platform honors data access and deletion requests in accordance with the California Consumer Privacy Act (CCPA), Cal. Civ. Code § 1798.100 et seq. Requests may be submitted to the contact address in Section 8.

### 4.5 Collaborator Upload Links

When a buyer generates a collaborator upload link for a transaction professional (lender, inspector, title officer, agent), the link recipient:

- Can upload documents to the buyer's workspace only
- Cannot view, download, or access any other documents in the buyer's workspace
- Cannot view the buyer's personal information, financial data, or AI-generated content
- Is not required to create an account and is not retained as a user of the platform
- Is subject to upload rate limits and file type restrictions for security purposes

### 4.6 Free Document Analyzer (/explain)

The platform offers a free, ungated document analysis tool that does not require account creation. Users of this tool:

- Are presented with the platform's disclaimer and privacy notice prior to upload
- Acknowledge, by initiating the upload, that the document will be transmitted to AI processing services for analysis
- Receive results that are ephemeral — not stored, not associated with a persistent user record, and not accessible after the browser session ends
- Are not required to provide any personal information, email address, or identifying data to use the free tool

---

## 5. RESPA Compliance

### 5.1 Settlement Service Classification

Phazr is not a "settlement service" as defined under RESPA, 12 USC § 2602(3), and does not provide any service listed in HUD's enumerated settlement service categories. The platform does not participate in or facilitate the closing, settlement, or escrow process.

### 5.2 Referral Fees and Things of Value (Section 8)

RESPA Section 8, 12 USC § 2607, prohibits the giving or receiving of any "thing of value" for the referral of settlement service business.

Phazr is not a settlement service. Agent referrals to Phazr are referrals to a consumer technology product, not to a settlement service provider. Accordingly, Section 8 does not apply to the act of an agent recommending the platform to a buyer.

**To the extent the platform offers promotional incentives to agents** (e.g., extended free trial periods, fee waivers, or feature upgrades in exchange for referrals), such incentives are structured as technology product promotions — not as compensation for the referral of settlement service business. The platform does not condition any incentive on the outcome, completion, or terms of any real estate transaction.

**Phazr does not pay agents for buyer sign-ups, completed transactions, or loan origination activity.** No agent compensation is tied to or contingent upon the volume or value of any settlement service.

---

## 6. Regulatory Compliance Summary

| Regulatory Framework | Phazr Compliance Posture |
|---------------------|----------------------------------|
| **RESPA** (12 USC § 2601 et seq.) | Not a settlement service provider. No referral fees paid or received for settlement services. See Section 5 for detailed analysis. |
| **TILA / Regulation Z** (15 USC § 1601; 12 CFR § 1026) | Does not originate, extend, or broker credit. TRID tolerance references are factual displays of numerical differences for consumer information only. |
| **FL Statute Ch. 475** | Does not broker, negotiate, or appraise real property. Does not provide services requiring a FL real estate license. |
| **TX Occupations Code Ch. 1101** | Does not act as a broker or sales agent. Does not negotiate or procure real estate transactions. |
| **AZ Rev. Stat. Title 32, Ch. 20** | Does not engage in acts requiring an AZ real estate license. |
| **CA Bus. & Prof. Code Div. 4** | Does not engage in acts requiring a CA real estate license. |
| **Fair Housing Act** (42 USC § 3601 et seq.) | Platform does not select, filter, recommend, or steer buyers toward or away from any property, neighborhood, school district, or demographic category. |
| **GLBA / Reg. P** (15 USC § 6801 et seq.) | Platform does not originate financial products and is not a "financial institution" under GLBA. To the extent the platform handles NPI contained in financial documents, it maintains administrative, technical, and physical safeguards consistent with the FTC Safeguards Rule (16 CFR § 314) and implements AES-256 encryption, access controls, and data minimization practices. |
| **CCPA** (Cal. Civ. Code § 1798.100 et seq.) | Platform honors data access, deletion, and opt-out requests from California residents. Privacy policy discloses categories of data collected and purpose of collection. |
| **FL FDUPTA** (FL Stat. § 501.201 et seq.) | All AI-generated output is clearly and conspicuously disclaimed as automated informational content, not professional advice. No deceptive or misleading claims regarding the nature, capabilities, or limitations of the service. |
| **TX DTPA** (TX Bus. & Com. Code § 17.41 et seq.) | Platform does not make representations that its services are of a particular standard, quality, or grade beyond what is disclaimed. AI output limitations are disclosed. |

---

## 7. Limitations, Disclaimers, and Error Handling

### 7.1 General Disclaimer

Phazr makes no warranty, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement, regarding the accuracy, completeness, timeliness, or reliability of any AI-generated output. The platform's document summaries, field extractions, and conversational responses are produced by artificial intelligence systems that, while designed to be helpful and accurate, may contain errors, omissions, misinterpretations, or inaccuracies.

**Buyers are advised in all cases to consult with their licensed real estate agent, mortgage lender, attorney, or other qualified professional before making any decision related to their real estate transaction.** The platform is a supplement to — not a substitute for — professional guidance.

### 7.2 Error Reporting and Correction

If a buyer, agent, or other party identifies a material error in AI-generated output:

- The error may be reported to the platform via the in-app reporting mechanism or by contacting the address in Section 8
- The platform will investigate reported errors and, where an error is confirmed, re-process the affected document and notify the reporting user within a commercially reasonable timeframe
- The platform maintains internal monitoring for systematic AI output errors and deploys corrections to its processing pipeline on an ongoing basis

### 7.3 Terms of Service

The platform's Terms of Service, which each user accepts upon account creation, include:

- Explicit acknowledgment that all AI-generated output is informational and not advisory
- Limitation of liability provisions capping the platform's aggregate liability
- Binding arbitration provisions for dispute resolution
- Disclaimer of warranties consistent with Section 7.1 above

**These Terms of Service are available for review at phazr.co/terms and will be provided to any brokerage upon request.**

---

## 8. Platform Insurance

Phazr maintains technology errors and omissions (Tech E&O) and general commercial liability insurance coverage. Details of coverage limits are available upon request to brokerages conducting due diligence.

---

## 9. Contact

For compliance inquiries, E&O carrier coordination, data handling questions, CCPA requests, or to request a copy of the Terms of Service and Privacy Policy:

**Email:** compliance@phazr.co
**Phone:** [Founder phone number]
**Web:** phazr.co/compliance

---

*This document is provided for informational purposes to assist brokerages in evaluating Phazr. It does not constitute legal advice. Brokerages are encouraged to consult with their own legal counsel and E&O carrier regarding the suitability of recommending any third-party consumer technology tool to clients. Phazr will cooperate with any such review upon request.*
