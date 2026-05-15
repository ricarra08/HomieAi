"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useInView } from "motion/react";
import {
  Shield,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Users,
  Link2,
  FileText,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { DEMO_LE_ROWS, DEMO_TESTIMONIALS, FEATURES } from "@/components/landing/data";
import { DocumentPreview } from "@/components/landing/DocumentPreview";
import { ExtractionPanel } from "@/components/landing/ExtractionPanel";
import { PainPoint } from "@/components/landing/PainPoint";
import { CopilotDemo } from "@/components/landing/CopilotDemo";
import { WireFraudDemo } from "@/components/landing/WireFraudDemo";
import { WorkspacePreview } from "@/components/landing/WorkspacePreview";
import { DeadlineMiniVisual } from "@/components/landing/DeadlineMiniVisual";

export default function LandingPage() {
  const router = useRouter();
  const demoRef = useRef<HTMLDivElement>(null);
  const demoInView = useInView(demoRef, { once: true, margin: "-100px" });
  const [demoKey, setDemoKey] = useState(0);
  const [manualStart, setManualStart] = useState(false);

  const demoStarted = demoInView || manualStart;

  function replayDemo() {
    setManualStart(true);
    setDemoKey((k) => k + 1);
    document.getElementById("ai-demo")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-secondary/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/PHAZR-Logo.png"
              alt="Phazr"
              width={56}
              height={56}
              priority
              className="w-14 h-14"
            />
            <h1 className="text-5xl font-semibold tracking-tight">Phazr</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push("/login")}
              className="text-base"
            >
              Sign In
            </Button>
            <Button
              onClick={() => router.push("/try")}
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-base shadow-sm"
            >
              Start Free
            </Button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-semibold tracking-tight leading-tight"
          >
            Finally understand your{" "}
            <span className="text-accent">home purchase</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-xl text-muted-foreground mt-6 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            From serious shopping to keys in hand — Phazr organizes your
            escrow, explains your documents, tracks your deadlines, and catches
            costly mistakes before they happen.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
          >
            <Button
              onClick={() => router.push("/try")}
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-base shadow-sm px-6 py-3 h-auto gap-2"
            >
              Start Free Workspace
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/signup?role=agent")}
              className="text-base px-6 py-3 h-auto bg-white text-foreground border border-border shadow-sm hover:bg-muted gap-2"
            >
              <Users className="w-4 h-4" />
              Create Agent Account
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex items-center justify-center gap-2 mt-5"
          >
            <button
              onClick={replayDemo}
              className="text-sm font-medium text-accent hover:text-accent/80 transition-colors underline underline-offset-4"
            >
              Watch the AI in action &darr;
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── STATE BADGES ── */}
      <section className="max-w-6xl mx-auto px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center justify-center gap-2 flex-wrap"
        >
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Built for</span>
          {["Florida", "Texas", "Arizona", "California"].map((state, i) => (
            <span key={state} className="text-sm font-medium text-foreground">
              {state}{i < 3 && <span className="text-muted-foreground ml-2">·</span>}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <PainPoint
            stat="47%"
            description="of buyers say closing was more stressful than expected"
            delay={0}
          />
          <PainPoint
            stat="150+"
            description="pages of documents the average buyer signs without fully understanding"
            delay={0.1}
          />
          <PainPoint
            stat="$400M+"
            description="lost to wire fraud in real estate closings every year"
            delay={0.2}
          />
        </div>
      </section>

      {/* ── WIRE FRAUD PROTECTION ── */}
      <section className="bg-secondary/50 border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-destructive" />
                </div>
                <span className="text-sm font-semibold text-destructive uppercase tracking-wide">
                  Wire Fraud Protection
                </span>
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">
                The safeguard your title company forgot to give you
              </h2>
              <p className="text-base text-muted-foreground mt-4 leading-relaxed">
                Real estate wire fraud stole over $400M last year. Criminals
                intercept closing emails and substitute fraudulent bank account
                numbers. By the time it&apos;s discovered, the money is gone —
                and it&apos;s almost never recovered.
              </p>
              <p className="text-base text-muted-foreground mt-3 leading-relaxed">
                Phazr&apos;s SafeSend verification walks you through three
                required steps before you can mark your wire as sent. No shortcuts.
                Your $16,000+ closing wire is protected.
              </p>
              <div className="mt-6 space-y-2.5">
                {[
                  "Confirms you received instructions directly — not via email",
                  "Requires verbal confirmation to a verified phone number",
                  "Locks the wire action until all steps are complete",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground">{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex justify-center lg:justify-end"
            >
              <WireFraudDemo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── APP WORKSPACE PREVIEW ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-semibold tracking-tight">
              Everything in one workspace
            </h2>
            <p className="text-base text-muted-foreground mt-3 max-w-xl mx-auto">
              From the first showing to recording your deed — Phazr guides
              you through every phase of the transaction so nothing falls through
              the cracks.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <WorkspacePreview />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mt-8"
          >
            <Button
              onClick={() => router.push("/try")}
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-base shadow-sm px-6 py-3 h-auto gap-2"
            >
              Explore Your Workspace
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="bg-secondary/50 border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-semibold tracking-tight">
              Everything you need from offer to keys
            </h2>
            <p className="text-base text-muted-foreground mt-3 max-w-2xl mx-auto">
              One workspace for your entire homebuying journey. No more scattered
              emails, confusing documents, or missed deadlines. State-specific
              workflows — from Texas option periods to Florida SIRS compliance.
              Your transaction follows your state&apos;s rules, not a generic
              checklist.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-card rounded-xl border border-border shadow-sm p-6"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}
                >
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                {feature.hasDeadlineVisual && <DeadlineMiniVisual />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LE COMPARISON DEMO ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-emerald-600-foreground" />
                </div>
                <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Loan Comparison
                </span>
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">
                See exactly which lender is actually cheaper
              </h2>
              <p className="text-base text-muted-foreground mt-4 leading-relaxed">
                Your interest rate isn&apos;t the whole story. APR, origination
                fees, and total cash to close determine which loan is actually the
                better deal — and they rarely all point to the same lender.
              </p>
              <p className="text-base text-muted-foreground mt-3 leading-relaxed">
                Phazr shows you every number side-by-side, highlights the
                best value, and tells you exactly what you&apos;d save by choosing
                each option.
              </p>
              <div className="mt-5 bg-card rounded-lg border border-border px-4 py-3 shadow-sm">
                <p className="text-sm font-semibold text-foreground">
                  In this example: Ficus Bank saves{" "}
                  <span className="text-accent">$980 at closing</span> — despite
                  the slightly higher note rate.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="grid grid-cols-3 border-b border-border">
                  <div className="px-4 py-3" />
                  <div className="px-4 py-3 border-l border-border bg-primary/5 flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      Ficus Bank
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-xs font-semibold text-emerald-600-foreground whitespace-nowrap">
                      Best Value
                    </span>
                  </div>
                  <div className="px-4 py-3 border-l border-border flex items-center">
                    <span className="text-sm font-semibold text-foreground">
                      Maple Funding
                    </span>
                  </div>
                </div>
                {DEMO_LE_ROWS.map((row, i) => (
                  <div
                    key={row.label}
                    className={`grid grid-cols-3 border-b border-border last:border-0 ${
                      i % 2 === 1 ? "bg-secondary/30" : ""
                    }`}
                  >
                    <div className="px-4 py-3 text-xs text-muted-foreground">
                      {row.label}
                    </div>
                    <div className="px-4 py-3 border-l border-border bg-primary/5">
                      <span
                        className={`text-sm ${
                          row.ficusWins
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {row.ficus}
                      </span>
                    </div>
                    <div className="px-4 py-3 border-l border-border">
                      <span
                        className={`text-sm ${
                          !row.ficusWins
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {row.maple}
                        {row.ficusWins && (
                          <span className="ml-1 text-destructive text-xs">
                            ↑
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOR REALTORS ── */}
      <section className="bg-secondary/50 border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 lg:p-10">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-accent" />
                  <span className="text-sm font-semibold text-accent uppercase tracking-wide">
                    For Realtors
                  </span>
                </div>
                <h2 className="text-3xl font-semibold tracking-tight">
                  Your buyers will stop calling you at 10pm
                </h2>
                <p className="text-base text-muted-foreground mt-4 leading-relaxed">
                  Send your buyers a link. They get an organized workspace that
                  explains their documents, tracks their deadlines, and answers their
                  questions — so you don&apos;t have to answer the same &ldquo;what
                  does this mean?&rdquo; call for the fifth time this week.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    "Buyers come to calls informed and prepared",
                    "Fewer repetitive questions about documents and deadlines",
                    "Your buyers look organized to lenders and title",
                    "Free to use — send it to every client",
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground">{point}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => router.push("/signup")}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 text-base shadow-sm px-6 py-3 h-auto gap-2 mt-8"
                >
                  Get Your Agent Invite Link
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="bg-secondary/50 p-8 lg:p-10 flex flex-col justify-center gap-4 border-l border-border">
                <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Link2 className="w-4 h-4 text-accent" />
                    <span className="text-xs font-semibold text-foreground">
                      Your buyer invite link
                    </span>
                  </div>
                  <div className="bg-secondary rounded-md px-3 py-2 border border-border">
                    <p className="text-sm font-medium text-foreground truncate">
                      phazr.co/join/
                      <span className="text-accent">sarah-chen-realty</span>
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Send this to any buyer — they sign up and your deal is
                    automatically connected.
                  </p>
                </div>
                <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      Before Phazr
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm text-foreground max-w-[80%]">
                      Hey what does &ldquo;escrow impounds&rdquo; mean?
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm text-foreground max-w-[85%]">
                      Is 6.875% a good rate? Should I lock?
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">
                      Tuesday 10:47 PM
                    </p>
                  </div>
                </div>
                <div className="bg-card rounded-lg border-2 border-primary/30 p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      After Phazr
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-primary/10 rounded-lg px-3 py-2 text-sm text-foreground">
                      Hey! I reviewed my LE in Phazr. The origination fee
                      seems high at 0.5 points — should we ask for a no-point option?
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">
                      Tuesday 2:15 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── AI DOCUMENT INTELLIGENCE DEMO ── */}
      <section id="ai-demo" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-semibold tracking-tight">
              Upload a document. Get instant clarity.
            </h2>
            <p className="text-base text-muted-foreground mt-3 max-w-xl mx-auto">
              Our AI reads your Loan Estimate, Closing Disclosure, inspection
              report, or any real estate document — and tells you exactly what it
              means.
            </p>
          </motion.div>
          <div
            ref={demoRef}
            className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <DocumentPreview />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <ExtractionPanel key={demoKey} started={demoStarted} />
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            Works with Loan Estimates, Closing Disclosures, Inspection Reports,
            Appraisals, Title Reports, HOA Bylaws, and more.
          </motion.p>
        </div>
      </section>

      {/* ── HOMIE COPILOT DEMO ── */}
      <section className="bg-secondary/50 border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-semibold tracking-tight">
              Have questions? Just ask Homie.
            </h2>
            <p className="text-base text-muted-foreground mt-3 max-w-xl mx-auto">
              Your AI assistant is grounded in your actual documents — not generic
              advice. Ask about your specific rate, fees, deadlines, or anything
              about your transaction.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CopilotDemo />
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-semibold tracking-tight">
              Three steps to closing with confidence
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Set up your transaction",
                description:
                  "Enter your property details, offer acceptance date, and closing timeline. Your personalized workspace is ready in 60 seconds.",
              },
              {
                step: "2",
                title: "Upload your documents",
                description:
                  "Drop in your Loan Estimate, inspection report, or any document. AI classifies it, extracts the key fields, and writes a summary you can actually understand.",
              },
              {
                step: "3",
                title: "Stay on track to closing",
                description:
                  "Track every deadline, compare loan options, verify wire instructions, and ask Homie anything about your transaction. No surprises at the closing table.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.12 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-secondary/50 border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-semibold tracking-tight">
              What homebuyers and realtors are saying
            </h2>
            <p className="text-base text-muted-foreground mt-3 max-w-lg mx-auto">
              From anxious to confident — Phazr guides buyers through the
              process they never learned in school.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DEMO_TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col"
              >
                <p className="text-3xl text-accent/40 font-serif leading-none mb-3">
                  &ldquo;
                </p>
                <p className="text-sm text-foreground leading-relaxed flex-1">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
                  <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-accent">
                      {t.initials}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST / SECURITY ── */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Bank-level encryption</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Wire fraud protection built in</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>TRID compliant LE/CD analysis</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Your data is never shared or sold</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-secondary/50 border-t border-border py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-semibold tracking-tight">
              Close with confidence
            </h2>
            <p className="text-base text-muted-foreground mt-3 max-w-lg mx-auto">
              Whether you&apos;re buying your first home or your fifth, you deserve
              to understand every step of the process.
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                onClick={() => router.push("/try")}
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-base shadow-sm px-8 py-3 h-auto gap-2"
              >
                Start Your Workspace
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Free to start. No credit card required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border py-8 bg-secondary/50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-foreground">
              Phazr
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              From serious shopping to keys in hand.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Phazr. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
