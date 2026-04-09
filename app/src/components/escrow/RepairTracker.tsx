"use client";

import { useState } from "react";
import { Plus, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { useCreateRepairItem, useUpdateRepairItem } from "@/lib/hooks/mutations";
import { formatCurrency } from "@/lib/utils";
import type { RepairItem } from "@/lib/types";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  major: "bg-destructive/10 text-destructive",
  minor: "bg-amber-50 text-amber-700",
  cosmetic: "bg-muted text-muted-foreground",
};

function RepairRow({ item, dealId }: { item: RepairItem; dealId: string }) {
  const updateRepair = useUpdateRepairItem(dealId);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <Wrench className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{item.description}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {item.severity && (
            <Badge className={`${SEVERITY_STYLES[item.severity] ?? ""} text-xs`}>{item.severity}</Badge>
          )}
          {item.category && (
            <Badge className="bg-muted text-muted-foreground text-xs">{item.category}</Badge>
          )}
          {item.estimated_cost != null && (
            <span className="text-xs text-muted-foreground">Est. {formatCurrency(item.estimated_cost)}</span>
          )}
          {item.agreed_cost != null && (
            <span className="text-xs text-primary font-medium">Agreed: {formatCurrency(item.agreed_cost)}</span>
          )}
        </div>
      </div>
      <select
        value={item.status}
        onChange={(e) => updateRepair.mutate({ itemId: item.id, updates: { status: e.target.value } })}
        className="text-xs px-2 py-1 rounded-lg border border-border bg-background shrink-0"
      >
        <option value="pending">Pending</option>
        <option value="requested">Requested</option>
        <option value="agreed">Agreed</option>
        <option value="declined">Declined</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
}

interface RepairTrackerProps {
  dealId: string;
  repairItems: RepairItem[];
  isLoading?: boolean;
}

export function RepairTracker({ dealId, repairItems, isLoading }: RepairTrackerProps) {
  const createRepair = useCreateRepairItem(dealId);
  const [showAdd, setShowAdd] = useState(false);
  const [desc, setDesc] = useState("");
  const [cost, setCost] = useState("");

  const totalEstimated = repairItems.reduce((s, r) => s + (r.estimated_cost ?? 0), 0);
  const totalAgreed = repairItems.reduce((s, r) => s + (r.agreed_cost ?? 0), 0);

  function handleAdd() {
    if (!desc.trim()) return;
    createRepair.mutate(
      { description: desc, estimated_cost: cost ? Number(cost) : undefined },
      { onSuccess: () => { setDesc(""); setCost(""); setShowAdd(false); } }
    );
  }

  return (
    <CollapsibleCard
      title="Repairs & Credits"
      subtitle={`${repairItems.length} item${repairItems.length !== 1 ? "s" : ""}`}
    >
      <div className="space-y-3">
        {isLoading ? (
          <div className="h-20 bg-muted rounded-lg animate-pulse" />
        ) : repairItems.length > 0 ? (
          <>
            {repairItems.map((item) => <RepairRow key={item.id} item={item} dealId={dealId} />)}
            <div className="flex items-center justify-between pt-3 border-t border-border text-sm">
              <span className="text-muted-foreground">Total Estimated</span>
              <span className="font-medium text-foreground">{formatCurrency(totalEstimated)}</span>
            </div>
            {totalAgreed > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Agreed</span>
                <span className="font-semibold text-primary">{formatCurrency(totalAgreed)}</span>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground py-2 text-center">
            No repair items yet. Add items from inspection findings or manually.
          </p>
        )}

        {showAdd ? (
          <div className="flex items-end gap-2 pt-2">
            <div className="flex-1 space-y-1">
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Repair description" className="text-sm" />
            </div>
            <div className="w-28 space-y-1">
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Cost" className="text-sm pl-5" />
              </div>
            </div>
            <Button size="sm" onClick={handleAdd} disabled={createRepair.isPending || !desc.trim()} className="bg-accent text-accent-foreground text-sm">
              Add
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)} className="text-sm">
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)} className="text-sm gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add Repair Item
          </Button>
        )}
      </div>
    </CollapsibleCard>
  );
}
