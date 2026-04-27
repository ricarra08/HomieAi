"use client";

import { useState } from "react";
import { AlertTriangle, MessageCircle, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { useCreateRepairItem } from "@/lib/hooks/mutations";
import { useUIStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import type { Document, RepairItem } from "@/lib/types";

interface Finding {
  description: string;
  severity: string;
  location: string | null;
  estimated_cost: number | null;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  major: "bg-destructive/10 text-destructive",
  minor: "bg-amber-50 text-amber-700",
  cosmetic: "bg-muted text-muted-foreground",
};

interface RedFlagSummaryProps {
  transactionId: string;
  inspectionDocs: Document[];
  repairItems: RepairItem[];
}

export function RedFlagSummary({ transactionId, inspectionDocs, repairItems }: RedFlagSummaryProps) {
  const createRepair = useCreateRepairItem(transactionId);
  const { setCopilotOpen } = useUIStore();
  const [addedFindings, setAddedFindings] = useState<Set<string>>(new Set());

  const processedDocs = inspectionDocs.filter((d) => d.status === "processed" && d.extracted_fields);

  const allFindings: (Finding & { docName: string; docId: string })[] = [];
  for (const doc of processedDocs) {
    const fields = doc.extracted_fields as Record<string, { value: unknown }>;
    const majors = fields?.major_findings?.value;
    if (Array.isArray(majors)) {
      for (const f of majors as Finding[]) {
        allFindings.push({ ...f, docName: doc.name, docId: doc.id });
      }
    }
  }

  if (allFindings.length === 0) return null;

  const totalCost = allFindings.reduce((sum, f) => sum + (f.estimated_cost ?? 0), 0);
  const criticalCount = allFindings.filter((f) => f.severity === "critical" || f.severity === "major").length;
  const existingDescriptions = new Set(repairItems.map((r) => r.description));
  const uniqueSeverities = new Set(allFindings.map((f) => f.severity));
  const allSameSeverity = uniqueSeverities.size === 1;

  function handleCreateRepair(finding: Finding, docId: string, index: number) {
    createRepair.mutate(
      {
        description: finding.description,
        category: undefined,
        estimated_cost: finding.estimated_cost ?? undefined,
        severity: finding.severity as "critical" | "major" | "minor" | "cosmetic" | undefined,
        source_document_id: docId,
      },
      {
        onSuccess: () => setAddedFindings((prev) => new Set(prev).add(String(index))),
      }
    );
  }

  function handleAskHomie() {
    setCopilotOpen(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("copilot:prefill", {
        detail: "Summarize the major findings from my inspection reports. Which ones should I prioritize for repair negotiations?",
      }));
    }, 100);
  }

  return (
    <CollapsibleCard
      title="Inspection Red Flags"
      subtitle={`${allFindings.length} major finding${allFindings.length !== 1 ? "s" : ""} found`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-destructive/5 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {allSameSeverity
                ? `${allFindings.length} ${[...uniqueSeverities][0]} issue${allFindings.length !== 1 ? "s" : ""}`
                : `${criticalCount} critical/major issue${criticalCount !== 1 ? "s" : ""}`}
            </span>
          </div>
          {totalCost > 0 && (
            <span className="text-sm font-semibold text-destructive">
              Est. {formatCurrency(totalCost)}
            </span>
          )}
        </div>

        {allFindings.map((f, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
            {!allSameSeverity && (
              <Badge className={`${SEVERITY_STYLES[f.severity] ?? SEVERITY_STYLES.minor} text-xs shrink-0 mt-0.5`}>
                {f.severity}
              </Badge>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{f.description}</p>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                {f.location && <span>{f.location}</span>}
                {f.estimated_cost != null && f.estimated_cost > 0 && (
                  <>
                    {f.location && <span>&middot;</span>}
                    <span>~{formatCurrency(f.estimated_cost)}</span>
                  </>
                )}
              </div>
            </div>
            {addedFindings.has(String(i)) || existingDescriptions.has(f.description) ? (
              <div className="p-1 shrink-0" title="Added to repairs">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
            ) : (
              <button
                onClick={() => handleCreateRepair(f, f.docId, i)}
                disabled={createRepair.isPending}
                className="px-2 py-1 rounded-lg text-xs font-medium text-accent border border-accent/30 hover:bg-accent/10 shrink-0 transition-colors"
              >
                Add to repairs
              </button>
            )}
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={handleAskHomie}
          className="text-sm gap-1.5"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Ask Homie about these findings
        </Button>
      </div>
    </CollapsibleCard>
  );
}
