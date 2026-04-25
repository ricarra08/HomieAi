"use client";

import { Calendar, MapPin, Check, CheckCircle2 } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Button } from "@/components/ui/button";
import { useUpdateDeal } from "@/lib/hooks/mutations";
import type { ClosingData } from "@/lib/hooks/use-closing-data";
import type { ClosingMetadata } from "@/lib/types";

const WHAT_TO_BRING = [
  "Government-issued photo ID (driver's license or passport)",
  "Cashier's check or wire confirmation receipt",
  "Any outstanding documents requested by lender or escrow",
  "Blue ink pen for signing",
];

export function SigningAppointment({ data, dealId, userId }: { data: ClosingData; dealId: string; userId: string }) {
  const { meta } = data;
  const updateDeal = useUpdateDeal(dealId, userId);

  function updateMeta(patch: Partial<ClosingMetadata>) {
    updateDeal.mutate({ closing_metadata: { ...meta, ...patch } });
  }

  return (
    <CollapsibleCard title="Signing Appointment" subtitle={meta.signing_confirmed ? "Confirmed" : "Not scheduled"}>
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Date & Time</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="datetime-local"
                value={meta.signing_date ?? ""}
                onChange={(e) => updateMeta({ signing_date: e.target.value || null })}
                className="flex-1 bg-transparent border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Location</label>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={meta.signing_location ?? ""}
                onChange={(e) => updateMeta({ signing_location: e.target.value || null })}
                placeholder="e.g., Title company office"
                className="flex-1 bg-transparent border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">What to Bring</p>
          {WHAT_TO_BRING.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>

        <Button
          variant={meta.signing_confirmed ? "outline" : "default"}
          size="sm"
          onClick={() => updateMeta({ signing_confirmed: !meta.signing_confirmed })}
          className="w-full gap-1.5"
        >
          {meta.signing_confirmed && <CheckCircle2 className="w-3.5 h-3.5" />}
          {meta.signing_confirmed ? "Appointment Confirmed" : "Confirm Appointment"}
        </Button>
      </div>
    </CollapsibleCard>
  );
}
