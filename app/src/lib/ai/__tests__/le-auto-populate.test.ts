import { describe, it, expect } from "vitest";
import { mapExtractedToLE } from "../le-auto-populate";

/* ------------------------------------------------------------------ */
/*  Helper: build extracted fields in {value, confidence} format       */
/* ------------------------------------------------------------------ */

function makeFields(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    lender_name: { value: "Chase Bank", confidence: "high" },
    loan_product: { value: "30-year fixed", confidence: "high" },
    loan_amount: { value: 300_000, confidence: "high" },
    interest_rate: { value: 6.5, confidence: "high" },
    apr: { value: 6.8, confidence: "medium" },
    down_payment_pct: { value: 20, confidence: "high" },
    points: { value: 1.0, confidence: "medium" },
    lender_fees: { value: 3_000, confidence: "high" },
    third_party_fees: { value: 2_000, confidence: "medium" },
    pmi_monthly: { value: 150, confidence: "low" },
    impounds: { value: true, confidence: "high" },
    cash_to_close: { value: 25_000, confidence: "high" },
    lock_status: { value: "Locked", confidence: "high" },
    lock_expiration: { value: "2026-07-01", confidence: "medium" },
    prepay_penalty: { value: false, confidence: "high" },
    ...overrides,
  };
}

/* ================================================================== */
/*  mapExtractedToLE — full mapping                                    */
/* ================================================================== */

describe("mapExtractedToLE", () => {
  it("maps all fields from a full extraction correctly", () => {
    const result = mapExtractedToLE(makeFields(), "doc-1", "deal-1");

    expect(result.deal_id).toBe("deal-1");
    expect(result.pdf_document_id).toBe("doc-1");
    expect(result.lender).toBe("Chase Bank");
    expect(result.product).toBe("30-year fixed");
    expect(result.loan_amount).toBe(300_000);
    expect(result.rate).toBe(6.5);
    expect(result.apr).toBe(6.8);
    expect(result.points).toBe(1.0);
    expect(result.lender_fees).toBe(3_000);
    expect(result.third_party_fees).toBe(2_000);
    expect(result.pmi_monthly).toBe(150);
    expect(result.impounds).toBe(true);
    expect(result.cash_to_close).toBe(25_000);
    expect(result.lock_status).toBe("locked");
    expect(result.lock_expires).toBe("2026-07-01");
    expect(result.prepay_penalty).toBe(false);
    expect(result.is_chosen).toBe(false);
  });

  it("calculates down payment from loan amount and percentage", () => {
    // downPayment = loanAmount * (downPct / (100 - downPct))
    // = 300000 * (20 / 80) = 75000
    const result = mapExtractedToLE(makeFields(), "doc-1", "deal-1");
    expect(result.down_payment).toBe(75_000);
  });

  it("returns 0 down_payment when downPct is 0 (VA/USDA loans)", () => {
    const fields = makeFields({ down_payment_pct: { value: 0, confidence: "high" } });
    const result = mapExtractedToLE(fields, "doc-1", "deal-1");
    expect(result.down_payment).toBe(0);
  });

  it("returns undefined down_payment when loan amount is missing", () => {
    const fields = makeFields({
      loan_amount: { value: null, confidence: "low" },
    });
    const result = mapExtractedToLE(fields, "doc-1", "deal-1");
    expect(result.down_payment).toBeUndefined();
  });

  it("defaults lender to 'Unknown Lender' when missing", () => {
    const fields = makeFields({ lender_name: { value: "", confidence: "low" } });
    const result = mapExtractedToLE(fields, "doc-1", "deal-1");
    expect(result.lender).toBe("Unknown Lender");
  });

  it("defaults product to 'Unknown Product' when missing", () => {
    const fields = makeFields({ loan_product: { value: null, confidence: "low" } });
    const result = mapExtractedToLE(fields, "doc-1", "deal-1");
    expect(result.product).toBe("Unknown Product");
  });

  it("defaults loan_amount to 0 when missing", () => {
    const fields = makeFields({ loan_amount: { value: "not a number", confidence: "low" } });
    const result = mapExtractedToLE(fields, "doc-1", "deal-1");
    expect(result.loan_amount).toBe(0);
  });

  it("defaults rate to 0 when missing", () => {
    const fields = makeFields({ interest_rate: { value: undefined, confidence: "low" } });
    const result = mapExtractedToLE(fields, "doc-1", "deal-1");
    expect(result.rate).toBe(0);
  });
});

/* ================================================================== */
/*  normalizeLockStatus (tested through mapExtractedToLE)              */
/* ================================================================== */

describe("lock status normalization via mapExtractedToLE", () => {
  it("normalizes 'Locked' to 'locked'", () => {
    const result = mapExtractedToLE(makeFields({ lock_status: { value: "Locked" } }), "d", "d");
    expect(result.lock_status).toBe("locked");
  });

  it("normalizes 'floating' to 'floating'", () => {
    const result = mapExtractedToLE(makeFields({ lock_status: { value: "floating" } }), "d", "d");
    expect(result.lock_status).toBe("floating");
  });

  it("normalizes 'unlocked' to 'floating'", () => {
    const result = mapExtractedToLE(makeFields({ lock_status: { value: "unlocked" } }), "d", "d");
    expect(result.lock_status).toBe("floating");
  });

  it("normalizes 'yes' to 'locked'", () => {
    const result = mapExtractedToLE(makeFields({ lock_status: { value: "yes" } }), "d", "d");
    expect(result.lock_status).toBe("locked");
  });

  it("returns null for missing lock status", () => {
    const result = mapExtractedToLE(makeFields({ lock_status: { value: null } }), "d", "d");
    expect(result.lock_status).toBeNull();
  });
});

/* ================================================================== */
/*  bool helper (tested through mapExtractedToLE)                      */
/* ================================================================== */

describe("boolean field extraction via mapExtractedToLE", () => {
  it("parses string 'yes' as true for impounds", () => {
    const result = mapExtractedToLE(makeFields({ impounds: { value: "yes" } }), "d", "d");
    expect(result.impounds).toBe(true);
  });

  it("parses string 'no' as false for impounds", () => {
    const result = mapExtractedToLE(makeFields({ impounds: { value: "no" } }), "d", "d");
    expect(result.impounds).toBe(false);
  });

  it("defaults impounds to false when missing", () => {
    const result = mapExtractedToLE(makeFields({ impounds: { value: undefined } }), "d", "d");
    expect(result.impounds).toBe(false);
  });
});
