import { afterEach, describe, expect, it, vi } from "vitest";
import type { Keyword, Source } from "../shared/types";
import { buildFeedUrl, collectFromBraveSearch, parseFeed } from "../server/services/collector";

const keyword: Keyword = {
  id: 1,
  term: "AI 编程",
  scope: "游戏开发",
  enabled: true,
  createdAt: new Date().toISOString()
};

const source: Source = {
  id: 2,
  name: "Test Feed",
  url: "https://example.com/rss?q={query}",
  category: "测试",
  providerType: "rss",
  reliabilityTier: "trusted",
  communitySource: false,
  minQualityScore: 60,
  enabled: true,
  builtin: false,
  createdAt: new Date().toISOString()
};

describe("collector", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.BRAVE_SEARCH_API_KEY;
  });

  it("builds a query feed url", () => {
    expect(buildFeedUrl(source.url, keyword)).toContain(encodeURIComponent("AI 编程 游戏开发"));
  });

  it("parses RSS items into normalized collected items", () => {
    const xml = `<?xml version="1.0"?>
      <rss><channel><item>
        <title>Unity AI update</title>
        <link>https://example.com/a?utm_source=x</link>
        <description>New tools</description>
        <pubDate>Thu, 04 Jun 2026 09:00:00 GMT</pubDate>
      </item></channel></rss>`;

    const items = parseFeed(xml, source, keyword);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("Unity AI update");
    expect(items[0].normalizedUrl).toBe("https://example.com/a");
  });

  it("extracts canonical article urls from Google News descriptions when present", () => {
    const googleSource: Source = { ...source, providerType: "google_news" };
    const xml = `<?xml version="1.0"?>
      <rss><channel><item>
        <title>Unity 发布新的 AI 游戏开发工具链 - 示例网</title>
        <link>https://news.google.com/rss/articles/abc?oc=5</link>
        <description><![CDATA[<a href="https://example.com/news/unity-ai?utm_source=google">Unity 发布新的 AI 游戏开发工具链</a>]]></description>
        <pubDate>Thu, 04 Jun 2026 09:00:00 GMT</pubDate>
      </item></channel></rss>`;

    const items = parseFeed(xml, googleSource, keyword);
    expect(items[0].url).toBe("https://example.com/news/unity-ai?utm_source=google");
    expect(items[0].normalizedUrl).toBe("https://example.com/news/unity-ai");
  });

  it("skips Brave Search when no API key is configured", async () => {
    const braveSource: Source = { ...source, providerType: "brave_search" };
    await expect(collectFromBraveSearch(keyword, braveSource)).resolves.toEqual([]);
  });

  it("normalizes Brave Search results when an API key is configured", async () => {
    process.env.BRAVE_SEARCH_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        web: {
          results: [
            {
              title: "Unity 发布新的 AI 游戏开发工具链",
              url: "https://example.com/unity-ai?utm_source=brave",
              description: "Unity AI tools for game developers",
              age: "2026-06-05T10:00:00Z"
            }
          ]
        }
      })
    })));
    const braveSource: Source = { ...source, providerType: "brave_search" };
    const items = await collectFromBraveSearch(keyword, braveSource);
    expect(items).toHaveLength(1);
    expect(items[0].providerType).toBe("brave_search");
    expect(items[0].normalizedUrl).toBe("https://example.com/unity-ai");
  });
});
