"use client";

import { DollarSign, Check, Clock } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Button } from "@/components/ui/button";
import { useUpdateTransaction } from "@/lib/hooks/mutations";
import { computeDaysRemaining } from "@/lib/computed";
import { formatCurrency } from "@/lib/utils";
import type { Transaction, Deadline } from "@/lib/types";

const STATUS_STEPS = ["pending", "sent", "confirmed", "held"] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  sent: "Sent",
  confirmed: "Confirmed",
  held: "Held in Escrow",
};

function StatusStepper({ current }: { current: string | null }) {
  const currentIdx = STATUS_STEPS.indexOf((current ?? "pending") as typeof STATUS_STEPS[number]);

  return (
    <div className="flex items-center gap-1">
      {STATUS_STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const isLast = i === STATUS_STEPS.length - 1;

        return (
          <div key={step} className="flex items-center gap-1">
            <div className="flex items-center gap-1.5">
              {done ? (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                </div>
              ) : active ? (
                <div className="w-5 h-5 rounded-full border-2 border-accent relative">
                  <div className="absolute inset-0.5 rounded-full bg-accent animate-pulse" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-border" />
              )}
              <span className={`text-xs font-medium ${done ? "text-foreground" : active ? "text-accent" : "text-muted-foreground"}`}>
                {STATUS_LABELS[step]}
              </span>
            </div>
            {!isLast && (
              <div className={`w-6 h-0.5 rounded-full ${done ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface EarnestMoneyTrackerProps {
  transaction: Transaction;
  userId: string;
  emdDeadline?: Deadline | null;
}

function computeEmdDueDate(transaction: Transaction, emdDeadline?: Deadline | null): string | null {
  if (emdDeadline) return emdDeadline.due_date;
  if (!transaction.contract_acceptance_date) return null;
  // Default: EMD due 3 business days after acceptance
  const start = new Date(transaction.contract_acceptance_date);
  let bizDays = 0;
  while (bizDays < 3) {
    start.setDate(start.getDate() + 1);
    const day = start.getDay();
    if (day !== 0 && day !== 6) bizDays++;
  }
  return start.toISOString().split("T")[0];
}

export function EarnestMoneyTracker({ transaction, userId, emdDeadline }: EarnestMoneyTrackerProps) {
  const updateTransaction = useUpdateTransaction(transaction.id, userId);

  const status = transaction.earnest_money_status ?? "pending";

  function advanceStatus() {
    const next = status === "pending" ? "sent" : status === "sent" ? "confirmed" : status === "confirmed" ? "held" : null;
    if (next) updateTransaction.mutate({ earnest_money_status: next });
  }

  const nextLabel = status === "pending" ? "Mark as Sent" : status === "sent" ? "Mark as Confirmed" : status === "confirmed" ? "Mark as Held" : null;

  return (
    <CollapsibleCard title="Earnest Money Deposit" subtitle="Track your good-faith deposit">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-accent" />
            <span className="text-sm text-muted-foreground">Deposit Amount</span>
          </div>
          <span className="text-2xl font-semibold text-foreground">
            {formatCurrency(transaction.earnest_money_amount)}
          </span>
        </div>

        <StatusStepper current={status} />

        {status !== "confirmed" && status !== "held" && (() => {
          const emdDue = computeEmdDueDate(transaction, emdDeadline);
          if (!emdDue) return null;
          const days = computeDaysRemaining(emdDue);
          if (days === null) return null;
          const dueDate = new Date(emdDue).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${days <= 3 ? "bg-destructive/5" : "bg-amber-50"}`}>
              <Clock className={`w-4 h-4 ${days <= 3 ? "text-destructive" : "text-amber-600"}`} />
              <span className={`text-sm font-medium ${days <= 3 ? "text-destructive" : "text-amber-700"}`}>
                {days <= 0 ? "EMD deposit overdue!" : `Due by ${dueDate} (${days} day${days !== 1 ? "s" : ""} left)`}
              </span>
            </div>
          );
        })()}

        {(transaction.escrow_company || transaction.escrow_contact) && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Escrow Company</p>
            {transaction.escrow_company && <p className="text-sm font-medium text-foreground">{transaction.escrow_company}</p>}
            {transaction.escrow_contact && <p className="text-sm text-muted-foreground">{transaction.escrow_contact}</p>}
          </div>
        )}

        {nextLabel && (
          <Button
            onClick={advanceStatus}
            disabled={updateTransaction.isPending}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {updateTransaction.isPending ? "Updating..." : nextLabel}
          </Button>
        )}
      </div>
    </CollapsibleCard>
  );
}
