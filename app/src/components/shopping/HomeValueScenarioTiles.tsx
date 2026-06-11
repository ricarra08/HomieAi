"use client";

import type { HomeValueProjection } from "@/lib/types";

function formatPrice(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

interface Props {
  projection: HomeValueProjection;
}

const HORIZONS = [
  { label: "5 years", months: 60 },
  { label: "10 years", months: 120 },
  { label: "15 years", months: 180 },
];

export function HomeValueScenarioTiles({ projection }: Props) {
  const byMonth = new Map(projection.series.map((p) => [p.monthOffset, p]));

  return (
    <div className="grid grid-cols-3 gap-4">
      {HORIZONS.map((h) => {
        const point = byMonth.get(h.months);
        if (!point) return null;
        return (
          <div
            key={h.label}
            className="bg-muted/40 border border-border rounded-lg p-4 flex flex-col items-start"
          >
            <span className="text-sm text-muted-foreground">{h.label}</span>
            <span className="text-2xl font-semibold text-foreground mt-1">
              {formatPrice(point.moderate)}
            </span>
            <span className="text-sm text-muted-foreground mt-1">Moderate scenario</span>
            <span className="text-sm text-muted-foreground">
              Range: {formatPrice(point.conservative)} – {formatPrice(point.optimistic)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
