"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "motion/react";
import {
  FileText,
  Shield,
  Clock,
  DollarSign,
  Sparkles,
  CheckCircle2,
  Check,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Users,
  Link2,
  Search,
  FilePen,
  ShieldCheck,
  Key,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ──────────────────────────────────────────────
   STATIC DEMO DATA — Loan Estimate (CFPB H-24B)
   ────────────────────────────────────────────── */

const DEMO_EXTRACTED_FIELDS = [
  { label: "Document Type", value: "Loan Estimate", delay: 0.3 },
  { label: "Lender", value: "Ficus Bank", delay: 0.7 },
  { label: "Loan Product", value: "30-Year Fixed (Conventional)", delay: 1.1 },
  { label: "Loan Amount", value: "$162,000", delay: 1.5 },
  { label: "Interest Rate", value: "3.875%", delay: 1.9 },
  { label: "APR", value: "4.274%", delay: 2.3 },
  { label: "Monthly P&I", value: "$761.78", delay: 2.7 },
  { label: "Est. Total Monthly", value: "$1,050", delay: 3.1 },
  { label: "Closing Costs", value: "$8,054", delay: 3.5 },
  { label: "Cash to Close", value: "$16,054", delay: 3.9 },
  { label: "Prepayment Penalty", value: "YES — up to $3,240", delay: 4.3, flag: true },
];

const DEMO_AI_SUMMARY =
  "This is a 30-year fixed conventional loan at 3.875% from Ficus Bank. Your APR of 4.274% is notably higher than the interest rate — the 0.399% spread reflects $1,802 in origination charges, including 0.25% in discount points ($405). " +
  "Important: This loan has a prepayment penalty of up to $3,240 if you pay off or refinance within the first 2 years. If rates drop, this could cost you. Ask the lender for a no-prepayment-penalty option and compare the rate difference. " +
  "Your monthly payment of $1,050 includes $82/mo in private mortgage insurance (PMI) because your down payment is under 20%. PMI drops off after year 7 when you reach ~20% equity, reducing your payment to $968/mo. " +
  "Your cash-to-close of $16,054 breaks down as: $18,000 down payment minus your $10,000 deposit, plus $8,054 in closing costs. The title search fee of $1,261 is on the higher end — worth comparing with other title companies.";

const DEMO_LE_PAGES = [
  { src: "/le-page-1.png", label: "Page 1 — Loan Terms" },
  { src: "/le-page-2.png", label: "Page 2 — Closing Costs" },
  { src: "/le-page-3.png", label: "Page 3 — Additional Info" },
];

/* ──────────────────────────────────────────────
   STATIC DEMO DATA — Homie Copilot Q&A
   ────────────────────────────────────────────── */

const DEMO_COPILOT_QA = [
  {
    question: "Should I worry about the prepayment penalty?",
    answer:
      "Yes — this is worth paying attention to. Your loan has a **prepayment penalty of up to $3,240** if you pay off or refinance within the first 2 years. That means if rates drop significantly, refinancing could cost you $3,240 on top of new closing costs.\n\nAsk your lender for a **no-prepayment-penalty option** — the rate might be slightly higher (often 0.125-0.25%), but the flexibility to refinance without penalty is usually worth it.",
  },
  {
    question: "Is my interest rate competitive?",
    answer:
      "Your rate of **3.875%** on a 30-year fixed conventional loan is solid. Your APR of **4.274%** reflects the true cost including fees — the 0.399% spread is slightly above average, driven by **$1,802 in origination charges**.\n\nThe origination includes 0.25% in discount points ($405). You could ask the lender for a **no-points option** — your rate would be slightly higher but your upfront costs would drop.",
  },
  {
    question: "What fees can I negotiate?",
    answer:
      "Several fees on your LE are negotiable:\n\n- **Title search** ($1,261) — on the high end. Get a quote from another title company.\n- **Underwriting fee** ($1,097) — sometimes negotiable if you push back.\n- **Owner's title policy** ($1,017) — optional but recommended. You can shop for a better price.\n- **Pest inspection** ($135) and **survey** ($65) — can also be shopped.\n\n**Total potential savings: $500-$1,500** if you comparison shop on Section C services.",
  },
  {
    question: "When does my PMI drop off?",
    answer:
      "Your PMI of **$82/month** is required because your down payment ($18,000) is 10% — below the 20% threshold. Based on your loan terms, **PMI drops off after Year 7** when your principal balance reaches approximately 80% of the original property value.\n\nThat's when your payment drops from **$1,050/mo to $968/mo**. You can also request PMI removal earlier if your home appreciates and you get a new appraisal showing 20%+ equity.",
  },
];

/* ──────────────────────────────────────────────
   STATIC DEMO DATA — LE Comparison Table
   ────────────────────────────────────────────── */

const DEMO_LE_ROWS = [
  { label: "Interest Rate", ficus: "3.875%", maple: "3.750%", ficusWins: false },
  { label: "APR — true cost", ficus: "4.274%", maple: "4.312%", ficusWins: true },
  { label: "Monthly P&I", ficus: "$761/mo", maple: "$750/mo", ficusWins: false },
  { label: "Lender Fees", ficus: "$1,802", maple: "$2,640", ficusWins: true },
  { label: "Cash to Close", ficus: "$16,054", maple: "$17,034", ficusWins: true },
];

/* ──────────────────────────────────────────────
   STATIC DEMO DATA — Testimonials
   ────────────────────────────────────────────── */

const DEMO_TESTIMONIALS = [
  {
    quote:
      "I've been through three closings before and never actually understood my Closing Disclosure. HomeBuyer Pro flagged that my lender fees went up $400 from the Loan Estimate — I would have just signed.",
    name: "Sarah M.",
    role: "Homebuyer, Tampa FL",
    initials: "SM",
  },
  {
    quote:
      "My buyers used to text me at 10pm asking what 'escrow impounds' mean. Now they show up to calls having already reviewed their LE — with specific questions about their actual numbers. It's night and day.",
    name: "Jennifer R.",
    role: "Realtor, 8 years, Broward County FL",
    initials: "JR",
  },
  {
    quote:
      "The wire fraud checklist alone was worth signing up. I had no idea how easy it is for criminals to intercept closing instructions. The 3-step verification gave me real confidence before I wired $18,000.",
    name: "Marcus T.",
    role: "First-time homebuyer, Orlando FL",
    initials: "MT",
  },
];

/* ──────────────────────────────────────────────
   ANIMATED TYPING HOOK
   ────────────────────────────────────────────── */

function useTypingEffect(
  text: string,
  speed: number,
  startDelay: number,
  shouldStart: boolean
) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!shouldStart) return;
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay, shouldStart]);

  return { displayed, done };
}

/* ──────────────────────────────────────────────
   FEATURE CARDS DATA
   ────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: FileText,
    title: "Document Intelligence",
    description:
      "Upload any real estate document — Loan Estimate, Closing Disclosure, inspection report, HOA bylaws. AI reads it, extracts the key fields, and explains what it all means in plain English.",
    color: "text-accent",
    bgColor: "bg-accent/10",
    hasDeadlineVisual: false,
  },
  {
    icon: Clock,
    title: "Deadline Tracking",
    description:
      "Never miss an inspection contingency or financing deadline. Color-coded urgency, days remaining, and smart alerts that tell you what's due and what to do about it.",
    color: "text-warning",
    bgColor: "bg-warning/10",
    hasDeadlineVisual: true,
  },
  {
    icon: BarChart3,
    title: "Loan Estimate Comparison",
    description:
      "Compare up to 3 loan estimates side-by-side. See which lender offers the lowest rate, lowest fees, and best total cost over 30 years. Then detect variances when your Closing Disclosure arrives.",
    color: "text-primary-foreground",
    bgColor: "bg-primary/20",
    hasDeadlineVisual: false,
  },
  {
    icon: Shield,
    title: "Wire Fraud Protection",
    description:
      "Wire fraud is the #1 risk in real estate closings. Our 3-step SafeSend verification ensures you never wire funds based on fraudulent instructions.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    hasDeadlineVisual: false,
  },
  {
    icon: DollarSign,
    title: "Cash-to-Close Engine",
    description:
      "See exactly how much you need at closing — broken down by down payment, lender fees, third-party costs, prepaids, and credits. Updated as your deal progresses from estimate to final numbers.",
    color: "text-accent",
    bgColor: "bg-accent/10",
    hasDeadlineVisual: false,
  },
  {
    icon: MessageSquare,
    title: "AI Deal Assistant",
    description:
      "Ask Homie anything about your transaction. Grounded in your actual documents and deal data — not generic advice. Get answers about your specific rate, your specific deadlines, your specific deal.",
    color: "text-primary-foreground",
    bgColor: "bg-primary/20",
    hasDeadlineVisual: false,
  },
];

/* ──────────────────────────────────────────────
   SECTION: ANIMATED FIELD ROW
   ────────────────────────────────────────────── */

function ExtractedFieldRow({
  label,
  value,
  delay,
  started,
  flag,
}: {
  label: string;
  value: string;
  delay: number;
  started: boolean;
  flag?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setVisible(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay, started]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center justify-between py-1.5 border-b border-border/50 last:border-0 ${
        flag ? "bg-destructive/5 -mx-2 px-2 rounded" : ""
      }`}
    >
      <span
        className={`text-sm ${
          flag ? "text-destructive font-medium" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        {flag ? (
          <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
        )}
        <span
          className={`text-sm font-medium ${
            flag ? "text-destructive" : "text-foreground"
          }`}
        >
          {value}
        </span>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   SECTION: DOCUMENT PREVIEW
   ────────────────────────────────────────────── */

function DocumentPreview() {
  const [activePage, setActivePage] = useState(0);

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden select-none h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <FileText className="w-4 h-4 text-accent" />
        <span className="text-xs font-medium text-foreground">
          Loan_Estimate_Ficus_Bank.pdf
        </span>
        <span className="ml-auto text-xs text-muted-foreground">3 pages</span>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-100 p-3">
        <img
          src={DEMO_LE_PAGES[activePage].src}
          alt={DEMO_LE_PAGES[activePage].label}
          className="w-full rounded shadow-sm border border-gray-200"
          draggable={false}
        />
      </div>
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-t border-border bg-secondary/50 shrink-0">
        {DEMO_LE_PAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActivePage(i)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activePage === i
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <span className="ml-2 text-xs text-muted-foreground truncate">
          {DEMO_LE_PAGES[activePage].label}
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   SECTION: AI EXTRACTION PANEL
   ────────────────────────────────────────────── */

function ExtractionPanel({ started }: { started: boolean }) {
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setShowSummary(true), 5000);
    return () => clearTimeout(t);
  }, [started]);

  const { displayed: summaryText } = useTypingEffect(
    DEMO_AI_SUMMARY,
    12,
    0,
    showSummary
  );

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-border">
        <Sparkles className="w-4 h-4 text-accent" />
        <span className="text-sm font-semibold text-foreground">AI Extraction</span>
        {started && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`ml-auto text-xs font-medium ${
              showSummary ? "text-primary" : "text-accent"
            }`}
          >
            {showSummary ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Complete
              </span>
            ) : (
              "Analyzing..."
            )}
          </motion.span>
        )}
      </div>
      <div className="space-y-0 mb-4 flex-shrink-0">
        {DEMO_EXTRACTED_FIELDS.map((field) => (
          <ExtractedFieldRow
            key={field.label}
            label={field.label}
            value={field.value}
            delay={field.delay}
            started={started}
            flag={"flag" in field && field.flag === true}
          />
        ))}
      </div>
      {showSummary && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 min-h-0"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-semibold text-accent">AI Summary</span>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
            <p className="text-sm text-foreground leading-relaxed">
              {summaryText}
              {summaryText.length < DEMO_AI_SUMMARY.length && (
                <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 animate-pulse align-middle" />
              )}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   SECTION: PAIN POINT CARD
   ────────────────────────────────────────────── */

function PainPoint({
  stat,
  description,
  delay,
}: {
  stat: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="bg-card rounded-xl border border-border shadow-sm p-6 text-center"
    >
      <p className="text-3xl font-semibold text-accent">{stat}</p>
      <p className="text-base text-muted-foreground mt-2">{description}</p>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   HELPER: Render **bold** markdown inline
   ────────────────────────────────────────────── */

function MarkdownLite({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        const lines = part.split("\n");
        return lines.map((line, j) => (
          <span key={`${i}-${j}`}>
            {j > 0 && <br />}
            {line}
          </span>
        ));
      })}
    </>
  );
}

/* ──────────────────────────────────────────────
   SECTION: COPILOT DEMO
   ────────────────────────────────────────────── */

function CopilotDemo() {
  const [selectedQ, setSelectedQ] = useState<number | null>(null);
  const [showResponse, setShowResponse] = useState(false);
  const [responseKey, setResponseKey] = useState(0);

  const activeQA = selectedQ !== null ? DEMO_COPILOT_QA[selectedQ] : null;

  const { displayed: typedResponse, done: typingDone } = useTypingEffect(
    activeQA?.answer ?? "",
    10,
    600,
    showResponse
  );

  function handleChipClick(index: number) {
    setSelectedQ(index);
    setShowResponse(true);
    setResponseKey((k) => k + 1);
  }

  function handleReset() {
    setSelectedQ(null);
    setShowResponse(false);
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden max-w-2xl mx-auto">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <Sparkles className="w-4 h-4 text-accent" />
        <h3 className="text-xl font-semibold">Homie</h3>
        <span className="text-sm text-muted-foreground ml-1">AI Deal Assistant</span>
      </div>
      <div className="p-5 space-y-4 min-h-[280px]" key={responseKey}>
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-xl p-3.5 text-sm leading-relaxed bg-muted text-foreground">
            <p>
              I just analyzed your Loan Estimate from Ficus Bank. I found a few
              things worth discussing — including a prepayment penalty that could
              cost you $3,240. What would you like to know?
            </p>
            <span className="text-xs text-muted-foreground mt-1.5 block">
              Just now
            </span>
          </div>
        </div>
        {activeQA && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-end"
          >
            <div className="max-w-[85%] rounded-xl p-3.5 text-sm leading-relaxed bg-accent/10 text-foreground">
              <p>{activeQA.question}</p>
              <span className="text-xs text-muted-foreground mt-1.5 block">
                Just now
              </span>
            </div>
          </motion.div>
        )}
        {showResponse && typedResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%] rounded-xl p-3.5 text-sm leading-relaxed bg-muted text-foreground">
              <MarkdownLite text={typedResponse} />
              {!typingDone && (
                <span className="inline-block w-0.5 h-4 bg-accent/60 animate-pulse ml-0.5 rounded-sm align-middle" />
              )}
              {typingDone && (
                <span className="text-xs text-muted-foreground mt-1.5 block">
                  Just now
                </span>
              )}
            </div>
          </motion.div>
        )}
        {typingDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <button
              onClick={handleReset}
              className="text-sm text-accent hover:underline font-medium"
            >
              Try another question
            </button>
          </motion.div>
        )}
      </div>
      {selectedQ === null && (
        <div className="px-5 pb-5 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {DEMO_COPILOT_QA.map((qa, i) => (
              <motion.button
                key={qa.question}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                onClick={() => handleChipClick(i)}
                className="text-sm px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {qa.question}
              </motion.button>
            ))}
          </div>
        </div>
      )}
      <div className="px-5 pb-4 pt-2 border-t border-border">
        <div className="flex gap-2">
          <div className="flex-1 text-base px-3 py-2 rounded-lg border border-border bg-background text-muted-foreground">
            Ask Homie anything...
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <ArrowRight className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   SECTION: WIRE FRAUD SAFESEND DEMO
   ────────────────────────────────────────────── */

const WIRE_STEPS = [
  "Received wire instructions directly from the escrow officer — not via email attachment",
  "Verbally confirmed instructions by calling the escrow office's publicly listed number",
  "I understand wire fraud is irreversible. I will never wire funds based on email alone.",
];

function WireFraudDemo() {
  return (
    <div className="bg-card rounded-xl border border-destructive/25 shadow-sm overflow-hidden max-w-md w-full">
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-destructive/5 border-b border-destructive/20">
        <Shield className="w-4 h-4 text-destructive shrink-0" />
        <span className="text-sm font-semibold text-destructive">
          Wire Transfer SafeSend
        </span>
        <div className="ml-auto shrink-0 bg-muted px-2.5 py-0.5 rounded-full text-xs font-semibold text-foreground border border-border">
          $16,054 due at closing
        </div>
      </div>
      <div className="px-5 py-3 bg-destructive/5 border-b border-border/60">
        <p className="text-xs text-destructive leading-relaxed">
          ⚠️ Criminals intercept real estate emails and substitute fraudulent wire
          account numbers. Wired funds are almost never recovered.
        </p>
      </div>
      <div className="px-5 py-4 space-y-3.5">
        {WIRE_STEPS.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className={`w-5 h-5 rounded mt-0.5 shrink-0 flex items-center justify-center border-2 ${
                i < 2
                  ? "bg-primary border-primary"
                  : "border-border bg-background"
              }`}
            >
              {i < 2 && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <p
              className={`text-sm leading-relaxed ${
                i < 2 ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step}
            </p>
          </div>
        ))}
      </div>
      <div className="px-5 pb-3">
        <div className="border border-dashed border-border rounded-lg px-4 py-2.5 text-center">
          <p className="text-xs text-muted-foreground">
            Upload wire confirmation receipt
          </p>
        </div>
      </div>
      <div className="px-5 pb-5">
        <div className="w-full py-2.5 px-4 rounded-lg bg-muted text-muted-foreground text-sm font-medium text-center select-none cursor-not-allowed">
          Mark as Wired — complete all steps to enable
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   SECTION: DEADLINE MINI VISUAL (inside features card)
   ────────────────────────────────────────────── */

const DEADLINE_ITEMS = [
  {
    label: "Inspection",
    days: "2 days",
    pct: 12,
    barClass: "bg-destructive",
    textClass: "text-destructive",
  },
  {
    label: "Appraisal",
    days: "8 days",
    pct: 45,
    barClass: "bg-warning",
    textClass: "text-warning",
  },
  {
    label: "Financing",
    days: "14 days",
    pct: 72,
    barClass: "bg-primary",
    textClass: "text-foreground",
  },
];

function DeadlineMiniVisual() {
  return (
    <div className="mt-4 space-y-2.5">
      {DEADLINE_ITEMS.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <span className={`text-xs font-semibold ${item.textClass}`}>
              {item.days}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${item.barClass}`}
              style={{ width: `${item.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   SECTION: APP WORKSPACE PREVIEW
   ────────────────────────────────────────────── */

const WORKSPACE_PHASES = [
  { label: "Shopping", icon: Search, done: true, active: false },
  { label: "Offer", icon: FilePen, done: true, active: false },
  { label: "Escrow", icon: ShieldCheck, done: false, active: true },
  { label: "Closing", icon: Key, done: false, active: false },
  { label: "Post-Close", icon: LineChart, done: false, active: false },
];

const WORKSPACE_CONTINGENCIES = [
  {
    label: "Inspection",
    days: "2 days",
    pct: 12,
    barClass: "bg-destructive",
    textClass: "text-destructive",
  },
  {
    label: "Appraisal",
    days: "8 days",
    pct: 45,
    barClass: "bg-warning",
    textClass: "text-warning",
  },
  {
    label: "Financing",
    days: "14 days",
    pct: 72,
    barClass: "bg-primary",
    textClass: "text-foreground",
  },
];

function WorkspacePreview() {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Phase stepper */}
      <div className="bg-secondary border-b border-border shadow-sm px-6 py-4">
        <div className="flex items-center">
          {WORKSPACE_PHASES.map((phase, i) => {
            const Icon = phase.icon;
            const isLast = i === WORKSPACE_PHASES.length - 1;
            return (
              <div key={phase.label} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      phase.done
                        ? "bg-primary text-primary-foreground"
                        : phase.active
                          ? "bg-accent text-accent-foreground"
                          : "bg-card text-muted-foreground border border-border"
                    }`}
                  >
                    {phase.done ? (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium whitespace-nowrap ${
                      phase.active || phase.done
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {phase.label}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className={`flex-1 h-[2px] mx-4 rounded-full ${
                      WORKSPACE_PHASES[i + 1].done
                        ? "bg-primary"
                        : WORKSPACE_PHASES[i + 1].active
                          ? "bg-accent"
                          : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
          <div className="ml-auto pl-6 shrink-0">
            <span className="text-sm font-semibold text-destructive whitespace-nowrap">
              18 days to close
            </span>
          </div>
        </div>
      </div>

      {/* Deal header */}
      <div className="px-6 py-3 border-b border-border bg-card">
        <p className="text-sm font-semibold text-foreground">
          12847 Magnolia Drive, Tampa FL 33601
        </p>
        <p className="text-xs text-muted-foreground">
          $427,500 · Accepted Oct 15, 2025 · Closes Nov 22, 2025
        </p>
      </div>

      {/* Widgets grid */}
      <div className="grid grid-cols-2 gap-4 p-4">
        {/* Contingency countdown */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Clock className="w-3.5 h-3.5 text-warning" />
            <p className="text-xs font-semibold text-foreground">
              Contingency Countdown
            </p>
          </div>
          <div className="space-y-2.5">
            {WORKSPACE_CONTINGENCIES.map((c) => (
              <div key={c.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {c.label}
                  </span>
                  <span className={`text-xs font-semibold ${c.textClass}`}>
                    {c.days}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.barClass}`}
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnest money */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <DollarSign className="w-3.5 h-3.5 text-accent" />
            <p className="text-xs font-semibold text-foreground">
              Earnest Money
            </p>
          </div>
          <p className="text-2xl font-semibold text-foreground">$8,500</p>
          <div className="flex items-center gap-1.5 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">
              Held in Escrow
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Confirmed Oct 18, 2025
          </p>
          <div className="mt-3 flex items-center gap-1">
            {["Sent", "Confirmed", "In Escrow"].map((s, idx) => (
              <div key={s} className="flex items-center gap-1">
                {idx > 0 && <div className="h-px w-3 bg-primary" />}
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">{s}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   MAIN LANDING PAGE
   ────────────────────────────────────────────── */

export default function LandingPage() {
  const router = useRouter();
  const demoRef = useRef<HTMLDivElement>(null);
  const demoInView = useInView(demoRef, { once: true, margin: "-100px" });
  const [demoRunCount, setDemoRunCount] = useState(0);

  useEffect(() => {
    if (demoInView && demoRunCount === 0) setDemoRunCount(1);
  }, [demoInView, demoRunCount]);

  return (
    <div className="min-h-screen bg-background">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-secondary/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">HomeBuyer Pro</h1>
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
            From serious shopping to keys in hand — HomeBuyer Pro organizes your
            escrow, explains your documents, tracks your deadlines, and catches
            costly mistakes before they happen.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <Button
              onClick={() => router.push("/try")}
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-base shadow-sm px-6 py-3 h-auto gap-2"
            >
              See Your Workspace
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDemoRunCount((c) => c + 1);
                document
                  .getElementById("ai-demo")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-base px-6 py-3 h-auto bg-white text-foreground border border-border shadow-sm hover:bg-muted"
            >
              Watch the AI in Action
            </Button>
          </motion.div>
        </div>
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
                HomeBuyer Pro&apos;s SafeSend verification walks you through three
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
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
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
              From the first showing to recording your deed — HomeBuyer Pro guides
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
            <p className="text-base text-muted-foreground mt-3 max-w-xl mx-auto">
              One workspace for your entire homebuying journey. No more scattered
              emails, confusing documents, or missed deadlines.
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
                  <BarChart3 className="w-4 h-4 text-primary-foreground" />
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
                HomeBuyer Pro shows you every number side-by-side, highlights the
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
                {/* Header row */}
                <div className="grid grid-cols-3 border-b border-border">
                  <div className="px-4 py-3" />
                  <div className="px-4 py-3 border-l border-border bg-primary/5 flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      Ficus Bank
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-xs font-semibold text-primary-foreground whitespace-nowrap">
                      Best Value
                    </span>
                  </div>
                  <div className="px-4 py-3 border-l border-border flex items-center">
                    <span className="text-sm font-semibold text-foreground">
                      Maple Funding
                    </span>
                  </div>
                </div>
                {/* Data rows */}
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
              {/* Left: copy */}
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
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
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

              {/* Right: invite link + before/after */}
              <div className="bg-secondary/50 p-8 lg:p-10 flex flex-col justify-center gap-4 border-l border-border">
                {/* Invite link visual */}
                <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Link2 className="w-4 h-4 text-accent" />
                    <span className="text-xs font-semibold text-foreground">
                      Your buyer invite link
                    </span>
                  </div>
                  <div className="bg-secondary rounded-md px-3 py-2 border border-border">
                    <p className="text-sm font-medium text-foreground truncate">
                      homebuyerpro.com/join/
                      <span className="text-accent">sarah-chen-realty</span>
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Send this to any buyer — they sign up and your deal is
                    automatically connected.
                  </p>
                </div>

                {/* Before */}
                <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      Before HomeBuyer Pro
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

                {/* After */}
                <div className="bg-card rounded-lg border-2 border-primary/30 p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      After HomeBuyer Pro
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-primary/10 rounded-lg px-3 py-2 text-sm text-foreground">
                      Hey! I reviewed my LE in HomeBuyer Pro. The origination fee
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
              <ExtractionPanel key={demoRunCount} started={demoRunCount > 0} />
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
              about your deal.
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
                title: "Set up your deal",
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
                  "Track every deadline, compare loan options, verify wire instructions, and ask Homie anything about your deal. No surprises at the closing table.",
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
              From anxious to confident — HomeBuyer Pro guides buyers through the
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
              HomeBuyer Pro
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              From serious shopping to keys in hand.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} HomeBuyer Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
