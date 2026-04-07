"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateLoanEstimate, useUpdateLoanEstimate } from "@/lib/hooks/mutations";
import type { LoanEstimate } from "@/lib/types";

function CurrencyInput({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">$</span>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-base pl-7"
      />
    </div>
  );
}

interface LEFormModalProps {
  dealId: string;
  open: boolean;
  onClose: () => void;
  editingLE?: LoanEstimate | null;
}

export function LEFormModal({ dealId, open, onClose, editingLE }: LEFormModalProps) {
  const createLE = useCreateLoanEstimate(dealId);
  const updateLE = useUpdateLoanEstimate(dealId);
  const isEditing = !!editingLE;

  const [lender, setLender] = useState("");
  const [product, setProduct] = useState("30-year fixed");
  const [loanAmount, setLoanAmount] = useState("");
  const [rate, setRate] = useState("");
  const [apr, setApr] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [points, setPoints] = useState("");
  const [lenderFees, setLenderFees] = useState("");
  const [thirdPartyFees, setThirdPartyFees] = useState("");
  const [pmiMonthly, setPmiMonthly] = useState("");
  const [cashToClose, setCashToClose] = useState("");
  const [lockStatus, setLockStatus] = useState<"locked" | "floating">("floating");
  const [lockExpires, setLockExpires] = useState("");
  const [impounds, setImpounds] = useState(false);
  const [prepayPenalty, setPrepayPenalty] = useState(false);

  useEffect(() => {
    if (editingLE) {
      setLender(editingLE.lender);
      setProduct(editingLE.product);
      setLoanAmount(String(editingLE.loan_amount));
      setRate(String(editingLE.rate));
      setApr(editingLE.apr != null ? String(editingLE.apr) : "");
      setDownPayment(editingLE.down_payment != null ? String(editingLE.down_payment) : "");
      setPoints(editingLE.points != null ? String(editingLE.points) : "");
      setLenderFees(editingLE.lender_fees != null ? String(editingLE.lender_fees) : "");
      setThirdPartyFees(editingLE.third_party_fees != null ? String(editingLE.third_party_fees) : "");
      setPmiMonthly(editingLE.pmi_monthly != null ? String(editingLE.pmi_monthly) : "");
      setCashToClose(editingLE.cash_to_close != null ? String(editingLE.cash_to_close) : "");
      setLockStatus(editingLE.lock_status ?? "floating");
      setLockExpires(editingLE.lock_expires ?? "");
      setImpounds(editingLE.impounds);
      setPrepayPenalty(editingLE.prepay_penalty);
    } else {
      setLender("");
      setProduct("30-year fixed");
      setLoanAmount("");
      setRate("");
      setApr("");
      setDownPayment("");
      setPoints("");
      setLenderFees("");
      setThirdPartyFees("");
      setPmiMonthly("");
      setCashToClose("");
      setLockStatus("floating");
      setLockExpires("");
      setImpounds(false);
      setPrepayPenalty(false);
    }
  }, [editingLE, open]);

  if (!open) return null;

  const isPending = createLE.isPending || updateLE.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lender || !loanAmount || !rate) return;

    const payload = {
      lender,
      product,
      loan_amount: Number(loanAmount),
      rate: Number(rate),
      apr: apr ? Number(apr) : undefined,
      down_payment: downPayment ? Number(downPayment) : undefined,
      points: points ? Number(points) : undefined,
      lender_fees: lenderFees ? Number(lenderFees) : undefined,
      third_party_fees: thirdPartyFees ? Number(thirdPartyFees) : undefined,
      pmi_monthly: pmiMonthly ? Number(pmiMonthly) : undefined,
      cash_to_close: cashToClose ? Number(cashToClose) : undefined,
      lock_status: lockStatus,
      lock_expires: lockExpires || undefined,
      impounds,
      prepay_penalty: prepayPenalty,
      pdf_document_id: editingLE?.pdf_document_id ?? undefined,
    };

    if (isEditing) {
      updateLE.mutate(
        { leId: editingLE!.id, updates: payload },
        { onSuccess: () => onClose() }
      );
    } else {
      createLE.mutate(payload, { onSuccess: () => onClose() });
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-4 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-[640px] max-h-[85vh] flex flex-col pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <h2 className="text-xl font-semibold text-foreground">
              {editingLE ? "Edit Loan Estimate" : "Add Loan Estimate"}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Lender + Product */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Lender *</label>
                <Input value={lender} onChange={(e) => setLender(e.target.value)} placeholder="e.g. Wells Fargo" className="text-base" required />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Loan Product</label>
                <Input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="30-year fixed" className="text-base" />
              </div>
            </div>

            {/* Core numbers */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Loan Amount *</label>
                <CurrencyInput value={loanAmount} onChange={setLoanAmount} placeholder="320000" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Interest Rate % *</label>
                <Input type="number" step="0.001" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="6.5" className="text-base" required />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">APR %</label>
                <Input type="number" step="0.001" value={apr} onChange={(e) => setApr(e.target.value)} placeholder="6.8" className="text-base" />
              </div>
            </div>

            {/* Costs */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Down Payment</label>
                <CurrencyInput value={downPayment} onChange={setDownPayment} placeholder="64000" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Lender Fees</label>
                <CurrencyInput value={lenderFees} onChange={setLenderFees} placeholder="1800" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Third-Party Fees</label>
                <CurrencyInput value={thirdPartyFees} onChange={setThirdPartyFees} placeholder="2500" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Points</label>
                <Input type="number" step="0.01" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="0.5" className="text-base" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">PMI Monthly</label>
                <CurrencyInput value={pmiMonthly} onChange={setPmiMonthly} placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Cash to Close</label>
                <CurrencyInput value={cashToClose} onChange={setCashToClose} placeholder="16000" />
              </div>
            </div>

            {/* Lock + toggles */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Lock Status</label>
                <select
                  value={lockStatus}
                  onChange={(e) => setLockStatus(e.target.value as "locked" | "floating")}
                  className="w-full text-base px-3 py-2 rounded-lg border border-border bg-background"
                >
                  <option value="floating">Floating</option>
                  <option value="locked">Locked</option>
                </select>
              </div>
              {lockStatus === "locked" && (
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Lock Expires</label>
                  <Input type="date" value={lockExpires} onChange={(e) => setLockExpires(e.target.value)} className="text-base" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-base text-foreground cursor-pointer">
                <input type="checkbox" checked={impounds} onChange={(e) => setImpounds(e.target.checked)} className="w-4 h-4 rounded border-border" />
                Impounds (taxes & insurance)
              </label>
              <label className="flex items-center gap-2 text-base text-foreground cursor-pointer">
                <input type="checkbox" checked={prepayPenalty} onChange={(e) => setPrepayPenalty(e.target.checked)} className="w-4 h-4 rounded border-border" />
                Prepayment penalty
              </label>
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex justify-end gap-3 shrink-0">
            <Button variant="outline" onClick={onClose} className="text-base">Cancel</Button>
            <Button
              onClick={(e) => { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); }}
              disabled={!lender || !loanAmount || !rate || isPending}
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-base"
            >
              {isPending ? "Saving..." : isEditing ? "Update Estimate" : "Add Estimate"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
