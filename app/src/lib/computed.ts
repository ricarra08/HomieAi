import type { LoanEstimate, Deadline, OfferDetails } from "./types";

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
  const due = new Date(deadline.due_date);
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
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * LE vs CD variance — compares key financial fields.
 * Returns an array of field-level deltas with tolerance check.
 */
export function computeLEVariance(
  le: LoanEstimate,
  cdFields: Record<string, unknown> | null
): { field: string; leValue: number; cdValue: number; delta: number; toleranceOk: boolean }[] {
  if (!cdFields) return [];

  const fieldsToCompare: { key: string; label: string }[] = [
    { key: "loan_amount", label: "Loan Amount" },
    { key: "rate", label: "Interest Rate" },
    { key: "apr", label: "APR" },
    { key: "lender_fees", label: "Lender Fees" },
    { key: "third_party_fees", label: "Third-Party Fees" },
    { key: "cash_to_close", label: "Cash to Close" },
    { key: "pmi_monthly", label: "Monthly PMI" },
  ];

  return fieldsToCompare
    .map(({ key, label }) => {
      const leValue = (le[key as keyof LoanEstimate] as number) ?? 0;
      const cdValue = (cdFields[key] as number) ?? 0;
      const delta = cdValue - leValue;
      const absDelta = Math.abs(delta);
      const toleranceOk = absDelta <= 100 || (leValue > 0 && (absDelta / leValue) <= 0.1);

      return { field: label, leValue, cdValue, delta, toleranceOk };
    })
    .filter((row) => row.delta !== 0);
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
 */
export function computeDeadlinesFromOffer(
  offer: OfferDetails,
  acceptanceDate: string
): { name: string; type: string; due_date: string }[] {
  const base = new Date(acceptanceDate);
  const deadlines: { name: string; type: string; due_date: string }[] = [];

  function addDays(date: Date, days: number): string {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  }

  if (offer.contingency_inspection_days) {
    deadlines.push({
      name: "Inspection Contingency",
      type: "inspection",
      due_date: addDays(base, offer.contingency_inspection_days),
    });
  }
  if (offer.contingency_appraisal_days) {
    deadlines.push({
      name: "Appraisal Contingency",
      type: "appraisal",
      due_date: addDays(base, offer.contingency_appraisal_days),
    });
  }
  if (offer.contingency_financing_days) {
    deadlines.push({
      name: "Financing Contingency",
      type: "financing",
      due_date: addDays(base, offer.contingency_financing_days),
    });
  }
  if (offer.contingency_disclosure_days) {
    deadlines.push({
      name: "Disclosure Review",
      type: "disclosure",
      due_date: addDays(base, offer.contingency_disclosure_days),
    });
  }
  if (offer.closing_date) {
    deadlines.push({
      name: "Closing Date",
      type: "closing",
      due_date: offer.closing_date,
    });
  }

  return deadlines;
}
