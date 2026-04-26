"use client";

import { Search, FileText, ArrowRight } from "lucide-react";
import { useUIStore } from "@/lib/store";

interface OnboardingSelectorProps {
  userId: string;
}

export function OnboardingSelector({ userId }: OnboardingSelectorProps) {
  const { setCurrentPhase, setShowDirectSetup } = useUIStore();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-xl mx-auto space-y-8 text-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Where are you in your journey?</h2>
          <p className="text-base text-muted-foreground mt-2">
            We&apos;ll set up your workspace based on where you are
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setCurrentPhase("shopping")}
            className="group bg-card rounded-xl border border-border shadow-sm p-6 text-left hover:border-accent/40 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-base font-semibold text-foreground">I&apos;m shopping for a home</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track properties, estimate affordability, and prepare for your first offer
            </p>
            <div className="flex items-center gap-1 mt-4 text-sm font-medium text-accent">
              Start browsing
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => setShowDirectSetup(true)}
            className="group bg-card rounded-xl border border-border shadow-sm p-6 text-left hover:border-accent/40 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">I have an accepted offer</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Set up your transaction workspace with document tracking, deadlines, and AI assistance
            </p>
            <div className="flex items-center gap-1 mt-4 text-sm font-medium text-accent">
              Set up my transaction
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
