import { describe, it, expect } from "vitest";
import {
  allowedDocTypesForLink,
  isDocTypeInScope,
  shouldAutoPopulateFinancials,
} from "../collaborator-scope";

describe("isDocTypeInScope", () => {
  it("flags a loan_estimate uploaded via an inspector-scoped link (the M-2 attack)", () => {
    expect(isDocTypeInScope("inspector", null, "loan_estimate")).toBe(false);
  });

  it("allows a loan_estimate from a lender-scoped link (happy path)", () => {
    expect(isDocTypeInScope("lender", null, "loan_estimate")).toBe(true);
  });

  it("allows an inspection_report from an inspector link", () => {
    expect(isDocTypeInScope("inspector", null, "inspection_report")).toBe(true);
  });

  it("flags a title_report from a lender link", () => {
    expect(isDocTypeInScope("lender", null, "title_report")).toBe(false);
  });

  it("treats unknown/permissive roles (other) as unrestricted", () => {
    expect(isDocTypeInScope("other", null, "loan_estimate")).toBe(true);
    expect(isDocTypeInScope("mystery_role", null, "loan_estimate")).toBe(true);
    expect(isDocTypeInScope(null, null, "loan_estimate")).toBe(true);
  });

  it("never flags unclassified documents", () => {
    expect(isDocTypeInScope("inspector", null, "other")).toBe(true);
    expect(isDocTypeInScope("inspector", null, null)).toBe(true);
    expect(isDocTypeInScope("inspector", null, undefined)).toBe(true);
  });

  it("honors an explicit requested_documents allow-list over role defaults", () => {
    // Even a lender link is out of scope for a type the buyer didn't request from it.
    expect(isDocTypeInScope("lender", ["closing_disclosure"], "loan_estimate")).toBe(false);
    expect(isDocTypeInScope("lender", ["loan_estimate"], "loan_estimate")).toBe(true);
  });

  it("ignores malformed requested_documents entries and falls back to role defaults", () => {
    // Non-string / empty entries are discarded; with nothing usable left, role defaults apply.
    expect(isDocTypeInScope("inspector", [123, "", null] as unknown[], "loan_estimate")).toBe(false);
    expect(isDocTypeInScope("inspector", [123, "", null] as unknown[], "inspection_report")).toBe(true);
  });
});

describe("allowedDocTypesForLink", () => {
  it("returns null (unrestricted) for a permissive role with no requested list", () => {
    expect(allowedDocTypesForLink("other", null)).toBeNull();
    expect(allowedDocTypesForLink("unknown", [])).toBeNull();
  });

  it("returns the requested list when present", () => {
    const set = allowedDocTypesForLink("lender", ["appraisal", "disclosure"]);
    expect(set).not.toBeNull();
    expect([...set!].sort()).toEqual(["appraisal", "disclosure"]);
  });
});

describe("shouldAutoPopulateFinancials", () => {
  it("blocks auto-population for collaborator uploads", () => {
    expect(shouldAutoPopulateFinancials("collaborator-upload")).toBe(false);
  });

  it("allows auto-population for owner (buyer/agent) uploads", () => {
    expect(shouldAutoPopulateFinancials("buyer-upload")).toBe(true);
    expect(shouldAutoPopulateFinancials("agent-upload")).toBe(true);
    expect(shouldAutoPopulateFinancials(undefined)).toBe(true);
    expect(shouldAutoPopulateFinancials(null)).toBe(true);
  });
});
