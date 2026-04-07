"use client";

import { AlertTriangle, CheckCircle2, MessageCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store";
import { computeLEVariance } from "@/lib/computed";
import { formatCurrency } from "@/lib/utils";
import type { LoanEstimate, Document } from "@/lib/types";

function formatDelta(delta: number): string {
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : "";
  return `${sign}$${Math.abs(delta).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

interface LEvsCDProps {
  chosenLE: LoanEstimate;
  cdDocument: Document;
}

export function LEvsCD({ chosenLE, cdDocument }: LEvsCDProps) {
  const { setCopilotOpen } = useUIStore();
  const cdFields = cdDocument.extracted_fields as Record<string, unknown> | null;
  const variances = computeLEVariance(chosenLE, cdFields);

  if (!cdFields || variances.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">LE vs CD Comparison</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {cdFields
            ? "No significant variances between your Loan Estimate and Closing Disclosure. All values are within tolerance."
            : "Closing Disclosure has not been fully processed yet. Upload and process the CD to see the comparison."}
        </p>
      </div>
    );
  }

  const hasIssues = variances.some((v) => !v.toleranceOk);

  function handleAskHomie() {
    setCopilotOpen(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("copilot:prefill", {
        detail: "Explain the differences between my Loan Estimate and Closing Disclosure. Are any of the changes concerning?",
      }));
    }, 100);
  }

  return (
    <div className={`bg-card rounded-xl border ${hasIssues ? "border-destructive/50" : "border-border"} shadow-sm overflow-hidden`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasIssues ? (
            <AlertTriangle className="w-5 h-5 text-destructive" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-primary" />
          )}
          <h3 className="text-base font-semibold text-foreground">LE vs CD Comparison</h3>
          {hasIssues && (
            <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
              Tolerance exceeded
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Field</th>
            <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Loan Estimate</th>
            <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Closing Disclosure</th>
            <th className="text-right text-sm font-medium text-muted-foreground px-6 py-3">Change</th>
          </tr>
        </thead>
        <tbody>
          {variances.map((v) => (
            <tr key={v.field} className={`border-b border-border last:border-0 ${!v.toleranceOk ? "bg-destructive/5" : ""}`}>
              <td className="text-sm text-foreground px-6 py-2.5">{v.field}</td>
              <td className="text-sm text-muted-foreground text-right px-4 py-2.5">{formatCurrency(v.leValue)}</td>
              <td className="text-sm text-foreground font-medium text-right px-4 py-2.5">{formatCurrency(v.cdValue)}</td>
              <td className={`text-sm font-medium text-right px-6 py-2.5 ${!v.toleranceOk ? "text-destructive" : v.delta > 0 ? "text-warning" : "text-primary"}`}>
                {formatDelta(v.delta)}
                {!v.toleranceOk && <AlertTriangle className="w-3.5 h-3.5 inline ml-1" />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border space-y-3">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Under TILA-RESPA (TRID), certain fees have tolerance limits. Fees exceeding $100 or 10% from the original estimate may require your lender to cover the difference.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAskHomie}
          className="text-sm gap-1.5"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Ask Homie to explain these changes
        </Button>
      </div>
    </div>
  );
}
