"use client";

import { useState } from "react";
import { useCreateDeal } from "@/lib/hooks/mutations";
import { useUIStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TermTooltip } from "@/components/ui/term-tooltip";

export interface DealFormData {
  address: string;
  acceptanceDate: string;
  closingDate: string;
  purchasePrice: string;
  earnestMoney: string;
  inspectionDays: string;
  appraisalDays: string;
  loanDays: string;
}

interface DealSetupFormProps {
  userId?: string;
  mode?: "authenticated" | "guest";
  onComplete?: () => void;
  onGuestSubmit?: (data: DealFormData) => void;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
}

export function DealSetupForm({
  userId,
  mode = "authenticated",
  onComplete,
  onGuestSubmit,
  title = "Welcome to Your Transaction Workspace",
  subtitle = "Let\u2019s set up your escrow and closing dashboard. You can update these details anytime.",
  submitLabel,
}: DealSetupFormProps) {
  const createDeal = useCreateDeal(userId ?? "");
  const uiStore = useUIStore();

  const [address, setAddress] = useState("");
  const [acceptanceDate, setAcceptanceDate] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [earnestMoney, setEarnestMoney] = useState("");
  const [inspectionDays, setInspectionDays] = useState("17");
  const [appraisalDays, setAppraisalDays] = useState("17");
  const [loanDays, setLoanDays] = useState("21");

  const isSubmitting = createDeal.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData: DealFormData = {
      address,
      acceptanceDate,
      closingDate,
      purchasePrice,
      earnestMoney,
      inspectionDays,
      appraisalDays,
      loanDays,
    };

    if (mode === "guest") {
      onGuestSubmit?.(formData);
      return;
    }

    createDeal.mutate(
      {
        property_address: address,
        purchase_price: Number(purchasePrice),
        current_phase: "escrow",
        contract_acceptance_date: acceptanceDate || undefined,
        closing_date: closingDate || undefined,
        earnest_money_amount: earnestMoney ? Number(earnestMoney) : undefined,
      },
      {
        onSuccess: (data) => {
          uiStore.setActiveDealId(data.id);
          uiStore.setCurrentPhase("escrow");
          onComplete?.();
        },
      }
    );
  }

  const defaultSubmitLabel =
    mode === "guest" ? "Preview My Workspace" : "Start Transaction Workspace";

  return (
    <div className="max-w-[768px] mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🏠</span>
        </div>
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="text-base text-muted-foreground mt-2 max-w-[576px] mx-auto">
          {subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border shadow-sm p-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="address">Property Address</Label>
          <Input
            id="address"
            placeholder="123 Main Street, San Francisco, CA 94102"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="text-base"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="acceptance">Offer Acceptance Date</Label>
            <Input
              id="acceptance"
              type="date"
              value={acceptanceDate}
              onChange={(e) => setAcceptanceDate(e.target.value)}
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="closing">
              <TermTooltip term="Scheduled Closing Date" definition="The target date for completing the purchase. Typically 30–45 days from offer acceptance. All contingencies, inspections, and loan approval must be finished before this date." />
            </Label>
            <Input
              id="closing"
              type="date"
              value={closingDate}
              onChange={(e) => setClosingDate(e.target.value)}
              className="text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Purchase Price</Label>
            <Input
              id="price"
              type="number"
              placeholder="900000"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              required
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emd">
              <TermTooltip term="Earnest Money Deposit" definition="A good-faith deposit showing you're serious about buying. Typically 1–3% of the purchase price. Held in escrow and applied to your closing costs." />
            </Label>
            <Input
              id="emd"
              type="number"
              placeholder="18000"
              value={earnestMoney}
              onChange={(e) => setEarnestMoney(e.target.value)}
              className="text-base"
            />
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-1">
            <TermTooltip term="Contingency Periods (Days)" definition="Conditions that must be met for the sale to go through. Each contingency has a deadline measured in days from offer acceptance. If not met, you can back out and keep your earnest money." />
          </h3>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div className="space-y-2">
              <Label htmlFor="inspection">
                <TermTooltip term="Inspection" definition="Time allowed to have the property professionally inspected and negotiate repairs. Typical: 7–14 days." />
              </Label>
              <Input
                id="inspection"
                type="number"
                value={inspectionDays}
                onChange={(e) => setInspectionDays(e.target.value)}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appraisal">
                <TermTooltip term="Appraisal" definition="Time for a lender-ordered property valuation. If the appraisal comes in low, you can renegotiate or walk away. Typical: 14–21 days." />
              </Label>
              <Input
                id="appraisal"
                type="number"
                value={appraisalDays}
                onChange={(e) => setAppraisalDays(e.target.value)}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loan">
                <TermTooltip term="Loan" definition="Time to secure final mortgage approval. If financing falls through, you can cancel the purchase. Typical: 21–30 days." />
              </Label>
              <Input
                id="loan"
                type="number"
                value={loanDays}
                onChange={(e) => setLoanDays(e.target.value)}
                className="text-base"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !address || !purchasePrice}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm text-base py-6 font-medium"
        >
          {isSubmitting ? "Creating..." : (submitLabel ?? defaultSubmitLabel)}
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          {mode === "guest"
            ? "No account needed — just see what your dashboard looks like"
            : "You can update these details anytime from your dashboard"}
        </p>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-6">
        🔒 Your data is encrypted and secure
      </p>
    </div>
  );
}
