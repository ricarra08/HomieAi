import { describe, it, expect } from "vitest";
import { matchesOrigin } from "../same-origin";

const APP = "https://app.phazr.co";

describe("matchesOrigin", () => {
  it("accepts a matching Origin header", () => {
    expect(matchesOrigin(APP, null, APP)).toBe(true);
  });

  it("rejects a cross-site Origin header", () => {
    expect(matchesOrigin("https://evil.com", null, APP)).toBe(false);
  });

  it("falls back to Referer when Origin is absent", () => {
    expect(matchesOrigin(null, `${APP}/documents`, APP)).toBe(true);
    expect(matchesOrigin(null, "https://evil.com/x", APP)).toBe(false);
  });

  it("prefers Origin over Referer when both are present", () => {
    // A matching Referer cannot rescue a mismatched Origin.
    expect(matchesOrigin("https://evil.com", `${APP}/x`, APP)).toBe(false);
  });

  it("rejects when neither header is present (browser fetch always sends Origin on POST)", () => {
    expect(matchesOrigin(null, null, APP)).toBe(false);
  });

  it("rejects a malformed Referer", () => {
    expect(matchesOrigin(null, "not a url", APP)).toBe(false);
  });
});
