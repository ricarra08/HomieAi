"use client";

import { AlertTriangle, CheckCircle2, MessageCircle, Info, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store";
import { computeLEVariance, type LEVarianceRow } from "@/lib/computed";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { LoanEstimate, Document } from "@/lib/types";

function formatValue(row: LEVarianceRow, value: number): string {
  return row.kind === "percent" ? formatPercent(value) : formatCurrency(value);
}

function formatDelta(row: LEVarianceRow): string {
  const sign = row.delta > 0 ? "+" : row.delta < 0 ? "-" : "";
  const abs = Math.abs(row.delta);
  return row.kind === "percent"
    ? `${sign}${formatPercent(abs)}`
    : `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
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
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
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
  const hasNoteworthy = variances.some((v) => v.noteworthy);

  function handleAskHomie() {
    const msg = "Explain the differences between my Loan Estimate and Closing Disclosure. Are any of the changes concerning?";
    (window as unknown as Record<string, string>).__pendingCopilotPrefill = msg;
    setCopilotOpen(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("copilot:prefill", { detail: msg }));
    }, 150);
  }

  return (
    <div className={`bg-card rounded-xl border ${hasIssues ? "border-destructive/50" : "border-border"} shadow-sm overflow-hidden`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasIssues ? (
            <AlertTriangle className="w-5 h-5 text-destructive" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          )}
          <h3 className="text-base font-semibold text-foreground">LE vs CD Comparison</h3>
          {hasIssues && (
            <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
              Tolerance exceeded
            </span>
          )}
          {!hasIssues && hasNoteworthy && (
            <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
              Review recommended
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
            <tr key={v.field} className={`border-b border-border last:border-0 ${!v.toleranceOk ? "bg-destructive/5" : v.noteworthy ? "bg-warning/5" : ""}`}>
              <td className="text-sm text-foreground px-6 py-2.5">{v.field}</td>
              <td className="text-sm text-muted-foreground text-right px-4 py-2.5">{formatValue(v, v.leValue)}</td>
              <td className="text-sm text-foreground font-medium text-right px-4 py-2.5">{formatValue(v, v.cdValue)}</td>
              <td className={`text-sm font-medium text-right px-6 py-2.5 ${!v.toleranceOk ? "text-destructive" : v.noteworthy ? "text-warning" : v.delta > 0 ? "text-warning" : "text-emerald-600"}`}>
                {formatDelta(v)}
                {!v.toleranceOk && <AlertTriangle className="w-3.5 h-3.5 inline ml-1" />}
                {v.noteworthy && <Eye className="w-3.5 h-3.5 inline ml-1" />}
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
            Under TILA-RESPA (TRID), certain fees have tolerance limits. Fees exceeding $100 or 10% from the original estimate may require your lender to cover the difference. Changes over $250 that are within tolerance are flagged for your review — they&apos;re legal, but worth understanding. Any increase in your interest rate, or an APR increase beyond 1/8% (0.125 pts), is also flagged — confirm it with your lender before signing.
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
