// Versioned hedonic coefficients (log-space). Additive, with saturating helpers in structural.ts.
// Calibrated to public hedonic literature (Sirmans/Macpherson/Zietz meta-analyses and Zillow/Redfin
// published research). v1 values; refit in v2 when backtest data exists.

export const STRUCTURAL_COEFFS_VERSION = "structural-v1";

export const COEFFS = {
  log_sqft_living: 0.65,      // saturating log-linear
  log_sqft_lot: 0.05,
  beds: 0.025,                // saturating after 4 (see structural.ts)
  baths: 0.045,               // saturating after 3
  yearBuiltPerYear: 0.002,    // per year above 1950, capped
  yearBuiltCapYears: 70,
  pool: 0.03,
  hoa: 0.0,                   // neutral on average; depends on amenity, leave 0 in v1
  waterfront: 0.15,
  culDeSac: 0.015,
  cornerLot: 0.005,
  gated: 0.02,
  adu: 0.05,
  garagePerSpace: 0.015,
  kitchenLevel: [0, 0.02, 0.04, 0.06] as const,
  bathLevel: [0, 0.015, 0.03, 0.045] as const,
  roofAgePerYear: -0.0009,
  hvacAgePerYear: -0.0005,
};

// Reasonable fallbacks when the snapshot is missing fields. Tuned so a typical single-family home in
// the US lands near a sane structural baseline before the anchor recalibration.
export const FALLBACKS = {
  beds: 3,
  baths: 2,
  sqft_living: 1800,
  sqft_lot: 7500,
  year_built: 1990,
  garage_spaces: 1,
  roof_age_years: 12,
  hvac_age_years: 10,
};
