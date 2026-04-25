"use client";

import { CheckCircle2, Shield } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Button } from "@/components/ui/button";
import { useUpdateDeal } from "@/lib/hooks/mutations";
import { computeCashToClose } from "@/lib/computed";
import { formatCurrency } from "@/lib/utils";
import type { ClosingData } from "@/lib/hooks/use-closing-data";
import type { ClosingMetadata } from "@/lib/types";

export function CashToCloseFinalizer({ data, dealId, userId }: { data: ClosingData; dealId: string; userId: string }) {
  const { chosenLE, deal, meta } = data;
  const updateDeal = useUpdateDeal(dealId, userId);

  const cashToClose = computeCashToClose(chosenLE, {
    earnestMoney: deal?.earnest_money_amount ?? 0,
  });

  function toggleConfirmed() {
    const updated: Partial<ClosingMetadata> = { ...meta, cash_to_close_confirmed: !meta.cash_to_close_confirmed };
    updateDeal.mutate({ closing_metadata: updated });
  }

  const wireDueDate = deal?.closing_date
    ? (() => { const d = new Date(deal.closing_date); d.setDate(d.getDate() - 1); return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); })()
    : null;

  return (
    <CollapsibleCard title="Cash to Close" subtitle={cashToClose != null ? formatCurrency(cashToClose) : "—"}>
      <div className="space-y-4">
        {cashToClose != null && (
          <div className="text-center py-3">
            <p className="text-3xl font-bold text-foreground">{formatCurrency(cashToClose)}</p>
            <p className="text-sm text-muted-foreground mt-1">Total amount due at closing</p>
          </div>
        )}

        {chosenLE && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Down Payment</span>
              <span className="text-foreground">{formatCurrency(chosenLE.down_payment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lender Fees</span>
              <span className="text-foreground">{formatCurrency(chosenLE.lender_fees)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Third-Party Fees</span>
              <span className="text-foreground">{formatCurrency(chosenLE.third_party_fees)}</span>
            </div>
            {chosenLE.points && chosenLE.points > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Points ({chosenLE.points}%)</span>
                <span className="text-foreground">{formatCurrency((chosenLE.points / 100) * chosenLE.loan_amount)}</span>
              </div>
            )}
            {deal?.earnest_money_amount && deal.earnest_money_amount > 0 && (
              <div className="flex justify-between text-primary-foreground">
                <span>Less: Earnest Money Deposit</span>
                <span>-{formatCurrency(deal.earnest_money_amount)}</span>
              </div>
            )}
          </div>
        )}

        {wireDueDate && (
          <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
            <p className="text-sm text-muted-foreground">
              Wire must be received by <span className="font-medium text-foreground">{wireDueDate}</span>
            </p>
          </div>
        )}

        {deal?.escrow_company && (
          <div className="text-sm">
            <p className="text-muted-foreground">Escrow: <span className="text-foreground">{deal.escrow_company}</span></p>
            {deal.escrow_contact && <p className="text-muted-foreground">Contact: <span className="text-foreground">{deal.escrow_contact}</span></p>}
          </div>
        )}

        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <Shield className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-xs text-destructive">Always verify wire instructions by phone before sending.</p>
        </div>

        <Button
          variant={meta.cash_to_close_confirmed ? "outline" : "default"}
          size="sm"
          onClick={toggleConfirmed}
          className="w-full gap-1.5"
        >
          {meta.cash_to_close_confirmed && <CheckCircle2 className="w-3.5 h-3.5" />}
          {meta.cash_to_close_confirmed ? "Amount Confirmed" : "Confirm Amount"}
        </Button>
      </div>
    </CollapsibleCard>
  );
}
