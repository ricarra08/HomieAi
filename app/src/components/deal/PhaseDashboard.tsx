"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/lib/store";
import { ShoppingView } from "@/components/shopping/ShoppingView";
import { OfferView } from "@/components/offer/OfferView";
import { DealSummaryCard } from "@/components/deal/DealSummaryCard";
import { DealSetupForm } from "@/components/deal/DealSetupForm";
import { createClient } from "@/lib/supabase/client";

function EscrowDashboard({ dealId }: { dealId: string | null }) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight">Escrow &amp; Due Diligence</h2>
      {dealId && <DealSummaryCard dealId={dealId} />}
      <div className="text-base text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-10 text-center">
        Escrow dashboard components — Phase 4 build
      </div>
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
      return <EscrowDashboard dealId={activeDealId} />;
    case "closing":
      return <ClosingDashboard />;
    case "post-close":
      return <PostCloseDashboard />;
  }
}
