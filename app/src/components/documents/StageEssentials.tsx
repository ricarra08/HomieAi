"use client";

import { CheckCircle, Circle, AlertCircle } from "lucide-react";
import type { Document } from "@/lib/types";

const ESSENTIAL_TYPES = [
  { docType: "purchase_contract", label: "Purchase Contract" },
  { docType: "loan_estimate", label: "Loan Estimate" },
  { docType: "pre_approval", label: "Pre-Approval Letter" },
  { docType: "inspection_report", label: "Inspection Report" },
  { docType: "appraisal", label: "Appraisal" },
  { docType: "title_report", label: "Title Report" },
  { docType: "closing_disclosure", label: "Closing Disclosure" },
  { docType: "insurance_binder", label: "Insurance Binder" },
];

interface StageEssentialsProps {
  documents: Document[];
}

export function StageEssentials({ documents }: StageEssentialsProps) {
  const uploadedTypes = new Set(documents.map((d) => d.doc_type).filter(Boolean));

  const items = ESSENTIAL_TYPES.map((e) => ({
    ...e,
    received: uploadedTypes.has(e.docType),
  }));

  const received = items.filter((i) => i.received).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((received / total) * 100) : 0;

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Stage Essentials</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Key documents for your transaction
          </p>
        </div>
        <div className="text-right">
          <span className="text-base font-semibold text-foreground">
            {received} of {total}
          </span>
          <span className="text-sm text-muted-foreground ml-1.5">{pct}%</span>
        </div>
      </div>

      <div className="w-full bg-muted rounded-full h-1.5 mb-4">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {items.map((item) => (
          <div key={item.docType} className="flex items-center gap-2 py-1">
            {item.received ? (
              <CheckCircle className="w-4 h-4 text-success shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
            )}
            <span
              className={`text-sm ${
                item.received ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {received < total && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
          <AlertCircle className="w-4 h-4 text-warning shrink-0" />
          <span className="text-sm text-muted-foreground">
            {total - received} essential document{total - received > 1 ? "s" : ""} still needed
          </span>
        </div>
      )}
    </div>
  );
}
