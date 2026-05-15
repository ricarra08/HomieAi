"use client";

import { useEffect, useRef, useState } from "react";
import { useUIStore } from "@/lib/store";
import { useTransaction } from "@/lib/hooks/queries";
import { useTransitionPhase } from "@/lib/hooks/mutations";
import { useEscrowData } from "@/lib/hooks/use-escrow-data";
import { useClosingData } from "@/lib/hooks/use-closing-data";
import { ShoppingView } from "@/components/shopping/ShoppingView";
import { OfferView } from "@/components/offer/OfferView";
import { TransactionSummaryCard } from "@/components/transaction/TransactionSummaryCard";
import { TransactionSetupForm } from "@/components/transaction/TransactionSetupForm";
import { ContingencyCountdown } from "@/components/escrow/ContingencyCountdown";
import { EarnestMoneyTracker } from "@/components/escrow/EarnestMoneyTracker";
import { AppraisalStatus } from "@/components/escrow/AppraisalStatus";
import { InspectionChecklist } from "@/components/escrow/InspectionChecklist";
import { RedFlagSummary } from "@/components/escrow/RedFlagSummary";
import { RepairTracker } from "@/components/escrow/RepairTracker";
import { EscrowAlerts } from "@/components/escrow/EscrowAlerts";
import { LoanProgress } from "@/components/escrow/LoanProgress";
import { DisclosureTracker } from "@/components/escrow/DisclosureTracker";
import { EscrowCashToClose } from "@/components/escrow/EscrowCashToClose";
import { ClosingAlerts } from "@/components/closing/ClosingAlerts";
import { ClosingDisclosureReview } from "@/components/closing/ClosingDisclosureReview";
import { CashToCloseFinalizer } from "@/components/closing/CashToCloseFinalizer";
import { SigningAppointment } from "@/components/closing/SigningAppointment";
import { FinalWalkthroughChecklist } from "@/components/closing/FinalWalkthroughChecklist";
import { InsuranceBinderVerification } from "@/components/closing/InsuranceBinderVerification";
import { UnderwritingConditionsFinal } from "@/components/closing/UnderwritingConditionsFinal";
import { WireTransferSafeSend } from "@/components/closing/WireTransferSafeSend";
import { TitleEscrowFinalChecks } from "@/components/closing/TitleEscrowFinalChecks";
import { FundingRecordingTimeline } from "@/components/closing/FundingRecordingTimeline";
import { PostCloseView } from "@/components/post-close/PostCloseView";
import { OnboardingSelector } from "@/components/onboarding/OnboardingSelector";
import { Button } from "@/components/ui/button";
import { ArrowRight, HelpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/lib/hooks/queries";
import { useMarkPhaseGuideSeen } from "@/lib/hooks/mutations";
import { PHASE_GUIDE_CONTENT } from "@/lib/phase-guide-content";
import { PhaseWelcomeModal } from "@/components/phase-guide/PhaseWelcomeModal";


function EscrowDashboard({ transactionId, userId }: { transactionId: string | null; userId: string }) {
  if (!transactionId) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-semibold tracking-tight">Escrow & Due Diligence</h2>
        <div className="text-base text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-10 text-center">
          Create a transaction first to access the escrow dashboard.
        </div>
      </div>
    );
  }
  return <EscrowDashboardContent transactionId={transactionId} userId={userId} />;
}

function EscrowDashboardContent({ transactionId, userId }: { transactionId: string; userId: string }) {
  const data = useEscrowData(transactionId);
  const transition = useTransitionPhase(transactionId, userId);
  const setCurrentPhase = useUIStore((s) => s.setCurrentPhase);

  if (data.isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-semibold tracking-tight">Escrow & Due Diligence</h2>
        {/* Summary card skeleton */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3 animate-pulse">
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="flex gap-4 mt-2">
            <div className="h-8 w-24 bg-muted rounded-full" />
            <div className="h-8 w-24 bg-muted rounded-full" />
          </div>
        </div>
        {/* Two-column card grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3 animate-pulse">
              <div className="h-4 w-36 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-3/4 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  function handleProceedToClosing() {
    transition.mutate("closing", {
      onSuccess: () => setCurrentPhase("closing"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Escrow & Due Diligence</h2>
          <p className="text-base text-muted-foreground mt-1">Track contingencies, inspections, and closing progress</p>
        </div>
        <Button onClick={handleProceedToClosing} disabled={transition.isPending} className="shrink-0 gap-2">
          Proceed to Closing
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <TransactionSummaryCard transactionId={transactionId} />
      <EscrowAlerts data={data} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <ContingencyCountdown transactionId={transactionId} deadlines={data.deadlines} />
        {data.transaction && <EarnestMoneyTracker transaction={data.transaction} userId={userId} emdDeadline={data.deadlines.find((d) => d.type === "earnest-money") ?? null} stateConfig={data.stateConfig} />}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <InspectionChecklist transactionId={transactionId} inspectionDocs={data.inspectionDocs} allDocs={data.documents} stateConfig={data.stateConfig} />
        <AppraisalStatus transactionId={transactionId} appraisalDoc={data.appraisalDoc} transaction={data.transaction} allDocs={data.documents} />
      </div>

      <RedFlagSummary transactionId={transactionId} inspectionDocs={data.inspectionDocs} repairItems={data.repairItems} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <RepairTracker transactionId={transactionId} repairItems={data.repairItems} />
        <LoanProgress chosenLE={data.chosenLE} documents={data.documents} />
      </div>

      <DisclosureTracker transactionId={transactionId} disclosureDocs={data.disclosureDocs} allDocs={data.documents} stateConfig={data.stateConfig} />
      <EscrowCashToClose chosenLE={data.chosenLE} transaction={data.transaction} cdDocument={data.cdDocument} />
    </div>
  );
}

function ClosingDashboard({ transactionId, userId }: { transactionId: string; userId: string }) {
  const data = useClosingData(transactionId);
  const transition = useTransitionPhase(transactionId, userId);
  const setCurrentPhase = useUIStore((s) => s.setCurrentPhase);

  if (data.isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-semibold tracking-tight">Closing</h2>
        {/* Summary card skeleton */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3 animate-pulse">
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
        {/* 3-column card grid skeleton matching closing layout */}
        {[0, 1, 2].map((row) => (
          <div key={row} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((col) => (
              <div key={col} className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3 animate-pulse">
                <div className="h-4 w-36 bg-muted rounded" />
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-2/3 bg-muted rounded" />
                <div className="h-8 w-full bg-muted rounded-lg mt-2" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  function handleRecordingComplete() {
    transition.mutate("post-close", {
      onSuccess: () => setCurrentPhase("post-close"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Closing</h2>
          <p className="text-base text-muted-foreground mt-1">Final steps to complete your purchase</p>
        </div>
        <Button onClick={handleRecordingComplete} disabled={transition.isPending} className="shrink-0 gap-2">
          Recording Complete — Keys in Hand!
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <TransactionSummaryCard transactionId={transactionId} />
      <ClosingAlerts data={data} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <ClosingDisclosureReview data={data} transactionId={transactionId} userId={userId} />
        <CashToCloseFinalizer data={data} transactionId={transactionId} userId={userId} />
        <SigningAppointment data={data} transactionId={transactionId} userId={userId} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <FinalWalkthroughChecklist data={data} transactionId={transactionId} userId={userId} />
        <InsuranceBinderVerification data={data} transactionId={transactionId} />
        <UnderwritingConditionsFinal data={data} transactionId={transactionId} userId={userId} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <WireTransferSafeSend data={data} transactionId={transactionId} userId={userId} />
        <TitleEscrowFinalChecks data={data} transactionId={transactionId} userId={userId} />
        <FundingRecordingTimeline data={data} transactionId={transactionId} userId={userId} onKeysReceived={handleRecordingComplete} />
      </div>
    </div>
  );
}

function PostCloseDashboard({ transactionId }: { transactionId: string }) {
  return <PostCloseView transactionId={transactionId} />;
}

export function PhaseDashboard() {
  const { currentPhase, activeTransactionId, showDirectSetup, setShowDirectSetup, setCurrentPhase, setCopilotOpen } = useUIStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const { data: profile } = useProfile(userId ?? undefined);
  const markSeen = useMarkPhaseGuideSeen(userId ?? "");
  const { data: transaction, isLoading: transactionLoading } = useTransaction(activeTransactionId);
  const setActiveTransactionId = useUIStore((s) => s.setActiveTransactionId);

  // Clear stale transaction ID if it no longer exists in DB (e.g. after data wipe)
  useEffect(() => {
    if (activeTransactionId && !transactionLoading && !transaction) {
      setActiveTransactionId(null);
    }
  }, [activeTransactionId, transactionLoading, transaction, setActiveTransactionId]);

  // Sync phase from DB when entering a new transaction (not on every phase change)
  const lastSyncedId = useRef<string | null>(null);
  useEffect(() => {
    if (transaction && activeTransactionId !== lastSyncedId.current) {
      setCurrentPhase(transaction.current_phase);
      lastSyncedId.current = activeTransactionId;
    }
  }, [transaction, activeTransactionId, setCurrentPhase]);

  // Auto-show phase guide on first visit to a phase
  const lastGuidePhase = useRef<string | null>(null);
  useEffect(() => {
    if (!profile || !currentPhase || !activeTransactionId) return;
    if (lastGuidePhase.current === currentPhase) return;
    const seen = profile.seen_phase_guides ?? [];
    if (!seen.includes(currentPhase)) {
      setGuideOpen(true);
      lastGuidePhase.current = currentPhase;
    }
  }, [currentPhase, profile, activeTransactionId]);

  function handleDismissGuide() {
    setGuideOpen(false);
    if (userId && currentPhase) {
      markSeen.mutate(currentPhase);
    }
  }

  function handleAskHomie() {
    setGuideOpen(false);
    if (userId && currentPhase) {
      markSeen.mutate(currentPhase);
    }
    setCopilotOpen(true);
    const prompt = PHASE_GUIDE_CONTENT[currentPhase].homieBriefingPrompt;
    (window as unknown as Record<string, string>).__pendingCopilotPrefill = prompt;
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("copilot:prefill", { detail: prompt }));
    }, 150);
  }

  if (!userId) {
    return <div className="text-base text-muted-foreground p-10 text-center">Loading...</div>;
  }

  // Loading guard: transaction ID set but data not yet fetched — prevent phase flash
  if (activeTransactionId && transactionLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3 animate-pulse">
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3 animate-pulse">
              <div className="h-4 w-36 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No transaction — show journey picker or direct setup form
  if (!activeTransactionId) {
    if (showDirectSetup) {
      return (
        <TransactionSetupForm
          userId={userId}
          onComplete={() => setShowDirectSetup(false)}
          onBack={() => setShowDirectSetup(false)}
        />
      );
    }
    return <OnboardingSelector userId={userId} />;
  }

  // Has transaction — render phase dashboard
  if (showDirectSetup) {
    return (
      <TransactionSetupForm
        userId={userId}
        onComplete={() => setShowDirectSetup(false)}
        onBack={() => setShowDirectSetup(false)}
      />
    );
  }

  function renderPhase() {
    switch (currentPhase) {
      case "shopping":
        return <ShoppingView userId={userId!} />;
      case "offer":
        return <OfferView userId={userId!} />;
      case "escrow":
        return <EscrowDashboard transactionId={activeTransactionId!} userId={userId!} />;
      case "closing":
        return <ClosingDashboard transactionId={activeTransactionId!} userId={userId!} />;
      case "post-close":
        return <PostCloseDashboard transactionId={activeTransactionId!} />;
    }
  }

  return (
    <>
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          aria-label="Phase guide"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card shadow-sm px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:shadow-md transition-all"
        >
          <HelpCircle className="w-4 h-4" />
          Phase Guide
        </button>
      </div>
      {renderPhase()}
      <PhaseWelcomeModal
        phase={currentPhase}
        open={guideOpen}
        onClose={handleDismissGuide}
        onAskHomie={handleAskHomie}
      />
    </>
  );
}
