import { describe, it, expect } from "vitest";
import { isTier1, TIER_1_TYPES } from "../extraction-schemas";

describe("isTier1", () => {
  it("returns true for all Tier 1 document types", () => {
    for (const docType of TIER_1_TYPES) {
      expect(isTier1(docType)).toBe(true);
    }
  });

  it("returns false for 'other'", () => {
    expect(isTier1("other")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isTier1("")).toBe(false);
  });

  it("returns false for non-existent type", () => {
    expect(isTier1("tax_return")).toBe(false);
  });
});
