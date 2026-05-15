import type { PropertySnapshot } from "./data-provider/types";

/**
 * LLM outputs frequently have scale-ambiguous fields (e.g., a YoY rate as "4.5" meaning 4.5%
 * vs "0.045" meaning the same in fractional form). The engine expects fractional form throughout
 * (0.04 = 4%/year). This pass normalizes every probabilistic field to that form.
 *
 * Heuristic: a value labeled as a YoY rate or fraction whose |x| > 0.5 is almost certainly in
 * percentage form. We divide by 100. We then clamp to defensible bounds so a single bad value
 * can't blow up the simulation.
 */

function normalizeFraction(value: number | null, clamp: [number, number]): number | null {
  if (value === null) return null;
  if (!Number.isFinite(value)) return null;
  let v = value;
  if (Math.abs(v) > 0.5) v = v / 100; // percentage → fraction
  return Math.max(clamp[0], Math.min(clamp[1], v));
}

function normalizeRate(value: number | null, clamp: [number, number]): number | null {
  if (value === null) return null;
  if (!Number.isFinite(value)) return null;
  let v = value;
  // Mortgage rate of 650 means basis points; rate of 0.065 means fraction.
  if (v > 100) v = v / 100;
  if (v < 0.5) v = v * 100; // fraction → percent (we store rates as 6.5 not 0.065)
  return Math.max(clamp[0], Math.min(clamp[1], v));
}

function normalizeCount(value: number | null, clamp: [number, number]): number | null {
  if (value === null) return null;
  if (!Number.isFinite(value)) return null;
  return Math.max(clamp[0], Math.min(clamp[1], value));
}

export function sanitizeSnapshot(input: PropertySnapshot): PropertySnapshot {
  const m = input.macro_snapshot;
  const macroSnapshot = {
    mortgage_rate_30y: normalizeRate(m.mortgage_rate_30y, [1, 20]),
    cpi_yoy: normalizeFraction(m.cpi_yoy, [-0.05, 0.20]),
    metro_unemployment: normalizeRate(m.metro_unemployment, [0.5, 25]),
    metro_hpi_yoy: normalizeFraction(m.metro_hpi_yoy, [-0.20, 0.25]),
    metro_inventory_months: normalizeCount(m.metro_inventory_months, [0, 24]),
    metro_dom_median: normalizeCount(m.metro_dom_median, [0, 365]),
  };

  const q = input.neighborhood_signals;
  const neighborhoodSignals = {
    // YoY / trend fields: fractional, clamp [-1, 1]
    permit_count_trend: normalizeFraction(q.permit_count_trend, [-1, 1]),
    permit_value_trend: normalizeFraction(q.permit_value_trend, [-1, 1]),
    school_trend: normalizeFraction(q.school_trend, [-1, 1]),
    crime_trend: normalizeFraction(q.crime_trend, [-1, 1]),
    rent_growth_vs_metro: normalizeFraction(q.rent_growth_vs_metro, [-0.5, 0.5]),
    sale_to_list_improvement: normalizeFraction(q.sale_to_list_improvement, [-0.2, 0.2]),
    income_growth: normalizeFraction(q.income_growth, [-0.5, 0.5]),
    educational_attainment_shift: normalizeFraction(q.educational_attainment_shift, [-0.5, 0.5]),
    // Fraction-in-[0,1] fields
    investor_share: q.investor_share === null ? null : Math.max(0, Math.min(1, q.investor_share)),
    flip_intensity: q.flip_intensity === null ? null : Math.max(0, Math.min(1, q.flip_intensity)),
    retail_quality_score: q.retail_quality_score === null ? null : Math.max(-1, Math.min(1, q.retail_quality_score)),
    dom_compression: q.dom_compression === null ? null : Math.max(-1, Math.min(1, q.dom_compression)),
    // Counts
    rezoning_announcements: normalizeCount(q.rezoning_announcements, [0, 50]),
    infrastructure_announcements: normalizeCount(q.infrastructure_announcements, [0, 50]),
  };

  return {
    ...input,
    macro_snapshot: macroSnapshot,
    neighborhood_signals: neighborhoodSignals,
  };
}
