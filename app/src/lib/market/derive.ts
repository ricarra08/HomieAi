import type { PropertySnapshot } from "@/lib/valuation/data-provider/types";
import type { MarketSnapshot, MarketTemperature } from "@/lib/types";

export const MARKET_DERIVE_VERSION = "market-v1";

// Industry-standard thresholds (NAR): <4mo seller's market, 4-6mo balanced, >6mo buyer's market.
const SELLER_INVENTORY_CAP = 4;
const BUYER_INVENTORY_FLOOR = 6;

// Hard cap on confidence — matches the projection card's "strong estimate" band per the
// Home Valuation Model Spec until backtest data exists in v2.
const CONFIDENCE_CAP = 75;

export interface DeriveInput {
  snapshot: PropertySnapshot;
  savedHomeId: string;
  address: string;
  anchorPrice: number | null;
}

function classifyTemperature(inventoryMonths: number | null): MarketTemperature | null {
  if (inventoryMonths === null) return null;
  if (inventoryMonths < SELLER_INVENTORY_CAP) return "seller";
  if (inventoryMonths <= BUYER_INVENTORY_FLOOR) return "balanced";
  return "buyer";
}

export function deriveMarketSnapshot(input: DeriveInput): MarketSnapshot {
  const m = input.snapshot.macro_snapshot;
  const median = m.metro_median_price;
  const inv = m.metro_inventory_months;

  const temperature = classifyTemperature(inv);

  const homeVsMedianPct =
    median !== null &&
    median > 0 &&
    input.anchorPrice !== null &&
    input.anchorPrice > 0
      ? (input.anchorPrice - median) / median
      : null;

  // Confidence blends per-field completeness (70%) with the snapshot's source quality (30%).
  const drivers = [
    m.metro_median_price,
    m.metro_dom_median,
    m.metro_hpi_yoy,
    m.mortgage_rate_30y,
    m.metro_inventory_months,
  ];
  const fieldFraction = drivers.filter((v) => v !== null).length / drivers.length;
  const completenessWeight = input.snapshot.source_quality.completeness_score;
  const raw = 0.7 * fieldFraction + 0.3 * completenessWeight;
  const confidenceScore = Math.min(CONFIDENCE_CAP, Math.round(raw * 100));

  const warnings: string[] = [];
  if (median === null) warnings.push("Metro median price unavailable.");
  if (inv === null) warnings.push("Metro inventory data unavailable.");
  if (input.anchorPrice === null) {
    warnings.push("Saved home has no price; home-vs-median comparison hidden.");
  }

  return {
    savedHomeId: input.savedHomeId,
    address: input.address,
    anchorPrice: input.anchorPrice,
    deriveVersion: MARKET_DERIVE_VERSION,
    medianPrice: median,
    daysOnMarket: m.metro_dom_median,
    hpiYoy: m.metro_hpi_yoy,
    mortgageRate: m.mortgage_rate_30y,
    homeVsMedianPct,
    marketTemperature: temperature,
    inventoryMonths: inv,
    confidenceScore,
    warnings,
    sourcesUsed: input.snapshot.source_quality.sources_used,
    generatedAt: new Date().toISOString(),
  };
}
