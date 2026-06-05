import { describe, expect, it } from "vitest";
import { normalizeTitle, normalizeUrl, titleSimilarity } from "../server/services/dedupe";

describe("dedupe helpers", () => {
  it("removes common tracking parameters from urls", () => {
    const url = normalizeUrl("https://Example.com/news?a=1&utm_source=x&fbclid=abc#section");
    expect(url).toBe("https://example.com/news?a=1");
  });

  it("normalizes punctuation and casing in titles", () => {
    expect(normalizeTitle("Unity: AI Tools Update!")).toBe("unity ai tools update");
  });

  it("scores similar titles higher than unrelated titles", () => {
    expect(titleSimilarity("Unity AI tools update", "Unity updates AI tools")).toBeGreaterThan(0.3);
    expect(titleSimilarity("Steam sale", "Unreal rendering pipeline")).toBeLessThan(0.1);
  });
});
