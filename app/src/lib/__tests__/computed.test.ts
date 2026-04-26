import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  computeMonthlyPI,
  computeCashToClose,
  computeDeadlineUrgency,
  computeDaysRemaining,
  computeLEVariance,
  computeTotalLoanCost,
  computeOfferReadiness,
  computeDeadlinesFromOffer,
} from "../computed";
import type { LoanEstimate, Deadline, OfferDetails } from "../types";

/* ------------------------------------------------------------------ */
/*  Helpers to build test fixtures                                     */
/* ------------------------------------------------------------------ */

function makeLE(overrides: Partial<LoanEstimate> = {}): LoanEstimate {
  return {
    id: "le-1",
    deal_id: "deal-1",
    lender: "Test Lender",
    product: "30-year fixed",
    loan_amount: 300_000,
    down_payment: 60_000,
    rate: 6.5,
    apr: 6.8,
    points: 0,
    lender_fees: 3_000,
    third_party_fees: 2_000,
    pmi_monthly: 150,
    impounds: false,
    cash_to_close: 25_000,
    lock_status: "locked",
    lock_expires: null,
    prepay_penalty: false,
    is_chosen: true,
    pdf_document_id: null,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeDeadline(overrides: Partial<Deadline> = {}): Deadline {
  return {
    id: "dl-1",
    deal_id: "deal-1",
    name: "Inspection",
    type: "inspection",
    due_date: "2026-06-01",
    status: "upcoming",
    notes: null,
    linked_document_ids: null,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeOffer(overrides: Partial<OfferDetails> = {}): OfferDetails {
  return {
    id: "offer-1",
    deal_id: "deal-1",
    offer_price: 400_000,
    earnest_money: 10_000,
    closing_date: "2026-07-15",
    contingency_inspection_days: 10,
    contingency_appraisal_days: 15,
    contingency_financing_days: 21,
    contingency_disclosure_days: 5,
    pre_approval_doc_id: null,
    proof_of_funds_doc_id: null,
    checklist_items: {},
    status: "accepted",
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

/* ================================================================== */
/*  computeMonthlyPI                                                   */
/* ================================================================== */

describe("computeMonthlyPI", () => {
  it("calculates standard 30-year mortgage correctly", () => {
    // $300K at 6.5% for 30 years → ~$1,896.20 (known amortization value)
    const result = computeMonthlyPI(300_000, 6.5, 30);
    expect(result).toBeCloseTo(1896.2, 0);
  });

  it("returns 0 for zero loan amount", () => {
    expect(computeMonthlyPI(0, 6.5)).toBe(0);
  });

  it("returns 0 for zero rate", () => {
    expect(computeMonthlyPI(300_000, 0)).toBe(0);
  });

  it("returns 0 for negative rate", () => {
    expect(computeMonthlyPI(300_000, -1)).toBe(0);
  });

  it("calculates higher payment for shorter term", () => {
    const payment30 = computeMonthlyPI(300_000, 6.5, 30);
    const payment15 = computeMonthlyPI(300_000, 6.5, 15);
    expect(payment15).toBeGreaterThan(payment30);
  });

  it("handles large loan amounts without precision loss", () => {
    const result = computeMonthlyPI(1_500_000, 7.0, 30);
    expect(result).toBeGreaterThan(9_000);
    expect(result).toBeLessThan(10_500);
    expect(Number.isFinite(result)).toBe(true);
  });
});

/* ================================================================== */
/*  computeCashToClose                                                 */
/* ================================================================== */

describe("computeCashToClose", () => {
  it("returns null for null LE", () => {
    expect(computeCashToClose(null)).toBeNull();
  });

  it("sums down payment + fees correctly", () => {
    const le = makeLE({
      down_payment: 60_000,
      lender_fees: 3_000,
      third_party_fees: 2_000,
      points: 0,
    });
    // 60000 + 3000 + 2000 + 0 - 0 = 65000
    expect(computeCashToClose(le)).toBe(65_000);
  });

  it("converts points to dollar amount", () => {
    const le = makeLE({
      down_payment: 0,
      lender_fees: 0,
      third_party_fees: 0,
      points: 1.5, // 1.5% of $300K = $4,500
      loan_amount: 300_000,
    });
    expect(computeCashToClose(le)).toBe(4_500);
  });

  it("does not add points cost when points is 0", () => {
    const le = makeLE({ points: 0, down_payment: 10_000, lender_fees: 0, third_party_fees: 0 });
    expect(computeCashToClose(le)).toBe(10_000);
  });

  it("subtracts credits correctly", () => {
    const le = makeLE({ down_payment: 60_000, lender_fees: 0, third_party_fees: 0, points: 0 });
    const result = computeCashToClose(le, {
      sellerCredits: 5_000,
      lenderCredits: 2_000,
      earnestMoney: 10_000,
    });
    // 60000 - (5000 + 2000 + 10000) = 43000
    expect(result).toBe(43_000);
  });

  it("defaults null fields to 0", () => {
    const le = makeLE({
      down_payment: null,
      lender_fees: null,
      third_party_fees: null,
      points: null,
    });
    expect(computeCashToClose(le)).toBe(0);
  });
});

/* ================================================================== */
/*  computeDeadlineUrgency                                             */
/* ================================================================== */

describe("computeDeadlineUrgency", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Use local-time constructor so new Date() and date strings with T00:00:00
    // (the production format after the timezone fix) resolve to the same local day.
    vi.setSystemTime(new Date(2026, 5, 1, 12, 0, 0)); // June 1, noon local
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'completed' regardless of date", () => {
    const dl = makeDeadline({ status: "completed", due_date: "2020-01-01" });
    expect(computeDeadlineUrgency(dl)).toBe("completed");
  });

  it("returns 'waived' regardless of date", () => {
    const dl = makeDeadline({ status: "waived", due_date: "2020-01-01" });
    expect(computeDeadlineUrgency(dl)).toBe("waived");
  });

  it("returns 'upcoming' for due date > 3 days away", () => {
    const dl = makeDeadline({ status: "upcoming", due_date: "2026-06-06" }); // 5 days away
    expect(computeDeadlineUrgency(dl)).toBe("upcoming");
  });

  it("returns 'due-soon' for due date exactly 3 days away", () => {
    const dl = makeDeadline({ status: "upcoming", due_date: "2026-06-04" }); // 3 days
    expect(computeDeadlineUrgency(dl)).toBe("due-soon");
  });

  it("returns 'due-soon' for due date today", () => {
    const dl = makeDeadline({ status: "upcoming", due_date: "2026-06-01" }); // today
    expect(computeDeadlineUrgency(dl)).toBe("due-soon");
  });

  it("returns 'overdue' for yesterday", () => {
    const dl = makeDeadline({ status: "upcoming", due_date: "2026-05-31" }); // yesterday
    expect(computeDeadlineUrgency(dl)).toBe("overdue");
  });

  it("returns 'overdue' for date far in the past", () => {
    const dl = makeDeadline({ status: "upcoming", due_date: "2026-04-01" }); // 2 months ago
    expect(computeDeadlineUrgency(dl)).toBe("overdue");
  });
});

/* ================================================================== */
/*  computeDaysRemaining                                               */
/* ================================================================== */

describe("computeDaysRemaining", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Use local-time constructor so new Date() and date strings with T00:00:00
    // (the production format after the timezone fix) resolve to the same local day.
    vi.setSystemTime(new Date(2026, 5, 1, 12, 0, 0)); // June 1, noon local
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for null input", () => {
    expect(computeDaysRemaining(null)).toBeNull();
  });

  it("returns 0 for today", () => {
    expect(computeDaysRemaining("2026-06-01")).toBe(0);
  });

  it("returns 1 for tomorrow", () => {
    expect(computeDaysRemaining("2026-06-02")).toBe(1);
  });

  it("returns negative for past dates", () => {
    expect(computeDaysRemaining("2026-05-31")).toBe(-1);
  });

  it("returns large positive number for far future", () => {
    // June 1 → Dec 1 = 183 calendar days, but Math.ceil + DST boundary
    // (fall back in November) can add 1. Either 183 or 184 is correct.
    const result = computeDaysRemaining("2026-12-01")!;
    expect(result).toBeGreaterThanOrEqual(183);
    expect(result).toBeLessThanOrEqual(184);
  });
});

/* ================================================================== */
/*  computeLEVariance (TRID compliance — CRITICAL)                     */
/* ================================================================== */

describe("computeLEVariance", () => {
  it("returns empty array for null cdFields", () => {
    expect(computeLEVariance(makeLE(), null)).toEqual([]);
  });

  it("returns empty array when LE and CD match exactly", () => {
    const le = makeLE({ loan_amount: 300_000, rate: 6.5 });
    const cdFields = { loan_amount: 300_000, interest_rate: 6.5 };
    // All deltas are 0 → filtered out
    const result = computeLEVariance(le, cdFields);
    expect(result).toEqual([]);
  });

  it("passes tolerance for delta under $100", () => {
    const le = makeLE({ loan_amount: 300_000 });
    const cdFields = { loan_amount: 300_050 }; // $50 delta
    const result = computeLEVariance(le, cdFields);
    expect(result).toHaveLength(1);
    expect(result[0].toleranceOk).toBe(true);
    expect(result[0].delta).toBe(50);
  });

  it("fails tolerance for delta over $100 AND over 10%", () => {
    // Tolerance is an OR: passes if <= $100 OR <= 10% of LE value.
    // To FAIL, delta must exceed BOTH. Use a small LE value.
    const le = makeLE({ lender_fees: 500 });
    const cdFields = { lender_fees: 601 }; // $101 > $100, and 101/500 = 20.2% > 10%
    const result = computeLEVariance(le, cdFields);
    const feeRow = result.find((r) => r.field === "Lender Fees");
    expect(feeRow).toBeDefined();
    expect(feeRow!.toleranceOk).toBe(false);
  });

  it("passes tolerance for delta exactly $100", () => {
    const le = makeLE({ loan_amount: 300_000 });
    const cdFields = { loan_amount: 300_100 }; // exactly $100
    const result = computeLEVariance(le, cdFields);
    expect(result).toHaveLength(1);
    expect(result[0].toleranceOk).toBe(true);
  });

  it("passes tolerance for delta under 10% of LE value", () => {
    const le = makeLE({ lender_fees: 5_000 });
    const cdFields = { lender_fees: 5_400 }; // $400 > $100, but 8% < 10%
    const result = computeLEVariance(le, cdFields);
    const feeRow = result.find((r) => r.field === "Lender Fees");
    expect(feeRow).toBeDefined();
    expect(feeRow!.toleranceOk).toBe(true);
  });

  it("fails tolerance for delta over 10% of LE value", () => {
    const le = makeLE({ lender_fees: 1_000 });
    const cdFields = { lender_fees: 1_200 }; // $200 > $100, and 20% > 10%
    const result = computeLEVariance(le, cdFields);
    const feeRow = result.find((r) => r.field === "Lender Fees");
    expect(feeRow).toBeDefined();
    expect(feeRow!.toleranceOk).toBe(false);
  });

  it("fails tolerance when LE value is 0 and CD has value", () => {
    // leValue = 0 → can't use 10% rule → falls back to $100 check
    const le = makeLE({ pmi_monthly: 0 });
    const cdFields = { pmi_monthly: 200 }; // $200 > $100, leValue=0 so % check fails
    const result = computeLEVariance(le, cdFields);
    const pmiRow = result.find((r) => r.field === "Monthly PMI");
    expect(pmiRow).toBeDefined();
    expect(pmiRow!.toleranceOk).toBe(false);
  });

  it("unwraps CD value from {value, confidence} object", () => {
    const le = makeLE({ loan_amount: 300_000 });
    const cdFields = { loan_amount: { value: 300_500, confidence: "high" } };
    const result = computeLEVariance(le, cdFields);
    expect(result).toHaveLength(1);
    expect(result[0].cdValue).toBe(300_500);
    expect(result[0].delta).toBe(500);
  });

  it("handles plain number CD values", () => {
    const le = makeLE({ loan_amount: 300_000 });
    const cdFields = { loan_amount: 301_000 };
    const result = computeLEVariance(le, cdFields);
    expect(result[0].cdValue).toBe(301_000);
  });

  it("excludes rows where CD field is missing", () => {
    const le = makeLE({ loan_amount: 300_000, rate: 6.5 });
    const cdFields = { loan_amount: 301_000 }; // no interest_rate in CD
    const result = computeLEVariance(le, cdFields);
    expect(result).toHaveLength(1);
    expect(result[0].field).toBe("Loan Amount");
  });

  it("marks noteworthy when within tolerance but delta > $250", () => {
    // $5,000 lender fees → $5,400 = $400 delta, 8% → within tolerance
    // But $400 > $250 → noteworthy
    const le = makeLE({ lender_fees: 5_000 });
    const cdFields = { lender_fees: 5_400 };
    const result = computeLEVariance(le, cdFields);
    const feeRow = result.find((r) => r.field === "Lender Fees");
    expect(feeRow!.toleranceOk).toBe(true);
    expect(feeRow!.noteworthy).toBe(true);
  });

  it("does not mark noteworthy when delta <= $250", () => {
    const le = makeLE({ lender_fees: 5_000 });
    const cdFields = { lender_fees: 5_200 }; // $200 < $250
    const result = computeLEVariance(le, cdFields);
    const feeRow = result.find((r) => r.field === "Lender Fees");
    expect(feeRow!.toleranceOk).toBe(true);
    expect(feeRow!.noteworthy).toBe(false);
  });

  it("does not mark noteworthy when tolerance is already exceeded", () => {
    // If toleranceOk is false, noteworthy is always false (the red flag is stronger)
    const le = makeLE({ lender_fees: 500 });
    const cdFields = { lender_fees: 900 }; // $400 > $100 AND 80% > 10% → tolerance fails
    const result = computeLEVariance(le, cdFields);
    const feeRow = result.find((r) => r.field === "Lender Fees");
    expect(feeRow!.toleranceOk).toBe(false);
    expect(feeRow!.noteworthy).toBe(false);
  });

  it("catches large dollar amount hidden by percentage tolerance", () => {
    // The key scenario: $300K loan, lender fees go from $3K to $8K
    // $5,000 delta > $100, but 5000/3000 = 166% > 10% → tolerance FAILS
    // Actually wait — let's use cash_to_close on the loan amount where % is small
    const le = makeLE({ loan_amount: 300_000 });
    const cdFields = { loan_amount: 305_000 }; // $5,000 delta, 1.67% → tolerance passes
    const result = computeLEVariance(le, cdFields);
    const loanRow = result.find((r) => r.field === "Loan Amount");
    expect(loanRow!.toleranceOk).toBe(true);
    expect(loanRow!.noteworthy).toBe(true); // $5,000 > $250 → flagged for review
  });

  it("handles multiple fields with mixed pass/fail", () => {
    const le = makeLE({
      loan_amount: 300_000,
      lender_fees: 1_000,
      third_party_fees: 2_000,
    });
    const cdFields = {
      loan_amount: 300_050, // $50 → pass
      lender_fees: 1_200,   // $200, 20% → fail
      third_party_fees: 2_050, // $50 → pass
    };
    const result = computeLEVariance(le, cdFields);
    expect(result).toHaveLength(3);

    const loanRow = result.find((r) => r.field === "Loan Amount");
    expect(loanRow!.toleranceOk).toBe(true);

    const feeRow = result.find((r) => r.field === "Lender Fees");
    expect(feeRow!.toleranceOk).toBe(false);

    const tpRow = result.find((r) => r.field === "Third-Party Fees");
    expect(tpRow!.toleranceOk).toBe(true);
  });
});

/* ================================================================== */
/*  computeTotalLoanCost                                               */
/* ================================================================== */

describe("computeTotalLoanCost", () => {
  it("sums total monthly payments + cash to close", () => {
    const le = makeLE({
      loan_amount: 300_000,
      rate: 6.5,
      pmi_monthly: 150,
      cash_to_close: 25_000,
      product: "30-year fixed",
    });
    const result = computeTotalLoanCost(le);
    // monthlyPI ≈ $1,896.20, total monthly ≈ $2,046.20, × 360 + $25,000
    expect(result).toBeGreaterThan(700_000);
    expect(result).toBeLessThan(800_000);
  });

  it("respects explicit termYears override", () => {
    const le = makeLE({ product: "30-year fixed" });
    const cost30 = computeTotalLoanCost(le, 30);
    const cost15 = computeTotalLoanCost(le, 15);
    // 15-year pays less total despite higher monthly
    expect(cost15).toBeLessThan(cost30);
  });
});

/* ================================================================== */
/*  computeOfferReadiness                                              */
/* ================================================================== */

describe("computeOfferReadiness", () => {
  it("returns zeros for null offer", () => {
    expect(computeOfferReadiness(null)).toEqual({ complete: 0, total: 0, percent: 0 });
  });

  it("returns zeros for empty checklist", () => {
    const offer = makeOffer({ checklist_items: {} });
    expect(computeOfferReadiness(offer)).toEqual({ complete: 0, total: 0, percent: 0 });
  });

  it("calculates partial completion", () => {
    const offer = makeOffer({
      checklist_items: { a: true, b: true, c: false, d: true, e: false },
    });
    expect(computeOfferReadiness(offer)).toEqual({ complete: 3, total: 5, percent: 60 });
  });

  it("calculates 100% for all checked", () => {
    const offer = makeOffer({
      checklist_items: { a: true, b: true, c: true },
    });
    expect(computeOfferReadiness(offer)).toEqual({ complete: 3, total: 3, percent: 100 });
  });
});

/* ================================================================== */
/*  computeDeadlinesFromOffer                                          */
/* ================================================================== */

describe("computeDeadlinesFromOffer", () => {
  it("generates all 5 deadlines when all contingencies set", () => {
    const offer = makeOffer();
    const result = computeDeadlinesFromOffer(offer, "2026-05-01");
    expect(result).toHaveLength(5);

    const types = result.map((d) => d.type);
    expect(types).toContain("inspection");
    expect(types).toContain("appraisal");
    expect(types).toContain("financing");
    expect(types).toContain("disclosure");
    expect(types).toContain("closing");
  });

  it("calculates due dates correctly from acceptance", () => {
    const offer = makeOffer({ contingency_inspection_days: 10 });
    const result = computeDeadlinesFromOffer(offer, "2026-05-01");
    const inspection = result.find((d) => d.type === "inspection");
    expect(inspection!.due_date).toBe("2026-05-11");
  });

  it("passes closing date through directly", () => {
    const offer = makeOffer({ closing_date: "2026-07-15" });
    const result = computeDeadlinesFromOffer(offer, "2026-05-01");
    const closing = result.find((d) => d.type === "closing");
    expect(closing!.due_date).toBe("2026-07-15");
  });

  it("generates only closing when all contingencies null", () => {
    const offer = makeOffer({
      contingency_inspection_days: null,
      contingency_appraisal_days: null,
      contingency_financing_days: null,
      contingency_disclosure_days: null,
      closing_date: "2026-07-15",
    });
    const result = computeDeadlinesFromOffer(offer, "2026-05-01");
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("closing");
  });

  it("returns empty array when everything is null", () => {
    const offer = makeOffer({
      contingency_inspection_days: null,
      contingency_appraisal_days: null,
      contingency_financing_days: null,
      contingency_disclosure_days: null,
      closing_date: null,
    });
    const result = computeDeadlinesFromOffer(offer, "2026-05-01");
    expect(result).toHaveLength(0);
  });
});
