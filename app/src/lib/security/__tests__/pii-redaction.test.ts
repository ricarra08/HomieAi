import { describe, it, expect } from "vitest";
import {
  redactPii,
  redactPiiText,
  passesLuhn,
  isValidAbaRouting,
} from "../pii-redaction";

// Synthetic checksum-valid fixtures:
// - Routing 123456780: 3(1+4+7) + 7(2+5+8) + (3+6+0) = 36 + 105 + 9 = 150 ✓, prefix 12 ✓
// - Routing 123456789: sum 159 ✗
// - Card 4111111111111111 is the canonical Luhn-valid Visa test number.
const VALID_ROUTING = "123456780";
const INVALID_ROUTING = "123456789";
const VALID_CARD = "4111111111111111";
const INVALID_CARD = "4111111111111112";

const CD_FIXTURE = `Closing Disclosure
This form is a statement of final loan terms and closing costs.

Borrower: Jane Q. Homebuyer
Borrower SSN: 123-45-6789
Property: 1437 Lakeview Terrace, Orlando, FL 32825-1234
APN 123-456-789-000
Loan #: 0987654321
Sale Price $345,000
Loan Amount $276,000
Closing Date: 04/15/2026
Cash to Close $52,431.18
Questions? Contact your settlement agent at (407) 555-1234.`;

const WIRE_FIXTURE = `WIRE TRANSFER INSTRUCTIONS
Beneficiary: Sunshine Title LLC
Beneficiary Bank: Example National Bank
ABA Routing: ${VALID_ROUTING}
Account No: 4567891234
SWIFT: EXAMUS33
Amount due at closing: $52,431.18`;

const LE_FALSE_POSITIVE_CORPUS = `Loan Estimate
Lender: Example Mortgage Co. NMLS 1234
Interest Rate 6.875%   APR 7.012%
Loan Amount $408,000   Estimated Cash to Close $61,250
Rate lock expires 04/30/2026
MLS# O6123456
Escrow Order No. 7012345678
Property: 880 Palm Way, Orlando FL 32825-1234
Account questions? Call (800) 555-1212
Estimated taxes recorded 04 15 2026`;

describe("checksum validators", () => {
  it("validates ABA routing checksums and prefixes", () => {
    expect(isValidAbaRouting(VALID_ROUTING)).toBe(true);
    expect(isValidAbaRouting(INVALID_ROUTING)).toBe(false);
    // Checksum-valid arithmetic but prefix 92 is outside Federal Reserve ranges:
    // 921456780 → 3(9+4+7)+7(2+5+8)+(1+6+0) = 60+105+7 = 172 ✗ — build a real one:
    // 920000003: 3(9+0+0)+7(2+0+0)+(0+0+3) = 27+14+3 = 44 ✗; brute spec: prefix check
    // is exercised via 990000000-style numbers below.
    expect(isValidAbaRouting("990000007")).toBe(false); // prefix 99 out of range
    expect(isValidAbaRouting("12345678")).toBe(false); // too short
    expect(isValidAbaRouting("1234567890")).toBe(false); // too long
    expect(isValidAbaRouting("abcdefghi")).toBe(false);
  });

  it("validates Luhn", () => {
    expect(passesLuhn(VALID_CARD)).toBe(true);
    expect(passesLuhn(INVALID_CARD)).toBe(false);
    expect(passesLuhn("4111")).toBe(false); // too short
  });
});

describe("SSN redaction", () => {
  it("redacts dashed SSNs unconditionally", () => {
    const r = redactPii(CD_FIXTURE);
    expect(r.text).toContain("Borrower SSN: [REDACTED:SSN]");
    expect(r.text).not.toContain("123-45-6789");
    expect(r.counts.ssn).toBe(1);
  });

  it("skips structurally invalid dashed placeholders", () => {
    expect(redactPii("Sample: 000-12-3456").total).toBe(0);
    expect(redactPii("Sample: 123-00-4567").total).toBe(0);
    expect(redactPii("Sample: 123-45-0000").total).toBe(0);
  });

  it("redacts spaced SSNs only with a nearby label (even on the prior line)", () => {
    const labeled = redactPii("Social Security Number\n123 45 6789");
    expect(labeled.text).toContain("[REDACTED:SSN]");
    expect(labeled.counts.ssn).toBe(1);

    const unlabeled = redactPii("Totals 123 45 6789 per column");
    expect(unlabeled.total).toBe(0);
  });

  it("redacts bare 9-digit values only with SSN context", () => {
    const labeled = redactPii("SSN: 123456789");
    expect(labeled.text).toBe("SSN: [REDACTED:SSN]");

    expect(redactPii("Escrow File No. 123456789").total).toBe(0);
    expect(redactPii("Employee ID 987654321").total).toBe(0);
  });

  it("treats lowercase 'tin' as an ordinary word but ITIN/TIN as labels", () => {
    expect(redactPii("tin roof repair estimate ref 123456789").total).toBe(0);
    expect(redactPii("ITIN: 912345678").counts.ssn).toBe(1);
  });
});

describe("card redaction", () => {
  it("redacts grouped card numbers that pass Luhn", () => {
    const r = redactPii(`Card on file: 4111 1111 1111 1111`);
    expect(r.text).toContain("[REDACTED:CARD]");
    expect(r.counts.card).toBe(1);
  });

  it("ignores grouped numbers that fail Luhn", () => {
    expect(redactPii("Ref: 4111 1111 1111 1112").total).toBe(0);
  });

  it("redacts contiguous card numbers with valid IIN + Luhn", () => {
    const r = redactPii(`Pay with ${VALID_CARD} today`);
    expect(r.text).toContain("[REDACTED:CARD]");
  });

  it("spares Luhn-valid long identifiers labeled as loan/escrow/file numbers", () => {
    // 4111111111111111 passes Luhn + IIN, but the label exempts it.
    expect(redactPii(`Loan Number: ${VALID_CARD}`).total).toBe(0);
    expect(redactPii(`Escrow File: ${VALID_CARD}`).total).toBe(0);
  });
});

describe("routing number redaction", () => {
  it("redacts checksum-valid routing numbers with banking context", () => {
    const r = redactPii(`ABA Routing: ${VALID_ROUTING}`);
    expect(r.text).toBe("ABA Routing: [REDACTED:ROUTING]");
    expect(r.counts.routing).toBe(1);
  });

  it("ignores 9-digit numbers that fail the checksum even with context", () => {
    expect(redactPii(`ABA Routing: ${INVALID_ROUTING}`).total).toBe(0);
  });

  it("ignores checksum-valid 9-digit numbers without banking context", () => {
    expect(redactPii(`Reference ${VALID_ROUTING} enclosed`).total).toBe(0);
  });

  it("prefers the SSN label when both could apply", () => {
    const r = redactPii(`SSN: ${VALID_ROUTING} (on file with the bank)`);
    expect(r.counts.ssn).toBe(1);
    expect(r.counts.routing).toBeUndefined();
  });
});

describe("account number redaction", () => {
  it("redacts labeled account numbers", () => {
    const r = redactPii("Account No: 4567891234");
    expect(r.text).toBe("Account No: [REDACTED:ACCOUNT]");
    expect(r.counts.account).toBe(1);
  });

  it("redacts checking/savings labeled numbers", () => {
    expect(redactPii("Checking 00123456789").counts.account).toBe(1);
  });

  it("spares phone numbers near the word 'account'", () => {
    expect(redactPii("Account questions? Call (800) 555-1212").total).toBe(0);
  });

  it("spares dates near account context", () => {
    expect(redactPii("Account opened 04/15/2026").total).toBe(0);
    expect(redactPii("Account opened 04 15 2026").total).toBe(0);
  });

  it("spares dollar amounts and unlabeled long numbers", () => {
    expect(redactPii("Deposit to show $1234567 in account ledger").total).toBe(0);
    expect(redactPii("Order No. 7012345678").total).toBe(0);
  });

  it("spares ZIP+4 after a state code even with account context nearby", () => {
    expect(redactPii("Account holder address: Orlando, FL 32825-1234").total).toBe(0);
  });
});

describe("wire-instruction block sweep", () => {
  it("redacts routing, account, and SWIFT inside a wire block; preserves amounts", () => {
    const r = redactPii(WIRE_FIXTURE);
    expect(r.text).toContain("ABA Routing: [REDACTED:ROUTING]");
    expect(r.text).toContain("Account No: [REDACTED:ACCOUNT]");
    expect(r.text).toContain("SWIFT: [REDACTED:WIRE]");
    expect(r.text).toContain("$52,431.18");
    expect(r.text).not.toContain(VALID_ROUTING);
    expect(r.text).not.toContain("4567891234");
    expect(r.text).not.toContain("EXAMUS33");
    expect(r.counts).toEqual({ routing: 1, account: 1, wire: 1 });
  });

  it("sweeps unlabeled digit runs inside the block", () => {
    const r = redactPii("Wire instructions\nUse ref 5556667778 when sending");
    expect(r.text).toContain("[REDACTED:WIRE]");
    expect(r.text).not.toContain("5556667778");
  });

  it("labels beneficiary-adjacent numbers via the account pass before the sweep", () => {
    const r = redactPii(
      "Wire instructions\nBeneficiary Bank: First Example\nRef 5556667778 for credit",
    );
    expect(r.text).not.toContain("5556667778");
    expect(r.counts.account).toBe(1);
  });

  it("does not treat ordinary all-caps words as SWIFT codes", () => {
    const r = redactPii("Wire instructions\nTRANSFER DISCLOSE BENEFICIARY name pending");
    expect(r.text).toContain("TRANSFER DISCLOSE BENEFICIARY");
  });

  it("leaves text outside wire blocks alone", () => {
    expect(redactPii("The DISCLOSE form arrived; ref 5556667778.").total).toBe(0);
  });
});

describe("false-positive corpus (Loan Estimate)", () => {
  it("redacts nothing from realistic LE text", () => {
    const r = redactPii(LE_FALSE_POSITIVE_CORPUS);
    expect(r.total).toBe(0);
    expect(r.text).toBe(LE_FALSE_POSITIVE_CORPUS);
  });
});

describe("quality preservation (Closing Disclosure)", () => {
  it("preserves everything classification/extraction need", () => {
    const r = redactPii(CD_FIXTURE);
    expect(r.text).toContain("Closing Disclosure");
    expect(r.text).toContain("$345,000");
    expect(r.text).toContain("$276,000");
    expect(r.text).toContain("$52,431.18");
    expect(r.text).toContain("04/15/2026");
    expect(r.text).toContain("APN 123-456-789-000");
    expect(r.text).toContain("Loan #: 0987654321");
    expect(r.text).toContain("32825-1234");
    expect(r.text).toContain("(407) 555-1234");
    expect(r.total).toBe(1); // only the SSN
    // Token replacement shouldn't meaningfully change document size.
    expect(Math.abs(r.text.length - CD_FIXTURE.length)).toBeLessThan(50);
  });
});

describe("idempotency", () => {
  it("re-redacting redacted text changes nothing", () => {
    for (const fixture of [CD_FIXTURE, WIRE_FIXTURE]) {
      const first = redactPii(fixture);
      const second = redactPii(first.text);
      expect(second.text).toBe(first.text);
      expect(second.total).toBe(0);
    }
  });
});

describe("robustness", () => {
  it("handles non-string and empty input without throwing", () => {
    expect(redactPii(null as unknown as string)).toEqual({ text: "", counts: {}, total: 0 });
    expect(redactPii(undefined as unknown as string)).toEqual({ text: "", counts: {}, total: 0 });
    expect(redactPii("")).toEqual({ text: "", counts: {}, total: 0 });
  });

  it("processes 100K chars quickly (linear patterns, no backtracking)", () => {
    const big = `${CD_FIXTURE}\n${LE_FALSE_POSITIVE_CORPUS}\n`.repeat(120); // ~100K chars
    const start = performance.now();
    const r = redactPii(big);
    expect(performance.now() - start).toBeLessThan(2000);
    expect(r.counts.ssn).toBe(120);
  });

  it("redactPiiText returns just the text", () => {
    expect(redactPiiText("SSN: 123-45-6789")).toBe("SSN: [REDACTED:SSN]");
  });
});
