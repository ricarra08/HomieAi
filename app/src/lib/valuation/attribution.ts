import type { HomeValueAttribution } from "@/lib/types";
import type { SimulationResult } from "./simulate";

/**
 * Decompose log(anchorPrice) into the spec's 6 attribution buckets.
 *
 * In our v1 engine: log(anchorPrice) = α + f_θ + s + m_0 + u_0 + h_0
 * where each is signed. We translate to the spec's percentage shares (sum = 1.0 over signed terms):
 *   structure       = (α + f_θ) / log(anchorPrice)   ← cycle-independent value
 *   micro_location  = s / log(anchorPrice)
 *   macro           = m_0 / log(anchorPrice)
 *   neighborhood    = u_0 / log(anchorPrice)
 *   property_specific = h_0 / log(anchorPrice)
 *
 * comp_residual captures the part absorbed into α relative to the cycle-independent hedonic baseline:
 *   comp_residual = α / log(anchorPrice)
 *
 * Note: "structure" in the spec sums α + f_θ. To split cleanly, we report structure as just f_θ and
 * put the α residual into comp_residual. This matches the spec response example shape where
 * comp_residual is typically the largest single bucket because real comps aren't yet wired.
 */
export function buildAttribution(
  anchorPrice: number,
  components: SimulationResult["components"],
): HomeValueAttribution {
  const logAnchor = Math.log(anchorPrice);
  const total = Math.abs(logAnchor) || 1;

  return {
    structure: components.structuralHedonic / total,
    microLocation: components.spatialContribution / total,
    macro: components.m0 / total,
    neighborhood: components.u0 / total,
    propertySpecific: components.h0 / total,
    compResidual: components.alpha / total,
  };
}
