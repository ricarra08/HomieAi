import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail } from "../validate";
import { collaboratorInviteEmail } from "../templates";

describe("email validation", () => {
  it("accepts plausible addresses", () => {
    expect(isValidEmail("jane@example.com")).toBe(true);
    expect(isValidEmail("a.b+tag@sub.example.co.uk")).toBe(true);
  });

  it("rejects garbage", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("no-at-sign")).toBe(false);
    expect(isValidEmail("foo@bar")).toBe(false); // no TLD dot
    expect(isValidEmail("foo @bar.com")).toBe(false);
    expect(isValidEmail("foo@bar..com")).toBe(false);
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(42)).toBe(false);
    expect(isValidEmail("a".repeat(255) + "@x.com")).toBe(false);
  });

  it("normalizes to lowercase/trimmed, null on invalid", () => {
    expect(normalizeEmail("  Jane@Example.COM ")).toBe("jane@example.com");
    expect(normalizeEmail("nope")).toBe(null);
    expect(normalizeEmail(undefined)).toBe(null);
  });
});

describe("collaboratorInviteEmail", () => {
  const base = {
    recipientRole: "lender",
    propertyAddress: "1437 Lakeview Terrace, Orlando, FL 32825",
    uploadUrl: "https://phazr.co/upload/abc-123",
  };

  it("builds subject from address and includes the link in html + text", () => {
    const { subject, html, text } = collaboratorInviteEmail(base);
    expect(subject).toContain("1437 Lakeview Terrace");
    expect(html).toContain("https://phazr.co/upload/abc-123");
    expect(text).toContain("https://phazr.co/upload/abc-123");
    expect(html).toContain("lender");
  });

  it("falls back to a generic subject when address is TBD", () => {
    const { subject } = collaboratorInviteEmail({ ...base, propertyAddress: "TBD" });
    expect(subject).toBe("Document upload request via Phazr");
  });

  it("lists requested documents and escapes html in them", () => {
    const { html } = collaboratorInviteEmail({
      ...base,
      requestedDocuments: ["Loan Estimate", "<script>alert(1)</script>"],
    });
    expect(html).toContain("<li>Loan Estimate</li>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
  });

  it("maps unknown roles to a safe label", () => {
    const { html } = collaboratorInviteEmail({ ...base, recipientRole: "weird" });
    expect(html).toContain("collaborator");
  });
});
