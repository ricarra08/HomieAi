import { describe, it, expect } from "vitest";
import { formatCurrency, parseLoanTermYears } from "../utils";

describe("formatCurrency", () => {
  it("formats null as em dash", () => {
    expect(formatCurrency(null)).toBe("—");
  });

  it("formats undefined as em dash", () => {
    expect(formatCurrency(undefined)).toBe("—");
  });

  it("formats zero as $0", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats with thousand separators", () => {
    expect(formatCurrency(350_000)).toBe("$350,000");
  });

  it("formats large numbers", () => {
    expect(formatCurrency(1_500_000)).toBe("$1,500,000");
  });
});

describe("parseLoanTermYears", () => {
  it("parses '30-year fixed'", () => {
    expect(parseLoanTermYears("30-year fixed")).toBe(30);
  });

  it("parses '15 Year ARM'", () => {
    expect(parseLoanTermYears("15 Year ARM")).toBe(15);
  });

  it("parses '20–year' with en dash", () => {
    expect(parseLoanTermYears("20–year")).toBe(20);
  });

  it("defaults to 30 when no match", () => {
    expect(parseLoanTermYears("jumbo")).toBe(30);
  });

  it("defaults to 30 for empty string", () => {
    expect(parseLoanTermYears("")).toBe(30);
  });
});
