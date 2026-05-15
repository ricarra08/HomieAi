// Macro VAR parameters. v1 uses published rolling realized-vol estimates as static priors.
// Do not attempt to fit from data in v1 — that's a v2 backtest task.

export const MACRO_PARAMS = {
  // Long-run means (the level each variable mean-reverts to over time)
  longRunMean: {
    mortgage_rate_30y: 6.0,     // %
    hpi_yoy: 0.04,              // 4% annualized HPI growth, long run
    unemployment: 4.5,          // %
  },
  // Mean-reversion strength per month (fraction of gap closed)
  meanReversion: {
    mortgage_rate_30y: 0.05,
    hpi_yoy: 0.10,
    unemployment: 0.08,
  },
  // Innovation std-dev per month (Gaussian)
  sigma: {
    mortgage_rate_30y: 0.20,    // ~20bps/mo
    hpi_yoy: 0.005,             // 50bps/mo
    unemployment: 0.08,
  },
  // Cross-coupling: 100bp jump in mortgage rate drags hpi_yoy by ~0.5%/yr the following month
  crossCoupling: {
    rateToHpi: -0.005,          // applied to (rate - longRunMean.mortgage_rate_30y) each month
  },
};

// Coefficients converting macro state → log-price contribution m_t.
// All applied to *deviations from long-run mean*.
export const MACRO_TO_LOGPRICE = {
  rateDeviation: -0.05,     // each 100bp above long-run → ~5% drag on log price (cumulative through HPI path is what drives long-term)
  hpiDeviation: 1.0,        // pass-through (already a log growth rate)
  unempDeviation: -0.015,   // each 1pp above long-run → ~1.5% drag
};
