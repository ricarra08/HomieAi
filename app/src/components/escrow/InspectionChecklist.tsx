"use client";

import { Check, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { InlineDocUpload } from "./InlineDocUpload";
import { useUIStore } from "@/lib/store";
import {
  INSPECTION_SUBTYPES,
  INSPECTION_SUBTYPE_LABELS,
  isInspectionSubtype,
} from "@/lib/documents/inspection-subtype";
import type { Document } from "@/lib/types";

function getInspectionType(doc: Document): string {
  const fields = doc.extracted_fields as Record<string, { value: unknown }> | null;
  const raw = fields?.inspection_type?.value;
  if (typeof raw === "string") {
    if (isInspectionSubtype(raw)) return raw;
    const lower = raw.toLowerCase();
    if (lower.includes("pest") || lower.includes("termite")) return "pest";
    if (lower.includes("roof")) return "roof";
    if (lower.includes("hvac") || lower.includes("heating") || lower.includes("cooling")) return "hvac";
    if (lower.includes("foundation") || lower.includes("structural")) return "foundation";
  }
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

interface InspectionChecklistProps {
  dealId: string;
  inspectionDocs: Document[];
  allDocs: Document[];
}

export function InspectionChecklist({ dealId, inspectionDocs, allDocs }: InspectionChecklistProps) {
  const { setCopilotOpen } = useUIStore();

  const docsByType = new Map<string, Document>();
  const sorted = [...inspectionDocs].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
  for (const doc of sorted) {
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
        {INSPECTION_SUBTYPES.map((type) => {
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
                    {INSPECTION_SUBTYPE_LABELS[type]}
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

              <div className="ml-8">
                <InlineDocUpload
                  dealId={dealId}
                  existingDoc={doc ?? null}
                  allDocs={allDocs}
                  label={`Drop ${INSPECTION_SUBTYPE_LABELS[type].toLowerCase()} report`}
                  uploadHints={{ docType: "inspection_report", category: "inspections", stage: "escrow", inspectionSubtype: type }}
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
