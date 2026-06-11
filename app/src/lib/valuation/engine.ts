import type { PropertySnapshot, SavedHomeInput } from "./data-provider/types";
import type {
  HomeValueAttribution,
  HomeValueProjectionSeriesPoint,
  RegimeName,
} from "@/lib/types";
import { runSimulation } from "./simulate";
import { computeQuantiles } from "./quantiles";
import { buildAttribution } from "./attribution";
import { computeConfidence } from "./confidence";
import { sanitizeSnapshot } from "./sanitize";
import { REGIMES } from "./layers/neighborhood";
import { STRUCTURAL_COEFFS_VERSION } from "./layers/structural";
import { NEIGHBORHOOD_VERSION } from "./layers/neighborhood-coeffs";

export const MODEL_VERSION = `v1.2-${STRUCTURAL_COEFFS_VERSION}-${NEIGHBORHOOD_VERSION}`;

// Disclosed to users in HomeValueProjectionCard and compliance brief §2.4 ("2,000 simulated
// paths") — update that copy together with this constant.
export const PATHS = 2000;
const HORIZON_MONTHS = 180; // 15 years
const SERIES_CHECKPOINTS = [0, 3, 6, 12, 24, 36, 60, 84, 108, 132, 156, 180];

// Listing-price observation noise: the saved-home price is one (noisy) observation of the latent
// fair value. We let the t=0 distribution spread accordingly so the chart shows a non-degenerate
// uncertainty band at month 0. σ ≈ 3% of log price → range_95 ≈ ±6% at t=0.
const T0_OBSERVATION_SIGMA = 0.03;

export interface ProjectInput {
  snapshot: PropertySnapshot;
  savedHome: SavedHomeInput;
  geocodeSucceeded: boolean;
  address: string;
}

export interface ProjectionResult {
  modelVersion: string;
  anchorPrice: number;
  currentValue: {
    fairValue: number;
    range50: [number, number];
    range80: [number, number];
    range95: [number, number];
    confidenceScore: number;
  };
  scenarios: { conservative: number; moderate: number; optimistic: number };
  series: HomeValueProjectionSeriesPoint[];
  attribution: HomeValueAttribution;
  regime: Partial<Record<RegimeName, number>>;
  explanation: string;
  warnings: string[];
}

function buildRegimeMass(probs: number[]): Partial<Record<RegimeName, number>> {
  const result: Partial<Record<RegimeName, number>> = {};
  REGIMES.forEach((name, i) => {
    if (probs[i] > 0.01) {
      result[name] = Number(probs[i].toFixed(3));
    }
  });
  return result;
}

export function projectHome(input: ProjectInput): ProjectionResult {
  const { savedHome, geocodeSucceeded } = input;
  const snapshot = sanitizeSnapshot(input.snapshot);

  const anchorPrice = savedHome.price ?? snapshot.property.last_sale_price ?? snapshot.property.assessed_value;
  if (!anchorPrice || anchorPrice <= 0) {
    throw new Error("Cannot project: no anchor price available (saved home, last sale, or assessment).");
  }

  const sim = runSimulation(snapshot, {
    paths: PATHS,
    months: HORIZON_MONTHS,
    anchorPrice,
    t0ObservationSigma: T0_OBSERVATION_SIGMA,
  });

  const series: HomeValueProjectionSeriesPoint[] = SERIES_CHECKPOINTS.map((monthOffset) => {
    const col = Array.from(sim.valueMatrix[monthOffset]);
    const [p025, p10, p25, p50, p75, p90, p975] = computeQuantiles(col, [
      0.025, 0.10, 0.25, 0.50, 0.75, 0.90, 0.975,
    ]);
    return {
      monthOffset,
      conservative: Math.round(p25),
      moderate: Math.round(p50),
      optimistic: Math.round(p75),
      range50: [Math.round(p25), Math.round(p75)],
      range80: [Math.round(p10), Math.round(p90)],
      range95: [Math.round(p025), Math.round(p975)],
    };
  });

  const t0 = series[0];
  const { score: confidenceScore, warnings } = computeConfidence({ snapshot, geocodeSucceeded });

  return {
    modelVersion: MODEL_VERSION,
    anchorPrice,
    currentValue: {
      fairValue: t0.moderate,
      range50: t0.range50!,
      range80: t0.range80!,
      range95: t0.range95!,
      confidenceScore,
    },
    scenarios: {
      conservative: t0.conservative,
      moderate: t0.moderate,
      optimistic: t0.optimistic,
    },
    series,
    attribution: buildAttribution(anchorPrice, sim.components),
    regime: buildRegimeMass(sim.initialRegimeProbs),
    explanation: snapshot.explanation,
    warnings,
  };
}
