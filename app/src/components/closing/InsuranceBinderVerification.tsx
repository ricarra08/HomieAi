"use client";

import { Shield, CheckCircle2 } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Badge } from "@/components/ui/badge";
import { InlineDocUpload } from "@/components/escrow/InlineDocUpload";
import { useCreateInsuranceInfo, useUpdateInsuranceInfo } from "@/lib/hooks/mutations";
import { useDocuments } from "@/lib/hooks/queries";
import { formatCurrency } from "@/lib/utils";
import type { ClosingData } from "@/lib/hooks/use-closing-data";

const BINDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  requested: "Requested",
  received: "Received",
  bound: "Bound",
  verified: "Verified",
};

export function InsuranceBinderVerification({ data, dealId }: { data: ClosingData; dealId: string }) {
  const { insuranceInfo, insuranceBinder } = data;
  const { data: allDocs } = useDocuments(dealId);
  const createInsurance = useCreateInsuranceInfo(dealId);
  const updateInsurance = useUpdateInsuranceInfo(dealId);

  const isBound = insuranceInfo?.binder_status === "bound" || insuranceInfo?.binder_status === "verified";

  function handleMarkBound() {
    if (insuranceInfo) {
      updateInsurance.mutate({ infoId: insuranceInfo.id, updates: { binder_status: "bound" } });
    } else {
      createInsurance.mutate({ carrier: "Unknown", binder_status: "bound" });
    }
  }

  return (
    <CollapsibleCard title="Insurance Binder" subtitle={isBound ? "Bound" : "Pending"}>
      <div className="space-y-4">
        {insuranceInfo ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Carrier</span>
              <span className="text-foreground">{insuranceInfo.carrier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge className={isBound ? "bg-primary/20 text-primary-foreground" : "bg-warning/10 text-warning"}>
                {BINDER_STATUS_LABELS[insuranceInfo.binder_status] ?? insuranceInfo.binder_status}
              </Badge>
            </div>
            {insuranceInfo.annual_premium && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Annual Premium</span>
                <span className="text-foreground">{formatCurrency(insuranceInfo.annual_premium)}</span>
              </div>
            )}
            {insuranceInfo.effective_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Effective Date</span>
                <span className="text-foreground">{new Date(insuranceInfo.effective_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            )}
            {insuranceInfo.mortgagee_clause && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mortgagee Clause</span>
                <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No insurance information on file. Upload your binder or enter details.</p>
        )}

        <InlineDocUpload
          dealId={dealId}
          existingDoc={insuranceBinder ?? null}
          allDocs={allDocs ?? []}
          label="Drop insurance binder"
          uploadHints={{ docType: "insurance_binder", category: "insurance", stage: "closing" }}
        />

        {!isBound && (
          <button
            onClick={handleMarkBound}
            className="text-sm text-accent hover:underline font-medium"
          >
            Mark as Bound
          </button>
        )}

        {isBound && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20 text-primary-foreground">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium">Insurance binder verified — premium included in closing costs</span>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}
