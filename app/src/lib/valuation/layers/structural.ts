import type { PropertySnapshot } from "../data-provider/types";
import { COEFFS, FALLBACKS, STRUCTURAL_COEFFS_VERSION } from "./structural-coeffs";

function saturating(value: number, breakpoint: number): number {
  if (value <= breakpoint) return value;
  return breakpoint + Math.log1p(value - breakpoint);
}

/**
 * Layer 1: structural baseline f_θ(X_i) in log space.
 * Does NOT include α — caller supplies α to anchor against listing price.
 */
export function structuralHedonic(snapshot: PropertySnapshot): number {
  const p = snapshot.property;

  const sqftLiving = p.sqft_living ?? FALLBACKS.sqft_living;
  const sqftLot = p.sqft_lot ?? FALLBACKS.sqft_lot;
  const beds = p.beds ?? FALLBACKS.beds;
  const baths = p.baths ?? FALLBACKS.baths;
  const yearBuilt = p.effective_year_built ?? p.year_built ?? FALLBACKS.year_built;
  const garage = p.garage_spaces ?? FALLBACKS.garage_spaces;
  const roofAge = p.roof_age_years ?? FALLBACKS.roof_age_years;
  const hvacAge = p.hvac_age_years ?? FALLBACKS.hvac_age_years;

  let log = 0;
  log += COEFFS.log_sqft_living * Math.log(Math.max(sqftLiving, 200));
  log += COEFFS.log_sqft_lot * Math.log(Math.max(sqftLot, 500));
  log += COEFFS.beds * saturating(beds, 4);
  log += COEFFS.baths * saturating(baths, 3);

  const yearAge = Math.min(Math.max(yearBuilt - 1950, 0), COEFFS.yearBuiltCapYears);
  log += COEFFS.yearBuiltPerYear * yearAge;

  log += COEFFS.garagePerSpace * Math.min(garage, 3);

  if (p.pool) log += COEFFS.pool;
  if (p.waterfront) log += COEFFS.waterfront;
  if (p.cul_de_sac) log += COEFFS.culDeSac;
  if (p.corner_lot) log += COEFFS.cornerLot;
  if (p.gated) log += COEFFS.gated;
  if (p.adu) log += COEFFS.adu;

  if (p.kitchen_update_level !== null) log += COEFFS.kitchenLevel[p.kitchen_update_level];
  if (p.bath_update_level !== null) log += COEFFS.bathLevel[p.bath_update_level];

  log += COEFFS.roofAgePerYear * roofAge;
  log += COEFFS.hvacAgePerYear * hvacAge;

  return log;
}

export { STRUCTURAL_COEFFS_VERSION };
