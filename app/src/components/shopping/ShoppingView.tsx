"use client";

import { useState } from "react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { ViewEditCard } from "@/components/ui/view-edit-card";
import { AddPropertyDialog } from "./AddPropertyDialog";
import { HomeValueProjectionCard } from "./HomeValueProjectionCard";
import { useSavedHomes } from "@/lib/hooks/queries";
import { useDeleteSavedHome, useUpdateTransaction } from "@/lib/hooks/mutations";
import { useUIStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Trash2, ArrowRight, Search } from "lucide-react";
import { toast } from "sonner";
import type { SavedHome } from "@/lib/types";

function formatPrice(price: number | null): string {
  if (!price) return "—";
  return `$${price.toLocaleString()}`;
}

function SavedHomeRow({ home, transactionId, onMoveToOffer }: {
  home: SavedHome;
  transactionId: string;
  onMoveToOffer: (home: SavedHome) => void;
}) {
  const deleteHome = useDeleteSavedHome(transactionId);

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
          onClick={() => onMoveToOffer(home)}
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
  const { setCurrentPhase, setSelectedHomeId, ownsCurrentHome, setOwnsCurrentHome, setShowDirectSetup, activeTransactionId } = useUIStore();
  const { data: homes, isLoading } = useSavedHomes(activeTransactionId);
  const updateTransaction = useUpdateTransaction(activeTransactionId ?? "", userId);

  // Buy Box state (editable, persisted locally for now)
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [bedsMin, setBedsMin] = useState("");
  const [bedsMax, setBedsMax] = useState("");
  const [targetArea, setTargetArea] = useState("");
  const [buyBoxSaved, setBuyBoxSaved] = useState(false);

  // Affordability state
  const [purchasePrice, setPurchasePrice] = useState("400000");
  const [downPaymentPct, setDownPaymentPct] = useState("20");

  const price = Number(purchasePrice) || 0;
  const dpPct = Number(downPaymentPct) || 0;
  const downPayment = price * (dpPct / 100);
  const estimatedClosingCosts = price * 0.03;
  const estimatedCashToClose = downPayment + estimatedClosingCosts;

  function handleMoveToOffer(home: SavedHome) {
    if (!activeTransactionId) return;
    setSelectedHomeId(home.id);
    setCurrentPhase("offer"); // Optimistic — instant UI switch
    updateTransaction.mutate(
      {
        current_phase: "offer",
        property_address: home.address,
        purchase_price: home.price ?? 0,
        saved_home_id: home.id,
      },
      {
        onError: () => {
          setCurrentPhase("shopping");
          setSelectedHomeId(null);
          toast.error("Failed to move to offer. Please try again.");
        },
      }
    );
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
        {homes && homes.length === 1 ? (
          <Button
            onClick={() => handleMoveToOffer(homes[0])}
            className="bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 text-sm font-medium gap-2"
          >
            Start an Offer
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : homes && homes.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 px-4 py-2 text-sm font-medium transition-colors"
            >
              Start an Offer
              <ArrowRight className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" sideOffset={4}>
              {homes.map((home) => (
                <DropdownMenuItem key={home.id} onClick={() => handleMoveToOffer(home)}>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{home.address}</span>
                    {home.price && (
                      <span className="text-xs text-muted-foreground">{formatPrice(home.price)}</span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            disabled
            className="bg-accent text-accent-foreground shadow-sm text-sm font-medium gap-2 opacity-50"
            title="Save a home first"
          >
            Start an Offer
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      <ViewEditCard
        title="Your Buy Box"
        subtitle="Target property criteria"
        saved={buyBoxSaved}
        onSave={() => { setBuyBoxSaved(true); toast.success("Buy box saved"); }}
        saveLabel="Save Buy Box"
        renderView={() => (
          <div className="grid grid-cols-3 gap-6">
            <div>
              <span className="text-sm text-muted-foreground">Price Range</span>
              <p className="text-base font-medium text-foreground">
                {priceMin || priceMax
                  ? `${priceMin ? `$${Number(priceMin).toLocaleString()}` : "Any"} – ${priceMax ? `$${Number(priceMax).toLocaleString()}` : "Any"}`
                  : "Not set"}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Bedrooms</span>
              <p className="text-base font-medium text-foreground">
                {bedsMin || bedsMax ? `${bedsMin || "Any"} – ${bedsMax || "Any"}` : "Not set"}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Target Area</span>
              <p className="text-base font-medium text-foreground">{targetArea || "Not set"}</p>
            </div>
          </div>
        )}
        renderEdit={() => (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Min Price</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">$</span>
                  <Input type="number" placeholder="350000" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="text-base pl-7" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Max Price</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">$</span>
                  <Input type="number" placeholder="450000" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="text-base pl-7" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Min Beds</span>
                <Input type="number" placeholder="3" value={bedsMin} onChange={(e) => setBedsMin(e.target.value)} className="text-base" />
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Max Beds</span>
                <Input type="number" placeholder="4" value={bedsMax} onChange={(e) => setBedsMax(e.target.value)} className="text-base" />
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Target Area</span>
                <Input placeholder="Springfield" value={targetArea} onChange={(e) => setTargetArea(e.target.value)} className="text-base" />
              </div>
            </div>
          </>
        )}
      />

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
                transactionId={activeTransactionId!}
                onMoveToOffer={handleMoveToOffer}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center space-y-3">
            <Search className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-base text-muted-foreground">No homes saved yet</p>
            <p className="text-sm text-muted-foreground">Add a property below to start tracking homes you&apos;re interested in.</p>
          </div>
        )}
        <div className="flex justify-end mt-4 pt-4 border-t border-border">
          <AddPropertyDialog userId={userId} transactionId={activeTransactionId!} />
        </div>
      </CollapsibleCard>

      <HomeValueProjectionCard transactionId={activeTransactionId} />

      <CollapsibleCard title="Affordability Estimate" subtitle="Quick cash-to-close estimate">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Purchase Price</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">$</span>
                <Input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="text-base pl-7"
                />
              </div>
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

      <CollapsibleCard title="About You" subtitle="Help us tailor your experience">
        <div className="space-y-3">
          <p className="text-base text-foreground">Do you currently own a home?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setOwnsCurrentHome(true)}
              className={`px-4 py-2 rounded-lg text-base font-medium transition-all cursor-pointer ${
                ownsCurrentHome === true
                  ? "bg-accent text-accent-foreground shadow-sm hover:bg-accent/90"
                  : "border border-border text-foreground hover:bg-muted hover:border-accent/40 hover:shadow-sm"
              }`}
            >
              Yes, I own
            </button>
            <button
              onClick={() => setOwnsCurrentHome(false)}
              className={`px-4 py-2 rounded-lg text-base font-medium transition-all cursor-pointer ${
                ownsCurrentHome === false
                  ? "bg-accent text-accent-foreground shadow-sm hover:bg-accent/90"
                  : "border border-border text-foreground hover:bg-muted hover:border-accent/40 hover:shadow-sm"
              }`}
            >
              No, first-time buyer
            </button>
          </div>
          {ownsCurrentHome === true && (
            <p className="text-sm text-muted-foreground">
              A &quot;Sale of Current Home&quot; contingency option will be available when you make an offer.
            </p>
          )}
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
            <p className="text-base font-medium text-emerald-600">Competitive</p>
          </div>
        </div>
      </CollapsibleCard>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6 text-center space-y-3">
        <p className="text-base text-foreground font-medium">Already have an accepted offer?</p>
        <p className="text-sm text-muted-foreground">Skip straight to your escrow and closing workspace</p>
        <Button
          onClick={() => setShowDirectSetup(true)}
          variant="outline"
          className="text-accent border-accent hover:bg-accent/10"
        >
          Go to Transaction Setup
        </Button>
      </div>
    </div>
  );
}
