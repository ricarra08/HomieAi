import { describe, it, expect } from "vitest";
import { formatCurrency, parseLoanTermYears, formatPercent, toSafeRelativePath } from "../utils";

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

describe("formatPercent", () => {
  it("formats a rate value with a % suffix", () => {
    expect(formatPercent(6.5)).toBe("6.5%");
  });

  it("trims trailing zeros up to 3 decimals", () => {
    expect(formatPercent(7)).toBe("7%");
    expect(formatPercent(6.875)).toBe("6.875%");
  });

  it("formats null/undefined as em dash", () => {
    expect(formatPercent(null)).toBe("—");
    expect(formatPercent(undefined)).toBe("—");
  });
});

describe("toSafeRelativePath", () => {
  it("passes a normal relative path through", () => {
    expect(toSafeRelativePath("/dashboard", "/fallback")).toBe("/dashboard");
    expect(toSafeRelativePath("/documents?tab=closing", "/fallback")).toBe("/documents?tab=closing");
  });

  it("rejects protocol-relative and backslash-host open-redirect attempts", () => {
    expect(toSafeRelativePath("//evil.com", "/dashboard")).toBe("/dashboard");
    expect(toSafeRelativePath("/\\evil.com", "/dashboard")).toBe("/dashboard");
  });

  it("rejects absolute URLs and non-path schemes", () => {
    expect(toSafeRelativePath("https://evil.com", "/dashboard")).toBe("/dashboard");
    expect(toSafeRelativePath("javascript:alert(1)", "/dashboard")).toBe("/dashboard");
  });

  it("rejects whitespace / CRLF (redirect header injection)", () => {
    expect(toSafeRelativePath("/foo\nSet-Cookie: x", "/dashboard")).toBe("/dashboard");
    expect(toSafeRelativePath("/foo bar", "/dashboard")).toBe("/dashboard");
  });

  it("falls back for empty / non-string input", () => {
    expect(toSafeRelativePath(null, "/dashboard")).toBe("/dashboard");
    expect(toSafeRelativePath("", "/dashboard")).toBe("/dashboard");
    expect(toSafeRelativePath(undefined, "/dashboard")).toBe("/dashboard");
  });
});
