import { describe, it, expect } from "vitest";
import {
  isValidInviteSlug,
  slugifyDisplayName,
  generateInviteSlug,
  isLikelyClaimToken,
} from "../invites";

describe("isValidInviteSlug", () => {
  it("accepts normal slugs", () => {
    expect(isValidInviteSlug("sarah-johnson-x7k2")).toBe(true);
    expect(isValidInviteSlug("abc")).toBe(true);
    expect(isValidInviteSlug("agent-99")).toBe(true);
  });

  it("rejects bad shapes", () => {
    expect(isValidInviteSlug("")).toBe(false);
    expect(isValidInviteSlug("ab")).toBe(false); // too short
    expect(isValidInviteSlug("-leading")).toBe(false);
    expect(isValidInviteSlug("trailing-")).toBe(false);
    expect(isValidInviteSlug("double--hyphen")).toBe(false);
    expect(isValidInviteSlug("UPPER-case")).toBe(false);
    expect(isValidInviteSlug("spaces here")).toBe(false);
    expect(isValidInviteSlug("a".repeat(41))).toBe(false);
    expect(isValidInviteSlug("路径-traversal")).toBe(false);
    expect(isValidInviteSlug("../../etc")).toBe(false);
    expect(isValidInviteSlug(null)).toBe(false);
    expect(isValidInviteSlug(42)).toBe(false);
  });
});

describe("slugifyDisplayName", () => {
  it("slugifies typical names", () => {
    expect(slugifyDisplayName("Sarah Q. Johnson")).toBe("sarah-q-johnson");
    expect(slugifyDisplayName("  José  Núñez ")).toBe("jose-nunez");
    expect(slugifyDisplayName("O'Brien & Co")).toBe("o-brien-co");
  });

  it("falls back to 'agent' for unusable names", () => {
    expect(slugifyDisplayName("")).toBe("agent");
    expect(slugifyDisplayName("!!!")).toBe("agent");
    expect(slugifyDisplayName("中文名字")).toBe("agent");
  });

  it("caps length", () => {
    expect(slugifyDisplayName("a".repeat(100)).length).toBeLessThanOrEqual(30);
  });
});

describe("isLikelyClaimToken", () => {
  it("accepts UUIDs", () => {
    expect(isLikelyClaimToken("3f9a1b2c-4d5e-6f70-8a9b-0c1d2e3f4a5b")).toBe(true);
    expect(isLikelyClaimToken("00000000-0000-0000-0000-000000000000")).toBe(true);
  });
  it("rejects non-UUIDs", () => {
    expect(isLikelyClaimToken("not-a-uuid")).toBe(false);
    expect(isLikelyClaimToken("3f9a1b2c4d5e6f708a9b0c1d2e3f4a5b")).toBe(false); // no hyphens
    expect(isLikelyClaimToken("../../etc/passwd")).toBe(false);
    expect(isLikelyClaimToken("")).toBe(false);
    expect(isLikelyClaimToken(null)).toBe(false);
    expect(isLikelyClaimToken(123)).toBe(false);
  });
});

describe("generateInviteSlug", () => {
  it("produces valid slugs", () => {
    const slug = generateInviteSlug("Sarah Johnson", () => 0.5);
    expect(isValidInviteSlug(slug)).toBe(true);
    expect(slug.startsWith("sarah-johnson-")).toBe(true);
  });

  it("varies the suffix with randomness", () => {
    const a = generateInviteSlug("Sarah", () => 0.1);
    const b = generateInviteSlug("Sarah", () => 0.9);
    expect(a).not.toBe(b);
  });

  it("stays valid for awkward display names", () => {
    for (const name of ["", "!!!", "José", "a".repeat(100)]) {
      expect(isValidInviteSlug(generateInviteSlug(name))).toBe(true);
    }
  });
});
