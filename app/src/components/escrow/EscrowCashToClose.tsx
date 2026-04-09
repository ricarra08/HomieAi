"use client";

import { DollarSign, ArrowRight } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Button } from "@/components/ui/button";
import { computeMonthlyPI, computeCashToClose } from "@/lib/computed";
import { formatCurrency } from "@/lib/utils";
import { useUIStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import type { LoanEstimate, Deal, Document } from "@/lib/types";

interface EscrowCashToCloseProps {
  chosenLE: LoanEstimate | null;
  deal: Deal | null;
  cdDocument: Document | null;
}

export function EscrowCashToClose({ chosenLE, deal, cdDocument }: EscrowCashToCloseProps) {
  const { setActiveSidebarItem } = useUIStore();
  const router = useRouter();

  if (!chosenLE || !deal) return null;

  const monthlyPI = computeMonthlyPI(chosenLE.loan_amount, chosenLE.rate);
  const totalMonthly = monthlyPI + (chosenLE.pmi_monthly ?? 0);
  const earnestMoney = deal.earnest_money_amount ?? 0;
  const cashToClose = computeCashToClose(chosenLE, { earnestMoney });

  const cdFields = cdDocument?.extracted_fields as Record<string, unknown> | null;
  let cdCashToClose: number | null = null;
  if (cdFields) {
    const raw = cdFields.final_cash_to_close ?? cdFields.cash_to_close;
    if (typeof raw === "number") cdCashToClose = raw;
    else if (raw && typeof raw === "object" && "value" in raw) {
      const v = (raw as { value: unknown }).value;
      if (typeof v === "number") cdCashToClose = v;
    }
  }

  const displayCash = cdCashToClose ?? cashToClose;

  function goToFinancing() {
    setActiveSidebarItem("financing");
    router.push("/financing");
  }

  return (
    <CollapsibleCard title="Cash to Close Summary" subtitle={chosenLE.lender}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-accent" />
            <span className="text-sm text-muted-foreground">
              {cdCashToClose != null ? "Final (from CD)" : "Estimated"}
            </span>
          </div>
          <span className="text-2xl font-semibold text-foreground">{formatCurrency(displayCash)}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly P&I</span>
            <span className="font-medium">{formatCurrency(monthlyPI)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rate</span>
            <span className="font-medium">{chosenLE.rate}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Monthly</span>
            <span className="font-medium">{formatCurrency(totalMonthly)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Loan Amount</span>
            <span className="font-medium">{formatCurrency(chosenLE.loan_amount)}</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToFinancing}
          className="text-sm gap-1.5"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          View full breakdown in Financing
        </Button>
      </div>
    </CollapsibleCard>
  );
}
