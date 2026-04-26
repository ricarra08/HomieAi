"use client";

import { Clock, DollarSign, Check, CheckCircle2 } from "lucide-react";
import { WORKSPACE_PHASES, WORKSPACE_CONTINGENCIES } from "./data";

export function WorkspacePreview() {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Phase stepper */}
      <div className="bg-secondary border-b border-border shadow-sm px-6 py-4">
        <div className="flex items-center">
          {WORKSPACE_PHASES.map((phase, i) => {
            const Icon = phase.icon;
            const isLast = i === WORKSPACE_PHASES.length - 1;
            return (
              <div key={phase.label} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      phase.done
                        ? "bg-primary text-primary-foreground"
                        : phase.active
                          ? "bg-accent text-accent-foreground"
                          : "bg-card text-muted-foreground border border-border"
                    }`}
                  >
                    {phase.done ? (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium whitespace-nowrap ${
                      phase.active || phase.done
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {phase.label}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className={`flex-1 h-[2px] mx-4 rounded-full ${
                      WORKSPACE_PHASES[i + 1].done
                        ? "bg-primary"
                        : WORKSPACE_PHASES[i + 1].active
                          ? "bg-accent"
                          : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
          <div className="ml-auto pl-6 shrink-0">
            <span className="text-sm font-semibold text-destructive whitespace-nowrap">
              18 days to close
            </span>
          </div>
        </div>
      </div>

      {/* Deal header */}
      <div className="px-6 py-3 border-b border-border bg-card">
        <p className="text-sm font-semibold text-foreground">
          12847 Magnolia Drive, Tampa FL 33601
        </p>
        <p className="text-xs text-muted-foreground">
          $427,500 · Accepted Oct 15, 2025 · Closes Nov 22, 2025
        </p>
      </div>

      {/* Widgets grid */}
      <div className="grid grid-cols-2 gap-4 p-4">
        {/* Contingency countdown */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Clock className="w-3.5 h-3.5 text-warning" />
            <p className="text-xs font-semibold text-foreground">
              Contingency Countdown
            </p>
          </div>
          <div className="space-y-2.5">
            {WORKSPACE_CONTINGENCIES.map((c) => (
              <div key={c.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {c.label}
                  </span>
                  <span className={`text-xs font-semibold ${c.textClass}`}>
                    {c.days}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.barClass}`}
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnest money */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <DollarSign className="w-3.5 h-3.5 text-accent" />
            <p className="text-xs font-semibold text-foreground">
              Earnest Money
            </p>
          </div>
          <p className="text-2xl font-semibold text-foreground">$8,500</p>
          <div className="flex items-center gap-1.5 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">
              Held in Escrow
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Confirmed Oct 18, 2025
          </p>
          <div className="mt-3 flex items-center gap-1">
            {["Sent", "Confirmed", "In Escrow"].map((s, idx) => (
              <div key={s} className="flex items-center gap-1">
                {idx > 0 && <div className="h-px w-3 bg-primary" />}
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">{s}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
