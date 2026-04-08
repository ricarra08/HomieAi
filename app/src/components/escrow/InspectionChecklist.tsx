"use client";

import { Check, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { InlineDocUpload } from "./InlineDocUpload";
import { useDocuments } from "@/lib/hooks/queries";
import { useUIStore } from "@/lib/store";
import type { Document } from "@/lib/types";

const INSPECTION_TYPES = ["general", "pest", "roof", "hvac", "foundation"] as const;

const TYPE_LABELS: Record<string, string> = {
  general: "General Home Inspection",
  pest: "Pest / Termite",
  roof: "Roof Inspection",
  hvac: "HVAC Inspection",
  foundation: "Foundation Inspection",
};

function getInspectionType(doc: Document): string {
  const fields = doc.extracted_fields as Record<string, { value: unknown }> | null;
  const raw = fields?.inspection_type?.value;
  if (typeof raw === "string") return raw.toLowerCase();
  return "general";
}

function getMajorCount(doc: Document): number {
  const fields = doc.extracted_fields as Record<string, { value: unknown }> | null;
  const findings = fields?.major_findings?.value;
  return Array.isArray(findings) ? findings.length : 0;
}

function getCondition(doc: Document): string | null {
  const fields = doc.extracted_fields as Record<string, { value: unknown }> | null;
  const v = fields?.overall_condition?.value;
  return typeof v === "string" ? v : null;
}

export function InspectionChecklist({ dealId }: { dealId: string }) {
  const { data: documents } = useDocuments(dealId);
  const { setCopilotOpen } = useUIStore();

  const inspectionDocs = (documents ?? []).filter(
    (d) => d.doc_type === "inspection_report"
  );

  const docsByType = new Map<string, Document>();
  for (const doc of inspectionDocs) {
    const type = getInspectionType(doc);
    if (!docsByType.has(type)) docsByType.set(type, doc);
  }

  const completedCount = inspectionDocs.filter((d) => d.status === "processed").length;
  const totalFindings = inspectionDocs.reduce((sum, d) => sum + getMajorCount(d), 0);

  function handleAskHomie() {
    setCopilotOpen(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("copilot:prefill", {
        detail: "Summarize all my inspection findings. What should I prioritize for repair negotiations?",
      }));
    }, 100);
  }

  return (
    <CollapsibleCard
      title="Inspections"
      subtitle={`${completedCount} completed${totalFindings > 0 ? ` · ${totalFindings} findings` : ""}`}
    >
      <div className="space-y-3">
        {INSPECTION_TYPES.map((type) => {
          const doc = docsByType.get(type);
          const isComplete = doc?.status === "processed";
          const majorCount = doc ? getMajorCount(doc) : 0;
          const condition = doc ? getCondition(doc) : null;

          return (
            <div key={type} className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isComplete ? "bg-primary" : "border-2 border-border"}`}>
                  {isComplete && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isComplete ? "text-foreground" : "text-muted-foreground"}`}>
                    {TYPE_LABELS[type]}
                  </p>
                  {isComplete && (
                    <div className="flex items-center gap-2 mt-0.5">
                      {condition && (
                        <Badge className={`text-xs ${
                          condition === "good" ? "bg-primary/20 text-primary-foreground"
                            : condition === "fair" ? "bg-amber-50 text-amber-700"
                              : "bg-destructive/10 text-destructive"
                        }`}>
                          {condition}
                        </Badge>
                      )}
                      {majorCount > 0 && (
                        <span className="text-xs text-destructive font-medium">
                          {majorCount} major finding{majorCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Inline doc upload/link per type */}
              <div className="ml-8">
                <InlineDocUpload
                  dealId={dealId}
                  existingDoc={doc ?? null}
                  label={`Drop ${TYPE_LABELS[type].toLowerCase()} report`}
                />
              </div>
            </div>
          );
        })}

        {totalFindings > 0 && (
          <Button variant="outline" size="sm" onClick={handleAskHomie} className="text-sm gap-1.5 w-full mt-2">
            <MessageCircle className="w-3.5 h-3.5" />
            Ask Homie about findings
          </Button>
        )}
      </div>
    </CollapsibleCard>
  );
}
