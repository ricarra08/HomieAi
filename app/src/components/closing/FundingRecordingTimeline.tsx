"use client";

import { CheckCircle2, Circle, Loader2, Key } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Button } from "@/components/ui/button";
import { useUpdateTransaction } from "@/lib/hooks/mutations";
import type { ClosingData } from "@/lib/hooks/use-closing-data";

const STEP_ICONS: Record<string, React.ReactNode> = {
  pending: <Circle className="w-5 h-5 text-muted-foreground" />,
  "in-progress": <Loader2 className="w-5 h-5 text-accent animate-spin" />,
  complete: <CheckCircle2 className="w-5 h-5 text-primary-foreground" />,
};

export function FundingRecordingTimeline({
  data,
  transactionId,
  userId,
  onKeysReceived,
}: {
  data: ClosingData;
  transactionId: string;
  userId: string;
  onKeysReceived: () => void;
}) {
  const { meta } = data;
  const updateTransaction = useUpdateTransaction(transactionId, userId);
  const steps = meta.funding_steps;

  const completedCount = steps.filter((s) => s.status === "complete").length;
  const allComplete = completedCount === steps.length;

  function advanceStep(index: number) {
    const updated = [...steps];
    const current = updated[index].status;
    const next = current === "pending" ? "in-progress" : current === "in-progress" ? "complete" : "pending";
    updated[index] = {
      ...updated[index],
      status: next,
      date: next === "complete" ? new Date().toISOString().split("T")[0] : updated[index].date,
    };
    updateTransaction.mutate({ closing_metadata: { ...meta, funding_steps: updated } });
  }

  return (
    <CollapsibleCard title="Funding & Recording" subtitle={`${completedCount}/${steps.length} complete`}>
      <div className="space-y-4">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <div key={step.step} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <button onClick={() => advanceStep(i)} className="shrink-0" title="Click to advance">
                  {STEP_ICONS[step.status]}
                </button>
                {!isLast && (
                  <div className={`w-0.5 h-6 mt-1 ${step.status === "complete" ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${step.status === "complete" ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.step}
                </p>
                {step.date && step.status === "complete" && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(step.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {allComplete ? (
          <Button onClick={onKeysReceived} className="w-full gap-2">
            <Key className="w-4 h-4" />
            I&apos;ve Picked Up the Keys!
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground text-center">Click each step icon to advance its status.</p>
        )}
      </div>
    </CollapsibleCard>
  );
}
