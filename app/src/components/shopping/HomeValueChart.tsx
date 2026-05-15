"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { chartSeriesColors } from "@/lib/theme-tokens";
import type { HomeValueProjection } from "@/lib/types";

function formatCurrencyShort(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

interface Props {
  projection: HomeValueProjection;
}

interface TooltipRow {
  dataKey: string;
  value: number;
  color: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipRow[];
  label?: number;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3 text-sm">
      <div className="font-semibold text-foreground mb-1">Year {label}</div>
      {payload.map((row) => (
        <div key={row.dataKey} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 capitalize text-muted-foreground">
            <span
              aria-hidden
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: row.color }}
            />
            {row.dataKey}
          </span>
          <span className="font-medium text-foreground">{formatCurrency(row.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function HomeValueChart({ projection }: Props) {
  const data = projection.series.map((p) => ({
    year: Number((p.monthOffset / 12).toFixed(1)),
    conservative: p.conservative,
    moderate: p.moderate,
    optimistic: p.optimistic,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 10, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8DBBF" vertical={false} />
          <XAxis
            dataKey="year"
            type="number"
            domain={[0, 15]}
            ticks={[0, 1, 3, 5, 7, 10, 12, 15]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#767676", fontSize: 12 }}
            label={{ value: "Years from now", position: "insideBottom", offset: -2, fill: "#767676", fontSize: 12 }}
          />
          <YAxis
            tickFormatter={formatCurrencyShort}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#767676", fontSize: 12 }}
            width={64}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            iconType="plainline"
            wrapperStyle={{ fontSize: 12, color: "#767676", paddingTop: 8 }}
          />
          <Line
            type="monotone"
            dataKey="conservative"
            stroke={chartSeriesColors.conservative}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="moderate"
            stroke={chartSeriesColors.moderate}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="optimistic"
            stroke={chartSeriesColors.optimistic}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
