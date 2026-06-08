import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

async function loadRepo() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hotspot-repo-"));
  process.env.DATABASE_PATH = path.join(tempDir, "test.sqlite");
  process.env.AI_MODE = "mock";
  vi.resetModules();
  const mod = await import("../server/db/client");
  return { tempDir, ...mod };
}

describe("repositories", () => {
  let tempDir = "";

  afterEach(async () => {
    const mod = await import("../server/db/client");
    mod.closeDb();
    vi.resetModules();
    if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
    tempDir = "";
    delete process.env.DATABASE_PATH;
  });

  it("counts unread new items only", async () => {
    const loaded = await loadRepo();
    tempDir = loaded.tempDir;
    const { repositories } = loaded;
    const keyword = repositories.keywords.create("Unity", "游戏");
    const source = repositories.sources.create({ name: "Test", url: "https://example.com/rss", category: "测试" });

    const base = {
      sourceId: source.id,
      keywordId: keyword.id,
      providerType: "rss" as const,
      url: "https://example.com/a",
      normalizedUrl: "https://example.com/a",
      summary: "summary",
      publishedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      matchedKeyword: keyword.term,
      query: keyword.term,
      rank: 1,
      qualityScore: 90,
      qualitySignals: ["基础质量通过"],
      interactionLikes: 0,
      interactionReposts: 0,
      interactionReplies: 0,
      interactionViews: 0
    };

    const watch = repositories.items.insert({ ...base, title: "Unity watch" })!;
    const fresh = repositories.items.insert({ ...base, title: "Unity new", url: "https://example.com/b", normalizedUrl: "https://example.com/b" })!;
    repositories.items.updateStatus(watch.id, "watch");
    repositories.items.updateStatus(fresh.id, "new");

    expect(repositories.items.unreadCount()).toBe(1);
  });

  it("archives stale active items and removes them from the main list", async () => {
    const loaded = await loadRepo();
    tempDir = loaded.tempDir;
    const { getDb, repositories } = loaded;
    const keyword = repositories.keywords.create("Unity", "游戏");
    const source = repositories.sources.create({ name: "Test", url: "https://example.com/rss", category: "测试" });
    const staleDate = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const result = repositories.items.insert({
      sourceId: source.id,
      keywordId: keyword.id,
      providerType: "rss",
      title: "Unity stale",
      url: "https://example.com/stale",
      normalizedUrl: "https://example.com/stale",
      summary: "summary",
      publishedAt: staleDate,
      fetchedAt: staleDate,
      matchedKeyword: keyword.term,
      query: keyword.term,
      rank: 1,
      qualityScore: 90,
      qualitySignals: ["基础质量通过"],
      interactionLikes: 0,
      interactionReposts: 0,
      interactionReplies: 0,
      interactionViews: 0
    })!;
    repositories.items.updateStatus(result.id, "new");

    expect(repositories.items.archiveStaleItems()).toBeGreaterThan(0);
    expect(repositories.items.list()).toHaveLength(0);
    expect(getDb().prepare("SELECT archived_at, status FROM items WHERE id = ?").get(result.id)).toMatchObject({ status: "watch" });
  });

  it("seeds no-key domestic sources and disables optional/community sources by default", async () => {
    const loaded = await loadRepo();
    tempDir = loaded.tempDir;
    const sources = loaded.repositories.sources.all();
    expect(sources.find((source) => source.name === "RSSHub 百度搜索")?.enabled).toBe(true);
    expect(sources.find((source) => source.name === "机核网")?.enabled).toBe(true);
    expect(sources.find((source) => source.name === "Brave Search 增强")?.enabled).toBe(false);
    expect(sources.find((source) => source.name === "微博热点")?.enabled).toBe(false);
    expect(sources.find((source) => source.name === "B站账号视频")?.enabled).toBe(true);
    expect(sources.filter((source) => source.providerType === "google_news").every((source) => source.enabled === false)).toBe(true);
  });

  it("preserves platform-specific interaction sources", async () => {
    const loaded = await loadRepo();
    tempDir = loaded.tempDir;
    const { repositories } = loaded;
    const keyword = repositories.keywords.create("Unity", "游戏");
    const source = repositories.sources.create({ name: "微博热搜", url: "https://weibo.com/ajax/side/hotSearch", category: "测试", providerType: "weibo_hot" });

    repositories.items.insert({
      sourceId: source.id,
      keywordId: keyword.id,
      providerType: "weibo_hot",
      title: "Unity 微博热搜",
      url: "https://s.weibo.com/weibo?q=Unity",
      normalizedUrl: "https://s.weibo.com/weibo?q=Unity",
      summary: "微博热搜 #1",
      publishedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      matchedKeyword: keyword.term,
      query: keyword.term,
      rank: 1,
      qualityScore: 90,
      qualitySignals: ["基础质量通过"],
      interactionLikes: 0,
      interactionReposts: 0,
      interactionReplies: 0,
      interactionViews: 120000,
      interactionSource: "weibo"
    });

    expect(repositories.items.list()[0].interactionSource).toBe("weibo");
  });
});
