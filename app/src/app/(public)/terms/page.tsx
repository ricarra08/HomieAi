import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Phazr",
  description: "Terms of Service governing your use of Phazr.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to Phazr
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight mt-6">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Effective Date: May 1, 2026 &middot; Last Updated: May 1, 2026
          </p>
        </div>

        {/* Body */}
        <div className="prose-legal space-y-8 text-base text-foreground leading-relaxed">
          {/* ------------------------------------------------------------ */}
          <Section n="1" title="Agreement to Terms">
            <P>
              These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally
              binding agreement between you (&ldquo;User,&rdquo;
              &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and Phazr, Inc.
              (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
              &ldquo;our&rdquo;), a Florida corporation, governing your access
              to and use of the Phazr platform, website, and related
              services (collectively, the &ldquo;Service&rdquo;).
            </P>
            <P>
              By creating an account, accessing the Service, or using the free
              document analyzer tool at /explain, you acknowledge that you have
              read, understood, and agree to be bound by these Terms and our{" "}
              <Link href="/privacy" className="text-accent hover:underline">
                Privacy Policy
              </Link>
              , which is incorporated herein by reference. If you do not agree to
              these Terms, do not use the Service.
            </P>
            <P>
              If you are using the free document analyzer tool without creating
              an account, your upload of a document constitutes acceptance of
              these Terms as they apply to that feature.
            </P>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="2" title="Description of Service">
            <P>
              Phazr is a consumer information technology platform that
              provides document summarization, transaction organization,
              deadline tracking, and general market information functionality
              to residential homebuyers. The Service utilizes artificial
              intelligence to parse user-uploaded documents and generate
              plain-language restatements of their contents.
            </P>
            <SubSection title="2.1 The Service Includes:">
              <UL>
                <li>
                  AI-generated plain-language restatements of uploaded real
                  estate transaction documents
                </li>
                <li>
                  Identification and display of key financial fields contained in
                  uploaded documents
                </li>
                <li>
                  Display of numerical differences between Loan Estimate and
                  Closing Disclosure field values
                </li>
                <li>
                  Transaction deadline tracking based on user-entered data
                </li>
                <li>
                  A conversational AI assistant (&ldquo;Homie&rdquo;) that
                  responds to questions grounded in uploaded document context
                </li>
                <li>
                  Secure document upload links for third-party transaction
                  professionals
                </li>
                <li>
                  Display of clearly-disclaimed, automated market statistics
                  and home value estimates with scenario ranges, provided as
                  general information only — these are not appraisals, not
                  forecasts or guarantees of any property&rsquo;s value, and
                  not advice on any transaction decision
                </li>
              </UL>
            </SubSection>
            <SubSection title="2.2 The Service Does Not Include:">
              <UL>
                <li>
                  Legal, financial, tax, investment, or real estate advice of any
                  kind
                </li>
                <li>
                  Appraisals, broker price opinions, comparative market
                  analyses, or individualized advice regarding the value of any
                  property (automated, clearly-disclaimed value estimates are
                  displayed as general information only, per Section 2.1)
                </li>
                <li>
                  Mortgage origination, processing, underwriting, or brokerage
                </li>
                <li>Insurance comparison, recommendation, or brokerage</li>
                <li>
                  Contract drafting, modification, interpretation, or execution
                </li>
                <li>Title examination, title opinions, or escrow services</li>
                <li>Referrals to lenders, agents, or other service providers</li>
              </UL>
            </SubSection>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section
            n="3"
            title="AI-Generated Content — Critical Disclaimers"
          >
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-5 my-4">
              <p className="text-sm font-semibold text-warning mb-2">
                IMPORTANT — PLEASE READ CAREFULLY
              </p>
              <P>
                All AI-generated content within the Service — including document
                summaries, field extractions, variance analyses, and
                conversational responses — constitutes{" "}
                <strong>automated informational output only.</strong> Such
                content is not legal advice, financial advice, real estate
                advice, tax advice, or any other form of professional advice.
              </P>
            </div>
            <SubSection title="3.1 No Professional Advice">
              <P>
                The Service restates document contents in plain language. It does
                not interpret the legal significance of any document provision,
                evaluate whether any transaction term is favorable or
                unfavorable, or recommend any course of action. You should always
                consult with your licensed real estate agent, mortgage lender,
                attorney, or other qualified professional before making any
                decision related to your real estate transaction.
              </P>
            </SubSection>
            <SubSection title="3.2 AI Limitations">
              <P>
                The Service&apos;s AI-generated content is produced by machine
                learning systems that, while designed to be helpful and accurate,
                may contain errors, omissions, misinterpretations, or
                inaccuracies. AI-generated content may:
              </P>
              <UL>
                <li>Misidentify or misclassify a document type</li>
                <li>
                  Extract incorrect values from documents, particularly those
                  that are scanned, handwritten, or of low quality
                </li>
                <li>
                  Generate summaries that omit material information or emphasize
                  immaterial information
                </li>
                <li>
                  Produce conversational responses that are incomplete,
                  inaccurate, or not applicable to your specific circumstances
                </li>
              </UL>
              <P>
                <strong>
                  You assume all risk associated with reliance on AI-generated
                  content.
                </strong>{" "}
                The Company is not liable for any decision made or action taken
                by you based on AI-generated content.
              </P>
            </SubSection>
            <SubSection title="3.3 Variance Detection">
              <P>
                The Service&apos;s Loan Estimate vs. Closing Disclosure
                comparison feature displays numerical differences between
                corresponding document fields. Where a difference exceeds
                regulatory tolerance thresholds established under the TILA-RESPA
                Integrated Disclosure Rule (TRID), the Service visually denotes
                the difference. Such displays are factual presentations of
                numerical differences and do not constitute advice regarding
                whether any variance is acceptable, actionable, erroneous, or
                indicative of lender misconduct.
              </P>
            </SubSection>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="4" title="Accounts and Registration">
            <SubSection title="4.1 Account Creation">
              <P>
                To access the full Service, you must create an account by
                providing a valid email address and password. You represent that
                all information provided during registration is accurate and
                complete.
              </P>
            </SubSection>
            <SubSection title="4.2 Account Security">
              <P>
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activity that occurs under your
                account. You agree to notify us immediately of any unauthorized
                use of your account.
              </P>
            </SubSection>
            <SubSection title="4.3 Age Requirement">
              <P>
                You must be at least 18 years of age to create an account or use
                the Service. By creating an account, you represent and warrant
                that you are at least 18 years old.
              </P>
            </SubSection>
            <SubSection title="4.4 Agent Accounts">
              <P>
                Licensed real estate agents may create agent accounts to refer
                buyers to the Service and view high-level transaction milestone
                data for referred buyers. Agent accounts do not grant access to
                AI-generated document explanations, copilot chat transcripts, or
                the content of buyer-uploaded documents.
              </P>
            </SubSection>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="5" title="User Responsibilities and Prohibited Uses">
            <SubSection title="5.1 Acceptable Use">
              <P>
                You agree to use the Service solely for the purpose of
                organizing and understanding your own residential real estate
                transaction, or, if you are a licensed agent, for the purpose of
                referring your buyer clients to the Service.
              </P>
            </SubSection>
            <SubSection title="5.2 Prohibited Conduct">
              <P>You agree not to:</P>
              <UL>
                <li>
                  Upload documents that you do not have the legal right to
                  possess or share
                </li>
                <li>
                  Use the Service to engage in or facilitate fraud, money
                  laundering, or any illegal activity
                </li>
                <li>
                  Attempt to circumvent rate limits, access controls, or security
                  measures
                </li>
                <li>
                  Use automated systems (bots, scrapers) to access the Service
                  except through published APIs
                </li>
                <li>
                  Reverse engineer, decompile, or attempt to extract the source
                  code of the Service
                </li>
                <li>
                  Resell, sublicense, or commercially redistribute the
                  Service&apos;s output without written consent
                </li>
                <li>
                  Upload content that contains malware, viruses, or malicious
                  code
                </li>
              </UL>
            </SubSection>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="6" title="Intellectual Property">
            <SubSection title="6.1 Our Property">
              <P>
                The Service, including its design, code, AI models, extraction
                schemas, user interface, and documentation, is owned by Phazr,
                Inc. and is protected by copyright, trademark, and other
                intellectual property laws. These Terms do not grant you any
                right, title, or interest in the Service except for the limited
                right to use it in accordance with these Terms.
              </P>
            </SubSection>
            <SubSection title="6.2 Your Content">
              <P>
                You retain ownership of all documents you upload to the Service.
                By uploading a document, you grant the Company a limited,
                non-exclusive, non-transferable license to process, analyze,
                store, and transmit the document to third-party AI processing
                providers, solely for the purpose of providing the Service to
                you as described in Section 7 and our Privacy Policy. This
                license terminates when you delete the document or your account.
              </P>
            </SubSection>
            <SubSection title="6.3 AI-Generated Output">
              <P>
                AI-generated summaries, explanations, and analyses produced by
                the Service are provided for your personal, non-commercial use in
                connection with your real estate transaction. You may share
                AI-generated output with your agent, lender, attorney, or other
                transaction professionals. You may not commercially redistribute
                or publish AI-generated output as your own work product.
              </P>
            </SubSection>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="7" title="Privacy and Data Handling">
            <P>
              Your use of the Service is subject to our{" "}
              <Link href="/privacy" className="text-accent hover:underline">
                Privacy Policy
              </Link>
              , which describes how we collect, use, store, and disclose your
              information. Key provisions include:
            </P>
            <UL>
              <li>
                Documents are encrypted at rest (AES-256) and in transit (TLS
                1.2+)
              </li>
              <li>
                No buyer data is sold, licensed, or shared with third parties for
                marketing or lead generation
              </li>
              <li>
                Document contents are transmitted to AI processing providers
                solely for the purpose of generating your requested analysis
              </li>
              <li>
                The platform does not collect, store, or process Social Security
                numbers, bank account numbers, routing numbers, or credit reports
              </li>
              <li>
                You may request deletion of your account and all associated data
                at any time
              </li>
            </UL>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="8" title="Fees and Payment">
            <P>
              Phazr currently offers a free tier for individual
              homebuyers. Certain features, premium tiers, or agent-specific
              functionality may require payment in the future. If we introduce
              paid features:
            </P>
            <UL>
              <li>
                We will clearly disclose pricing before you incur any charges
              </li>
              <li>
                No charges will be applied without your affirmative consent
              </li>
              <li>
                Existing free features will not be retroactively paywalled
                without 30 days&apos; prior notice
              </li>
            </UL>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="9" title="Disclaimer of Warranties">
            <div className="bg-muted rounded-xl p-5 my-4">
              <P>
                THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
                AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS
                OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                NON-INFRINGEMENT, ACCURACY, OR COMPLETENESS.
              </P>
              <P>
                THE COMPANY DOES NOT WARRANT THAT: (A) THE SERVICE WILL BE
                UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE; (B) AI-GENERATED
                CONTENT WILL BE ACCURATE, COMPLETE, OR RELIABLE; (C) THE RESULTS
                OBTAINED FROM USE OF THE SERVICE WILL BE ACCURATE OR DEPENDABLE;
                OR (D) ANY ERRORS IN THE SERVICE WILL BE CORRECTED.
              </P>
              <P>
                NO ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED BY
                YOU FROM THE COMPANY OR THROUGH THE SERVICE SHALL CREATE ANY
                WARRANTY NOT EXPRESSLY STATED IN THESE TERMS.
              </P>
              <P>
                SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN
                WARRANTIES OR THE LIMITATION OR EXCLUSION OF LIABILITY FOR
                CERTAIN TYPES OF DAMAGES. ACCORDINGLY, SOME OF THE ABOVE
                DISCLAIMERS AND LIMITATIONS MAY NOT APPLY TO YOU. TO THE EXTENT
                THAT THE COMPANY MAY NOT, AS A MATTER OF APPLICABLE LAW,
                DISCLAIM ANY IMPLIED WARRANTY OR LIMIT ITS LIABILITIES, THE
                SCOPE AND DURATION OF SUCH WARRANTY AND THE EXTENT OF THE
                COMPANY&apos;S LIABILITY SHALL BE THE MINIMUM PERMITTED UNDER
                SUCH APPLICABLE LAW.
              </P>
            </div>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="10" title="Limitation of Liability">
            <div className="bg-muted rounded-xl p-5 my-4">
              <P>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
                SHALL THE COMPANY, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS,
                OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO
                DAMAGES FOR LOSS OF PROFITS, GOODWILL, DATA, OR OTHER INTANGIBLE
                LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO
                USE THE SERVICE, REGARDLESS OF WHETHER SUCH DAMAGES ARE BASED ON
                WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STATUTE, OR ANY
                OTHER LEGAL THEORY, AND REGARDLESS OF WHETHER THE COMPANY HAS
                BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </P>
              <P>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE
                COMPANY&apos;S TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS
                ARISING OUT OF OR RELATED TO THESE TERMS OR YOUR USE OF THE
                SERVICE SHALL NOT EXCEED THE GREATER OF: (A) THE TOTAL AMOUNT
                YOU HAVE PAID TO THE COMPANY IN THE TWELVE (12) MONTHS
                IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM; OR (B)
                ONE HUNDRED DOLLARS ($100.00).
              </P>
              <P>
                THE LIMITATIONS OF THIS SECTION SHALL APPLY REGARDLESS OF THE
                FAILURE OF THE ESSENTIAL PURPOSE OF ANY LIMITED REMEDY.
              </P>
              <P>
                NOTHING IN THESE TERMS SHALL LIMIT THE COMPANY&apos;S LIABILITY
                FOR (A) FRAUD OR INTENTIONAL MISCONDUCT BY THE COMPANY; OR (B)
                ANY LIABILITY THAT CANNOT BE EXCLUDED OR LIMITED UNDER APPLICABLE
                LAW. SOME JURISDICTIONS DO NOT ALLOW THE LIMITATION OR EXCLUSION
                OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE
                ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
              </P>
            </div>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="11" title="Indemnification">
            <P>
              You agree to indemnify, defend, and hold harmless the Company, its
              officers, directors, employees, agents, and affiliates from and
              against any and all claims, liabilities, damages, losses, costs,
              and expenses (including reasonable attorneys&apos; fees) arising out
              of or related to: (a) your use of the Service; (b) your violation
              of these Terms; (c) your violation of any third-party right,
              including any intellectual property or privacy right; (d) any claim
              that your use of the Service caused damage to a third party; or
              (e) any documents you upload to the Service that you did not have
              the legal right to possess or share.
            </P>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="12" title="Dispute Resolution and Arbitration">
            <SubSection title="12.1 Informal Resolution">
              <P>
                Before initiating any formal dispute resolution proceeding, you
                agree to first contact the Company at the address in Section 16
                and attempt to resolve the dispute informally for a period of at
                least thirty (30) days.
              </P>
            </SubSection>
            <SubSection title="12.2 Binding Arbitration">
              <P>
                If the dispute is not resolved informally, you and the Company
                agree that any dispute, claim, or controversy arising out of or
                relating to these Terms or the Service (collectively,
                &ldquo;Disputes&rdquo;) shall be resolved exclusively through
                binding individual arbitration administered by the American
                Arbitration Association (&ldquo;AAA&rdquo;) under its Consumer
                Arbitration Rules then in effect, except that: (a) each party
                retains the right to seek injunctive or other equitable relief in
                a court of competent jurisdiction to prevent the actual or
                threatened infringement, misappropriation, or violation of a
                party&apos;s intellectual property rights; and (b) either party
                may bring an individual action in small claims court for disputes
                within the jurisdictional limits of that court.
              </P>
            </SubSection>
            <SubSection title="12.3 Class Action Waiver">
              <P>
                YOU AND THE COMPANY AGREE THAT EACH MAY BRING CLAIMS AGAINST THE
                OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A
                PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED,
                OR REPRESENTATIVE PROCEEDING. THE ARBITRATOR MAY NOT CONSOLIDATE
                MORE THAN ONE PERSON&apos;S CLAIMS AND MAY NOT OTHERWISE PRESIDE
                OVER ANY FORM OF A CLASS, CONSOLIDATED, OR REPRESENTATIVE
                PROCEEDING.
              </P>
            </SubSection>
            <SubSection title="12.4 Arbitration Location and Costs">
              <P>
                Arbitration shall take place in the State of Florida or, at the
                election of the claimant, by telephone or video conference. The
                Company shall pay all AAA filing fees and arbitrator compensation
                for claims under $10,000. For claims over $10,000, filing fees
                and arbitrator compensation shall be allocated in accordance with
                AAA rules.
              </P>
            </SubSection>
            <SubSection title="12.5 Opt-Out">
              <P>
                You may opt out of the arbitration and class action waiver
                provisions of this Section 12 by sending written notice to the
                Company at the address in Section 16 within thirty (30) days of
                first accepting these Terms. Your notice must include your name,
                account email address, and a clear statement that you wish to opt
                out of arbitration. If you opt out, disputes will be resolved in
                the state or federal courts located in the State of Florida.
              </P>
            </SubSection>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="13" title="Termination">
            <SubSection title="13.1 Termination by You">
              <P>
                You may terminate your account at any time by contacting the
                Company at the address in Section 16 or by using the account
                deletion feature within the Service, if available. Upon
                termination, your right to use the Service ceases immediately.
              </P>
            </SubSection>
            <SubSection title="13.2 Termination by Us">
              <P>
                We may suspend or terminate your account and access to the
                Service at any time, with or without cause, with or without
                notice. Grounds for termination include, but are not limited to,
                violation of these Terms, fraudulent activity, or conduct that we
                reasonably believe is harmful to the Company, other users, or
                third parties.
              </P>
            </SubSection>
            <SubSection title="13.3 Effect of Termination">
              <P>
                Upon termination, your license to use the Service terminates. The
                Company will delete your account data in accordance with the data
                retention provisions of our Privacy Policy. Sections 3
                (AI Disclaimers), 6 (Intellectual Property), 9 (Disclaimer of
                Warranties), 10 (Limitation of Liability), 11
                (Indemnification), 12 (Dispute Resolution), 14 (Governing Law),
                17 (No Third-Party Beneficiaries), and 22 (Severability) shall
                survive termination.
              </P>
            </SubSection>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="14" title="Governing Law">
            <P>
              These Terms shall be governed by and construed in accordance with
              the laws of the State of Florida, without regard to its conflict of
              laws principles. To the extent that litigation is permitted under
              Section 12, the exclusive jurisdiction and venue for any such
              litigation shall be the state courts located in Miami-Dade County,
              Florida, or the United States District Court for the Southern
              District of Florida, and you consent to the personal jurisdiction
              of such courts.
            </P>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="15" title="Changes to Terms">
            <P>
              We reserve the right to modify these Terms at any time. If we make
              material changes, we will provide notice through the Service or by
              email to the address associated with your account at least thirty
              (30) days before the changes take effect. Your continued use of the
              Service after the effective date of revised Terms constitutes
              acceptance of the revised Terms. If you do not agree to the revised
              Terms, you must stop using the Service and terminate your account.
            </P>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="16" title="Contact">
            <P>
              For questions about these Terms, to report an issue, or to submit
              legal notices:
            </P>
            <div className="bg-card rounded-xl border border-border p-5 mt-3">
              <p className="text-sm font-medium">Phazr, Inc.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Email: legal@phazr.co
              </p>
              <p className="text-sm text-muted-foreground">
                Mailing Address: [Registered Agent Address or PO Box, City, FL
                ZIP]
              </p>
              <p className="text-sm text-muted-foreground">
                Web: phazr.co
              </p>
            </div>
            <P>
              Legal notices (including arbitration opt-out notices under Section
              12.5) must be sent to the mailing address above or by email to
              legal@phazr.co. Notices are deemed received upon delivery
              (for physical mail) or upon confirmed transmission (for email).
            </P>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="17" title="No Third-Party Beneficiaries">
            <P>
              These Terms are between you and the Company. No third party —
              including any real estate agent, brokerage, lender, title company,
              or other transaction professional — is a third-party beneficiary of
              these Terms or has any right to enforce any provision hereof. An
              agent&apos;s recommendation of the Service does not make the agent
              a party to or beneficiary of these Terms.
            </P>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="18" title="Assignment">
            <P>
              You may not assign or transfer these Terms, or any rights or
              obligations hereunder, without the Company&apos;s prior written
              consent. The Company may assign these Terms, in whole or in part,
              without restriction, including in connection with a merger,
              acquisition, corporate reorganization, or sale of all or
              substantially all of its assets. Subject to the foregoing, these
              Terms shall bind and inure to the benefit of the parties and their
              respective successors and permitted assigns.
            </P>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="19" title="Force Majeure and Third-Party Services">
            <P>
              The Company shall not be liable for any delay or failure to perform
              resulting from causes beyond its reasonable control, including but
              not limited to acts of God, natural disasters, pandemics,
              government actions, war, terrorism, labor disputes, power or
              internet outages, or failures of third-party service providers
              (including AI processing providers, cloud infrastructure providers,
              and payment processors).
            </P>
            <P>
              The Service relies on third-party infrastructure and AI processing
              providers. The Company is not liable for service interruptions,
              data processing delays, or errors caused by the unavailability or
              malfunction of third-party services. The Company will make
              commercially reasonable efforts to restore the Service promptly
              following any such interruption.
            </P>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="20" title="Electronic Communications">
            <P>
              By creating an account, you consent to receive communications from
              the Company electronically, including by email and in-app
              notifications. You agree that all agreements, notices, disclosures,
              and other communications that the Company provides to you
              electronically satisfy any legal requirement that such
              communications be in writing.
            </P>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="21" title="Waiver">
            <P>
              The failure of the Company to enforce any provision of these Terms
              shall not constitute a waiver of that provision or any other
              provision. No waiver shall be effective unless made in writing and
              signed by an authorized representative of the Company.
            </P>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="22" title="Severability">
            <P>
              If any provision of these Terms is held to be invalid,
              unenforceable, or illegal by a court of competent jurisdiction or
              arbitrator, such provision shall be modified to the minimum extent
              necessary to make it enforceable, or if modification is not
              possible, severed from these Terms. The invalidity of any provision
              shall not affect the validity or enforceability of the remaining
              provisions.
            </P>
          </Section>

          {/* ------------------------------------------------------------ */}
          <Section n="23" title="Entire Agreement">
            <P>
              These Terms, together with the Privacy Policy and any other
              agreements expressly incorporated by reference, constitute the
              entire agreement between you and the Company regarding the Service
              and supersede all prior or contemporaneous communications,
              representations, or agreements, whether oral or written.
            </P>
          </Section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Phazr, Inc. All rights
            reserved.
          </p>
          <div className="flex gap-4 mt-2">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/compliance"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Compliance
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout helper components for consistent legal document formatting  */
/* ------------------------------------------------------------------ */

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        {n}. {title}
      </h2>
      {children}
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <h3 className="text-base font-medium text-foreground mb-2">{title}</h3>
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-foreground/90">{children}</p>;
}

function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc pl-6 space-y-1.5 text-foreground/90 mb-3">
      {children}
    </ul>
  );
}
