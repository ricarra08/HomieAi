import type { Phase } from "./types";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  DollarSign,
  Heart,
  BarChart3,
  FileText,
  Shield,
  Folder,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  Banknote,
  FileSearch,
  Home,
  Wrench,
  TrendingUp,
  AlertTriangle,
  Bell,
  Wallet,
  PenTool,
  Footprints,
  ShieldCheck,
  FileCheck,
  Send,
  Scale,
  Flag,
  Receipt,
  Archive,
  LineChart,
  Hammer,
} from "lucide-react";

export interface PhaseGuideSection {
  icon: LucideIcon;
  label: string;
  description: string;
}

export interface PhaseGuideContent {
  phase: Phase;
  title: string;
  subtitle: string;
  sections: PhaseGuideSection[];
  homieBriefingPrompt: string;
}

export const PHASE_GUIDE_CONTENT: Record<Phase, PhaseGuideContent> = {
  shopping: {
    phase: "shopping",
    title: "Welcome to Shopping",
    subtitle:
      "Define what you're looking for and save homes that match your criteria.",
    sections: [
      {
        icon: Search,
        label: "Buy Box",
        description: "Set your price range, bedrooms, and target neighborhoods.",
      },
      {
        icon: DollarSign,
        label: "Affordability",
        description:
          "Estimate your down payment and total cash needed to close.",
      },
      {
        icon: Heart,
        label: "Saved Homes",
        description:
          "Save properties you like and compare them side by side.",
      },
      {
        icon: BarChart3,
        label: "Market Snapshot",
        description:
          "See trends and stats for your target area.",
      },
    ],
    homieBriefingPrompt:
      "I just started the Shopping phase. Give me a brief overview of what I should focus on as a first-time homebuyer. What does each section on my dashboard help me with?",
  },

  offer: {
    phase: "offer",
    title: "Welcome to Offer",
    subtitle:
      "Craft a competitive offer with the right contingencies and supporting documents.",
    sections: [
      {
        icon: FileText,
        label: "Offer Details",
        description:
          "Set your offer price, earnest money, and closing timeline.",
      },
      {
        icon: Shield,
        label: "Contingencies",
        description:
          "Choose protections like inspection, financing, and appraisal contingencies.",
      },
      {
        icon: Folder,
        label: "Documents",
        description:
          "Upload your pre-approval letter and proof of funds.",
      },
      {
        icon: CheckCircle2,
        label: "Readiness Checklist",
        description:
          "Track everything needed before submitting your offer.",
      },
    ],
    homieBriefingPrompt:
      "I'm in the Offer phase now. Walk me through what each section does and what I should prioritize. What are contingencies and why do they matter?",
  },

  escrow: {
    phase: "escrow",
    title: "Welcome to Escrow",
    subtitle:
      "Track deadlines, inspections, and loan progress during your due diligence period.",
    sections: [
      {
        icon: Clock,
        label: "Deadlines",
        description:
          "Monitor your contingency deadlines — missing one can cost you.",
      },
      {
        icon: ClipboardCheck,
        label: "Inspections",
        description:
          "Upload inspection reports and we'll extract key findings.",
      },
      {
        icon: Banknote,
        label: "Earnest Money",
        description:
          "Track your deposit status and confirm delivery to escrow.",
      },
      {
        icon: FileSearch,
        label: "Disclosures",
        description:
          "Review seller disclosures before your cancellation window closes.",
      },
      {
        icon: Home,
        label: "Appraisal",
        description:
          "Monitor the appraisal and understand any valuation gap.",
      },
      {
        icon: Wrench,
        label: "Repairs",
        description:
          "Track repair requests, quotes, and negotiation status.",
      },
      {
        icon: TrendingUp,
        label: "Loan Progress",
        description:
          "Follow your underwriting status and rate lock timeline.",
      },
      {
        icon: AlertTriangle,
        label: "Alerts & Red Flags",
        description:
          "Get notified about critical issues that need immediate attention.",
      },
    ],
    homieBriefingPrompt:
      "I just entered the Escrow phase. This looks complex — walk me through what each section tracks and what deadlines I need to worry about first.",
  },

  closing: {
    phase: "closing",
    title: "Welcome to Closing",
    subtitle:
      "Final steps before you get the keys — review documents, verify funds, and sign.",
    sections: [
      {
        icon: Bell,
        label: "Alerts",
        description:
          "Critical tasks and countdown to your closing date.",
      },
      {
        icon: Wallet,
        label: "Cash to Close",
        description:
          "Final amount you need to wire, broken down line by line.",
      },
      {
        icon: PenTool,
        label: "Signing",
        description:
          "Schedule your signing appointment and know what to bring.",
      },
      {
        icon: Footprints,
        label: "Final Walkthrough",
        description:
          "Checklist for your 24-48 hour pre-closing property walkthrough.",
      },
      {
        icon: ShieldCheck,
        label: "Insurance",
        description:
          "Verify your homeowners insurance binder is in place.",
      },
      {
        icon: FileCheck,
        label: "Underwriting",
        description:
          "Clear any final lender conditions before funding.",
      },
      {
        icon: Send,
        label: "Wire Transfer",
        description:
          "Securely verify and send your closing funds (fraud prevention built in).",
      },
      {
        icon: Scale,
        label: "Title & Escrow",
        description:
          "Confirm clear title and escrow account readiness.",
      },
      {
        icon: Flag,
        label: "Funding & Recording",
        description:
          "Track funding, county recording, and when you get your keys.",
      },
    ],
    homieBriefingPrompt:
      "I'm in the Closing phase now. Walk me through each step I need to complete. What's the wire transfer process and how do I stay safe from wire fraud?",
  },

  "post-close": {
    phase: "post-close",
    title: "Congratulations!",
    subtitle:
      "You're a homeowner! Here's your transaction summary and next steps.",
    sections: [
      {
        icon: Receipt,
        label: "Summary",
        description:
          "Review your final purchase details — price, loan, and monthly payment.",
      },
      {
        icon: Archive,
        label: "Document Archive",
        description:
          "Download and keep all your transaction documents in one place.",
      },
      {
        icon: LineChart,
        label: "Equity Tracking",
        description:
          "Monitor your home's value over time (coming soon).",
      },
      {
        icon: Hammer,
        label: "Homeowner Tools",
        description:
          "Maintenance reminders and new homeowner tasks (coming soon).",
      },
    ],
    homieBriefingPrompt:
      "I just closed on my home! What should new homeowners do first? Summarize my purchase and give me a checklist of immediate next steps.",
  },
};
