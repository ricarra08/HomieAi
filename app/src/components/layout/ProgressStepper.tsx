"use client";

import { useUIStore, type Phase } from "@/lib/store";
import { Search, FilePen, ShieldCheck, Key, LineChart, Check } from "lucide-react";

const steps: { id: Phase; label: string; icon: React.ElementType }[] = [
  { id: "shopping", label: "Shopping", icon: Search },
  { id: "offer", label: "Offer", icon: FilePen },
  { id: "escrow", label: "Escrow", icon: ShieldCheck },
  { id: "closing", label: "Closing", icon: Key },
  { id: "post-close", label: "Post-Close", icon: LineChart },
];

const phaseOrder: Phase[] = ["shopping", "offer", "escrow", "closing", "post-close"];

function getStepState(step: Phase, current: Phase): "completed" | "current" | "future" {
  const stepIdx = phaseOrder.indexOf(step);
  const currentIdx = phaseOrder.indexOf(current);
  if (stepIdx < currentIdx) return "completed";
  if (stepIdx === currentIdx) return "current";
  return "future";
}

export function ProgressStepper() {
  const currentPhase = useUIStore((s) => s.currentPhase);

  return (
    <div className="h-[72px] bg-secondary border-b border-border shadow-sm flex items-center justify-center px-8">
      <div className="flex items-center max-w-[1024px] w-full">
        {steps.map((step, i) => {
          const state = getStepState(step.id, currentPhase);
          const Icon = step.icon;
          const isLast = i === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    state === "completed"
                      ? "bg-primary text-primary-foreground"
                      : state === "current"
                        ? "bg-accent text-accent-foreground"
                        : "bg-card text-muted-foreground border border-border"
                  }`}
                >
                  {state === "completed" ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-base font-medium whitespace-nowrap ${
                    state === "future"
                      ? "text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={`flex-1 h-[2px] mx-4 rounded-full ${
                    (() => {
                      const nextState = getStepState(steps[i + 1].id, currentPhase);
                      if (nextState === "completed") return "bg-primary";
                      if (nextState === "current") return "bg-accent";
                      return "bg-border";
                    })()
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
