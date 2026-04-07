"use client";

import { Check, Star, BarChart3, FileText, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store";
import { useSetChosenLE } from "@/lib/hooks/mutations";
import { computeMonthlyPI } from "@/lib/computed";
import { formatCurrency } from "@/lib/utils";
import type { LoanEstimate } from "@/lib/types";

interface LECardProps {
  le: LoanEstimate;
  dealId: string;
  isSelected: boolean;
  onEdit: (le: LoanEstimate) => void;
}

export function LECard({ le, dealId, isSelected, onEdit }: LECardProps) {
  const setChosen = useSetChosenLE(dealId);
  const { toggleLESelection, openViewer } = useUIStore();
  const selectedLEIds = useUIStore((s) => s.selectedLEIds);

  const monthlyPI = computeMonthlyPI(le.loan_amount, le.rate);
  const totalMonthly = monthlyPI + (le.pmi_monthly ?? 0);

  const borderClass = le.is_chosen
    ? "border-primary border-2"
    : isSelected
      ? "border-accent border-2"
      : "border-border";

  return (
    <div className={`bg-card rounded-xl ${borderClass} shadow-sm p-6 flex flex-col`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">{le.lender}</h3>
          <p className="text-sm text-muted-foreground">{le.product}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {le.is_chosen && (
            <Badge className="bg-primary/20 text-primary-foreground text-xs gap-1">
              <Check className="w-3 h-3" />
              Chosen
            </Badge>
          )}
          {le.lock_status && (
            <Badge className={`text-xs ${le.lock_status === "locked" ? "bg-primary/20 text-primary-foreground" : "bg-amber-50 text-amber-700"}`}>
              {le.lock_status === "locked" ? "Locked" : "Floating"}
            </Badge>
          )}
        </div>
      </div>

      {/* Key numbers */}
      <div className="space-y-3 flex-1">
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-muted-foreground">Rate</span>
          <span className="text-2xl font-semibold text-foreground">{le.rate}%</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-muted-foreground">APR</span>
          <span className="text-base font-medium text-foreground">{le.apr ?? "—"}%</span>
        </div>
        <div className="border-t border-border pt-3 flex justify-between items-baseline">
          <span className="text-sm text-muted-foreground">Monthly P&I</span>
          <span className="text-base font-semibold text-foreground">{formatCurrency(monthlyPI)}</span>
        </div>
        {le.pmi_monthly != null && le.pmi_monthly > 0 && (
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">+ PMI</span>
            <span className="text-sm text-muted-foreground">{formatCurrency(le.pmi_monthly)}/mo</span>
          </div>
        )}
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-muted-foreground">Total Monthly</span>
          <span className="text-base font-semibold text-foreground">{formatCurrency(totalMonthly)}</span>
        </div>
        <div className="border-t border-border pt-3 flex justify-between items-baseline">
          <span className="text-sm text-muted-foreground">Cash to Close</span>
          <span className="text-lg font-semibold text-foreground">{formatCurrency(le.cash_to_close)}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-muted-foreground">Loan Amount</span>
          <span className="text-sm text-foreground">{formatCurrency(le.loan_amount)}</span>
        </div>
        {le.lender_fees != null && (
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Lender Fees</span>
            <span className="text-sm text-foreground">{formatCurrency(le.lender_fees)}</span>
          </div>
        )}
        {le.prepay_penalty && (
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-destructive">Prepay Penalty</span>
            <span className="text-sm text-destructive">Yes</span>
          </div>
        )}
      </div>

      {/* Auto-extracted banner */}
      {le.pdf_document_id && (
        <div className="mt-4 bg-accent/5 rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-accent font-medium">Auto-extracted from PDF</span>
          <button
            onClick={() => onEdit(le)}
            className="text-xs text-accent hover:underline font-medium"
          >
            Review
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
        {!le.is_chosen && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setChosen.mutate(le.id)}
            disabled={setChosen.isPending}
            className="text-sm gap-1.5 flex-1"
          >
            <Star className="w-3.5 h-3.5" />
            Set as Chosen
          </Button>
        )}
        <Button
          size="sm"
          variant={isSelected ? "default" : "outline"}
          onClick={() => toggleLESelection(le.id)}
          disabled={!isSelected && selectedLEIds.length >= 3}
          className={`text-sm gap-1.5 flex-1 ${isSelected ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          {isSelected ? "Selected" : "Compare"}
        </Button>
        {le.pdf_document_id && (
          <button
            onClick={() => openViewer(le.pdf_document_id!)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            title="View PDF"
          >
            <FileText className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onEdit(le)}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          title="More"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
