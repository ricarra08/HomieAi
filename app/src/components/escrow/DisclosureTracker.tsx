"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { InlineDocUpload } from "./InlineDocUpload";
import { useDocuments } from "@/lib/hooks/queries";

const REQUIRED_DISCLOSURES = [
  { key: "tds", label: "Transfer Disclosure Statement (TDS)" },
  { key: "nhd", label: "Natural Hazard Disclosure (NHD)" },
  { key: "lead_paint", label: "Lead-Based Paint Disclosure" },
  { key: "hoa", label: "HOA Documents (if applicable)" },
];

export function DisclosureTracker({ dealId }: { dealId: string }) {
  const { data: documents } = useDocuments(dealId);

  const disclosureDocs = (documents ?? []).filter(
    (d) => d.category === "disclosures" || d.doc_type === "disclosure"
  );

  const uploadedCount = disclosureDocs.length;

  return (
    <CollapsibleCard
      title="Disclosures"
      subtitle={`${uploadedCount} uploaded`}
    >
      <div className="space-y-3">
        {REQUIRED_DISCLOSURES.map((disc) => {
          const matchingDoc = disclosureDocs.find(
            (d) => d.name.toLowerCase().includes(disc.key) ||
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
                  <p className={`text-sm font-medium ${isUploaded ? "text-foreground" : "text-muted-foreground"}`}>
                    {disc.label}
                  </p>
                  {!isUploaded && <Badge className="bg-muted text-muted-foreground text-xs">Missing</Badge>}
                </div>
              </div>
              <div className="ml-8">
                <InlineDocUpload
                  dealId={dealId}
                  existingDoc={matchingDoc ?? null}
                  label={`Drop ${disc.label.split("(")[0].trim().toLowerCase()}`}
                />
              </div>
            </div>
          );
        })}

        {/* Extra uploaded disclosures not in the required list */}
        {disclosureDocs
          .filter((d) => !REQUIRED_DISCLOSURES.some((r) => d.name.toLowerCase().includes(r.key)))
          .map((doc) => (
            <div key={doc.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                </div>
                <p className="text-sm font-medium text-foreground flex-1">{doc.name}</p>
              </div>
              <div className="ml-8">
                <InlineDocUpload dealId={dealId} existingDoc={doc} label="Additional disclosure" />
              </div>
            </div>
          ))}
      </div>
    </CollapsibleCard>
  );
}
