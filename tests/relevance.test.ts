import { describe, expect, it } from "vitest";
import { buildFeedUrl, isGameKeyword } from "../server/services/collector";
import { computeKeywordRelevance } from "../server/services/ai";
import type { Keyword } from "../shared/types";

describe("relevance pipeline", () => {
  const keyword: Keyword = {
    id: 1, term: "vibe coding", scope: "AI编程",
    enabled: true, accountMode: false, createdAt: "", accountPlatform: "", accountUid: "", accountUrl: ""
  };

  it("wraps Baidu search query in quotes and excludes spam sites", () => {
    const url = buildFeedUrl("https://rsshub.rssforever.com/baidu/search/{query}", keyword);
    expect(url).toContain(encodeURIComponent('"vibe coding AI编程"'));
    expect(url).toContain("-site%3Acsdn.net");
    expect(url).toContain("-site%3Azhihu.com");
  });

  it("does not wrap non-Baidu RSS queries in quotes", () => {
    const url = buildFeedUrl("https://example.com/rss?q={query}", keyword);
    expect(url).toContain(encodeURIComponent("vibe coding AI编程"));
    expect(url).not.toContain("%22");
  });

  it("scores full keyword match as 100", () => {
    const score = computeKeywordRelevance("Vibe Coding 入门指南", "", "vibe coding");
    expect(score).toBe(100);
  });

  it("scores partial token match as 60+", () => {
    const score = computeKeywordRelevance("AI Coding Tools", "vibe", "vibe coding");
    expect(score).toBeGreaterThanOrEqual(60);
  });

  it("scores no match as 0", () => {
    const score = computeKeywordRelevance("Game Review 2026", "something else", "vibe coding");
    expect(score).toBe(0);
  });

  it("handles empty keyword gracefully", () => {
    const score = computeKeywordRelevance("Some Title", "", "");
    expect(score).toBe(50);
  });
});

describe("isGameKeyword", () => {
  const makeKeyword = (term: string, scope = ""): Keyword => ({
    id: 1, term, scope, enabled: true, accountMode: false,
    createdAt: "", accountPlatform: "", accountUid: "", accountUrl: ""
  });

  it("detects game keywords", () => {
    expect(isGameKeyword(makeKeyword("游戏出海"))).toBe(true);
    expect(isGameKeyword(makeKeyword("Unity 教程"))).toBe(true);
    expect(isGameKeyword(makeKeyword("vibe coding", "游戏开发"))).toBe(true);
  });

  it("rejects non-game keywords", () => {
    expect(isGameKeyword(makeKeyword("vibe coding"))).toBe(false);
    expect(isGameKeyword(makeKeyword("AI 编程"))).toBe(false);
    expect(isGameKeyword(makeKeyword("前端开发"))).toBe(false);
  });
});
