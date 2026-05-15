import { randomNormal } from "d3-random";
import type { PropertySnapshot } from "../data-provider/types";
import {
  REGIMES,
  REGIME_DRIFT,
  REGIME_VOL,
  REGIME_LOGITS_BASE,
  REGIME_LOGIT_WEIGHTS,
  SIGNAL_KEYS,
  SIGNAL_TO_DRIFT,
  NEIGHBORHOOD_MONTHLY_DRIFT_CLAMP,
  NEIGHBORHOOD_INITIAL_MONTHS,
  type RegimeIndex,
  type SignalKey,
} from "./neighborhood-coeffs";

export interface NeighborhoodPath {
  // u_{g,t} cumulative log-price contribution, length = months + 1
  cumulative: Float64Array;
  // u_{g,0} initial value (deviation from long-run derived from current signals)
  u0: number;
  // Regime probability mass at t=0 (used by the orchestrator for the response payload)
  initialRegimeProbs: number[];
  // Cumulative time spent in each regime across the path (used for attribution-friendly summary)
  regimeOccupancy: number[];
}

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

function transitionLogits(q: Record<SignalKey, number>): number[] {
  return REGIMES.map((r) => {
    const base = REGIME_LOGITS_BASE[r];
    const weights = REGIME_LOGIT_WEIGHTS[r];
    let logit = base;
    for (const key of SIGNAL_KEYS) {
      const w = weights[key];
      if (w !== undefined) {
        logit += w * q[key];
      }
    }
    return logit;
  });
}

function signalsAsRecord(snapshot: PropertySnapshot): Record<SignalKey, number> {
  const s = snapshot.neighborhood_signals;
  const out = {} as Record<SignalKey, number>;
  for (const key of SIGNAL_KEYS) {
    const raw = s[key];
    out[key] = raw ?? 0; // null → 0 contribution
  }
  return out;
}

function signalToDriftSum(q: Record<SignalKey, number>): number {
  let sum = 0;
  for (const [key, w] of Object.entries(SIGNAL_TO_DRIFT)) {
    if (w !== undefined) {
      sum += w * q[key as SignalKey];
    }
  }
  return sum;
}

function sampleRegime(probs: number[], rng: () => number): RegimeIndex {
  const r = rng();
  let cum = 0;
  for (let i = 0; i < probs.length; i++) {
    cum += probs[i];
    if (r <= cum) return i as RegimeIndex;
  }
  return (probs.length - 1) as RegimeIndex;
}

/**
 * Layer 4: neighborhood regime + state simulation.
 *
 * u_{g,t} = u_{g,t-1} + δ_{r_{g,t}} + γᵀq_{g,t} + ω_{g,t}
 *
 * Regime transitions follow softmax(a_k + b_kᵀq). For v1 the signal vector q is held constant
 * (we don't simulate q_t forward), so transition probabilities at every step are equal — the
 * regime trajectory is still stochastic (Markov chain with the constant transition row).
 *
 * u_{g,0} is initialized as the cumulative signal-to-drift over 24 months of "current" signals,
 * representing the head start a hot/cold neighborhood already has in current price level.
 */
export function simulateNeighborhoodPath(
  snapshot: PropertySnapshot,
  months: number,
  rngSource: () => number,
): NeighborhoodPath {
  const q = signalsAsRecord(snapshot);
  const logits = transitionLogits(q);
  const probs = softmax(logits);

  // Initial cycle state u_0: a few months of current-signal drift, representing the embedded
  // momentum the neighborhood already has. Treated as a "head start" or "head wind".
  const drift = signalToDriftSum(q);
  const u0 = drift * NEIGHBORHOOD_INITIAL_MONTHS;

  const cumulative = new Float64Array(months + 1);
  cumulative[0] = u0;

  const stdNorm = randomNormal.source(rngSource)(0, 1);
  const occupancy = REGIMES.map(() => 0);

  // Sample initial regime from the t=0 distribution
  let currentRegime = sampleRegime(probs, rngSource);
  occupancy[currentRegime] += 1;
  let u = u0;

  for (let t = 1; t <= months; t++) {
    // Stochastic regime resample at each step from the same q-conditioned distribution
    currentRegime = sampleRegime(probs, rngSource);
    occupancy[currentRegime] += 1;

    const regimeName = REGIMES[currentRegime];
    let stepDrift = REGIME_DRIFT[regimeName] + drift;
    // Hard clamp prevents a noisy snapshot from blowing up cumulative drift.
    stepDrift = Math.max(
      -NEIGHBORHOOD_MONTHLY_DRIFT_CLAMP,
      Math.min(NEIGHBORHOOD_MONTHLY_DRIFT_CLAMP, stepDrift),
    );
    const noise = REGIME_VOL[regimeName] * stdNorm();
    u += stepDrift + noise;
    cumulative[t] = u;
  }

  return {
    cumulative,
    u0,
    initialRegimeProbs: probs,
    regimeOccupancy: occupancy,
  };
}

export { REGIMES };
