import { afterEach, describe, expect, it, vi } from "vitest";
import { enrichBilibiliVideo, enrichCollectedItem, enrichHtmlMetadata, extractOriginalUrlFromHtml, resolveCanonicalUrl } from "../server/services/enrichment";
import type { CollectedItem } from "../server/services/collector";

describe("enrichment", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fills Bilibili interaction stats from public video metadata", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      text: async () => JSON.stringify({
        data: {
          title: "控制：共振",
          desc: "夏日游戏节公开的控制系列新视频。",
          stat: { view: 113000, like: 1299, reply: 88, share: 77 }
        }
      })
    })));

    const result = await enrichBilibiliVideo({ bvid: "BV1abc123456" });
    expect(result).toMatchObject({
      interactionViews: 113000,
      interactionLikes: 1299,
      interactionReplies: 88,
      interactionReposts: 77,
      interactionSource: "bilibili"
    });
    expect(result?.summary).toContain("控制");
  });

  it("extracts game site metadata summaries from html", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      text: async () => `<html><head><meta name="description" content="这是一条游戏新闻简介"></head><body>1.2万播放</body></html>`
    })));

    const result = await enrichHtmlMetadata("https://www.17173.com/news/a.html");
    expect(result).toMatchObject({
      summary: "这是一条游戏新闻简介",
      summarySource: "metadata",
      interactionViews: 12000
    });
  });

  it("does not fail collected item enrichment when fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 500, text: async () => "" })));
    const item: CollectedItem = {
      sourceId: 1,
      keywordId: 1,
      providerType: "rss",
      title: "B站视频 BV1abc123456",
      url: "https://www.bilibili.com/video/BV1abc123456",
      normalizedUrl: "https://www.bilibili.com/video/BV1abc123456",
      summary: "old",
      publishedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      matchedKeyword: "B站",
      query: "B站",
      rank: 1,
      qualityScore: 90,
      qualitySignals: ["基础质量通过"],
      interactionLikes: 0,
      interactionReposts: 0,
      interactionReplies: 0,
      interactionViews: 0,
      summarySource: "rss",
      interactionSource: "none"
    };
    await expect(enrichCollectedItem(item)).resolves.toEqual(item);
  });

  it("resolves b23 short links to final bilibili video urls", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      url: "https://www.bilibili.com/video/BV1abc123456",
      text: async () => "<html></html>"
    })));

    await expect(resolveCanonicalUrl("https://b23.tv/test")).resolves.toMatchObject({
      url: "https://www.bilibili.com/video/BV1abc123456"
    });
  });

  it("extracts original article urls from google-like html payloads", () => {
    const html = `<html><head><meta property="og:url" content="https://example.com/news/a"></head><body></body></html>`;
    expect(extractOriginalUrlFromHtml(html)).toBe("https://example.com/news/a");
  });
});
