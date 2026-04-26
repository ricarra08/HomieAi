"use client";

import { useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store";
import { useSetChosenLE } from "@/lib/hooks/mutations";
import { computeMonthlyPI, computeTotalLoanCost } from "@/lib/computed";
import { formatCurrency } from "@/lib/utils";
import type { LoanEstimate } from "@/lib/types";

type OptMode = "monthly" | "cash" | "total";

function getBestIndex(estimates: LoanEstimate[], mode: OptMode): number {
  if (estimates.length === 0) return -1;
  let bestIdx = 0;
  let bestVal = Infinity;

  estimates.forEach((le, i) => {
    let val: number;
    if (mode === "monthly") {
      val = computeMonthlyPI(le.loan_amount, le.rate) + (le.pmi_monthly ?? 0);
    } else if (mode === "cash") {
      val = le.cash_to_close ?? Infinity;
    } else {
      val = computeTotalLoanCost(le);
    }
    if (val < bestVal) { bestVal = val; bestIdx = i; }
  });

  return bestIdx;
}

interface Row {
  label: string;
  values: (string | number | null)[];
  isCurrency?: boolean;
  bestIdx?: number;
}

function buildRows(estimates: LoanEstimate[], bestIdx: number): Row[] {
  const rows: Row[] = [];

  rows.push({
    label: "Monthly P&I",
    values: estimates.map((le) => computeMonthlyPI(le.loan_amount, le.rate)),
    isCurrency: true,
    bestIdx,
  });
  rows.push({
    label: "PMI Monthly",
    values: estimates.map((le) => le.pmi_monthly ?? 0),
    isCurrency: true,
  });
  rows.push({
    label: "Total Monthly",
    values: estimates.map((le) => computeMonthlyPI(le.loan_amount, le.rate) + (le.pmi_monthly ?? 0)),
    isCurrency: true,
    bestIdx,
  });
  rows.push({
    label: "Interest Rate",
    values: estimates.map((le) => `${le.rate}%`),
  });
  rows.push({
    label: "APR",
    values: estimates.map((le) => le.apr ? `${le.apr}%` : "—"),
  });
  rows.push({
    label: "Loan Amount",
    values: estimates.map((le) => le.loan_amount),
    isCurrency: true,
  });
  rows.push({
    label: "Down Payment",
    values: estimates.map((le) => le.down_payment),
    isCurrency: true,
  });
  rows.push({
    label: "Lender Fees",
    values: estimates.map((le) => le.lender_fees),
    isCurrency: true,
  });
  rows.push({
    label: "Third-Party Fees",
    values: estimates.map((le) => le.third_party_fees),
    isCurrency: true,
  });
  rows.push({
    label: "Points",
    values: estimates.map((le) => le.points != null ? `${le.points}` : "—"),
  });
  rows.push({
    label: "Cash to Close",
    values: estimates.map((le) => le.cash_to_close),
    isCurrency: true,
    bestIdx,
  });
  rows.push({
    label: "Lock Status",
    values: estimates.map((le) => le.lock_status ?? "—"),
  });
  rows.push({
    label: "Prepay Penalty",
    values: estimates.map((le) => le.prepay_penalty ? "Yes" : "No"),
  });
  rows.push({
    label: "Total Loan Cost",
    values: estimates.map((le) => computeTotalLoanCost(le)),
    isCurrency: true,
    bestIdx,
  });

  return rows;
}

interface LEComparisonTableProps {
  estimates: LoanEstimate[];
  transactionId: string;
}

export function LEComparisonTable({ estimates, transactionId }: LEComparisonTableProps) {
  const [mode, setMode] = useState<OptMode>("monthly");
  const setChosen = useSetChosenLE(transactionId);
  const { clearLESelections, setCopilotOpen } = useUIStore();

  const bestIdx = getBestIndex(estimates, mode);
  const rows = buildRows(estimates, bestIdx);

  function handleAskHomie() {
    const names = estimates.map((le) => le.lender).join(", ");
    const msg = `Compare my ${estimates.length} loan estimates (${names}) and tell me which is the best deal overall.`;
    (window as unknown as Record<string, string>).__pendingCopilotPrefill = msg;
    setCopilotOpen(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("copilot:prefill", { detail: msg }));
    }, 150);
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Loan Estimate Comparison</h3>
        <div className="flex items-center gap-2">
          {(["monthly", "cash", "total"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {m === "monthly" ? "Lowest Monthly" : m === "cash" ? "Lowest Cash" : "Lowest Total Cost"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3 w-48" />
              {estimates.map((le, i) => (
                <th key={le.id} className={`text-center px-4 py-3 min-w-[180px] ${i === bestIdx ? "bg-primary/15" : ""}`}>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-foreground">{le.lender}</p>
                    <p className="text-sm text-muted-foreground">{le.product}</p>
                    {i === bestIdx && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Best Value
                      </span>
                    )}
                    {!le.is_chosen && (
                      <button
                        onClick={() => setChosen.mutate(le.id)}
                        className="text-xs text-accent hover:underline font-medium block mx-auto"
                      >
                        Set as Chosen
                      </button>
                    )}
                    {le.is_chosen && (
                      <span className="text-xs text-primary font-medium">Chosen</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-0">
                <td className="text-sm text-muted-foreground px-6 py-2.5">{row.label}</td>
                {row.values.map((val, i) => {
                  const isBest = row.bestIdx === i;
                  const display = row.isCurrency && typeof val === "number"
                    ? formatCurrency(val)
                    : val != null ? String(val) : "—";
                  return (
                    <td
                      key={i}
                      className={`text-center text-sm px-4 py-2.5 ${
                        isBest ? "bg-primary/15 font-semibold text-foreground" : "font-medium text-foreground"
                      }`}
                    >
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAskHomie}
          className="text-sm gap-1.5"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Ask Homie about these differences
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={clearLESelections}
          className="text-sm"
        >
          Clear Comparison
        </Button>
      </div>
    </div>
  );
}
