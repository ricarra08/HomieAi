import {
  FileText,
  Clock,
  DollarSign,
  BarChart3,
  MessageSquare,
  Shield,
  Search,
  FilePen,
  ShieldCheck,
  Key,
  LineChart,
} from "lucide-react";

/* ──────────────────────────────────────────────
   STATIC DEMO DATA — Loan Estimate (CFPB H-24B)
   ────────────────────────────────────────────── */

export const DEMO_EXTRACTED_FIELDS = [
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

export const DEMO_AI_SUMMARY =
  "This is a 30-year fixed conventional loan at 3.875% from Ficus Bank. Your APR of 4.274% is notably higher than the interest rate — the 0.399% spread reflects $1,802 in origination charges, including 0.25% in discount points ($405). " +
  "Important: This loan has a prepayment penalty of up to $3,240 if you pay off or refinance within the first 2 years. If rates drop, this could cost you. Ask the lender for a no-prepayment-penalty option and compare the rate difference. " +
  "Your monthly payment of $1,050 includes $82/mo in private mortgage insurance (PMI) because your down payment is under 20%. PMI drops off after year 7 when you reach ~20% equity, reducing your payment to $968/mo. " +
  "Your cash-to-close of $16,054 breaks down as: $18,000 down payment minus your $10,000 deposit, plus $8,054 in closing costs. The title search fee of $1,261 is on the higher end — worth comparing with other title companies.";

export const DEMO_LE_PAGES = [
  { src: "/le-page-1.png", label: "Page 1 — Loan Terms" },
  { src: "/le-page-2.png", label: "Page 2 — Closing Costs" },
  { src: "/le-page-3.png", label: "Page 3 — Additional Info" },
];

/* ──────────────────────────────────────────────
   STATIC DEMO DATA — Homie Copilot Q&A
   ────────────────────────────────────────────── */

export const DEMO_COPILOT_QA = [
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

export const DEMO_LE_ROWS = [
  { label: "Interest Rate", ficus: "3.875%", maple: "3.750%", ficusWins: false },
  { label: "APR — true cost", ficus: "4.274%", maple: "4.312%", ficusWins: true },
  { label: "Monthly P&I", ficus: "$761/mo", maple: "$750/mo", ficusWins: false },
  { label: "Lender Fees", ficus: "$1,802", maple: "$2,640", ficusWins: true },
  { label: "Cash to Close", ficus: "$16,054", maple: "$17,034", ficusWins: true },
];

/* ──────────────────────────────────────────────
   STATIC DEMO DATA — Testimonials
   ────────────────────────────────────────────── */

export const DEMO_TESTIMONIALS = [
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
   FEATURE CARDS DATA
   ────────────────────────────────────────────── */

export const FEATURES = [
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
      "See exactly how much you need at closing — broken down by down payment, lender fees, third-party costs, prepaids, and credits. Updated as your transaction progresses from estimate to final numbers.",
    color: "text-accent",
    bgColor: "bg-accent/10",
    hasDeadlineVisual: false,
  },
  {
    icon: MessageSquare,
    title: "AI Homebuying Assistant",
    description:
      "Ask Homie anything about your transaction. Grounded in your actual documents and deal data — not generic advice. Get answers about your specific rate, your specific deadlines, your specific transaction.",
    color: "text-primary-foreground",
    bgColor: "bg-primary/20",
    hasDeadlineVisual: false,
  },
];

/* ──────────────────────────────────────────────
   WIRE FRAUD STEPS
   ────────────────────────────────────────────── */

export const WIRE_STEPS = [
  "Received wire instructions directly from the escrow officer — not via email attachment",
  "Verbally confirmed instructions by calling the escrow office's publicly listed number",
  "I understand wire fraud is irreversible. I will never wire funds based on email alone.",
];

/* ──────────────────────────────────────────────
   DEADLINE ITEMS
   ────────────────────────────────────────────── */

export const DEADLINE_ITEMS = [
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

/* ──────────────────────────────────────────────
   WORKSPACE DATA
   ────────────────────────────────────────────── */

export const WORKSPACE_PHASES = [
  { label: "Shopping", icon: Search, done: true, active: false },
  { label: "Offer", icon: FilePen, done: true, active: false },
  { label: "Escrow", icon: ShieldCheck, done: false, active: true },
  { label: "Closing", icon: Key, done: false, active: false },
  { label: "Post-Close", icon: LineChart, done: false, active: false },
];

export const WORKSPACE_CONTINGENCIES = [
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
