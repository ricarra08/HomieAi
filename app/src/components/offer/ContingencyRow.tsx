"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Check, Pencil, X } from "lucide-react";

interface ContingencyRowProps {
  label: string;
  hasDays?: boolean;
  defaultDays?: string;
  typicalRange?: string;
  acceptanceDate?: string;
  onConfirm?: (enabled: boolean, days: number | null) => void;
}

function computeDeadlineDate(acceptanceDate: string | undefined, days: string): string | null {
  if (!acceptanceDate || !days || Number(days) <= 0) return null;
  const d = new Date(acceptanceDate);
  d.setDate(d.getDate() + Number(days));
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function ContingencyRow({
  label,
  hasDays = true,
  defaultDays = "",
  typicalRange,
  acceptanceDate,
  onConfirm,
}: ContingencyRowProps) {
  const [days, setDays] = useState(defaultDays);
  const [confirmed, setConfirmed] = useState(false);
  const [removed, setRemoved] = useState(false);

  function handleConfirm() {
    setConfirmed(true);
    onConfirm?.(true, hasDays ? Number(days) : null);
  }

  function handleEdit() {
    setConfirmed(false);
  }

  function handleRemove() {
    setRemoved(true);
    setConfirmed(false);
    onConfirm?.(false, null);
  }

  function handleRestore() {
    setRemoved(false);
  }

  if (removed) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
        <span className="text-base text-muted-foreground line-through">{label}</span>
        <button
          onClick={handleRestore}
          className="text-sm text-accent font-medium hover:underline"
        >
          Restore
        </button>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <Check className="w-3 h-3" />
          </div>
          <span className="text-base text-foreground">{label}</span>
          {hasDays && (
            <>
              <span className="text-base text-muted-foreground">— {days} days</span>
              {computeDeadlineDate(acceptanceDate, days) && (
                <span className="text-sm text-accent font-medium">
                  · Deadline: {computeDeadlineDate(acceptanceDate, days)}
                </span>
              )}
            </>
          )}
        </div>
        <button
          onClick={handleEdit}
          className="flex items-center gap-1.5 text-sm text-accent font-medium hover:underline"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="py-3 border-b border-border last:border-0">
      <div className="flex items-center justify-between">
        <span className="text-base text-foreground font-medium">{label}</span>
        <button
          onClick={handleRemove}
          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Remove contingency"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-3 mt-2">
        {hasDays ? (
          <>
            <Input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="days"
              className="w-20 text-base text-center"
            />
            <span className="text-sm text-muted-foreground">days</span>
            {typicalRange && (
              <span className="text-sm text-muted-foreground ml-1">· Typical: {typicalRange}</span>
            )}
          </>
        ) : (
          <span className="text-sm text-muted-foreground">No timeline required</span>
        )}
        <button
          onClick={handleConfirm}
          disabled={hasDays && (!days || Number(days) <= 0)}
          className="ml-auto px-3 py-1.5 rounded-lg text-sm font-medium bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
