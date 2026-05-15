import { randomNormal } from "d3-random";
import type { PropertySnapshot } from "../data-provider/types";
import { MACRO_PARAMS, MACRO_TO_LOGPRICE } from "./macro-params";

export interface MacroPath {
  // Cumulative log-price contribution from macro through month t (length = months + 1, index 0 = t=0)
  cumulative: Float64Array;
  // Macro state at t=0 (the spec's m_0; non-zero, captures current cycle deviation)
  m0: number;
}

interface MacroState {
  rate: number;
  hpiYoy: number;
  unemp: number;
}

function devToLogPrice(state: MacroState): number {
  const { longRunMean } = MACRO_PARAMS;
  return (
    MACRO_TO_LOGPRICE.rateDeviation * (state.rate - longRunMean.mortgage_rate_30y) +
    MACRO_TO_LOGPRICE.unempDeviation * (state.unemp - longRunMean.unemployment)
  );
  // Note: hpi_yoy is incorporated as monthly drift below, not via levels.
}

/**
 * Layer 3: simulate the macro state forward 180 months and convert to a log-price contribution path.
 *
 * Returns one path (Monte Carlo caller invokes this N times with an RNG source). The returned
 * cumulative[t] is the log-price contribution m_t in the spec's decomposition.
 *
 * m_0 is non-zero: the difference between current macro snapshot and long-run mean, mapped to log
 * price. This is the spec-correct initial condition that makes attribution meaningful at t=0.
 */
export function simulateMacroPath(
  snapshot: PropertySnapshot,
  months: number,
  rngSource: () => number,
): MacroPath {
  const z = snapshot.macro_snapshot;
  const { longRunMean } = MACRO_PARAMS;
  const state: MacroState = {
    rate: z.mortgage_rate_30y ?? longRunMean.mortgage_rate_30y,
    hpiYoy: z.metro_hpi_yoy ?? longRunMean.hpi_yoy,
    unemp: z.metro_unemployment ?? longRunMean.unemployment,
  };

  const m0 = devToLogPrice(state);

  // m_t = cumulativeHpiDrift_t + devToLogPrice(state_t).
  // The drift term accumulates HPI growth month-over-month; the dev term captures the (changing)
  // suppression/boost from rate and unemployment deviation. m_0 = devToLogPrice(state_0) only.
  const cumulative = new Float64Array(months + 1);
  cumulative[0] = m0;

  const stdNorm = randomNormal.source(rngSource)(0, 1);
  const { meanReversion, sigma, crossCoupling } = MACRO_PARAMS;

  let cumulativeDrift = 0;

  for (let t = 1; t <= months; t++) {
    state.rate +=
      meanReversion.mortgage_rate_30y * (longRunMean.mortgage_rate_30y - state.rate) +
      sigma.mortgage_rate_30y * stdNorm();

    state.unemp +=
      meanReversion.unemployment * (longRunMean.unemployment - state.unemp) +
      sigma.unemployment * stdNorm();

    state.hpiYoy +=
      meanReversion.hpi_yoy * (longRunMean.hpi_yoy - state.hpiYoy) +
      sigma.hpi_yoy * stdNorm() +
      crossCoupling.rateToHpi * (state.rate - longRunMean.mortgage_rate_30y);

    cumulativeDrift += state.hpiYoy / 12;
    cumulative[t] = cumulativeDrift + devToLogPrice(state);
  }

  return { cumulative, m0 };
}
