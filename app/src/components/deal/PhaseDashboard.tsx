"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/lib/store";
import { useDeal } from "@/lib/hooks/queries";
import { useTransitionPhase } from "@/lib/hooks/mutations";
import { useEscrowData } from "@/lib/hooks/use-escrow-data";
import { useClosingData } from "@/lib/hooks/use-closing-data";
import { ShoppingView } from "@/components/shopping/ShoppingView";
import { OfferView } from "@/components/offer/OfferView";
import { DealSummaryCard } from "@/components/deal/DealSummaryCard";
import { DealSetupForm } from "@/components/deal/DealSetupForm";
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
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function EscrowDashboard({ dealId, userId }: { dealId: string | null; userId: string }) {
  if (!dealId) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-semibold tracking-tight">Escrow & Due Diligence</h2>
        <div className="text-base text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-10 text-center">
          Create a deal first to access the escrow dashboard.
        </div>
      </div>
    );
  }
  return <EscrowDashboardContent dealId={dealId} userId={userId} />;
}

function EscrowDashboardContent({ dealId, userId }: { dealId: string; userId: string }) {
  const data = useEscrowData(dealId);
  const transition = useTransitionPhase(dealId, userId);
  const setCurrentPhase = useUIStore((s) => s.setCurrentPhase);

  if (data.isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-semibold tracking-tight">Escrow & Due Diligence</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-card rounded-xl border border-border shadow-sm animate-pulse" />)}
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

      <DealSummaryCard dealId={dealId} />
      <EscrowAlerts data={data} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <ContingencyCountdown dealId={dealId} deadlines={data.deadlines} />
        {data.deal && <EarnestMoneyTracker deal={data.deal} userId={userId} emdDeadline={data.deadlines.find((d) => d.type === "earnest-money") ?? null} />}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <InspectionChecklist dealId={dealId} inspectionDocs={data.inspectionDocs} allDocs={data.documents} />
        <AppraisalStatus dealId={dealId} appraisalDoc={data.appraisalDoc} deal={data.deal} allDocs={data.documents} />
      </div>

      <RedFlagSummary dealId={dealId} inspectionDocs={data.inspectionDocs} repairItems={data.repairItems} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <RepairTracker dealId={dealId} repairItems={data.repairItems} />
        <LoanProgress chosenLE={data.chosenLE} documents={data.documents} />
      </div>

      <DisclosureTracker dealId={dealId} disclosureDocs={data.disclosureDocs} allDocs={data.documents} />
      <EscrowCashToClose chosenLE={data.chosenLE} deal={data.deal} cdDocument={data.cdDocument} />
    </div>
  );
}

function ClosingDashboard({ dealId, userId }: { dealId: string; userId: string }) {
  const data = useClosingData(dealId);
  const transition = useTransitionPhase(dealId, userId);
  const setCurrentPhase = useUIStore((s) => s.setCurrentPhase);

  if (data.isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-semibold tracking-tight">Closing</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-card rounded-xl border border-border shadow-sm animate-pulse" />)}
        </div>
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

      <DealSummaryCard dealId={dealId} />
      <ClosingAlerts data={data} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <ClosingDisclosureReview data={data} dealId={dealId} userId={userId} />
        <CashToCloseFinalizer data={data} dealId={dealId} userId={userId} />
        <SigningAppointment data={data} dealId={dealId} userId={userId} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <FinalWalkthroughChecklist data={data} dealId={dealId} userId={userId} />
        <InsuranceBinderVerification data={data} dealId={dealId} />
        <UnderwritingConditionsFinal data={data} dealId={dealId} userId={userId} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <WireTransferSafeSend data={data} dealId={dealId} userId={userId} />
        <TitleEscrowFinalChecks data={data} dealId={dealId} userId={userId} />
        <FundingRecordingTimeline data={data} dealId={dealId} userId={userId} onKeysReceived={handleRecordingComplete} />
      </div>
    </div>
  );
}

function PostCloseDashboard({ dealId }: { dealId: string }) {
  return <PostCloseView dealId={dealId} />;
}

export function PhaseDashboard() {
  const { currentPhase, activeDealId, showDirectSetup, setShowDirectSetup, setCurrentPhase } = useUIStore();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const { data: deal } = useDeal(activeDealId);

  useEffect(() => {
    if (deal && deal.current_phase !== currentPhase) {
      setCurrentPhase(deal.current_phase);
    }
  }, [deal, deal?.current_phase, currentPhase, setCurrentPhase]);

  if (!userId) {
    return <div className="text-base text-muted-foreground p-10 text-center">Loading...</div>;
  }

  if (showDirectSetup) {
    return <DealSetupForm userId={userId} onComplete={() => setShowDirectSetup(false)} />;
  }

  switch (currentPhase) {
    case "shopping":
      return <ShoppingView userId={userId} />;
    case "offer":
      return <OfferView userId={userId} />;
    case "escrow":
      return <EscrowDashboard dealId={activeDealId} userId={userId} />;
    case "closing":
      return activeDealId ? <ClosingDashboard dealId={activeDealId} userId={userId} /> : (
        <div className="text-base text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-10 text-center">
          Create a deal first to access closing.
        </div>
      );
    case "post-close":
      return activeDealId ? <PostCloseDashboard dealId={activeDealId} /> : (
        <div className="text-base text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-10 text-center">
          No deal selected.
        </div>
      );
  }
}
