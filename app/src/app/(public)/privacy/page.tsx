import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Phazr",
  description: "How Phazr collects, uses, protects, and shares your information.",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Effective Date: June 11, 2026 &middot; Last Updated: June 11, 2026
          </p>
        </div>

        {/* Body */}
        <div className="prose-legal space-y-8 text-base text-foreground leading-relaxed">
          <Section n="1" title="Introduction">
            <P>
              This Privacy Policy describes how Phazr, Inc. (&ldquo;Phazr,&rdquo;
              &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), a Florida
              corporation, collects, uses, protects, and shares information when you
              use the Phazr platform, website, and related services (the
              &ldquo;Service&rdquo;). It is incorporated into our{" "}
              <Link href="/terms" className="text-accent hover:underline">
                Terms of Service
              </Link>
              .
            </P>
            <P>
              Phazr is a homebuying workspace: you upload real estate transaction
              documents and enter transaction details, and the Service organizes
              them, explains them in plain language, and tracks your deadlines. By
              its nature, the Service handles information about one of the largest
              financial transactions of your life — this policy explains exactly
              what we do and do not do with it.
            </P>
          </Section>

          <Section n="2" title="Information We Collect">
            <SubSection title="2.1 Information you provide">
              <UL>
                <li>
                  <strong>Account information</strong> — email address, password
                  (stored as a cryptographic hash, never in plain text), and the
                  display name and role you choose at setup
                </li>
                <li>
                  <strong>Transaction information</strong> — details you enter about
                  your home purchase, such as property addresses, prices, offer
                  terms, contingency dates, and deadlines
                </li>
                <li>
                  <strong>Uploaded documents</strong> — real estate transaction
                  documents (for example purchase contracts, loan estimates, closing
                  disclosures, and inspection reports) that you, or collaborators you
                  invite, upload to your workspace
                </li>
                <li>
                  <strong>Messages to Homie</strong> — questions you ask the
                  Service&rsquo;s AI assistant and its responses
                </li>
              </UL>
            </SubSection>
            <SubSection title="2.2 Information collected automatically">
              <UL>
                <li>
                  <strong>Usage and log information</strong> — standard technical
                  data such as IP address, browser type, and the actions you take in
                  the Service, used for security, debugging, and abuse prevention
                </li>
                <li>
                  <strong>Cookies</strong> — we use cookies for authentication
                  (keeping you signed in). We do not use advertising or cross-site
                  tracking cookies
                </li>
              </UL>
            </SubSection>
            <SubSection title="2.3 Sensitive identifiers in your documents">
              <P>
                We do not ask for your Social Security number, bank account numbers,
                routing numbers, or payment card numbers. Real estate documents you
                upload may incidentally contain such identifiers. The Service applies
                automated redaction to document text before AI processing and before
                storing any derived text, summaries, or extracted fields (see
                Section 4). Your original uploaded documents are retained in
                encrypted storage as the authoritative record.
              </P>
            </SubSection>
          </Section>

          <Section n="3" title="How We Use Your Information">
            <UL>
              <li>To provide the Service: organizing your transaction, generating
                plain-language document summaries, extracting key fields, tracking
                deadlines, and answering your questions about your documents</li>
              <li>To secure the Service: authentication, fraud and abuse prevention,
                and debugging</li>
              <li>To communicate with you about your account and the Service</li>
              <li>To improve the Service, using aggregated or de-identified
                information that does not identify you</li>
            </UL>
            <P>
              We do not use your information for advertising, and we do not build
              advertising profiles.
            </P>
          </Section>

          <Section n="4" title="AI Processing of Your Documents">
            <P>
              The Service uses third-party artificial intelligence services
              (currently OpenAI&rsquo;s API) to classify documents, extract key
              fields, generate plain-language summaries, and answer your questions.
              The following commitments apply regardless of any provider&rsquo;s own
              policies:
            </P>
            <UL>
              <li>
                Document content is transmitted solely to generate the analysis you
                requested
              </li>
              <li>
                Before document text is transmitted for AI processing, we apply
                automated redaction of sensitive identifiers (Social Security
                numbers, bank account numbers, routing numbers, payment card
                numbers, and wire-instruction details). One exception: scanned or
                image-based documents that cannot be read as text are transmitted as
                images for optical text extraction before redaction can occur; the
                extracted text is then redacted before all further processing and
                storage
              </li>
              <li>
                We do not authorize or consent to the use of your document content
                for AI model training by any provider, and we select providers whose
                API terms exclude input data from model training
              </li>
              <li>
                If a provider&rsquo;s data handling becomes inconsistent with these
                commitments, we will migrate to an alternative provider or put data
                processing agreements in place that preserve them
              </li>
            </UL>
          </Section>

          <Section n="5" title="How We Share Information">
            <P>
              <strong>
                We do not sell, license, rent, or share your information with third
                parties
              </strong>{" "}
              for marketing, lead generation, advertising, or any commercial purpose
              unrelated to your direct use of the Service.
            </P>
            <SubSection title="5.1 Sharing you control">
              <UL>
                <li>
                  <strong>Collaborator links</strong> — if you generate an upload
                  link for a lender, inspector, title company, or other transaction
                  party, that person can upload documents to your workspace and sees
                  only what the link itself shows (such as the property address).
                  Links expire and can be revoked by you
                </li>
                <li>
                  <strong>Your agent</strong> — if you connect your workspace with a
                  real estate agent (for example by signing up through your
                  agent&rsquo;s invite link, or when your agent sets up a transaction
                  with you), that agent can view and help manage your transaction
                  workspace. Your private conversations with Homie are never visible
                  to your agent
                </li>
              </UL>
            </SubSection>
            <SubSection title="5.2 Service providers">
              <P>
                We use a small number of infrastructure providers to operate the
                Service, each only to the extent needed to provide it: Supabase
                (database, authentication, and document storage), OpenAI (AI
                processing as described in Section 4), Vercel (application hosting),
                and Geoapify (address lookup and autocomplete).
              </P>
            </SubSection>
            <SubSection title="5.3 Legal requirements">
              <P>
                We may disclose information if required by law, subpoena, or court
                order, or where reasonably necessary to protect the rights, safety,
                or property of our users or the public.
              </P>
            </SubSection>
          </Section>

          <Section n="6" title="Data Security">
            <UL>
              <li>All data in transit is encrypted via TLS 1.2 or higher</li>
              <li>Documents and data are encrypted at rest</li>
              <li>
                Your workspace is isolated by per-transaction, row-level database
                security policies — other users cannot access your data
              </li>
              <li>
                Sensitive identifiers are redacted from document-derived text before
                AI processing and storage (Section 4)
              </li>
            </UL>
            <P>
              No method of transmission or storage is perfectly secure. If we learn
              of a breach affecting your information, we will notify you consistent
              with applicable law.
            </P>
          </Section>

          <Section n="7" title="Data Retention and Deletion">
            <P>
              We retain your information while your account is active so the Service
              can do its job. If you delete your account or request deletion, we
              delete your personal information — including uploaded documents and
              derived summaries — within 30 days, except where retention is required
              by law or for legitimate security purposes (such as fraud-prevention
              logs).
            </P>
            <P>
              You may export your documents at any time before deletion.
            </P>
          </Section>

          <Section n="8" title="Your Privacy Rights">
            <P>
              Depending on where you live, you may have rights to access, correct,
              export, or delete your personal information, and to know what
              categories of information we collect and share (we do not sell
              personal information, and we do not share it for cross-context
              behavioral advertising). California residents may exercise rights
              under the California Consumer Privacy Act.
            </P>
            <P>
              To exercise any of these rights, contact us at the address in Section
              11. We will verify your request using your account email and respond
              within the timeframe required by applicable law. We will not
              discriminate against you for exercising your rights.
            </P>
          </Section>

          <Section n="9" title="Children's Privacy">
            <P>
              The Service is intended for adults entering real estate transactions
              and is not directed to children. We do not knowingly collect personal
              information from anyone under 18. If you believe a child has provided
              us personal information, contact us and we will delete it.
            </P>
          </Section>

          <Section n="10" title="Changes to This Policy">
            <P>
              We may update this policy as the Service evolves. If we make material
              changes, we will notify you by email or a prominent notice in the
              Service before the changes take effect. The &ldquo;Last Updated&rdquo;
              date at the top reflects the latest revision.
            </P>
          </Section>

          <Section n="11" title="Contact Us">
            <P>
              Questions or requests about this policy or your information:
              privacy@phazr.co
            </P>
          </Section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Phazr, Inc. All rights reserved.
          </p>
          <div className="flex gap-4 mt-2">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
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
