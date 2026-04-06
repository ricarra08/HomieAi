"use client";

import { useDeal } from "@/lib/hooks/queries";
import { computeDaysRemaining } from "@/lib/computed";
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

export function DealSummaryCard({ dealId }: { dealId: string }) {
  const { data: deal, isLoading } = useDeal(dealId);

  if (isLoading || !deal) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-1/2 mt-2" />
      </div>
    );
  }

  const daysRemaining = computeDaysRemaining(deal.closing_date);

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{deal.property_address}</h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            {deal.closing_date && <span>Closing: {formatDate(deal.closing_date)}</span>}
            {deal.closing_date && <span>&middot;</span>}
            <span>Purchase Price: {formatPrice(deal.purchase_price)}</span>
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
