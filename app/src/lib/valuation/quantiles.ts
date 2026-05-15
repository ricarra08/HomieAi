import { quantile, quantileSorted } from "simple-statistics";

/**
 * Compute multiple quantiles at once. Caller passes an unsorted column of N samples.
 */
export function computeQuantiles(
  samples: number[],
  qs: number[],
): number[] {
  if (samples.length === 0) return qs.map(() => 0);
  const sorted = [...samples].sort((a, b) => a - b);
  return qs.map((q) => quantileSorted(sorted, q));
}

export { quantile };
