import { describe, expect, it } from "vitest";
import type { Keyword, Source } from "../shared/types";
import { buildFeedUrl, parseFeed } from "../server/services/collector";

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
  enabled: true,
  builtin: false,
  createdAt: new Date().toISOString()
};

describe("collector", () => {
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
});
