"use client";

import { useTransaction } from "@/lib/hooks/queries";
import { computeDaysRemaining } from "@/lib/computed";
import { isValidStateCode, STATE_LABELS } from "@/lib/state-configs";
import type { StateCode } from "@/lib/state-configs";
import { Badge } from "@/components/ui/badge";

function formatPrice(price: number): string {
  return `$${price.toLocaleString()}`;
}

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TransactionSummaryCard({ transactionId }: { transactionId: string }) {
  const { data: transaction, isLoading } = useTransaction(transactionId);

  if (isLoading || !transaction) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-1/2 mt-2" />
      </div>
    );
  }

  const daysRemaining = computeDaysRemaining(transaction.closing_date);

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-foreground">{transaction.property_address}</h3>
            {transaction.state && isValidStateCode(transaction.state) && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-secondary text-muted-foreground border border-border shrink-0">
                {STATE_LABELS[transaction.state as StateCode]}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            {transaction.closing_date && <span>Closing: {formatDate(transaction.closing_date)}</span>}
            {transaction.closing_date && <span>&middot;</span>}
            <span>Purchase Price: {formatPrice(transaction.purchase_price)}</span>
          </div>
        </div>
        <div className="text-right shrink-0 ml-4">
          {daysRemaining !== null && (
            <Badge
              className={`text-sm px-3 py-1 ${
                daysRemaining <= 7
                  ? "bg-destructive/10 text-destructive"
                  : daysRemaining <= 14
                    ? "bg-warning/10 text-warning"
                    : "bg-primary/20 text-primary-foreground"
              }`}
            >
              {daysRemaining > 0
                ? `${daysRemaining} days to close`
                : daysRemaining === 0
                  ? "Closing today"
                  : `${Math.abs(daysRemaining)} days past closing`}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
