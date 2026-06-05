import { describe, expect, it } from "vitest";
import { cleanArticleTitle, cleanSummary, isLowQualityResult } from "../server/services/contentFilter";

describe("content filter", () => {
  it("keeps article titles and strips common source suffixes", () => {
    expect(cleanArticleTitle("AI正在悄然替代游戏编剧？ - 搜狐网")).toBe("AI正在悄然替代游戏编剧？");
    expect(cleanArticleTitle("篮球传奇：球星生涯模拟器的相似游戏 - TapTap - 发现好游戏")).toBe("篮球传奇：球星生涯模拟器的相似游戏");
  });

  it("removes dangling html and tracking urls from summaries", () => {
    expect(cleanSummary('<a href="https://news.google.com/rss/articles/abc')).toBe("");
  });

  it("filters search result spam titles", () => {
    expect(
      isLowQualityResult({
        title: 'Results for " 北京快三代理 {官网：852.tw} .ojd - x.com',
        url: "https://x.com/spam"
      })
    ).toBe(true);
  });

  it("filters generic API page titles", () => {
    expect(
      isLowQualityResult({
        title: "微博正文 - api.weibo.com",
        url: "https://api.weibo.com/2/statuses/show.json"
      })
    ).toBe(true);
  });

  it("keeps a real game industry news title", () => {
    expect(
      isLowQualityResult({
        title: "Unity 发布新的 AI 游戏开发工具链",
        url: "https://example.com/news/unity-ai-tools"
      })
    ).toBe(false);
  });
});
