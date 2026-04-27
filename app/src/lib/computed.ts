import type { LoanEstimate, Deadline, OfferDetails } from "./types";
import type { StateConfig } from "./state-configs/types";
import { addDays as addDaysFromConfig } from "./state-configs/day-counting";
import { parseLoanTermYears } from "./utils";

/**
 * Standard amortization: monthly principal & interest payment.
 * This is deterministic math — never ask the LLM for this.
 */
export function computeMonthlyPI(loanAmount: number, annualRate: number, termYears: number = 30): number {
  if (annualRate <= 0 || loanAmount <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  return (
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
}

/**
 * Cash-to-close from a chosen loan estimate and optional credits.
 * Down payment + closing costs - credits = cash to close.
 */
export function computeCashToClose(
  chosenLE: LoanEstimate | null,
  credits: { sellerCredits?: number; lenderCredits?: number; earnestMoney?: number } = {}
): number | null {
  if (!chosenLE) return null;

  const downPayment = chosenLE.down_payment ?? 0;
  const lenderFees = chosenLE.lender_fees ?? 0;
  const thirdPartyFees = chosenLE.third_party_fees ?? 0;
  const points = (chosenLE.points ?? 0) > 0
    ? (chosenLE.points! / 100) * chosenLE.loan_amount
    : 0;

  const totalCosts = downPayment + lenderFees + thirdPartyFees + points;
  const totalCredits =
    (credits.sellerCredits ?? 0) +
    (credits.lenderCredits ?? 0) +
    (credits.earnestMoney ?? 0);

  return totalCosts - totalCredits;
}

/**
 * Deadline urgency based on days remaining.
 * Returns a status suitable for UI color coding.
 */
export function computeDeadlineUrgency(
  deadline: Deadline
): "overdue" | "due-soon" | "upcoming" | "completed" | "waived" {
  if (deadline.status === "completed") return "completed";
  if (deadline.status === "waived") return "waived";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Append T00:00:00 to force local-time parsing. Date-only strings like
  // "2026-06-01" are parsed as UTC midnight per the JS spec, which shifts
  // to the previous day in negative-offset timezones (e.g., US Eastern/Central).
  const due = new Date(deadline.due_date + "T00:00:00");
  due.setHours(0, 0, 0, 0);

  const daysRemaining = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) return "overdue";
  if (daysRemaining <= 3) return "due-soon";
  return "upcoming";
}

/**
 * Days remaining until a date. Negative means overdue.
 */
export function computeDaysRemaining(targetDate: string | null): number | null {
  if (!targetDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Append T00:00:00 to force local-time parsing (see computeDeadlineUrgency comment).
  const target = new Date(targetDate + "T00:00:00");
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * LE vs CD variance — compares key financial fields.
 * Returns an array of field-level deltas with tolerance check.
 */
function unwrapCDValue(cdFields: Record<string, unknown>, key: string): number | null {
  const raw = cdFields[key];
  if (typeof raw === "number") return raw;
  if (raw && typeof raw === "object" && "value" in raw) {
    const v = (raw as { value: unknown }).value;
    return typeof v === "number" ? v : null;
  }
  return null;
}

// Dollar threshold above which a change is flagged as "noteworthy" even if
// it's within TRID tolerance. TRID compliance is a regulatory floor — this
// is the consumer-protection layer on top.
const NOTEWORTHY_DELTA = 250;

export interface LEVarianceRow {
  field: string;
  leValue: number;
  cdValue: number;
  delta: number;
  toleranceOk: boolean;
  /** Within TRID tolerance but still a significant dollar change worth reviewing. */
  noteworthy: boolean;
}

export function computeLEVariance(
  le: LoanEstimate,
  cdFields: Record<string, unknown> | null
): LEVarianceRow[] {
  if (!cdFields) return [];

  const fieldsToCompare: { key: string; label: string }[] = [
    { key: "loan_amount", label: "Loan Amount" },
    { key: "interest_rate", label: "Interest Rate" },
    { key: "apr", label: "APR" },
    { key: "lender_fees", label: "Lender Fees" },
    { key: "third_party_fees", label: "Third-Party Fees" },
    { key: "cash_to_close", label: "Cash to Close" },
    { key: "pmi_monthly", label: "Monthly PMI" },
  ];

  const leKeyMap: Record<string, keyof LoanEstimate> = {
    loan_amount: "loan_amount",
    interest_rate: "rate",
    apr: "apr",
    lender_fees: "lender_fees",
    third_party_fees: "third_party_fees",
    cash_to_close: "cash_to_close",
    pmi_monthly: "pmi_monthly",
  };

  return fieldsToCompare
    .map(({ key, label }) => {
      const leValue = (le[leKeyMap[key]] as number) ?? 0;
      const cdValue = unwrapCDValue(cdFields, key);
      if (cdValue === null) return null;
      const delta = cdValue - leValue;
      const absDelta = Math.abs(delta);
      const toleranceOk = absDelta <= 100 || (leValue > 0 && (absDelta / leValue) <= 0.1);
      const noteworthy = toleranceOk && absDelta > NOTEWORTHY_DELTA;

      return { field: label, leValue, cdValue, delta, toleranceOk, noteworthy };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null && row.delta !== 0);
}

export function computeTotalLoanCost(le: LoanEstimate, termYears?: number): number {
  const term = termYears ?? parseLoanTermYears(le.product);
  const monthlyPI = computeMonthlyPI(le.loan_amount, le.rate, term);
  const totalMonthly = monthlyPI + (le.pmi_monthly ?? 0);
  return totalMonthly * (term * 12) + (le.cash_to_close ?? 0);
}

/**
 * Offer readiness — checklist completion percentage.
 */
export function computeOfferReadiness(
  offer: OfferDetails | null
): { complete: number; total: number; percent: number } {
  if (!offer) return { complete: 0, total: 0, percent: 0 };

  const items = offer.checklist_items;
  const keys = Object.keys(items);
  const total = keys.length;
  const complete = keys.filter((k) => items[k]).length;
  const percent = total > 0 ? Math.round((complete / total) * 100) : 0;

  return { complete, total, percent };
}

/**
 * Compute deadlines from offer contingency days + acceptance date.
 * Used during Offer → Escrow transition to auto-generate deadline rows.
 *
 * When stateConfig is provided, generates state-specific deadlines
 * (TX option period, CA standalone appraisal, etc.) with proper day counting.
 * When omitted, falls back to legacy calendar-day behavior.
 */
export function computeDeadlinesFromOffer(
  offer: OfferDetails,
  acceptanceDate: string,
  stateConfig?: StateConfig
): { name: string; type: string; due_date: string }[] {
  const deadlines: { name: string; type: string; due_date: string }[] = [];

  const countType = stateConfig?.day_counting.type ?? "calendar";
  const weekendExt = stateConfig?.day_counting.weekend_extension ?? false;

  function add(days: number): string {
    return addDaysFromConfig(acceptanceDate, days, countType, weekendExt);
  }

  // EMD deposit deadline
  if (stateConfig) {
    deadlines.push({
      name: "Earnest Money Deposit Due",
      type: "earnest-money",
      due_date: addDaysFromConfig(
        acceptanceDate,
        stateConfig.earnest_money.deposit_deadline_days,
        stateConfig.earnest_money.deposit_deadline_type,
        weekendExt
      ),
    });
  }

  // TX option period
  if (stateConfig?.option_period.enabled && offer.option_period_days) {
    deadlines.push({
      name: "Option Period Expires",
      type: "option-period",
      due_date: add(offer.option_period_days),
    });
    if (stateConfig.option_period.fee_delivery_days) {
      deadlines.push({
        name: "Option Fee Delivery",
        type: "option-fee-delivery",
        due_date: add(stateConfig.option_period.fee_delivery_days),
      });
    }
  }

  // Inspection / Investigation contingency
  if (offer.contingency_inspection_days) {
    const isInvestigation = stateConfig?.buyer_protection.type === "investigation_contingency";
    deadlines.push({
      name: isInvestigation ? "Investigation Contingency Expires" : (stateConfig?.buyer_protection.label ?? "Inspection Contingency"),
      type: isInvestigation ? "investigation" : "inspection",
      due_date: add(offer.contingency_inspection_days),
    });
  }

  // CA standalone appraisal contingency
  if (offer.contingency_appraisal_days) {
    deadlines.push({
      name: "Appraisal Contingency",
      type: "appraisal",
      due_date: add(offer.contingency_appraisal_days),
    });
  }

  // Financing contingency
  if (offer.contingency_financing_days) {
    deadlines.push({
      name: "Financing Contingency",
      type: "financing",
      due_date: add(offer.contingency_financing_days),
    });
  }

  // Disclosure review
  if (offer.contingency_disclosure_days) {
    deadlines.push({
      name: "Disclosure Review",
      type: "disclosure",
      due_date: add(offer.contingency_disclosure_days),
    });
  }

  // Closing date
  if (offer.closing_date) {
    deadlines.push({
      name: "Closing Date",
      type: "closing",
      due_date: offer.closing_date,
    });
  }

  return deadlines;
}

/**
 * Compute deadlines from setup form values (no OfferDetails row yet).
 * Used by TransactionSetupForm, AddClientDialog, and OfferView
 * when creating a transaction directly (not through the offer flow).
 */
export function computeDeadlinesFromSetupForm(
  params: {
    acceptanceDate: string;
    closingDate?: string;
    inspectionDays?: number;
    appraisalDays?: number;
    loanDays?: number;
    optionPeriodDays?: number;
  },
  stateConfig?: StateConfig
): { name: string; type: string; due_date: string }[] {
  const deadlines: { name: string; type: string; due_date: string }[] = [];
  const base = params.acceptanceDate;

  const countType = stateConfig?.day_counting.type ?? "calendar";
  const weekendExt = stateConfig?.day_counting.weekend_extension ?? false;

  function add(days: number): string {
    return addDaysFromConfig(base, days, countType, weekendExt);
  }

  // EMD deposit deadline
  if (stateConfig) {
    deadlines.push({
      name: "Earnest Money Deposit Due",
      type: "earnest-money",
      due_date: addDaysFromConfig(
        base,
        stateConfig.earnest_money.deposit_deadline_days,
        stateConfig.earnest_money.deposit_deadline_type,
        weekendExt
      ),
    });
  }

  // TX option period
  if (stateConfig?.option_period.enabled && params.optionPeriodDays) {
    deadlines.push({
      name: "Option Period Expires",
      type: "option-period",
      due_date: add(params.optionPeriodDays),
    });
    if (stateConfig.option_period.fee_delivery_days) {
      deadlines.push({
        name: "Option Fee Delivery",
        type: "option-fee-delivery",
        due_date: add(stateConfig.option_period.fee_delivery_days),
      });
    }
  }

  // Inspection / Investigation
  if (params.inspectionDays) {
    const isInvestigation = stateConfig?.buyer_protection.type === "investigation_contingency";
    deadlines.push({
      name: isInvestigation ? "Investigation Contingency Expires" : (stateConfig?.buyer_protection.label ?? "Inspection Contingency"),
      type: isInvestigation ? "investigation" : "inspection",
      due_date: add(params.inspectionDays),
    });
  }

  // Appraisal (CA standalone)
  if (params.appraisalDays) {
    deadlines.push({
      name: "Appraisal Contingency",
      type: "appraisal",
      due_date: add(params.appraisalDays),
    });
  }

  // Financing
  if (params.loanDays) {
    deadlines.push({
      name: "Financing Contingency",
      type: "financing",
      due_date: add(params.loanDays),
    });
  }

  // Closing date
  if (params.closingDate) {
    deadlines.push({
      name: "Closing Date",
      type: "closing",
      due_date: params.closingDate,
    });
  }

  return deadlines;
}
