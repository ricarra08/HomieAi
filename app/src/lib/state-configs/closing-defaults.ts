/**
 * State-aware defaults for the closing phase.
 *
 * Used by FundingRecordingTimeline and SigningAppointment to show
 * the correct closing process steps based on the state's closing style
 * (wet / dry / escrow).
 */

export type FundingStep = {
  step: string;
  status: "pending" | "in-progress" | "complete";
  date?: string;
};

/**
 * Returns the default funding/recording steps for a given closing style.
 *
 * - wet (FL):     3 steps — sign at table, fund, keys same day
 * - dry (TX):     5 steps — sign, lender reviews, funds, records, keys (1-3 days)
 * - escrow (AZ/CA): 5 steps — sign separately, fund, disburse, record, keys
 */
export function getDefaultFundingSteps(style: "wet" | "dry" | "escrow"): FundingStep[] {
  switch (style) {
    case "wet":
      return [
        { step: "Sign at Closing Table", status: "pending" },
        { step: "Lender Funds", status: "pending" },
        { step: "Keys Released", status: "pending" },
      ];
    case "dry":
      return [
        { step: "Sign Documents", status: "pending" },
        { step: "Lender Reviews", status: "pending" },
        { step: "Funds Disbursed", status: "pending" },
        { step: "County Records", status: "pending" },
        { step: "Keys Released", status: "pending" },
      ];
    case "escrow":
      return [
        { step: "Sign Documents", status: "pending" },
        { step: "Lender Funds", status: "pending" },
        { step: "Escrow Disburses", status: "pending" },
        { step: "County Records", status: "pending" },
        { step: "Keys Released", status: "pending" },
      ];
  }
}

/**
 * Returns a human-readable note about the signing/closing process for a state.
 */
export function getSigningNote(style: "wet" | "dry" | "escrow"): string {
  switch (style) {
    case "wet":
      return "Parties typically sign together at the closing table. Funds are disbursed and keys released the same day.";
    case "dry":
      return "You'll sign separately from the seller. The lender reviews signed documents before funding. Keys are available 1-3 business days after signing.";
    case "escrow":
      return "You'll sign separately from the seller. The escrow company coordinates funding and recording. Keys are available after the deed records, typically 1-3 business days.";
  }
}
