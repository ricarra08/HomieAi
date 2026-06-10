"use client";

import { CheckCircle2, Shield } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Button } from "@/components/ui/button";
import { useUpdateTransaction } from "@/lib/hooks/mutations";
import { resolveCashToClose } from "@/lib/computed";
import { formatCurrency } from "@/lib/utils";
import type { ClosingData } from "@/lib/hooks/use-closing-data";
import type { ClosingMetadata } from "@/lib/types";

export function CashToCloseFinalizer({ data, transactionId, userId }: { data: ClosingData; transactionId: string; userId: string }) {
  const { chosenLE, transaction, meta } = data;
  const updateTransaction = useUpdateTransaction(transactionId, userId);

  const cdFields = (data.cdDocument?.extracted_fields as Record<string, unknown> | null) ?? null;
  const { amount: cashToClose, source } = resolveCashToClose(cdFields, chosenLE, {
    earnestMoney: transaction?.earnest_money_amount ?? 0,
  });
  const isEstimate = source === "loan_estimate_estimate";

  function toggleConfirmed() {
    const updated: Partial<ClosingMetadata> = { ...meta, cash_to_close_confirmed: !meta.cash_to_close_confirmed };
    updateTransaction.mutate({ closing_metadata: updated });
  }

  const wireDueDate = transaction?.closing_date
    ? (() => { const d = new Date(transaction.closing_date); d.setDate(d.getDate() - 1); return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); })()
    : null;

  return (
    <CollapsibleCard title="Cash to Close" subtitle={cashToClose != null ? formatCurrency(cashToClose) : "—"}>
      <div className="space-y-4">
        {cashToClose != null && (
          <div className="text-center py-3">
            <p className="text-3xl font-bold text-foreground">{formatCurrency(cashToClose)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {isEstimate ? "Estimated from your Loan Estimate" : "Final amount from your Closing Disclosure"}
            </p>
            {isEstimate && (
              <p className="text-xs text-warning mt-1">
                Estimate only — excludes prepaids, escrow reserves, and taxes. Use the figure on your Closing Disclosure for the actual wire.
              </p>
            )}
          </div>
        )}

        {isEstimate && chosenLE && (
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
            {transaction?.earnest_money_amount && transaction.earnest_money_amount > 0 && (
              <div className="flex justify-between text-primary-foreground">
                <span>Less: Earnest Money Deposit</span>
                <span>-{formatCurrency(transaction.earnest_money_amount)}</span>
              </div>
            )}
          </div>
        )}

        {data.stateConfig && (
          <div className="border-t border-border pt-2 mt-2 space-y-2 text-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">State-Specific Costs ({data.stateConfig.state_name})</p>
            {data.stateConfig.taxes.transfer_tax.exists ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transfer Tax (${data.stateConfig.taxes.transfer_tax.rate_per_thousand}/K)</span>
                <span className="text-foreground">{data.stateConfig.taxes.transfer_tax.paid_by} pays</span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transfer Tax</span>
                <span className="text-emerald-600">None in {data.stateConfig.state_name}</span>
              </div>
            )}
            {data.stateConfig.taxes.mortgage_tax.exists ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mortgage Tax (${data.stateConfig.taxes.mortgage_tax.rate_per_thousand}/K)</span>
                <span className="text-foreground">{data.stateConfig.taxes.mortgage_tax.paid_by} pays</span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mortgage Tax</span>
                <span className="text-emerald-600">None in {data.stateConfig.state_name}</span>
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

        {transaction?.escrow_company && (
          <div className="text-sm">
            <p className="text-muted-foreground">Escrow: <span className="text-foreground">{transaction.escrow_company}</span></p>
            {transaction.escrow_contact && <p className="text-muted-foreground">Contact: <span className="text-foreground">{transaction.escrow_contact}</span></p>}
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
