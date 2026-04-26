"use client";

import { DEADLINE_ITEMS } from "./data";

export function DeadlineMiniVisual() {
  return (
    <div className="mt-4 space-y-2.5">
      {DEADLINE_ITEMS.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <span className={`text-xs font-semibold ${item.textClass}`}>
              {item.days}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${item.barClass}`}
              style={{ width: `${item.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
