import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("item evidence", () => {
  let tempDir = "";

  afterEach(async () => {
    const { closeDb } = await import("../server/db/client");
    closeDb();
    vi.resetModules();
    if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.DATABASE_PATH;
  });

  it("merges similar multi-source hits into one item with multiple evidence rows", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hotspot-evidence-"));
    process.env.DATABASE_PATH = path.join(tempDir, "test.sqlite");
    process.env.AI_MODE = "mock";
    const { repositories } = await import("../server/db/client");

    const keyword = repositories.keywords.create("Unity AI", "游戏开发");
    const sourceA = repositories.sources.create({
      name: "Source A",
      url: "https://news.google.com/rss/search?q={query}",
      category: "测试",
      providerType: "google_news",
      reliabilityTier: "search"
    });
    const sourceB = repositories.sources.create({
      name: "Source B",
      url: "{query}",
      category: "测试",
      providerType: "brave_search",
      reliabilityTier: "search"
    });

    const first = repositories.items.insert({
      sourceId: sourceA.id,
      keywordId: keyword.id,
      providerType: "google_news",
      title: "Unity 发布新的 AI 游戏开发工具链",
      url: "https://example.com/a",
      normalizedUrl: "https://example.com/a",
      summary: "Unity AI tools",
      publishedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      matchedKeyword: keyword.term,
      query: "Unity AI 游戏开发",
      rank: 1,
      qualityScore: 86,
      qualitySignals: ["基础质量通过"],
      interactionLikes: 0,
      interactionReposts: 0,
      interactionReplies: 0,
      interactionViews: 0
    });
    const second = repositories.items.insert({
      sourceId: sourceB.id,
      keywordId: keyword.id,
      providerType: "brave_search",
      title: "Unity 发布 AI 游戏开发工具链",
      url: "https://mirror.example.com/a",
      normalizedUrl: "https://mirror.example.com/a",
      summary: "Unity AI tools",
      publishedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      matchedKeyword: keyword.term,
      query: "Unity AI 游戏开发",
      rank: 2,
      qualityScore: 88,
      qualitySignals: ["基础质量通过"],
      interactionLikes: 0,
      interactionReposts: 0,
      interactionReplies: 0,
      interactionViews: 0
    });

    expect(first?.inserted).toBe(true);
    expect(second?.inserted).toBe(false);
    expect(second?.id).toBe(first?.id);
    const item = repositories.items.byId(first!.id);
    expect(item?.evidenceCount).toBe(2);
    expect(item?.qualityScore).toBe(88);
    expect(item?.evidenceProviders.sort()).toEqual(["brave_search", "google_news"]);
  });
});
