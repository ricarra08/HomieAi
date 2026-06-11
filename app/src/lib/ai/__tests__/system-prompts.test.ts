import { describe, it, expect } from "vitest";
import { getCopilotSystemPrompt } from "../system-prompts";
import type { Phase } from "@/lib/types";

const PHASES: Phase[] = ["shopping", "offer", "escrow", "closing", "post-close"];

// The compliance brief (§2.4) cites these prompt rules as controls a brokerage can rely on.
// If the wording drifts, the brief's representations become false — pin the load-bearing phrases.
describe("copilot BOUNDARIES — value-opinion prohibition (compliance brief §2.4)", () => {
  it.each(PHASES)("phase %s: forbids specific-home value opinions", (phase) => {
    const prompt = getCopilotSystemPrompt(phase, "");
    expect(prompt).toContain("Never tell a buyer what a specific home is worth");
  });

  it.each(PHASES)("phase %s: describes the scenarios cards as estimates, never advice", (phase) => {
    const prompt = getCopilotSystemPrompt(phase, "");
    expect(prompt).toContain("Home Value Scenarios");
    expect(prompt).toContain("not an appraisal, not a prediction, not advice");
    expect(prompt).toContain("NEVER treat those numbers as a value opinion");
  });

  it.each(PHASES)("phase %s: permits general education (over-refusal guard)", (phase) => {
    const prompt = getCopilotSystemPrompt(phase, "");
    expect(prompt).toContain("You MAY explain general concepts");
  });
});
