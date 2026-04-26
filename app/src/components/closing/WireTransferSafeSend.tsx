"use client";

import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Button } from "@/components/ui/button";
import { InlineDocUpload } from "@/components/escrow/InlineDocUpload";
import { useUpdateTransaction } from "@/lib/hooks/mutations";
import { useDocuments } from "@/lib/hooks/queries";
import { computeCashToClose } from "@/lib/computed";
import { formatCurrency } from "@/lib/utils";
import type { ClosingData } from "@/lib/hooks/use-closing-data";
import type { ClosingMetadata } from "@/lib/types";

const VERIFICATION_STEPS = [
  "I received wire instructions directly from my escrow officer",
  "I verbally confirmed the instructions by calling a number I independently verified",
  "I understand wire fraud is irreversible and I will NEVER wire based on email alone",
];

export function WireTransferSafeSend({ data, transactionId, userId }: { data: ClosingData; transactionId: string; userId: string }) {
  const { meta, chosenLE, transaction } = data;
  const updateTransaction = useUpdateTransaction(transactionId, userId);
  const { data: allDocs } = useDocuments(transactionId);

  const wireAmount = computeCashToClose(chosenLE, { earnestMoney: transaction?.earnest_money_amount ?? 0 });
  const allVerified = meta.wire_verified_steps.every(Boolean);
  const isWired = meta.wire_status === "wired" || meta.wire_status === "confirmed";

  const receiptDoc = meta.wire_receipt_doc_id
    ? (allDocs ?? []).find((d) => d.id === meta.wire_receipt_doc_id) ?? null
    : null;

  const canMarkWired = allVerified && !!receiptDoc;

  function toggleStep(index: number) {
    const updated = [...meta.wire_verified_steps] as [boolean, boolean, boolean];
    updated[index] = !updated[index];
    const patch: Partial<ClosingMetadata> = { ...meta, wire_verified_steps: updated };
    updateTransaction.mutate({ closing_metadata: patch });
  }

  function handleReceiptUploaded(docId: string) {
    updateTransaction.mutate({ closing_metadata: { ...meta, wire_receipt_doc_id: docId } });
  }

  function markWired() {
    updateTransaction.mutate({ closing_metadata: { ...meta, wire_status: "wired" } });
  }

  return (
    <CollapsibleCard title="Wire Transfer SafeSend" subtitle={isWired ? "Wired" : "Pending"}>
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-destructive/10 border-2 border-destructive/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">Wire Fraud Prevention</p>
              <p className="text-xs text-destructive/80 mt-1">
                Wire fraud is the #1 risk in real estate closings. Scammers impersonate escrow officers via email with fake wire instructions. Once funds are wired, they are typically unrecoverable.
              </p>
            </div>
          </div>
        </div>

        {wireAmount != null && (
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Wire Amount</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(wireAmount)}</p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Verification Steps</p>
          {VERIFICATION_STEPS.map((step, i) => (
            <label key={i} className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={meta.wire_verified_steps[i]}
                onChange={() => toggleStep(i)}
                disabled={isWired}
                className="w-4 h-4 rounded border-border mt-0.5 shrink-0"
              />
              <span className={`text-sm ${meta.wire_verified_steps[i] ? "text-foreground" : "text-muted-foreground"}`}>
                {step}
              </span>
            </label>
          ))}
        </div>

        {!isWired && (
          <InlineDocUpload
            transactionId={transactionId}
            existingDoc={receiptDoc}
            allDocs={allDocs ?? []}
            label="Upload wire receipt"
            uploadHints={{ docType: "other", category: "closing", stage: "closing" }}
            onDocUploaded={handleReceiptUploaded}
          />
        )}

        {isWired ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-primary-foreground">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Wire transfer marked as sent</span>
          </div>
        ) : (
          <Button
            onClick={markWired}
            disabled={!canMarkWired}
            className="w-full gap-1.5"
            variant={canMarkWired ? "default" : "outline"}
          >
            <Shield className="w-3.5 h-3.5" />
            {!allVerified
              ? "Complete all verification steps first"
              : !receiptDoc
                ? "Upload wire receipt before marking as wired"
                : "Mark as Wired"}
          </Button>
        )}
      </div>
    </CollapsibleCard>
  );
}
