"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { useHomeValuation, HomeValuationError } from "@/lib/hooks/queries";
import { useSavedHomes } from "@/lib/hooks/queries";
import { HomeValueScenarioTiles } from "./HomeValueScenarioTiles";
import { HomeValueAttribution } from "./HomeValueAttribution";
import { AlertTriangle, Loader2 } from "lucide-react";

const HomeValueChart = dynamic(() => import("./HomeValueChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 flex items-center justify-center text-muted-foreground text-sm">
      Loading chart…
    </div>
  ),
});

interface Props {
  transactionId: string | null;
}

export function HomeValueProjectionCard({ transactionId }: Props) {
  const { data: homes } = useSavedHomes(transactionId);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Default to most recently added saved home with a price.
  useEffect(() => {
    if (!homes || homes.length === 0) {
      setSelectedId(null);
      return;
    }
    const withPrice = homes.find((h) => h.price && h.price > 0);
    if (withPrice && (!selectedId || !homes.some((h) => h.id === selectedId))) {
      setSelectedId(withPrice.id);
    }
  }, [homes, selectedId]);

  const projection = useHomeValuation(selectedId);
  const selectedHome = useMemo(
    () => homes?.find((h) => h.id === selectedId) ?? null,
    [homes, selectedId],
  );

  const subtitle = selectedHome
    ? selectedHome.address
    : "5/10/15-year scenarios for a saved home";

  return (
    <CollapsibleCard title="Home Value Projection" subtitle={subtitle}>
      {!homes || homes.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          Save a home first to see a projected value.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-muted-foreground" htmlFor="home-valuation-picker">
              Home
            </label>
            <select
              id="home-valuation-picker"
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(e.target.value || null)}
              className="text-base bg-card border border-border rounded-lg px-3 py-2 max-w-[60%] truncate"
            >
              {homes.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.address}
                </option>
              ))}
            </select>
          </div>

          <ProjectionBody
            isLoading={projection.isLoading || projection.isFetching}
            error={projection.error}
            data={projection.data ?? null}
          />

          <p className="text-xs text-muted-foreground border-t border-border pt-3">
            Projections are statistical estimates based on the home, its location, current market
            conditions, and neighborhood signals. Actual outcomes vary; treat these as a planning
            tool, not financial advice.
          </p>
        </div>
      )}
    </CollapsibleCard>
  );
}

interface BodyProps {
  isLoading: boolean;
  error: HomeValuationError | null;
  data: ReturnType<typeof useHomeValuation>["data"] | null;
}

function ProjectionBody({ isLoading, error, data }: BodyProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
        <p className="text-sm text-muted-foreground">
          Analyzing the home, neighborhood, and market…
        </p>
        <p className="text-xs text-muted-foreground">This can take up to 20 seconds the first time.</p>
      </div>
    );
  }

  if (error) {
    if (error.status === 429) {
      const minutes =
        error.retryAfterSeconds != null ? Math.max(1, Math.ceil(error.retryAfterSeconds / 60)) : 60;
      return (
        <ErrorBlock
          title="Hourly limit reached"
          body={`You've hit the projection limit. Try again in about ${minutes} minutes.`}
        />
      );
    }
    if (error.status === 503) {
      return (
        <ErrorBlock
          title="Projections temporarily unavailable"
          body="Our data source didn't return a usable response. Please try again shortly."
        />
      );
    }
    return (
      <ErrorBlock
        title="Couldn't generate a projection"
        body={error.message || "An unexpected error occurred. Please try again."}
      />
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground py-4">Pick a home above to see a projection.</p>
    );
  }

  const lowConfidence =
    data.currentValue.confidenceScore < 35 ||
    data.warnings.some((w) => w.toLowerCase().includes("sparse"));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="text-sm text-muted-foreground">Current fair value</span>
          <div className="text-2xl font-semibold text-foreground">
            ${Math.round(data.currentValue.fairValue).toLocaleString()}
          </div>
        </div>
        <ConfidenceChip score={data.currentValue.confidenceScore} lowConfidence={lowConfidence} />
      </div>

      <HomeValueChart projection={data} />
      <HomeValueScenarioTiles projection={data} />
      <HomeValueAttribution projection={data} />

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

function ConfidenceChip({ score, lowConfidence }: { score: number; lowConfidence: boolean }) {
  if (lowConfidence) {
    return (
      <span className="text-xs px-2.5 py-1 rounded-full bg-warning/10 text-warning border border-warning/30 inline-flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" /> Limited data · confidence {score}/100
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
