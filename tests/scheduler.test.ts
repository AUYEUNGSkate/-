import { describe, expect, it } from "vitest";
import { intervalToMilliseconds, normalizeScanIntervalMinutes } from "../server/services/scheduler";

describe("scheduler", () => {
  it("clamps scan interval to the supported range", () => {
    expect(normalizeScanIntervalMinutes(1)).toBe(5);
    expect(normalizeScanIntervalMinutes(30)).toBe(30);
    expect(normalizeScanIntervalMinutes(90)).toBe(90);
    expect(normalizeScanIntervalMinutes(2000)).toBe(1440);
  });

  it("rounds invalid or fractional values before converting to milliseconds", () => {
    expect(normalizeScanIntervalMinutes(30.6)).toBe(31);
    expect(intervalToMilliseconds(90)).toBe(90 * 60 * 1000);
    expect(intervalToMilliseconds(Number.NaN)).toBe(30 * 60 * 1000);
  });
});
