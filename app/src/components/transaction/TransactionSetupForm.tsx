"use client";

import { useState } from "react";
import { useCreateTransaction, useUpdateTransaction } from "@/lib/hooks/mutations";
import { toast } from "sonner";
import { useUIStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TermTooltip } from "@/components/ui/term-tooltip";
import { ArrowLeft } from "lucide-react";
import { SUPPORTED_STATES, STATE_LABELS, getStateConfig, getContingencyDefaults } from "@/lib/state-configs";
import { computeDeadlinesFromSetupForm } from "@/lib/computed";
import type { StateCode } from "@/lib/state-configs";

export interface TransactionFormData {
  state: string;
  address: string;
  acceptanceDate: string;
  closingDate: string;
  purchasePrice: string;
  earnestMoney: string;
  inspectionDays: string;
  appraisalDays: string;
  loanDays: string;
}

interface TransactionSetupFormProps {
  userId?: string;
  mode?: "authenticated" | "guest";
  onComplete?: () => void;
  onGuestSubmit?: (data: TransactionFormData) => void;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
}

export function TransactionSetupForm({
  userId,
  mode = "authenticated",
  onComplete,
  onGuestSubmit,
  onBack,
  title = "Welcome to Your Transaction Workspace",
  subtitle = "Let\u2019s set up your escrow and closing dashboard. You can update these details anytime.",
  submitLabel,
}: TransactionSetupFormProps) {
  const createTransaction = useCreateTransaction(userId ?? "");
  const uiStore = useUIStore();
  const updateTransaction = useUpdateTransaction(uiStore.activeTransactionId ?? "", userId ?? "");

  const [address, setAddress] = useState("");
  const [acceptanceDate, setAcceptanceDate] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [earnestMoney, setEarnestMoney] = useState("");
  const [inspectionDays, setInspectionDays] = useState("");
  const [appraisalDays, setAppraisalDays] = useState("");
  const [loanDays, setLoanDays] = useState("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [optionPeriodDays, setOptionPeriodDays] = useState("");
  const [optionFee, setOptionFee] = useState("");
  const [userEditedContingencies, setUserEditedContingencies] = useState(false);

  const stateConfig = selectedState ? getStateConfig(selectedState) : null;

  const isSubmitting = createTransaction.isPending || updateTransaction.isPending;

  function handleStateChange(code: string) {
    setSelectedState(code);
    setOptionPeriodDays("");
    setOptionFee("");
    if (!userEditedContingencies) {
      const defaults = getContingencyDefaults(code);
      setInspectionDays(defaults.inspectionDays);
      setAppraisalDays(defaults.appraisalDays);
      setLoanDays(defaults.loanDays);
    }
    if (getStateConfig(code).option_period.enabled) {
      setOptionPeriodDays(String(getStateConfig(code).option_period.default_days ?? ""));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData: TransactionFormData = {
      state: selectedState,
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

    const payload = {
      state: selectedState || undefined,
      property_address: address,
      purchase_price: Number(purchasePrice),
      current_phase: "escrow" as const,
      contract_acceptance_date: acceptanceDate || undefined,
      closing_date: closingDate || undefined,
      earnest_money_amount: earnestMoney ? Number(earnestMoney) : undefined,
    };

    async function createDeadlines(dealId: string) {
      if (!acceptanceDate) return;
      const deadlines = computeDeadlinesFromSetupForm({
        acceptanceDate,
        closingDate: closingDate || undefined,
        inspectionDays: Number(inspectionDays) || undefined,
        appraisalDays: Number(appraisalDays) || undefined,
        loanDays: Number(loanDays) || undefined,
        optionPeriodDays: Number(optionPeriodDays) || undefined,
      }, stateConfig ?? undefined);
      if (deadlines.length > 0) {
        const rows = deadlines.map((d) => ({ ...d, deal_id: dealId }));
        const { error: deadlineError } = await createClient().from("deadlines").insert(rows);
        if (deadlineError) console.error("[transaction-setup] Failed to create deadlines:", deadlineError);
      }
    }

    if (uiStore.activeTransactionId) {
      updateTransaction.mutate(payload, {
        onSuccess: async () => {
          uiStore.setCurrentPhase("escrow");
          toast.success("Transaction updated");
          await createDeadlines(uiStore.activeTransactionId!);
          onComplete?.();
        },
      });
    } else {
      createTransaction.mutate(payload, {
        onSuccess: async (data) => {
          uiStore.setActiveTransactionId(data.id);
          uiStore.setCurrentPhase("escrow");
          toast.success("Transaction created");
          await createDeadlines(data.id);
          onComplete?.();
        },
      });
    }
  }

  const defaultSubmitLabel =
    mode === "guest" ? "Preview My Workspace" : "Start Transaction Workspace";

  return (
    <div className="max-w-[768px] mx-auto">
      {onBack && (
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
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
          <Label htmlFor="state">State</Label>
          <select
            id="state"
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            required
            className="w-full text-base px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            <option value="">Select state...</option>
            {SUPPORTED_STATES.map((code) => (
              <option key={code} value={code}>{STATE_LABELS[code as StateCode]}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Property Address</Label>
          <AddressAutocomplete
            id="address"
            placeholder="123 Main Street, San Francisco, CA 94102"
            value={address}
            onChange={(val) => setAddress(val)}
            required
            className="text-base"
            stateCode={selectedState}
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
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">$</span>
              <Input
                id="price"
                type="number"
                placeholder="900000"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                required
                className="text-base pl-7"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emd">
              <TermTooltip term="Earnest Money Deposit" definition="A good-faith deposit showing you're serious about buying. Typically 1–3% of the purchase price. Held in escrow and applied to your closing costs." />
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">$</span>
              <Input
                id="emd"
                type="number"
                placeholder="18000"
                value={earnestMoney}
                onChange={(e) => setEarnestMoney(e.target.value)}
                className="text-base pl-7"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-1">
            <TermTooltip term="Contingency Periods (Days)" definition="Conditions that must be met for the sale to go through. Each contingency has a deadline measured in days from offer acceptance. If not met, you can back out and keep your earnest money." />
          </h3>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div className="space-y-2">
              <Label htmlFor="inspection">
                <TermTooltip term={stateConfig?.buyer_protection.label ?? "Inspection"} definition="Time allowed to have the property professionally inspected and negotiate repairs. Typical: 7–14 days." />
              </Label>
              <Input
                id="inspection"
                type="number"
                value={inspectionDays}
                onChange={(e) => setInspectionDays(e.target.value)}
                onFocus={() => setUserEditedContingencies(true)}
                className="text-base"
              />
            </div>
            {(!stateConfig || stateConfig.contingency_defaults.appraisal_days !== null) && (
              <div className="space-y-2">
                <Label htmlFor="appraisal">
                  <TermTooltip term="Appraisal" definition="Time for a lender-ordered property valuation. If the appraisal comes in low, you can renegotiate or walk away. Typical: 14–21 days." />
                </Label>
                <Input
                  id="appraisal"
                  type="number"
                  value={appraisalDays}
                  onChange={(e) => setAppraisalDays(e.target.value)}
                  onFocus={() => setUserEditedContingencies(true)}
                  className="text-base"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="loan">
                <TermTooltip term="Loan" definition="Time to secure final mortgage approval. If financing falls through, you can cancel the purchase. Typical: 21–30 days." />
              </Label>
              <Input
                id="loan"
                type="number"
                value={loanDays}
                onChange={(e) => setLoanDays(e.target.value)}
                onFocus={() => setUserEditedContingencies(true)}
                className="text-base"
              />
            </div>
          </div>
          {stateConfig?.option_period.enabled && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="optionDays">Option Period Days</Label>
                <Input
                  id="optionDays"
                  type="number"
                  value={optionPeriodDays}
                  onChange={(e) => setOptionPeriodDays(e.target.value)}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="optionFee">Option Fee</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">$</span>
                  <Input
                    id="optionFee"
                    type="number"
                    placeholder="100"
                    value={optionFee}
                    onChange={(e) => setOptionFee(e.target.value)}
                    className="text-base pl-7"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !address || !purchasePrice || !selectedState}
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
