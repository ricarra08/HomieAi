import type { PropertySnapshot } from "../data-provider/types";

const W = {
  schoolPerPtAbove5: 0.012,
  walkabilityPerPtAbove50: 0.0006,
  highRiskFloodPenalty: -0.04,
  crimeZscore: -0.018,
  waterProximityBonus: 0.04,           // applied when within 1 mi of water but not waterfront
  jobCenterPenaltyPerMile: -0.003,     // per mile over 15 miles
};

const HIGH_RISK_FLOOD_ZONES = new Set(["A", "AE", "AH", "AO", "AR", "A99", "V", "VE"]);

/**
 * Layer 2: spatial micro-location s(ℓ_i). Bounded contribution (~±10% in log space).
 */
export function spatialContribution(snapshot: PropertySnapshot): number {
  const s = snapshot.spatial;
  let log = 0;

  if (s.school_score !== null) {
    log += W.schoolPerPtAbove5 * (s.school_score - 5);
  }
  if (s.walkability !== null) {
    log += W.walkabilityPerPtAbove50 * (s.walkability - 50);
  }
  if (s.flood_zone && HIGH_RISK_FLOOD_ZONES.has(s.flood_zone.toUpperCase())) {
    log += W.highRiskFloodPenalty;
  }
  if (s.crime_index_zscore !== null) {
    log += W.crimeZscore * s.crime_index_zscore;
  }
  if (
    s.distance_to_water_miles !== null &&
    s.distance_to_water_miles < 1 &&
    !snapshot.property.waterfront
  ) {
    log += W.waterProximityBonus * (1 - s.distance_to_water_miles);
  }
  if (s.distance_to_job_center_miles !== null && s.distance_to_job_center_miles > 15) {
    log += W.jobCenterPenaltyPerMile * (s.distance_to_job_center_miles - 15);
  }

  // Clamp to ±15% in log space so a single weird input can't dominate.
  return Math.max(-0.15, Math.min(0.15, log));
}
