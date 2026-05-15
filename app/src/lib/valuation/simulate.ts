import { randomLcg, randomNormal } from "d3-random";
import type { PropertySnapshot } from "./data-provider/types";
import { structuralHedonic } from "./layers/structural";
import { spatialContribution } from "./layers/spatial";
import { simulateMacroPath } from "./layers/macro";
import { simulateNeighborhoodPath } from "./layers/neighborhood";
import { simulatePropertySpecificPath } from "./layers/property-specific";

export interface SimulationConfig {
  paths: number;
  months: number;
  anchorPrice: number;
  seed?: number;
  /** Per-path log-price observation shock at t=0, representing listing-price measurement noise. */
  t0ObservationSigma?: number;
}

export interface SimulationResult {
  /** valueMatrix[t][p] = simulated price at month t for path p */
  valueMatrix: Float64Array[];
  /** Decomposition averages at t=0 (for attribution) */
  components: {
    structuralHedonic: number;
    spatialContribution: number;
    m0: number;
    u0: number;
    h0: number;
    alpha: number;
  };
  /** Initial regime probability mass (averaged across paths) */
  initialRegimeProbs: number[];
  /** Time-spent in each regime, averaged across paths */
  regimeOccupancyAverage: number[];
}

/**
 * Run the full Monte Carlo. Returns price paths in dollar space + decomposition info.
 *
 * Composition (spec-faithful): for each month t and path p
 *   x_{p,t} = b_i + s(ℓ) + u_{p,t} + m_{p,t} + h_{p,t}
 *   V_{p,t} = exp(x_{p,t})
 *
 * α is calibrated so V_{·,0} = anchorPrice exactly (no spread at t=0):
 *   α = log(anchorPrice) − f_θ(X_i) − s(ℓ) − m_0 − u_0 − h_0
 */
export function runSimulation(
  snapshot: PropertySnapshot,
  config: SimulationConfig,
): SimulationResult {
  const { paths, months, anchorPrice, seed = 42, t0ObservationSigma = 0 } = config;

  // Static (non-stochastic) layer values, computed once.
  const fTheta = structuralHedonic(snapshot);
  const s = spatialContribution(snapshot);

  // We need m_0, u_0, h_0 to calibrate α. These come from the first path; subsequent paths share
  // the same initial values (they're functions of the snapshot, not the RNG).
  const rng = randomLcg(seed);
  const obsShock = t0ObservationSigma > 0 ? randomNormal.source(rng)(0, t0ObservationSigma) : null;

  // Allocate per-month columns up front so the resulting matrix is column-oriented (one Float64Array
  // per month, indexed [path]). This makes per-month quantile computation fast.
  const valueMatrix: Float64Array[] = [];
  for (let t = 0; t <= months; t++) {
    valueMatrix.push(new Float64Array(paths));
  }

  // Aggregate regime info across paths
  const regimeProbsSum = [0, 0, 0, 0, 0, 0];
  const occupancySum = [0, 0, 0, 0, 0, 0];

  let m0Captured = 0;
  let u0Captured = 0;
  let h0Captured = 0;
  let alpha = 0;

  for (let p = 0; p < paths; p++) {
    const macro = simulateMacroPath(snapshot, months, rng);
    const neigh = simulateNeighborhoodPath(snapshot, months, rng);
    const propSpec = simulatePropertySpecificPath(snapshot, months, rng);

    if (p === 0) {
      m0Captured = macro.m0;
      u0Captured = neigh.u0;
      h0Captured = propSpec.h0;
      alpha = Math.log(anchorPrice) - fTheta - s - macro.m0 - neigh.u0 - propSpec.h0;
    }

    // Per-path observation shock: gives the t=0 distribution a sensible spread representing
    // listing-price measurement uncertainty. Carried as a constant level shift across the path.
    const pathShock = obsShock ? obsShock() : 0;

    const b = alpha + fTheta;

    for (let t = 0; t <= months; t++) {
      const x =
        b + s + macro.cumulative[t] + neigh.cumulative[t] + propSpec.cumulative[t] + pathShock;
      valueMatrix[t][p] = Math.exp(x);
    }

    for (let r = 0; r < 6; r++) {
      regimeProbsSum[r] += neigh.initialRegimeProbs[r];
      occupancySum[r] += neigh.regimeOccupancy[r];
    }
  }

  return {
    valueMatrix,
    components: {
      structuralHedonic: fTheta,
      spatialContribution: s,
      m0: m0Captured,
      u0: u0Captured,
      h0: h0Captured,
      alpha,
    },
    initialRegimeProbs: regimeProbsSum.map((v) => v / paths),
    regimeOccupancyAverage: occupancySum.map((v) => v / (paths * (months + 1))),
  };
}
