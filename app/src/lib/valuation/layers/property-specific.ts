import { randomNormal } from "d3-random";
import type { PropertySnapshot } from "../data-provider/types";

const RHO = 0.97;          // sticky persistence
const SIGMA = 0.002;       // monthly innovation σ
const FLOOD_DRAG = -0.0008;       // monthly
const OLD_HOME_DRAG_PER_YEAR_OVER_60 = -0.00005;

const HIGH_RISK_FLOOD_ZONES = new Set(["A", "AE", "AH", "AO", "AR", "A99", "V", "VE"]);

export interface PropertySpecificPath {
  cumulative: Float64Array;
  h0: number;
}

function computeDragRate(snapshot: PropertySnapshot): number {
  let drag = 0;
  if (
    snapshot.spatial.flood_zone &&
    HIGH_RISK_FLOOD_ZONES.has(snapshot.spatial.flood_zone.toUpperCase())
  ) {
    drag += FLOOD_DRAG;
  }
  const yearBuilt = snapshot.property.effective_year_built ?? snapshot.property.year_built;
  if (yearBuilt !== null && yearBuilt < 1960) {
    drag += OLD_HOME_DRAG_PER_YEAR_OVER_60 * (1960 - yearBuilt);
  }
  return drag;
}

/**
 * Layer 5: property-specific evolution h_{i,t} = ρ h_{i,t-1} + κᵀR − λᵀD + ξ.
 * v1 does not yet expose renovation flags from the UI (defaults to none), so R is empty.
 * D drag comes from flood-zone status and old construction without recent renovation.
 *
 * h_{i,0} initialized as drag × 12 (one year of embedded condition state).
 */
export function simulatePropertySpecificPath(
  snapshot: PropertySnapshot,
  months: number,
  rngSource: () => number,
): PropertySpecificPath {
  const dragRate = computeDragRate(snapshot);
  const h0 = dragRate * 12;

  const cumulative = new Float64Array(months + 1);
  cumulative[0] = h0;

  const stdNorm = randomNormal.source(rngSource)(0, 1);
  let h = h0;

  for (let t = 1; t <= months; t++) {
    h = RHO * h + dragRate + SIGMA * stdNorm();
    cumulative[t] = h;
  }

  return { cumulative, h0 };
}
