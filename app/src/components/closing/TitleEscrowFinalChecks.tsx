"use client";

import { CheckCircle2, Eye } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/lib/store";
import { useUpdateDeal } from "@/lib/hooks/mutations";
import type { ClosingData } from "@/lib/hooks/use-closing-data";

export function TitleEscrowFinalChecks({ data, dealId, userId }: { data: ClosingData; dealId: string; userId: string }) {
  const { meta, titleReport, deal } = data;
  const updateDeal = useUpdateDeal(dealId, userId);
  const { openViewer } = useUIStore();

  function toggleAcknowledged() {
    updateDeal.mutate({ closing_metadata: { ...meta, title_acknowledged: !meta.title_acknowledged } });
  }

  return (
    <CollapsibleCard title="Title & Escrow Final Checks" subtitle={meta.title_acknowledged ? "Acknowledged" : "Review needed"}>
      <div className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Title Report</span>
            {titleReport ? (
              <Badge className="bg-primary/20 text-primary-foreground">Uploaded</Badge>
            ) : (
              <Badge className="bg-warning/10 text-warning">Missing</Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Clear Title</span>
            {meta.title_acknowledged ? (
              <Badge className="bg-primary/20 text-primary-foreground">Confirmed</Badge>
            ) : (
              <Badge className="bg-muted text-muted-foreground">Pending review</Badge>
            )}
          </div>

          {deal?.escrow_company && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Escrow Company</span>
              <span className="text-foreground">{deal.escrow_company}</span>
            </div>
          )}
        </div>

        {titleReport && titleReport.ai_summary && (
          <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground line-clamp-3">{titleReport.ai_summary.slice(0, 200)}...</p>
          </div>
        )}

        <div className="flex gap-2">
          {titleReport && (
            <Button variant="outline" size="sm" onClick={() => openViewer(titleReport.id)} className="gap-1.5">
              <Eye className="w-3.5 h-3.5" /> View Full Report
            </Button>
          )}
          <Button
            variant={meta.title_acknowledged ? "outline" : "default"}
            size="sm"
            onClick={toggleAcknowledged}
            className="gap-1.5 flex-1"
          >
            {meta.title_acknowledged && <CheckCircle2 className="w-3.5 h-3.5" />}
            {meta.title_acknowledged ? "Acknowledged" : "Acknowledge & Continue"}
          </Button>
        </div>
      </div>
    </CollapsibleCard>
  );
}
