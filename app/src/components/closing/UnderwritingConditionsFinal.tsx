"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Loader2, Plus } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Button } from "@/components/ui/button";
import { useUpdateTransaction } from "@/lib/hooks/mutations";
import type { ClosingData } from "@/lib/hooks/use-closing-data";
import type { ClosingMetadata } from "@/lib/types";

const CONDITION_STATUSES = ["outstanding", "submitted", "cleared"] as const;
type ConditionStatus = (typeof CONDITION_STATUSES)[number];

const STATUS_STYLES: Record<ConditionStatus, { icon: React.ReactNode; className: string }> = {
  outstanding: { icon: <Circle className="w-3.5 h-3.5" />, className: "text-destructive" },
  submitted: { icon: <Loader2 className="w-3.5 h-3.5" />, className: "text-warning" },
  cleared: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, className: "text-primary-foreground" },
};

export function UnderwritingConditionsFinal({ data, transactionId, userId }: { data: ClosingData; transactionId: string; userId: string }) {
  const { meta } = data;
  const updateTransaction = useUpdateTransaction(transactionId, userId);
  const [newCondition, setNewCondition] = useState("");

  const conditions = meta.underwriting_conditions ?? [];
  const clearedCount = conditions.filter((c) => c.status === "cleared").length;
  const allCleared = conditions.length > 0 && clearedCount === conditions.length;

  function saveMeta(updated: ClosingMetadata["underwriting_conditions"]) {
    updateTransaction.mutate({ closing_metadata: { ...meta, underwriting_conditions: updated } });
  }

  function addCondition() {
    if (!newCondition.trim()) return;
    saveMeta([...conditions, { description: newCondition.trim(), status: "outstanding" }]);
    setNewCondition("");
  }

  function cycleStatus(index: number) {
    const updated = [...conditions];
    const current = updated[index].status;
    const next = current === "outstanding" ? "submitted" : current === "submitted" ? "cleared" : "outstanding";
    updated[index] = { ...updated[index], status: next };
    saveMeta(updated);
  }

  function removeCondition(index: number) {
    saveMeta(conditions.filter((_, i) => i !== index));
  }

  return (
    <CollapsibleCard title="Underwriting Conditions" subtitle={conditions.length > 0 ? `${clearedCount}/${conditions.length} cleared` : "None"}>
      <div className="space-y-3">
        {conditions.length === 0 && (
          <p className="text-sm text-muted-foreground">No outstanding underwriting conditions. Add any conditions from your lender.</p>
        )}

        {conditions.map((cond, i) => {
          const style = STATUS_STYLES[cond.status];
          return (
            <div key={i} className="flex items-center gap-2.5 group">
              <button onClick={() => cycleStatus(i)} className={`shrink-0 ${style.className}`} title="Click to cycle status">
                {style.icon}
              </button>
              <span className={`flex-1 text-sm ${cond.status === "cleared" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {cond.description}
              </span>
              <button
                onClick={() => removeCondition(i)}
                className="text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Remove
              </button>
            </div>
          );
        })}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addCondition(); }}
            placeholder="Add condition..."
            className="flex-1 bg-transparent border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <Button variant="outline" size="sm" onClick={addCondition} disabled={!newCondition.trim()}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        {allCleared && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-primary-foreground">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Clear to Close — all conditions met</span>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}
