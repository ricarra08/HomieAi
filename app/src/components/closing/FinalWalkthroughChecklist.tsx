"use client";

import { CheckCircle2 } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { useUpdateDeal } from "@/lib/hooks/mutations";
import type { ClosingData } from "@/lib/hooks/use-closing-data";
import type { ClosingMetadata } from "@/lib/types";

const WALKTHROUGH_ROOMS = [
  { id: "kitchen", label: "Kitchen — appliances, plumbing, countertops" },
  { id: "bathrooms", label: "Bathrooms — fixtures, water pressure, drains" },
  { id: "bedrooms", label: "Bedrooms — closets, windows, walls" },
  { id: "living", label: "Living areas — floors, lighting, outlets" },
  { id: "exterior", label: "Exterior — roof, siding, landscaping, drainage" },
  { id: "garage", label: "Garage — door opener, walls, floor" },
  { id: "hvac", label: "HVAC — heating, cooling, thermostat" },
  { id: "electrical", label: "Electrical — panel, outlets, switches" },
  { id: "plumbing", label: "Plumbing — water heater, main shutoff" },
  { id: "repairs", label: "Agreed repairs completed and verified" },
];

export function FinalWalkthroughChecklist({ data, dealId, userId }: { data: ClosingData; dealId: string; userId: string }) {
  const { meta } = data;
  const updateDeal = useUpdateDeal(dealId, userId);
  const items = meta.walkthrough_items;

  const checkedCount = Object.values(items).filter(Boolean).length;
  const total = WALKTHROUGH_ROOMS.length;
  const allDone = checkedCount === total;

  function toggleItem(id: string) {
    const updated: Partial<ClosingMetadata> = {
      ...meta,
      walkthrough_items: { ...items, [id]: !items[id] },
    };
    updateDeal.mutate({ closing_metadata: updated });
  }

  return (
    <CollapsibleCard title="Final Walkthrough" subtitle={`${checkedCount} of ${total} checked`}>
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">Walk through the property 24–48 hours before closing to verify condition.</p>

        {WALKTHROUGH_ROOMS.map((room) => (
          <label key={room.id} className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={!!items[room.id]}
              onChange={() => toggleItem(room.id)}
              className="w-4 h-4 rounded border-border mt-0.5 shrink-0"
            />
            <span className={`text-sm ${items[room.id] ? "text-foreground" : "text-muted-foreground"}`}>
              {room.label}
            </span>
          </label>
        ))}

        {allDone && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-primary-foreground">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Walkthrough complete</span>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}
