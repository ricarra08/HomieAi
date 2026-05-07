"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { InlineDocUpload } from "./InlineDocUpload";
import type { Document } from "@/lib/types";
import type { StateConfig } from "@/lib/state-configs";

const REQUIRED_DISCLOSURES = [
  { key: "tds", label: "Transfer Disclosure Statement (TDS)", required: true },
  { key: "nhd", label: "Natural Hazard Disclosure (NHD)", required: true },
  { key: "lead_paint", label: "Lead-Based Paint Disclosure", required: true },
  { key: "hoa", label: "HOA Documents", required: false },
];

interface DisclosureTrackerProps {
  transactionId: string;
  disclosureDocs: Document[];
  allDocs: Document[];
  stateConfig?: StateConfig | null;
}

export function DisclosureTracker({ transactionId, disclosureDocs, allDocs, stateConfig }: DisclosureTrackerProps) {
  const disclosures = stateConfig
    ? stateConfig.disclosures.map((d) => ({
        key: d.short_name.toLowerCase().replace(/\s+/g, "_"),
        label: d.name,
        required: d.required,
        legal_reference: d.legal_reference,
        who_provides: d.who_provides,
      }))
    : REQUIRED_DISCLOSURES;

  return (
    <CollapsibleCard
      title="Disclosures"
      subtitle={`${disclosureDocs.length} uploaded`}
    >
      <div className="space-y-3">
        {disclosures.map((disc) => {
          const matchingDoc = disclosureDocs.find(
            (d) => d.name.toLowerCase().includes(disc.key) ||
              d.name.toLowerCase().includes(disc.label?.toLowerCase().split("(")[0].trim() ?? "") ||
              (d.extracted_fields && JSON.stringify(d.extracted_fields).toLowerCase().includes(disc.key))
          );
          const isUploaded = !!matchingDoc;

          return (
            <div key={disc.key} className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isUploaded ? "bg-primary" : "border-2 border-border"}`}>
                  {isUploaded && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isUploaded ? "text-foreground" : "text-muted-foreground"}`}>
                      {disc.label}{!disc.required && " (if applicable)"}
                    </p>
                    {"legal_reference" in disc && (disc as { legal_reference?: string }).legal_reference && (
                      <p className="text-xs text-muted-foreground">{(disc as { legal_reference?: string }).legal_reference}</p>
                    )}
                  </div>
                  {!isUploaded && disc.required && <Badge className="bg-muted text-muted-foreground text-xs">Missing</Badge>}
                  {!isUploaded && !disc.required && <Badge className="bg-muted/50 text-muted-foreground/70 text-xs">Optional</Badge>}
                </div>
              </div>
              <div className="ml-8">
                <InlineDocUpload
                  transactionId={transactionId}
                  existingDoc={matchingDoc ?? null}
                  allDocs={allDocs}
                  uploadHints={{ docType: "disclosure", category: "disclosures", stage: "escrow" }}
                  label={`Drop ${disc.label.split("(")[0].trim().toLowerCase()}`}
                />
              </div>
            </div>
          );
        })}

        {disclosureDocs
          .filter((d) => !REQUIRED_DISCLOSURES.some((r) => d.name.toLowerCase().includes(r.key)) &&
            !disclosures.some((disc) => d.name.toLowerCase().includes(disc.key) || d.name.toLowerCase().includes(disc.label?.toLowerCase().split("(")[0].trim() ?? "")))
          .map((doc) => (
            <div key={doc.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                </div>
                <p className="text-sm font-medium text-foreground flex-1">{doc.name}</p>
              </div>
              <div className="ml-8">
                <InlineDocUpload transactionId={transactionId} existingDoc={doc} allDocs={allDocs} label="Additional disclosure" uploadHints={{ docType: "disclosure", category: "disclosures", stage: "escrow" }} />
              </div>
            </div>
          ))}
      </div>
    </CollapsibleCard>
  );
}
