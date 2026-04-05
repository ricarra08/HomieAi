"use client";

import { useUIStore, type Phase } from "@/lib/store";

function ShoppingDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Shopping</h2>
          <p className="text-base text-muted-foreground mt-1">Track homes and prepare your buy box</p>
        </div>
        <button className="px-5 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium text-base shadow-sm hover:bg-accent/90 transition-colors">
          Add Property
        </button>
      </div>
      <div className="text-base text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-10 text-center">
        Shopping dashboard — Phase 1 build
      </div>
    </div>
  );
}

function OfferDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Offer Workspace</h2>
          <p className="text-base text-muted-foreground mt-1">Structure and prepare your offer</p>
        </div>
      </div>
      <div className="text-base text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-10 text-center">
        Offer workspace — Phase 1 build
      </div>
    </div>
  );
}

function EscrowDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Escrow &amp; Due Diligence</h2>
        <p className="text-base text-muted-foreground mt-1">1234 Maple Street, San Francisco, CA 94102</p>
      </div>
      <div className="text-base text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-10 text-center">
        Escrow dashboard — Phase 4 build
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
      <p className="text-lg text-muted-foreground">
        Your journey is complete!
      </p>
      <div className="text-base text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-10">
        Post-close view — Phase 5 build
      </div>
    </div>
  );
}

const phaseComponents: Record<Phase, React.ComponentType> = {
  shopping: ShoppingDashboard,
  offer: OfferDashboard,
  escrow: EscrowDashboard,
  closing: ClosingDashboard,
  "post-close": PostCloseDashboard,
};

export function PhaseDashboard() {
  const currentPhase = useUIStore((s) => s.currentPhase);
  const Component = phaseComponents[currentPhase];
  return <Component />;
}
