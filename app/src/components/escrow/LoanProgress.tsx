"use client";

import { Check, Lock } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { useLoanEstimates, useDocuments } from "@/lib/hooks/queries";
import { computeDaysRemaining, computeMonthlyPI } from "@/lib/computed";
import { formatCurrency } from "@/lib/utils";

export function LoanProgress({ dealId }: { dealId: string }) {
  const { data: estimates } = useLoanEstimates(dealId);
  const { data: documents } = useDocuments(dealId);

  const chosen = estimates?.find((le) => le.is_chosen);
  const hasPreApproval = (documents ?? []).some((d) => d.doc_type === "pre_approval");
  const lockDays = chosen?.lock_expires ? computeDaysRemaining(chosen.lock_expires) : null;

  const items = [
    {
      label: "Pre-Approval",
      done: hasPreApproval,
      detail: hasPreApproval ? "Letter uploaded" : "Not uploaded yet",
    },
    {
      label: "Loan Estimate Chosen",
      done: !!chosen,
      detail: chosen ? `${chosen.lender} — ${chosen.rate}% (${chosen.product})` : "Select a loan estimate in Financing",
    },
    {
      label: "Rate Lock",
      done: chosen?.lock_status === "locked",
      detail: chosen?.lock_status === "locked"
        ? lockDays !== null
          ? lockDays > 0
            ? `Locked — ${lockDays} days remaining`
            : "Lock expired"
          : "Locked"
        : "Floating or not set",
      urgency: lockDays !== null && lockDays <= 7 && lockDays > 0 ? "warning" : lockDays !== null && lockDays <= 0 ? "destructive" : null,
    },
  ];

  return (
    <CollapsibleCard title="Loan Financing" subtitle={chosen ? chosen.lender : "No loan selected"}>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={item.label} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${item.done ? "bg-primary" : "border-2 border-border"}`}>
              {item.done && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${item.done ? "text-foreground" : "text-muted-foreground"}`}>
                {item.label}
              </p>
              <p className={`text-xs ${item.urgency === "destructive" ? "text-destructive" : item.urgency === "warning" ? "text-warning" : "text-muted-foreground"}`}>
                {item.detail}
              </p>
            </div>
            {item.label === "Rate Lock" && chosen?.lock_status === "locked" && (
              <Lock className="w-4 h-4 text-primary shrink-0" />
            )}
          </div>
        ))}

        {chosen && (
          <div className="pt-3 mt-2 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly P&I</span>
              <span className="font-medium text-foreground">{formatCurrency(computeMonthlyPI(chosen.loan_amount, chosen.rate))}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Loan Amount</span>
              <span className="font-medium text-foreground">{formatCurrency(chosen.loan_amount)}</span>
            </div>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}
