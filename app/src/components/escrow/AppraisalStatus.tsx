"use client";

import { Home, AlertTriangle, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { InlineDocUpload } from "./InlineDocUpload";
import { useUIStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import type { Document, Transaction } from "@/lib/types";

function getAppraisedValue(doc: Document): number | null {
  const fields = doc.extracted_fields as Record<string, { value: unknown }> | null;
  if (!fields?.appraised_value) return null;
  const v = fields.appraised_value.value;
  return typeof v === "number" ? v : null;
}

interface AppraisalStatusProps {
  transactionId: string;
  appraisalDoc: Document | null;
  transaction: Transaction | null;
  allDocs: Document[];
}

export function AppraisalStatus({ transactionId, appraisalDoc, transaction, allDocs }: AppraisalStatusProps) {
  const { setCopilotOpen } = useUIStore();

  const isProcessed = appraisalDoc?.status === "processed";
  const appraisedValue = isProcessed && appraisalDoc ? getAppraisedValue(appraisalDoc) : null;
  const purchasePrice = transaction?.purchase_price ?? 0;
  const gap = appraisedValue != null ? purchasePrice - appraisedValue : null;
  const hasGap = gap != null && gap > 0;

  function handleAskHomie() {
    setCopilotOpen(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("copilot:prefill", {
        detail: hasGap
          ? "My appraisal came in below the purchase price. What are my options?"
          : "Explain my appraisal results and what they mean for my purchase.",
      }));
    }, 100);
  }

  return (
    <CollapsibleCard title="Appraisal" subtitle="Property valuation">
      <div className="space-y-4">
        <InlineDocUpload transactionId={transactionId} existingDoc={appraisalDoc} allDocs={allDocs} label="Drop appraisal report here" uploadHints={{ docType: "appraisal", category: "appraisal", stage: "escrow" }} />

        {appraisedValue != null && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Appraised Value</span>
              </div>
              <span className="text-xl font-semibold text-foreground">{formatCurrency(appraisedValue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Purchase Price</span>
              <span className="text-sm font-medium text-foreground">{formatCurrency(purchasePrice)}</span>
            </div>
            <div className={`flex items-center justify-between py-2 px-3 rounded-lg ${hasGap ? "bg-destructive/5" : "bg-primary/5"}`}>
              <div className="flex items-center gap-2">
                {hasGap && <AlertTriangle className="w-4 h-4 text-destructive" />}
                <span className="text-sm font-medium">{hasGap ? "Appraisal Gap" : "No Gap"}</span>
              </div>
              <span className={`text-sm font-semibold ${hasGap ? "text-destructive" : "text-emerald-600"}`}>
                {hasGap ? `-${formatCurrency(gap)}` : "At or above value"}
              </span>
            </div>
            {hasGap && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Options: renegotiate price, make up the difference in cash, or challenge the appraisal.
              </p>
            )}
          </>
        )}

        {!appraisalDoc && (
          <Badge className="bg-amber-50 text-amber-700 text-xs">Awaiting Appraisal</Badge>
        )}

        {isProcessed && (
          <Button variant="outline" size="sm" onClick={handleAskHomie} className="text-sm gap-1.5 w-full">
            <MessageCircle className="w-3.5 h-3.5" />
            Ask Homie about the appraisal
          </Button>
        )}
      </div>
    </CollapsibleCard>
  );
}
