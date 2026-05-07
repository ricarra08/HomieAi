export type { StateCode, StateConfig } from "./types";
export { addDays, addCalendarDays } from "./day-counting";
export { getDefaultFundingSteps, getSigningNote } from "./closing-defaults";
export type { FundingStep } from "./closing-defaults";

import type { StateCode, StateConfig } from "./types";
import { FLORIDA_CONFIG } from "./fl";
import { TEXAS_CONFIG } from "./tx";
import { ARIZONA_CONFIG } from "./az";
import { CALIFORNIA_CONFIG } from "./ca";

export const SUPPORTED_STATES: StateCode[] = ["FL", "TX", "AZ", "CA"];

export const STATE_LABELS: Record<StateCode, string> = {
  FL: "Florida",
  TX: "Texas",
  AZ: "Arizona",
  CA: "California",
};

const STATE_CONFIGS: Record<StateCode, StateConfig> = {
  FL: FLORIDA_CONFIG,
  TX: TEXAS_CONFIG,
  AZ: ARIZONA_CONFIG,
  CA: CALIFORNIA_CONFIG,
};

/**
 * Get the full state configuration for a given state code.
 * Throws if the state code is not supported.
 */
export function getStateConfig(stateCode: string): StateConfig {
  const config = STATE_CONFIGS[stateCode as StateCode];
  if (!config) throw new Error(`Unsupported state: ${stateCode}`);
  return config;
}

/**
 * Type guard: is this string a supported state code?
 */
export function isValidStateCode(code: string): code is StateCode {
  return SUPPORTED_STATES.includes(code as StateCode);
}

/**
 * Get form-ready contingency defaults for a state.
 * Used by TransactionSetupForm, AddClientDialog, and OfferView
 * to avoid duplicating state→defaults logic.
 */
export function getContingencyDefaults(stateCode: string): {
  inspectionDays: string;
  appraisalDays: string;
  loanDays: string;
  inspectionLabel: string;
  showAppraisal: boolean;
  showOptionPeriod: boolean;
  optionPeriodDays: string;
} {
  const config = getStateConfig(stateCode);
  return {
    inspectionDays: String(config.contingency_defaults.inspection_days),
    appraisalDays: config.contingency_defaults.appraisal_days
      ? String(config.contingency_defaults.appraisal_days)
      : "",
    loanDays: String(config.contingency_defaults.financing_days),
    inspectionLabel: config.buyer_protection.label,
    showAppraisal: config.contingency_defaults.appraisal_days !== null,
    showOptionPeriod: config.option_period.enabled,
    optionPeriodDays: config.option_period.default_days
      ? String(config.option_period.default_days)
      : "",
  };
}
