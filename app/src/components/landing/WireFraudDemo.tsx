"use client";

import { Shield, Check } from "lucide-react";
import { WIRE_STEPS } from "./data";

export function WireFraudDemo() {
  return (
    <div className="bg-card rounded-xl border border-destructive/25 shadow-sm overflow-hidden max-w-md w-full">
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-destructive/5 border-b border-destructive/20">
        <Shield className="w-4 h-4 text-destructive shrink-0" />
        <span className="text-sm font-semibold text-destructive">
          Wire Transfer SafeSend
        </span>
        <div className="ml-auto shrink-0 bg-muted px-2.5 py-0.5 rounded-full text-xs font-semibold text-foreground border border-border">
          $16,054 due at closing
        </div>
      </div>
      <div className="px-5 py-3 bg-destructive/5 border-b border-border/60">
        <p className="text-xs text-destructive leading-relaxed">
          ⚠️ Criminals intercept real estate emails and substitute fraudulent wire
          account numbers. Wired funds are almost never recovered.
        </p>
      </div>
      <div className="px-5 py-4 space-y-3.5">
        {WIRE_STEPS.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className={`w-5 h-5 rounded mt-0.5 shrink-0 flex items-center justify-center border-2 ${
                i < 2
                  ? "bg-primary border-primary"
                  : "border-border bg-background"
              }`}
            >
              {i < 2 && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <p
              className={`text-sm leading-relaxed ${
                i < 2 ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step}
            </p>
          </div>
        ))}
      </div>
      <div className="px-5 pb-3">
        <div className="border border-dashed border-border rounded-lg px-4 py-2.5 text-center">
          <p className="text-xs text-muted-foreground">
            Upload wire confirmation receipt
          </p>
        </div>
      </div>
      <div className="px-5 pb-5">
        <div className="w-full py-2.5 px-4 rounded-lg bg-muted text-muted-foreground text-sm font-medium text-center select-none cursor-not-allowed">
          Mark as Wired — complete all steps to enable
        </div>
      </div>
    </div>
  );
}
