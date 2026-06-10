import { describe, it, expect } from "vitest";
import { deriveMarketSnapshot } from "../derive";
import type { PropertySnapshot } from "@/lib/valuation/data-provider/types";

function makeSnapshot(overrides: Partial<PropertySnapshot> = {}): PropertySnapshot {
  return {
    property: {
      beds: 3, baths: 2, sqft_living: 1800, sqft_lot: 6000,
      year_built: 2000, effective_year_built: 2000,
      stories: 1, garage_spaces: 2,
      pool: false, hoa: false, waterfront: false,
      cul_de_sac: false, corner_lot: false, gated: false,
      adu: false, zoning: "R-1",
      last_sale_price: 380000, last_sale_date: "2020-05-01",
      assessed_value: 360000, tax_year: 2024,
      kitchen_update_level: 2, bath_update_level: 1,
      roof_age_years: 8, hvac_age_years: 7,
    },
    spatial: {
      school_score: 7, walkability: 50, flood_zone: "X",
      distance_to_water_miles: 10, distance_to_job_center_miles: 12,
      crime_index_zscore: 0,
    },
    comps: [],
    neighborhood_signals: {
      permit_count_trend: 0.05, permit_value_trend: 0.07,
      rezoning_announcements: 0, infrastructure_announcements: 0,
      school_trend: 0, crime_trend: 0,
      rent_growth_vs_metro: 0.03, investor_share: 0.12,
      flip_intensity: 0.10, retail_quality_score: 0.4,
      dom_compression: 0.1, sale_to_list_improvement: 0,
      income_growth: 0.03, educational_attainment_shift: 0,
    },
    macro_snapshot: {
      mortgage_rate_30y: 6.7,
      cpi_yoy: 0.031,
      metro_unemployment: 3.5,
      metro_hpi_yoy: 0.04,
      metro_inventory_months: 3.2,
      metro_dom_median: 22,
      metro_median_price: 415000,
    },
    source_quality: {
      sources_used: ["https://zillow.com/research"],
      completeness_score: 1.0,
      notes: "stub",
    },
    explanation: "stub",
    ...overrides,
  };
}

const baseInput = { savedHomeId: "h1", address: "1 Test St" };

describe("deriveMarketSnapshot", () => {
  it("returns all six tiles populated when snapshot is complete", () => {
    const out = deriveMarketSnapshot({
      ...baseInput,
      snapshot: makeSnapshot(),
      anchorPrice: 500000,
    });
    expect(out.medianPrice).toBe(415000);
    expect(out.daysOnMarket).toBe(22);
    expect(out.hpiYoy).toBe(0.04);
    expect(out.mortgageRate).toBe(6.7);
    expect(out.homeVsMedianPct).toBeCloseTo((500000 - 415000) / 415000, 5);
    expect(out.marketTemperature).toBe("seller");
    expect(out.inventoryMonths).toBe(3.2);
    expect(out.confidenceScore).toBeGreaterThanOrEqual(70);
    expect(out.warnings).toEqual([]);
  });

  it("hides home-vs-median when median is null", () => {
    const snap = makeSnapshot();
    snap.macro_snapshot.metro_median_price = null;
    const out = deriveMarketSnapshot({ ...baseInput, snapshot: snap, anchorPrice: 500000 });
    expect(out.homeVsMedianPct).toBeNull();
    expect(out.warnings).toContain("Metro median price unavailable.");
  });

  it("hides home-vs-median when anchor price is null", () => {
    const out = deriveMarketSnapshot({
      ...baseInput,
      snapshot: makeSnapshot(),
      anchorPrice: null,
    });
    expect(out.homeVsMedianPct).toBeNull();
    expect(out.warnings).toContain("Saved home has no price; home-vs-median comparison hidden.");
  });

  it("classifies market temperature by inventory months", () => {
    const cases: Array<[number | null, ReturnType<typeof deriveMarketSnapshot>["marketTemperature"]]> = [
      [2.0, "seller"],
      [3.9, "seller"],
      [4.0, "balanced"],
      [5.5, "balanced"],
      [6.0, "balanced"],
      [6.1, "buyer"],
      [10, "buyer"],
      [null, null],
    ];
    for (const [inv, expected] of cases) {
      const snap = makeSnapshot();
      snap.macro_snapshot.metro_inventory_months = inv;
      const out = deriveMarketSnapshot({ ...baseInput, snapshot: snap, anchorPrice: 500000 });
      expect(out.marketTemperature).toBe(expected);
    }
  });

  it("produces signed home-vs-median (positive above, negative below)", () => {
    const above = deriveMarketSnapshot({ ...baseInput, snapshot: makeSnapshot(), anchorPrice: 500000 });
    expect(above.homeVsMedianPct).toBeGreaterThan(0);

    const below = deriveMarketSnapshot({ ...baseInput, snapshot: makeSnapshot(), anchorPrice: 300000 });
    expect(below.homeVsMedianPct).toBeLessThan(0);
  });

  it("blends field-fraction with snapshot completeness for confidence (≈57 for the specified mix)", () => {
    // 3 of 5 driver fields filled, completeness 0.5 → raw = 0.7*0.6 + 0.3*0.5 = 0.57 → 57
    const snap = makeSnapshot();
    snap.macro_snapshot.metro_dom_median = null;
    snap.macro_snapshot.metro_inventory_months = null;
    snap.source_quality.completeness_score = 0.5;
    const out = deriveMarketSnapshot({ ...baseInput, snapshot: snap, anchorPrice: 500000 });
    expect(out.confidenceScore).toBe(57);
  });

  it("caps confidence at 75 even with perfect inputs", () => {
    const snap = makeSnapshot();
    snap.source_quality.completeness_score = 1.0;
    const out = deriveMarketSnapshot({ ...baseInput, snapshot: snap, anchorPrice: 500000 });
    expect(out.confidenceScore).toBeLessThanOrEqual(75);
  });

  it("stamps the derive version on every output", () => {
    const out = deriveMarketSnapshot({ ...baseInput, snapshot: makeSnapshot(), anchorPrice: 500000 });
    expect(out.deriveVersion).toMatch(/^market-/);
  });
});
