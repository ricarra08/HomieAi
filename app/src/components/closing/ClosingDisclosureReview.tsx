"use client";

import { FileText, MessageCircle } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/lib/store";
import { useUpdateDeal } from "@/lib/hooks/mutations";
import { computeLEVariance, computeDaysRemaining } from "@/lib/computed";
import { formatCurrency } from "@/lib/utils";
import type { ClosingData } from "@/lib/hooks/use-closing-data";
import type { ClosingMetadata } from "@/lib/types";

function computeBusinessDaysRemaining(uploadDate: string): number {
  const uploaded = new Date(uploadDate);
  let bDays = 0;
  const d = new Date(uploaded);
  while (bDays < 3) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) bDays++;
  }
  const remaining = computeDaysRemaining(d.toISOString().split("T")[0]);
  return remaining ?? 0;
}

export function ClosingDisclosureReview({ data, dealId, userId }: { data: ClosingData; dealId: string; userId: string }) {
  const { cdDocument, chosenLE, meta } = data;
  const updateDeal = useUpdateDeal(dealId, userId);
  const { openViewer, setCopilotOpen } = useUIStore();

  function toggleCDConfirmed() {
    const updated: Partial<ClosingMetadata> = { ...meta, cd_received_confirmed: !meta.cd_received_confirmed };
    updateDeal.mutate({ closing_metadata: updated });
  }

  const variance = chosenLE && cdDocument?.extracted_fields
    ? computeLEVariance(chosenLE, cdDocument.extracted_fields as Record<string, unknown>)
    : [];

  const waitDays = cdDocument ? computeBusinessDaysRemaining(cdDocument.created_at) : null;

  function handleExplain() {
    setCopilotOpen(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("copilot:prefill", {
        detail: "Explain the differences between my Loan Estimate and Closing Disclosure. Are any variances concerning?",
      }));
    }, 100);
  }

  return (
    <CollapsibleCard title="Closing Disclosure Review" subtitle={cdDocument ? "Received" : "Pending"}>
      <div className="space-y-4">
        {!cdDocument ? (
          <p className="text-sm text-muted-foreground">Upload your Closing Disclosure in the Documents tab to begin review.</p>
        ) : (
          <>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={meta.cd_received_confirmed}
                onChange={toggleCDConfirmed}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm font-medium">I have received and reviewed the CD</span>
            </label>

            {waitDays !== null && waitDays > 0 && (
              <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                <p className="text-sm text-muted-foreground">
                  3-business-day waiting period: <span className="font-medium text-foreground">{waitDays} day{waitDays !== 1 ? "s" : ""} remaining</span>
                </p>
              </div>
            )}

            {variance.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">LE vs CD Variance</p>
                {variance.map((v) => (
                  <div key={v.field} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{v.field}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{formatCurrency(v.leValue)}</span>
                      <span className="text-foreground font-medium">→</span>
                      <span className={v.toleranceOk ? "text-foreground" : "text-destructive font-medium"}>{formatCurrency(v.cdValue)}</span>
                      {!v.toleranceOk && <Badge className="bg-destructive/10 text-destructive text-xs">Flag</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {variance.length === 0 && chosenLE && (
              <p className="text-sm text-muted-foreground">No variances detected between LE and CD.</p>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openViewer(cdDocument.id)} className="gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Open CD
              </Button>
              {variance.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleExplain} className="gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" /> Explain Differences
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </CollapsibleCard>
  );
}
