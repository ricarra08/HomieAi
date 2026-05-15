// Layer 4 (regime-switching) parameters. v1 heuristic; seeded from spec semantics, not fit.

export const REGIMES = [
  "stagnant",
  "stable",
  "improving",
  "accelerating",
  "overheated",
  "correcting",
] as const;

export type RegimeIndex = 0 | 1 | 2 | 3 | 4 | 5;

// δ_r: per-regime monthly log-price drift offset ON TOP OF the macro layer's HPI drift.
// "stable" is the no-op baseline (macro alone). Other regimes shift up/down from there.
// Scales chosen so a 15-year "stable" projection annualizes to roughly the macro HPI rate (~4%/yr),
// and an "accelerating" projection adds ~1.5–2%/yr on top.
export const REGIME_DRIFT: Record<(typeof REGIMES)[number], number> = {
  stagnant: -0.0010,    // ≈ -1.2%/yr
  stable: 0.0000,        // baseline (macro drives appreciation)
  improving: 0.0008,    // ≈ +1.0%/yr
  accelerating: 0.0015, // ≈ +1.8%/yr
  overheated: 0.0010,   // ≈ +1.2%/yr (slowing)
  correcting: -0.0020,  // ≈ -2.4%/yr
};

// Regime-dependent innovation volatility (Gaussian σ per month)
export const REGIME_VOL: Record<(typeof REGIMES)[number], number> = {
  stagnant: 0.003,
  stable: 0.003,
  improving: 0.004,
  accelerating: 0.005,
  overheated: 0.007,
  correcting: 0.007,
};

// Leading-indicator features the snapshot provides (see PropertySnapshot.neighborhood_signals).
// Each maps to a coefficient that influences regime transition logits and per-step drift.
export const SIGNAL_KEYS = [
  "permit_count_trend",
  "permit_value_trend",
  "rezoning_announcements",
  "infrastructure_announcements",
  "school_trend",
  "crime_trend",
  "rent_growth_vs_metro",
  "investor_share",
  "flip_intensity",
  "retail_quality_score",
  "dom_compression",
  "sale_to_list_improvement",
  "income_growth",
  "educational_attainment_shift",
] as const;

export type SignalKey = (typeof SIGNAL_KEYS)[number];

// a_k: baseline transition log-odds toward regime k (from any state). Spec semantics: stable is the
// most common neutral regime; correcting and overheated are rarer absent strong signals.
export const REGIME_LOGITS_BASE: Record<(typeof REGIMES)[number], number> = {
  stagnant: -0.5,
  stable: 1.0,
  improving: 0.3,
  accelerating: -0.5,
  overheated: -1.5,
  correcting: -1.0,
};

// b_k: how each signal pushes the transition log-odds toward regime k. Positive q value moves probability mass.
// Tuned so strong permit+DOM compression activity → improving/accelerating; falling sale-to-list → correcting.
export const REGIME_LOGIT_WEIGHTS: Record<(typeof REGIMES)[number], Partial<Record<SignalKey, number>>> = {
  stagnant: {
    crime_trend: 0.5,
    dom_compression: -0.4,
    sale_to_list_improvement: -0.3,
    income_growth: -0.5,
  },
  stable: {},
  improving: {
    permit_count_trend: 0.6,
    permit_value_trend: 0.5,
    school_trend: 0.5,
    rent_growth_vs_metro: 0.4,
    income_growth: 0.4,
    rezoning_announcements: 0.3,
    educational_attainment_shift: 0.3,
  },
  accelerating: {
    permit_count_trend: 0.9,
    permit_value_trend: 0.8,
    infrastructure_announcements: 0.7,
    rezoning_announcements: 0.5,
    investor_share: 0.6,
    flip_intensity: 0.5,
    dom_compression: 0.7,
    sale_to_list_improvement: 0.6,
    rent_growth_vs_metro: 0.5,
    retail_quality_score: 0.4,
  },
  overheated: {
    investor_share: 0.9,
    flip_intensity: 0.8,
    dom_compression: 0.8,
    sale_to_list_improvement: 0.6,
    rent_growth_vs_metro: 0.4,
  },
  correcting: {
    crime_trend: 0.8,
    investor_share: -0.4,
    sale_to_list_improvement: -0.8,
    dom_compression: -0.7,
    permit_count_trend: -0.4,
    income_growth: -0.5,
  },
};

// γ: how each signal contributes directly to monthly u_{g,t} drift (above and beyond regime δ_r).
// Provides continuous signal even within a regime. Scales are deliberately small — a strongly
// positive q vector should add at most ~0.5%/mo (~6%/yr) on top of regime drift, since the
// macro layer already captures the bulk of HPI appreciation.
export const SIGNAL_TO_DRIFT: Partial<Record<SignalKey, number>> = {
  permit_count_trend: 0.00015,
  permit_value_trend: 0.00012,
  infrastructure_announcements: 0.00010,
  school_trend: 0.00012,
  crime_trend: -0.00015,
  rent_growth_vs_metro: 0.00020,
  investor_share: 0.00008,
  income_growth: 0.00015,
  dom_compression: 0.00010,
  sale_to_list_improvement: 0.00012,
};

// Cap on per-month drift from the neighborhood layer (regime + signals), preventing runaway growth
// when a snapshot returns aggressive signal values.
export const NEIGHBORHOOD_MONTHLY_DRIFT_CLAMP = 0.0025; // ≈ ±3%/yr ceiling on the layer's drift

// Initial state seed: u_{g,0} represents the cycle momentum already embedded in current price.
// Lower bound (was drift * 24 — too much). 6 months of current drift is sufficient.
export const NEIGHBORHOOD_INITIAL_MONTHS = 6;

export const NEIGHBORHOOD_VERSION = "neighborhood-v1";
