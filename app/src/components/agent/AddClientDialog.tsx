"use client";

import { useState } from "react";
import { X, Search, FileText, ArrowRight, Loader2 } from "lucide-react";
import { useCreateTransaction } from "@/lib/hooks/mutations";
import { useUIStore } from "@/lib/store";
import { SUPPORTED_STATES, STATE_LABELS, getStateConfig, getContingencyDefaults } from "@/lib/state-configs";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { computeDeadlinesFromSetupForm } from "@/lib/computed";
import type { StateCode } from "@/lib/state-configs";

interface AddClientDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

type ClientStage = "shopping" | "accepted-offer";

export function AddClientDialog({ open, onClose, userId }: AddClientDialogProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [stage, setStage] = useState<ClientStage | null>(null);

  // Accepted offer fields
  const [address, setAddress] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [acceptanceDate, setAcceptanceDate] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [earnestMoney, setEarnestMoney] = useState("");
  const [inspectionDays, setInspectionDays] = useState("17");
  const [appraisalDays, setAppraisalDays] = useState("21");
  const [loanDays, setLoanDays] = useState("21");
  const [selectedState, setSelectedState] = useState("");
  const [optionPeriodDays, setOptionPeriodDays] = useState("");
  const [optionFee, setOptionFee] = useState("");

  const createTransaction = useCreateTransaction(userId);
  const { setActiveTransactionId, setCurrentPhase } = useUIStore();

  const stateConfig = selectedState ? getStateConfig(selectedState) : null;

  function handleStateChange(code: string) {
    setSelectedState(code);
    setOptionPeriodDays("");
    setOptionFee("");
    const defaults = getContingencyDefaults(code);
    setInspectionDays(defaults.inspectionDays);
    setAppraisalDays(defaults.appraisalDays);
    setLoanDays(defaults.loanDays);
    if (getStateConfig(code).option_period.enabled) {
      setOptionPeriodDays(String(getStateConfig(code).option_period.default_days ?? ""));
    }
  }

  function reset() {
    setClientName("");
    setClientEmail("");
    setStage(null);
    setAddress("");
    setPurchasePrice("");
    setAcceptanceDate("");
    setClosingDate("");
    setEarnestMoney("");
    setInspectionDays("");
    setAppraisalDays("");
    setLoanDays("");
    setSelectedState("");
    setOptionPeriodDays("");
    setOptionFee("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmitShopping() {
    if (!clientName.trim()) return;

    createTransaction.mutate(
      {
        property_address: "TBD",
        purchase_price: 0,
        current_phase: "shopping",
        agent_id: userId,
        client_name: clientName.trim(),
        client_email: clientEmail.trim() || undefined,
        state: selectedState || undefined,
      },
      {
        onSuccess: (data) => {
          setActiveTransactionId(data.id);
          setCurrentPhase("shopping");
          handleClose();
        },
      }
    );
  }

  function handleSubmitAccepted() {
    if (!clientName.trim() || !address.trim() || !purchasePrice || !acceptanceDate) return;

    createTransaction.mutate(
      {
        property_address: address.trim(),
        purchase_price: Number(purchasePrice),
        current_phase: "escrow",
        contract_acceptance_date: acceptanceDate || undefined,
        closing_date: closingDate || undefined,
        earnest_money_amount: earnestMoney ? Number(earnestMoney) : undefined,
        agent_id: userId,
        client_name: clientName.trim(),
        client_email: clientEmail.trim() || undefined,
        state: selectedState || undefined,
      },
      {
        onSuccess: async (data) => {
          // Auto-create deadlines
          if (acceptanceDate) {
            const deadlines = computeDeadlinesFromSetupForm({
              acceptanceDate,
              closingDate: closingDate || undefined,
              inspectionDays: Number(inspectionDays) || undefined,
              appraisalDays: Number(appraisalDays) || undefined,
              loanDays: Number(loanDays) || undefined,
              optionPeriodDays: Number(optionPeriodDays) || undefined,
            }, stateConfig ?? undefined);
            if (deadlines.length > 0) {
              const supabase = (await import("@/lib/supabase/client")).createClient();
              const rows = deadlines.map((d) => ({ ...d, deal_id: data.id }));
              await supabase.from("deadlines").insert(rows);
            }
          }

          setActiveTransactionId(data.id);
          setCurrentPhase("escrow");
          handleClose();
        },
      }
    );
  }

  if (!open) return null;

  const isSubmitting = createTransaction.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-sm w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add Client</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Client info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="client-name" className="text-base font-medium text-foreground">Client name</label>
            <input
              id="client-name"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. John & Jane Smith"
              className="w-full text-base px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="client-email" className="text-base font-medium text-foreground">
              Client email <span className="text-sm text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              id="client-email"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full text-base px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="client-state" className="text-base font-medium text-foreground">State</label>
            <select
              id="client-state"
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full text-base px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="">Select state...</option>
              {SUPPORTED_STATES.map((code) => (
                <option key={code} value={code}>{STATE_LABELS[code as StateCode]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stage selection */}
        {!stage && (
          <div className="space-y-3">
            <p className="text-base font-medium text-foreground">Where is this client?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStage("shopping")}
                className="bg-background rounded-xl border border-border p-4 text-left hover:border-accent/40 transition-all"
              >
                <Search className="w-5 h-5 text-accent mb-2" />
                <p className="text-sm font-semibold text-foreground">Shopping</p>
                <p className="text-xs text-muted-foreground mt-0.5">Looking for homes</p>
              </button>
              <button
                onClick={() => setStage("accepted-offer")}
                className="bg-background rounded-xl border border-border p-4 text-left hover:border-accent/40 transition-all"
              >
                <FileText className="w-5 h-5 text-accent mb-2" />
                <p className="text-sm font-semibold text-foreground">Accepted Offer</p>
                <p className="text-xs text-muted-foreground mt-0.5">Under contract</p>
              </button>
            </div>
          </div>
        )}

        {/* Shopping — just submit */}
        {stage === "shopping" && (
          <button
            onClick={handleSubmitShopping}
            disabled={!clientName.trim() || !selectedState || isSubmitting}
            className="w-full bg-accent text-accent-foreground shadow-sm rounded-lg px-5 py-2.5 text-base font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {isSubmitting ? "Creating..." : "Create Transaction"}
          </button>
        )}

        {/* Accepted offer — show transaction details */}
        {stage === "accepted-offer" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-base font-medium text-foreground">Property address</label>
              <AddressAutocomplete
                value={address}
                onChange={(val) => setAddress(val)}
                placeholder="123 Main St, City, ST 12345"
                stateCode={selectedState}
                className="w-full text-base px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Purchase price</label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="450000"
                  className="w-full text-base px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Earnest money</label>
                <input
                  type="number"
                  value={earnestMoney}
                  onChange={(e) => setEarnestMoney(e.target.value)}
                  placeholder="10000"
                  className="w-full text-base px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Contract acceptance</label>
                <input
                  type="date"
                  value={acceptanceDate}
                  onChange={(e) => setAcceptanceDate(e.target.value)}
                  className="w-full text-base px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Closing date</label>
                <input
                  type="date"
                  value={closingDate}
                  onChange={(e) => setClosingDate(e.target.value)}
                  className="w-full text-base px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{stateConfig?.buyer_protection.type === "investigation_contingency" ? "Investigation" : stateConfig?.buyer_protection.type === "option_period" ? "Inspection" : "Inspection"} days</label>
                <input type="number" value={inspectionDays} onChange={(e) => setInspectionDays(e.target.value)} className="w-full text-base px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40" />
              </div>
              {(!stateConfig || stateConfig.contingency_defaults.appraisal_days !== null) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Appraisal days</label>
                  <input type="number" value={appraisalDays} onChange={(e) => setAppraisalDays(e.target.value)} className="w-full text-base px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40" />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Loan days</label>
                <input type="number" value={loanDays} onChange={(e) => setLoanDays(e.target.value)} className="w-full text-base px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40" />
              </div>
            </div>
            {stateConfig?.option_period.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Option period days</label>
                  <input type="number" value={optionPeriodDays} onChange={(e) => setOptionPeriodDays(e.target.value)} className="w-full text-base px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Option fee</label>
                  <input type="number" value={optionFee} onChange={(e) => setOptionFee(e.target.value)} className="w-full text-base px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40" />
                </div>
              </div>
            )}

            <button
              onClick={handleSubmitAccepted}
              disabled={!clientName.trim() || !address.trim() || !purchasePrice || !acceptanceDate || !selectedState || isSubmitting}
              className="w-full bg-accent text-accent-foreground shadow-sm rounded-lg px-5 py-2.5 text-base font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {isSubmitting ? "Creating..." : "Create Transaction"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
