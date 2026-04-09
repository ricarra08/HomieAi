"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/lib/store";
import { useEscrowData } from "@/lib/hooks/use-escrow-data";
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Escrow & Due Diligence</h2>
        <p className="text-base text-muted-foreground mt-1">Track contingencies, inspections, and closing progress</p>
      </div>

      <DealSummaryCard dealId={dealId} />

      <EscrowAlerts data={data} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <ContingencyCountdown dealId={dealId} deadlines={data.deadlines} />
        {data.deal && <EarnestMoneyTracker deal={data.deal} userId={userId} />}
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

function ClosingDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Closing</h2>
        <p className="text-base text-muted-foreground mt-1">Final steps to complete your purchase</p>
      </div>
      <div className="text-base text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-10 text-center">
        Closing dashboard — Phase 5 build
      </div>
    </div>
  );
}

function PostCloseDashboard() {
  return (
    <div className="space-y-6 text-center py-12">
      <div className="text-6xl">🎉</div>
      <h2 className="text-3xl font-semibold tracking-tight">Congratulations!</h2>
      <p className="text-lg text-muted-foreground">Your journey is complete!</p>
      <div className="text-base text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-10">
        Post-close view — Phase 5 build
      </div>
    </div>
  );
}

export function PhaseDashboard() {
  const { currentPhase, activeDealId, showDirectSetup, setShowDirectSetup } = useUIStore();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

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
      return <ClosingDashboard />;
    case "post-close":
      return <PostCloseDashboard />;
  }
}
