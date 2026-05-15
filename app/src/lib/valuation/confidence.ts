import type { PropertySnapshot } from "./data-provider/types";

const HARD_CAP = 75; // per spec: cap at "strong estimate" band until backtest data exists in v2.

export interface ConfidenceInputs {
  snapshot: PropertySnapshot;
  geocodeSucceeded: boolean;
}

/**
 * v1 confidence score is a heuristic. Components, each contributing 0–100 weight:
 *   - completeness_score from the snapshot (0..1 → 0..40)
 *   - comp count (0..6 maps to 0..25)
 *   - core structural fields presence (sqft, year_built, beds, baths → 0..15)
 *   - geocode succeeded (0..10)
 *   - macro snapshot present (0..10) — required field, almost always full
 */
export function computeConfidence(inputs: ConfidenceInputs): { score: number; warnings: string[] } {
  const { snapshot, geocodeSucceeded } = inputs;
  const warnings: string[] = [];

  let score = 0;

  score += Math.round(40 * snapshot.source_quality.completeness_score);

  const compCount = Math.min(snapshot.comps.length, 6);
  score += Math.round((25 * compCount) / 6);
  if (compCount < 3) {
    warnings.push("Limited comparable sales available for this address.");
  }

  const coreFields = [
    snapshot.property.sqft_living,
    snapshot.property.year_built,
    snapshot.property.beds,
    snapshot.property.baths,
  ];
  const presentCore = coreFields.filter((v) => v !== null).length;
  score += Math.round((15 * presentCore) / coreFields.length);
  if (presentCore < coreFields.length) {
    warnings.push("Some core property details (beds/baths/sqft/year) were estimated.");
  }

  if (geocodeSucceeded) {
    score += 10;
  } else {
    warnings.push("Address could not be geocoded; spatial features were dropped.");
  }

  // macro_snapshot is required in the schema; always full. Just credit 10.
  score += 10;

  score = Math.max(0, Math.min(HARD_CAP, score));

  if (snapshot.source_quality.completeness_score < 0.3) {
    warnings.push("Data sources were sparse; treat this as a rough estimate.");
  }

  return { score, warnings };
}
