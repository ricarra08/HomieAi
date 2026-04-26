import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit } from "../rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows first request", () => {
    const result = rateLimit("test-key-1", 3, 60_000);
    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(2);
  });

  it("allows requests up to the max", () => {
    rateLimit("test-key-2", 3, 60_000); // 1st
    rateLimit("test-key-2", 3, 60_000); // 2nd
    const result = rateLimit("test-key-2", 3, 60_000); // 3rd
    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("limits request after max exceeded", () => {
    rateLimit("test-key-3", 3, 60_000);
    rateLimit("test-key-3", 3, 60_000);
    rateLimit("test-key-3", 3, 60_000);
    const result = rateLimit("test-key-3", 3, 60_000); // 4th → limited
    expect(result.limited).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    rateLimit("test-key-4", 3, 60_000);
    rateLimit("test-key-4", 3, 60_000);
    rateLimit("test-key-4", 3, 60_000);

    // Advance past the 60s window
    vi.advanceTimersByTime(61_000);

    const result = rateLimit("test-key-4", 3, 60_000);
    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(2);
  });

  it("tracks different keys independently", () => {
    rateLimit("key-a", 1, 60_000);
    const limitedA = rateLimit("key-a", 1, 60_000); // 2nd for key-a → limited

    const freshB = rateLimit("key-b", 1, 60_000); // 1st for key-b → not limited

    expect(limitedA.limited).toBe(true);
    expect(freshB.limited).toBe(false);
  });
});
