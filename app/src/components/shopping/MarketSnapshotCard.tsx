"use client";

import { useMemo, useState } from "react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import {
  useMarketSnapshot,
  useSavedHomes,
  HomeValuationError,
} from "@/lib/hooks/queries";
import type { MarketSnapshot, MarketTemperature } from "@/lib/types";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Loader2 } from "lucide-react";

interface Props {
  transactionId: string | null;
}

function formatPrice(value: number | null): string {
  if (value === null) return "—";
  return `$${Math.round(value).toLocaleString()}`;
}

function formatDays(value: number | null): string {
  if (value === null) return "—";
  return `${Math.round(value)} days`;
}

function formatPct(value: number | null, opts: { signed?: boolean } = {}): string {
  if (value === null) return "—";
  const pct = value * 100;
  const sign = opts.signed && pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function formatRate(value: number | null): string {
  if (value === null) return "—";
  return `${value.toFixed(1)}% (30y fixed)`;
}

const TEMPERATURE_LABELS: Record<MarketTemperature, { text: string; classes: string }> = {
  seller: { text: "Seller's market", classes: "bg-accent/15 text-accent border-accent/30" },
  balanced: { text: "Balanced market", classes: "bg-muted text-foreground border-border" },
  buyer: { text: "Buyer's market", classes: "bg-primary/20 text-primary-foreground border-primary/30" },
};

export function MarketSnapshotCard({ transactionId }: Props) {
  const { data: homes } = useSavedHomes(transactionId);
  // Only the user's explicit pick lives in state; the effective selection is derived in
  // render (falls back to the first home, and self-heals if the picked home is deleted).
  const [pickedId, setPickedId] = useState<string | null>(null);
  const selectedId =
    pickedId && homes?.some((h) => h.id === pickedId) ? pickedId : homes?.[0]?.id ?? null;

  const market = useMarketSnapshot(selectedId);
  const selectedHome = useMemo(
    () => homes?.find((h) => h.id === selectedId) ?? null,
    [homes, selectedId],
  );

  const subtitle = selectedHome
    ? selectedHome.address
    : "Pick a saved home for local market signals";

  return (
    <CollapsibleCard title="Market Snapshot" subtitle={subtitle}>
      {!homes || homes.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          Save a home first to see local market signals.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-muted-foreground" htmlFor="market-home-picker">
              Home
            </label>
            <select
              id="market-home-picker"
              value={selectedId ?? ""}
              onChange={(e) => setPickedId(e.target.value || null)}
              className="text-base bg-card border border-border rounded-lg px-3 py-2 max-w-[60%] truncate"
            >
              {homes.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.address}
                </option>
              ))}
            </select>
          </div>

          <MarketBody
            // isPending (not isFetching): a background refresh shouldn't blank data the
            // user is already looking at back into the 20-second spinner.
            isLoading={market.isPending}
            error={market.error}
            data={market.data ?? null}
          />

          <p className="text-sm text-muted-foreground border-t border-border pt-3">
            Market figures are automated estimates from third-party market data — not an
            appraisal or advice. Verify with your agent before acting on them.
          </p>
        </div>
      )}
    </CollapsibleCard>
  );
}

interface BodyProps {
  isLoading: boolean;
  error: HomeValuationError | null;
  data: MarketSnapshot | null;
}

function MarketBody({ isLoading, error, data }: BodyProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
        <p className="text-sm text-muted-foreground">Gathering local market signals…</p>
        <p className="text-xs text-muted-foreground">
          This can take up to 20 seconds the first time.
        </p>
      </div>
    );
  }

  if (error) {
    if (error.status === 429) {
      const minutes =
        error.retryAfterSeconds != null
          ? Math.max(1, Math.ceil(error.retryAfterSeconds / 60))
          : 60;
      return (
        <ErrorBlock
          title="Hourly limit reached"
          body={`You've hit the hourly limit for market data and value scenarios. Try again in about ${minutes} minutes.`}
        />
      );
    }
    if (error.status === 503) {
      return (
        <ErrorBlock
          title="Market data temporarily unavailable"
          body="Our data source didn't return a usable response. Please try again shortly."
        />
      );
    }
    // error.message carries machine codes from the API (e.g. "invalid_address") — map the
    // ones a buyer can act on to plain English and never render raw codes.
    return (
      <ErrorBlock
        title="Couldn't load market data"
        body={
          error.message === "invalid_address"
            ? "We couldn't read this home's address. Check that it's a standard street address."
            : "An unexpected error occurred. Please try again."
        }
      />
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground py-4">Pick a home above to see market signals.</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <ConfidenceChip score={data.confidenceScore} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Tile label="Median Home Price" value={formatPrice(data.medianPrice)} />
        <Tile label="Avg Days on Market" value={formatDays(data.daysOnMarket)} />
        <TrendTile hpiYoy={data.hpiYoy} />

        <Tile label="Mortgage Rate" value={formatRate(data.mortgageRate)} />
        {data.homeVsMedianPct !== null ? (
          <HomeVsMedianTile pct={data.homeVsMedianPct} />
        ) : (
          // Empty cell preserves grid layout when the tile is genuinely meaningless.
          <div aria-hidden />
        )}
        <TemperatureTile temperature={data.marketTemperature} />
      </div>

      {data.warnings.length > 0 && (
        <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
          {data.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-sm text-muted-foreground">{label}</span>
      <p className="text-base font-semibold text-foreground mt-1">{value}</p>
    </div>
  );
}

function TrendTile({ hpiYoy }: { hpiYoy: number | null }) {
  if (hpiYoy === null) {
    return <Tile label="Market Trend" value="—" />;
  }
  const up = hpiYoy >= 0;
  const ArrowIcon = up ? ArrowUpRight : ArrowDownRight;
  const color = up ? "text-emerald-600" : "text-destructive";
  return (
    <div>
      <span className="text-sm text-muted-foreground">Market Trend</span>
      <p className={`text-base font-semibold flex items-center gap-1 mt-1 ${color}`}>
        <ArrowIcon className="w-4 h-4" />
        {formatPct(hpiYoy, { signed: true })} YoY
      </p>
    </div>
  );
}

function HomeVsMedianTile({ pct }: { pct: number }) {
  const above = pct >= 0;
  const direction = above ? "Above" : "Below";
  return (
    <div>
      <span className="text-sm text-muted-foreground">This Home vs Median</span>
      <p className="text-base font-semibold text-foreground mt-1">
        {direction} by {Math.abs(pct * 100).toFixed(0)}%
      </p>
    </div>
  );
}

function TemperatureTile({ temperature }: { temperature: MarketTemperature | null }) {
  const meta = temperature
    ? TEMPERATURE_LABELS[temperature]
    : { text: "Unknown", classes: "bg-muted text-muted-foreground border-border" };
  return (
    <div>
      <span className="text-sm text-muted-foreground">Market Temperature</span>
      <div className="mt-1">
        <span
          className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium border ${meta.classes}`}
        >
          {meta.text}
        </span>
      </div>
    </div>
  );
}

function ConfidenceChip({ score }: { score: number }) {
  if (score < 35) {
    return (
      <span className="text-xs px-2.5 py-1 rounded-full bg-warning/10 text-warning border border-warning/30 inline-flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" /> Limited data · {score}/100
      </span>
    );
  }
  if (score >= 60) {
    return (
      <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-emerald-600 border border-primary/30">
        Confidence {score}/100
      </span>
    );
  }
  return (
    <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-foreground border border-border">
      Confidence {score}/100
    </span>
  );
}

function ErrorBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-4 text-sm">
      <p className="font-semibold text-destructive">{title}</p>
      <p className="text-foreground mt-1">{body}</p>
    </div>
  );
}
