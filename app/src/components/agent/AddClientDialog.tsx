"use client";

import { useState } from "react";
import { X, Search, FileText, ArrowRight, Loader2 } from "lucide-react";
import { useCreateTransaction } from "@/lib/hooks/mutations";
import { useCreateDeadlines } from "@/lib/hooks/mutations";
import { useUIStore } from "@/lib/store";

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

  const createTransaction = useCreateTransaction(userId);
  const { setActiveTransactionId, setCurrentPhase } = useUIStore();

  function reset() {
    setClientName("");
    setClientEmail("");
    setStage(null);
    setAddress("");
    setPurchasePrice("");
    setAcceptanceDate("");
    setClosingDate("");
    setEarnestMoney("");
    setInspectionDays("17");
    setAppraisalDays("21");
    setLoanDays("21");
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
    if (!clientName.trim() || !address.trim() || !purchasePrice) return;

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
      },
      {
        onSuccess: async (data) => {
          // Auto-create deadlines
          if (acceptanceDate) {
            const supabase = (await import("@/lib/supabase/client")).createClient();
            const base = new Date(acceptanceDate);
            function addDays(d: Date, days: number) {
              const r = new Date(d);
              r.setDate(r.getDate() + days);
              return r.toISOString().split("T")[0];
            }
            const deadlines: { deal_id: string; name: string; type: string; due_date: string }[] = [];
            if (Number(inspectionDays)) deadlines.push({ deal_id: data.id, name: "Inspection Contingency", type: "inspection", due_date: addDays(base, Number(inspectionDays)) });
            if (Number(appraisalDays)) deadlines.push({ deal_id: data.id, name: "Appraisal Contingency", type: "appraisal", due_date: addDays(base, Number(appraisalDays)) });
            if (Number(loanDays)) deadlines.push({ deal_id: data.id, name: "Financing Contingency", type: "financing", due_date: addDays(base, Number(loanDays)) });
            if (closingDate) deadlines.push({ deal_id: data.id, name: "Closing Date", type: "closing", due_date: closingDate });

            if (deadlines.length) {
              await supabase.from("deadlines").insert(deadlines);
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
            disabled={!clientName.trim() || isSubmitting}
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
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, ST 12345"
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
                <label className="text-sm font-medium text-foreground">Inspection days</label>
                <input type="number" value={inspectionDays} onChange={(e) => setInspectionDays(e.target.value)} className="w-full text-base px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Appraisal days</label>
                <input type="number" value={appraisalDays} onChange={(e) => setAppraisalDays(e.target.value)} className="w-full text-base px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Loan days</label>
                <input type="number" value={loanDays} onChange={(e) => setLoanDays(e.target.value)} className="w-full text-base px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40" />
              </div>
            </div>

            <button
              onClick={handleSubmitAccepted}
              disabled={!clientName.trim() || !address.trim() || !purchasePrice || isSubmitting}
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
