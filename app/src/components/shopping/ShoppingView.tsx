"use client";

import { useState } from "react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { AddPropertyDialog } from "./AddPropertyDialog";
import { useSavedHomes } from "@/lib/hooks/queries";
import { useDeleteSavedHome } from "@/lib/hooks/mutations";
import { useUIStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import type { SavedHome } from "@/lib/types";

function formatPrice(price: number | null): string {
  if (!price) return "—";
  return `$${price.toLocaleString()}`;
}

function SavedHomeRow({ home, userId, onMoveToOffer }: {
  home: SavedHome;
  userId: string;
  onMoveToOffer: () => void;
}) {
  const deleteHome = useDeleteSavedHome(userId);

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-foreground">{home.address}</span>
          <Badge className="bg-primary/20 text-primary-foreground text-xs">Active</Badge>
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span>{formatPrice(home.price)}</span>
          {home.beds && <span>{home.beds} bed</span>}
          {home.baths && <span>{home.baths} bath</span>}
          {home.sqft && <span>{home.sqft} sqft</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMoveToOffer()}
          className="text-accent border-accent hover:bg-accent/10"
        >
          Move to Offer
        </Button>
        <button
          onClick={() => deleteHome.mutate(home.id)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ShoppingView({ userId }: { userId: string }) {
  const { data: homes, isLoading } = useSavedHomes(userId);
  const setCurrentPhase = useUIStore((s) => s.setCurrentPhase);

  const [purchasePrice, setPurchasePrice] = useState("400000");
  const [downPaymentPct, setDownPaymentPct] = useState("20");

  const price = Number(purchasePrice) || 0;
  const dpPct = Number(downPaymentPct) || 0;
  const downPayment = price * (dpPct / 100);
  const estimatedClosingCosts = price * 0.03;
  const estimatedCashToClose = downPayment + estimatedClosingCosts;

  function handleMoveToOffer() {
    setCurrentPhase("offer");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Shopping</h2>
          <p className="text-base text-muted-foreground mt-1">
            Track homes and prepare your buy box
          </p>
        </div>
        <AddPropertyDialog userId={userId} />
      </div>

      <CollapsibleCard title="Your Buy Box" subtitle="Target property criteria">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <span className="text-sm text-muted-foreground">Price Range</span>
            <p className="text-base font-medium text-foreground">$350K - $450K</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Bedrooms</span>
            <p className="text-base font-medium text-foreground">3 - 4</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Target Area</span>
            <p className="text-base font-medium text-foreground">Springfield</p>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard
        title="Saved Homes"
        subtitle={homes ? `${homes.length} properties tracked` : "Loading..."}
      >
        {isLoading ? (
          <div className="text-sm text-muted-foreground py-4 text-center">Loading homes...</div>
        ) : homes && homes.length > 0 ? (
          <div>
            {homes.map((home) => (
              <SavedHomeRow
                key={home.id}
                home={home}
                userId={userId}
                onMoveToOffer={() => handleMoveToOffer()}
              />
            ))}
          </div>
        ) : (
          <div className="text-base text-muted-foreground py-6 text-center">
            No homes saved yet. Add a property to start tracking.
          </div>
        )}
      </CollapsibleCard>

      <CollapsibleCard title="Affordability Estimate" subtitle="Quick cash-to-close estimate">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Purchase Price</span>
              <Input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="text-base"
              />
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Down Payment %</span>
              <Input
                type="number"
                value={downPaymentPct}
                onChange={(e) => setDownPaymentPct(e.target.value)}
                className="text-base"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Estimated Cash to Close</span>
            <span className="text-2xl font-semibold text-foreground">
              ~{formatPrice(estimatedCashToClose)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Includes down payment + estimated closing costs
          </p>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Market Snapshot" subtitle="Light neighborhood insights">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <span className="text-sm text-muted-foreground">Median Home Price</span>
            <p className="text-base font-medium text-foreground">$415,000</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Avg Days on Market</span>
            <p className="text-base font-medium text-foreground">18 days</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Market Trend</span>
            <p className="text-base font-medium text-primary">Competitive</p>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
