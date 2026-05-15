"use client";

import type { HomeValueProjection } from "@/lib/types";

const ATTRIBUTION_LABELS: Record<keyof HomeValueProjection["attribution"], string> = {
  structure: "Home itself",
  microLocation: "Micro-location",
  macro: "Macro market",
  neighborhood: "Neighborhood regime",
  propertySpecific: "Property-specific",
  compResidual: "Comp residual",
};

const REGIME_LABELS: Record<string, string> = {
  stagnant: "Stagnant",
  stable: "Stable",
  improving: "Improving",
  accelerating: "Accelerating",
  overheated: "Overheated",
  correcting: "Correcting",
};

function formatPct(value: number): string {
  const pct = value * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}%`;
}

interface Props {
  projection: HomeValueProjection;
}

export function HomeValueAttribution({ projection }: Props) {
  const { attribution, regime, explanation } = projection;
  const attributionRows = (Object.keys(ATTRIBUTION_LABELS) as Array<keyof typeof ATTRIBUTION_LABELS>).map(
    (k) => ({ key: k, label: ATTRIBUTION_LABELS[k], value: attribution[k] }),
  );

  const regimeRows = Object.entries(regime)
    .filter(([, v]) => typeof v === "number" && v > 0.01)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));

  return (
    <div className="space-y-4">
      {explanation && (
        <p className="text-base text-foreground leading-relaxed">{explanation}</p>
      )}

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          What drives this estimate
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {attributionRows.map((row) => (
            <div key={row.key} className="flex items-center justify-between">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="text-foreground font-medium">{formatPct(row.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {regimeRows.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Neighborhood regime probabilities
          </h4>
          <div className="flex flex-wrap gap-2">
            {regimeRows.map(([k, v]) => (
              <span
                key={k}
                className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border"
              >
                {REGIME_LABELS[k] ?? k}: {Math.round((v ?? 0) * 100)}%
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
