import { describe, expect, it } from "vitest";
import { assessContentQuality, cleanArticleTitle, cleanSummary, isLowQualityResult } from "../server/services/contentFilter";

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

  it("downgrades forum pagination and thin community pages", () => {
    const result = assessContentQuality({
      title: "量子跃迁：米乐光年- 官方论坛｜第 23 页 - TapTap - 发现好游戏",
      url: "https://www.taptap.cn/forum/page/23",
      summary: ""
    });
    expect(result.score).toBeLessThan(60);
    expect(result.signals.join(" ")).toContain("分页");
  });

  it("flags Baidu redirect/search index URLs", () => {
    const result = assessContentQuality({
      title: "Vibe Coding 入门指南",
      url: "http://www.baidu.com/link?url=abc123",
      summary: "some content"
    });
    expect(result.lowQuality).toBe(false);
    expect(result.signals.join(" ")).toContain("搜索引擎中转");
  });

  it("flags SEO-stuffed comma-heavy titles", () => {
    const result = assessContentQuality({
      title: "vibe coding, AI编程, cursor, windsurf, bolt, lovable, replit, v0, github copilot, claude code",
      url: "https://example.com/seo",
      summary: "some content"
    });
    expect(result.signals.join(" ")).toContain("SEO堆砌");
    expect(result.score).toBeLessThan(60);
  });

  it("flags navigation/directory page titles", () => {
    const result = assessContentQuality({
      title: "Vibe Coding 目录",
      url: "https://example.com/dir",
      summary: "some content"
    });
    expect(result.signals.join(" ")).toContain("目录/导航");
  });

  it("flags empty or date-only titles", () => {
    const result = assessContentQuality({
      title: "2026-06-07",
      url: "https://example.com/date",
      summary: ""
    });
    expect(result.lowQuality).toBe(true);
  });

  it("penalizes short title with no summary", () => {
    const result = assessContentQuality({
      title: "新闻标题",
      url: "https://example.com/short",
      summary: ""
    });
    expect(result.signals.join(" ")).toContain("空或纯日期标题");
  });
});
