import { describe, it, expect } from "vitest";
import { projectHome, PATHS } from "../engine";
import type { PropertySnapshot } from "../data-provider/types";

function makeStubSnapshot(overrides: Partial<PropertySnapshot> = {}): PropertySnapshot {
  return {
    property: {
      beds: 4, baths: 3, sqft_living: 2400, sqft_lot: 8000,
      year_built: 2005, effective_year_built: 2005,
      stories: 2, garage_spaces: 2,
      pool: true, hoa: false, waterfront: false,
      cul_de_sac: false, corner_lot: false, gated: false,
      adu: false, zoning: "R-1",
      last_sale_price: 520000, last_sale_date: "2019-06-01",
      assessed_value: 480000, tax_year: 2024,
      kitchen_update_level: 2, bath_update_level: 1,
      roof_age_years: 6, hvac_age_years: 8,
    },
    spatial: {
      school_score: 7.5, walkability: 42, flood_zone: "X",
      distance_to_water_miles: 8, distance_to_job_center_miles: 18,
      crime_index_zscore: -0.3,
    },
    comps: [
      { address: "1 Comp St", sale_price: 540000, sale_date: "2025-09-01", beds: 4, baths: 3, sqft: 2380, distance_miles: 0.3 },
      { address: "2 Comp St", sale_price: 525000, sale_date: "2025-08-15", beds: 4, baths: 2, sqft: 2200, distance_miles: 0.5 },
      { address: "3 Comp St", sale_price: 565000, sale_date: "2025-10-10", beds: 5, baths: 3, sqft: 2700, distance_miles: 0.6 },
    ],
    neighborhood_signals: {
      permit_count_trend: 0.08, permit_value_trend: 0.12,
      rezoning_announcements: 1, infrastructure_announcements: 1,
      school_trend: 0.2, crime_trend: -0.1,
      rent_growth_vs_metro: 0.04, investor_share: 0.18,
      flip_intensity: 0.15, retail_quality_score: 0.5,
      dom_compression: 0.3, sale_to_list_improvement: 0.02,
      income_growth: 0.05, educational_attainment_shift: 0.02,
    },
    macro_snapshot: {
      mortgage_rate_30y: 6.8, cpi_yoy: 0.031,
      metro_unemployment: 3.6, metro_hpi_yoy: 0.04,
      metro_inventory_months: 3.5, metro_dom_median: 22,
      metro_median_price: 400000,
    },
    source_quality: {
      sources_used: ["stub"],
      completeness_score: 0.7,
      notes: "Stub.",
    },
    explanation: "Test stub.",
    ...overrides,
  };
}

const baseInput = {
  savedHome: { address: "Test Address", price: 525000, beds: 4, baths: 3, sqft: "2400" },
  geocodeSucceeded: true,
  address: "Test Address",
};

describe("projectHome", () => {
  it("returns a complete projection with all spec fields", () => {
    const result = projectHome({ ...baseInput, snapshot: makeStubSnapshot() });

    expect(result.modelVersion).toMatch(/^v1/);
    expect(result.anchorPrice).toBe(525000);
    expect(result.currentValue.fairValue).toBeGreaterThan(0);
    expect(result.series.length).toBeGreaterThan(0);
    expect(result.attribution).toHaveProperty("structure");
    expect(result.attribution).toHaveProperty("microLocation");
    expect(result.attribution).toHaveProperty("macro");
    expect(result.attribution).toHaveProperty("neighborhood");
    expect(result.attribution).toHaveProperty("propertySpecific");
    expect(result.attribution).toHaveProperty("compResidual");
  });

  it("produces monotonic Conservative ≤ Moderate ≤ Optimistic at every checkpoint", () => {
    const result = projectHome({ ...baseInput, snapshot: makeStubSnapshot() });
    for (const point of result.series) {
      expect(point.conservative).toBeLessThanOrEqual(point.moderate);
      expect(point.moderate).toBeLessThanOrEqual(point.optimistic);
    }
  });

  it("anchors at the saved-home price at t=0 within tight tolerance (median, with measurement noise)", () => {
    const result = projectHome({ ...baseInput, snapshot: makeStubSnapshot() });
    const t0 = result.series[0];
    expect(t0.monthOffset).toBe(0);
    // P50 of a log-normal centered at log(anchor) equals anchor in expectation; sample noise allowed.
    expect(Math.abs(t0.moderate - 525000) / 525000).toBeLessThan(0.015);
  });

  it("produces plausible 15-year annualized median growth (~2%-6%/yr)", () => {
    const result = projectHome({ ...baseInput, snapshot: makeStubSnapshot() });
    const t180 = result.series.find((p) => p.monthOffset === 180);
    expect(t180).toBeDefined();
    const annualized = Math.pow(t180!.moderate / 525000, 1 / 15) - 1;
    expect(annualized).toBeGreaterThan(0.015);
    expect(annualized).toBeLessThan(0.06);
  });

  it("does not produce runaway growth in the first 3 months (<3% moderate change)", () => {
    const result = projectHome({ ...baseInput, snapshot: makeStubSnapshot() });
    const t3 = result.series.find((p) => p.monthOffset === 3);
    expect(t3).toBeDefined();
    const change = t3!.moderate / 525000 - 1;
    expect(Math.abs(change)).toBeLessThan(0.03);
  });

  it("survives a snapshot with percentage-form macro inputs (5.0 not 0.05)", () => {
    const result = projectHome({
      ...baseInput,
      snapshot: makeStubSnapshot({
        macro_snapshot: {
          mortgage_rate_30y: 6.5,
          cpi_yoy: 3.1,           // 3.1% returned as percentage points
          metro_unemployment: 3.6,
          metro_hpi_yoy: 5.0,     // 5%/yr returned as 5.0, not 0.05
          metro_inventory_months: 3.5,
          metro_dom_median: 22,
          metro_median_price: 400000,
        },
      }),
    });
    const t180 = result.series.find((p) => p.monthOffset === 180);
    const annualized = Math.pow(t180!.moderate / 525000, 1 / 15) - 1;
    expect(annualized).toBeLessThan(0.08); // should NOT explode to 100%/yr
  });

  it("produces a non-degenerate t=0 confidence band", () => {
    const result = projectHome({ ...baseInput, snapshot: makeStubSnapshot() });
    const t0 = result.series[0];
    const [lo, hi] = t0.range95!;
    expect(hi).toBeGreaterThan(lo);
    expect((hi - lo) / 525000).toBeGreaterThan(0.02); // at least ~2% spread
  });

  it("caps confidence at 75 per spec", () => {
    const result = projectHome({
      ...baseInput,
      snapshot: makeStubSnapshot({
        source_quality: { sources_used: ["s1", "s2"], completeness_score: 1.0, notes: "" },
      }),
    });
    expect(result.currentValue.confidenceScore).toBeLessThanOrEqual(75);
  });

  it("returns regime probabilities summing to ~1", () => {
    const result = projectHome({ ...baseInput, snapshot: makeStubSnapshot() });
    const sum = Object.values(result.regime).reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0;
    expect(sum).toBeGreaterThan(0.5);
    expect(sum).toBeLessThanOrEqual(1.01);
  });

  it("throws when no anchor price is available", () => {
    expect(() =>
      projectHome({
        ...baseInput,
        savedHome: { ...baseInput.savedHome, price: null },
        snapshot: makeStubSnapshot({
          property: { ...makeStubSnapshot().property, last_sale_price: null, assessed_value: null },
        }),
      }),
    ).toThrow();
  });
});

// The in-card disclosure (HomeValueProjectionCard) and compliance brief §2.4 publicly state
// that ranges show "the middle 50% of 2,000 simulated paths". These pins keep that legal
// disclosure true if the engine is ever tuned — update the consumer copy and brief together
// with any change here.
describe("publicly disclosed model facts", () => {
  it("runs 2,000 simulated paths", () => {
    expect(PATHS).toBe(2000);
  });

  it("conservative/optimistic are the middle-50% band (p25/p75)", () => {
    const result = projectHome({ ...baseInput, snapshot: makeStubSnapshot() });
    expect(result.series.length).toBeGreaterThan(0);
    for (const point of result.series) {
      const [lo, hi] = point.range50 ?? [NaN, NaN];
      expect(point.conservative).toBe(lo);
      expect(point.optimistic).toBe(hi);
    }
  });
});
