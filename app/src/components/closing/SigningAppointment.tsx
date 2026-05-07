"use client";

import { useState } from "react";
import { Calendar, MapPin, Check, CheckCircle2 } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Button } from "@/components/ui/button";
import { useUpdateTransaction } from "@/lib/hooks/mutations";
import { getSigningNote } from "@/lib/state-configs";
import type { ClosingData } from "@/lib/hooks/use-closing-data";
import type { ClosingMetadata } from "@/lib/types";

const WHAT_TO_BRING = [
  "Government-issued photo ID (driver's license or passport)",
  "Cashier's check or wire confirmation receipt",
  "Any outstanding documents requested by lender or escrow",
  "Blue ink pen for signing",
];

export function SigningAppointment({ data, transactionId, userId }: { data: ClosingData; transactionId: string; userId: string }) {
  const { meta } = data;
  const updateTransaction = useUpdateTransaction(transactionId, userId);
  const [localDate, setLocalDate] = useState(meta.signing_date ?? "");
  const [localLocation, setLocalLocation] = useState(meta.signing_location ?? "");

  function updateMeta(patch: Partial<ClosingMetadata>) {
    updateTransaction.mutate({ closing_metadata: { ...meta, ...patch } });
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
                value={localDate}
                onChange={(e) => setLocalDate(e.target.value)}
                onBlur={() => updateMeta({ signing_date: localDate || null })}
                className="flex-1 bg-transparent border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Location</label>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <AddressAutocomplete
                value={localLocation}
                onChange={(val) => setLocalLocation(val)}
                onBlur={() => updateMeta({ signing_location: localLocation || null })}
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

        {data.stateConfig && (
          <div className="bg-muted/30 rounded-lg p-3 space-y-1.5">
            <p className="text-sm text-foreground">{getSigningNote(data.stateConfig.closing.style)}</p>
            {data.stateConfig.closing.ron_available && (
              <p className="text-xs text-muted-foreground">Remote Online Notarization (RON) is available in {data.stateConfig.state_name}.</p>
            )}
          </div>
        )}

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
