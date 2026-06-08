import { describe, it, expect } from "vitest";
import type { HotspotItem, AiEvaluation } from "../shared/types";

function makeEval(overrides: Partial<AiEvaluation> = {}): AiEvaluation {
  return {
    relevanceScore: 80,
    credibilityScore: 70,
    noveltyScore: 65,
    hotnessScore: 75,
    isImpersonationLikely: false,
    summary: "AI summary",
    reason: "这是一条AI分析的理由文本",
    recommendedAction: "notify",
    ...overrides
  };
}

function makeItem(overrides: Partial<HotspotItem> = {}): HotspotItem {
  return {
    id: 1,
    sourceId: null,
    keywordId: 1,
    title: "测试标题",
    url: "https://example.com",
    normalizedUrl: "https://example.com",
    summary: "原始摘要内容",
    publishedAt: "2026-06-08T10:00:00.000Z",
    fetchedAt: "2026-06-08T10:30:00.000Z",
    matchedKeyword: "AI 编程",
    readAt: null,
    status: "new",
    qualityScore: 80,
    qualitySignals: [],
    evidenceCount: 1,
    evidenceProviders: ["rss"],
    evidenceSourceNames: ["机核网"],
    sourceReliability: "trusted",
    communitySource: false,
    evaluation: makeEval(),
    interactionLikes: 100,
    interactionReposts: 50,
    interactionReplies: 20,
    interactionViews: 5000,
    summarySource: "rss",
    interactionSource: "rss",
    priorityScore: 85,
    freshnessScore: 80,
    authorName: null,
    authorFollowers: 0,
    authorVerified: false,
    interactionDanmaku: 0,
    interactionQuotes: 0,
    ...overrides
  };
}

// ── Helper functions extracted from App.tsx ──

function getPriority(item: HotspotItem): { label: string; tone: "high" | "medium" | "low" } {
  const hotness = item.evaluation?.hotnessScore ?? item.qualityScore;
  if (hotness >= 85 || item.qualityScore >= 90) return { label: "HIGH", tone: "high" };
  if (hotness >= 65 || item.qualityScore >= 70) return { label: "MEDIUM", tone: "medium" };
  return { label: "LOW", tone: "low" };
}

function formatDate(value: string | null): string {
  if (!value) return "尚未完成";
  try {
    return new Date(value).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return value;
  }
}

function reliabilityLabel(value: string | null): string {
  if (value === "official") return "官方";
  if (value === "trusted") return "可信";
  if (value === "community") return "社区";
  if (value === "search") return "搜索";
  return "未知";
}

function getItemSourceLabel(item: HotspotItem): string {
  return item.evidenceSourceNames[0] || "RSS";
}

function formatNumber(num: number): string {
  if (num >= 10000) return (num / 10000).toFixed(1).replace(/\.0$/, "") + "万";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(num);
}

function formatInteraction(item: HotspotItem): string {
  const parts: string[] = [];
  if (item.interactionLikes > 0) parts.push(`${formatNumber(item.interactionLikes)}赞`);
  if (item.interactionReposts > 0) parts.push(`${formatNumber(item.interactionReposts)}转发`);
  if (item.interactionReplies > 0) parts.push(`${formatNumber(item.interactionReplies)}回复`);
  if (item.interactionViews > 0) parts.push(`${formatNumber(item.interactionViews)}浏览`);
  if (parts.length > 0) return parts.join(" · ");
  return "";
}

// ── Expand/collapse logic tests ──

function toggleExpand(expanded: Set<number>, itemId: number): Set<number> {
  const next = new Set(expanded);
  if (next.has(itemId)) next.delete(itemId);
  else next.add(itemId);
  return next;
}

function expandAll(items: HotspotItem[]): Set<number> {
  return new Set(items.map((i) => i.id));
}

function collapseAll(): Set<number> {
  return new Set();
}

function isAllExpanded(items: HotspotItem[], expanded: Set<number>): boolean {
  return items.length > 0 && items.every((i) => expanded.has(i.id));
}

function hasEvaluations(items: HotspotItem[]): boolean {
  return items.some((i) => i.evaluation);
}

// ── Tests ──

describe("HotspotCard utilities", () => {
  describe("getPriority", () => {
    it("HIGH when hotness >= 85", () => {
      expect(getPriority(makeItem({ evaluation: makeEval({ hotnessScore: 85 }) }))).toEqual({ label: "HIGH", tone: "high" });
    });
    it("HIGH when quality >= 90 even if hotness low", () => {
      expect(getPriority(makeItem({ qualityScore: 90, evaluation: makeEval({ hotnessScore: 60 }) }))).toEqual({ label: "HIGH", tone: "high" });
    });
    it("MEDIUM when hotness >= 65", () => {
      expect(getPriority(makeItem({ evaluation: makeEval({ hotnessScore: 70 }) }))).toEqual({ label: "MEDIUM", tone: "medium" });
    });
    it("MEDIUM when quality >= 70", () => {
      expect(getPriority(makeItem({ qualityScore: 75, evaluation: makeEval({ hotnessScore: 60 }) }))).toEqual({ label: "MEDIUM", tone: "medium" });
    });
    it("LOW for low scores", () => {
      expect(getPriority(makeItem({ qualityScore: 50, evaluation: makeEval({ hotnessScore: 40 }) }))).toEqual({ label: "LOW", tone: "low" });
    });
    it("uses qualityScore when evaluation is null", () => {
      expect(getPriority(makeItem({ qualityScore: 92, evaluation: null }))).toEqual({ label: "HIGH", tone: "high" });
    });
  });

  describe("formatDate", () => {
    it("formats ISO date to Chinese locale", () => {
      const result = formatDate("2026-06-08T10:00:00.000Z");
      expect(result).toMatch(/06.08/);
    });
    it("returns fallback for null", () => {
      expect(formatDate(null)).toBe("尚未完成");
    });
    it("returns fallback for empty string", () => {
      expect(formatDate("")).toBe("尚未完成");
    });
  });

  describe("reliabilityLabel", () => {
    it("官方 for official", () => expect(reliabilityLabel("official")).toBe("官方"));
    it("可信 for trusted", () => expect(reliabilityLabel("trusted")).toBe("可信"));
    it("社区 for community", () => expect(reliabilityLabel("community")).toBe("社区"));
    it("搜索 for search", () => expect(reliabilityLabel("search")).toBe("搜索"));
    it("未知 for null", () => expect(reliabilityLabel(null)).toBe("未知"));
  });

  describe("getItemSourceLabel", () => {
    it("returns first evidence source name", () => {
      expect(getItemSourceLabel(makeItem({ evidenceSourceNames: ["机核网", "触乐"] }))).toBe("机核网");
    });
    it("falls back to RSS when empty", () => {
      expect(getItemSourceLabel(makeItem({ evidenceSourceNames: [] }))).toBe("RSS");
    });
  });

  describe("formatNumber", () => {
    it("formats 万", () => expect(formatNumber(12345)).toBe("1.2万"));
    it("formats k", () => expect(formatNumber(5600)).toBe("5.6k"));
    it("returns raw for small numbers", () => expect(formatNumber(42)).toBe("42"));
    it("removes .0 decimal", () => expect(formatNumber(10000)).toBe("1万"));
  });

  describe("formatInteraction", () => {
    it("formats all 4 stats", () => {
      const item = makeItem({ interactionLikes: 1200, interactionReposts: 300, interactionReplies: 50, interactionViews: 5000 });
      const result = formatInteraction(item);
      expect(result).toContain("1.2k赞");
      expect(result).toContain("300转发");
      expect(result).toContain("50回复");
      expect(result).toContain("5k浏览");
    });
    it("skips zero values", () => {
      const item = makeItem({ interactionLikes: 100, interactionReposts: 0, interactionReplies: 0, interactionViews: 0 });
      expect(formatInteraction(item)).toBe("100赞");
    });
    it("returns empty when all zero", () => {
      expect(formatInteraction(makeItem({ interactionLikes: 0, interactionReposts: 0, interactionReplies: 0, interactionViews: 0 }))).toBe("");
    });
  });
});

describe("Expand/collapse logic", () => {
  const items = [makeItem({ id: 1 }), makeItem({ id: 2 }), makeItem({ id: 3 })];
  const itemsWithoutEval = [makeItem({ id: 4, evaluation: null }), makeItem({ id: 5, evaluation: null })];

  describe("toggleExpand", () => {
    it("adds item to empty set", () => {
      const result = toggleExpand(new Set(), 1);
      expect(result.has(1)).toBe(true);
      expect(result.size).toBe(1);
    });
    it("removes item from set", () => {
      const result = toggleExpand(new Set([1, 2]), 1);
      expect(result.has(1)).toBe(false);
      expect(result.has(2)).toBe(true);
      expect(result.size).toBe(1);
    });
    it("adds second item to set", () => {
      const result = toggleExpand(new Set([1]), 2);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
      expect(result.size).toBe(2);
    });
    it("toggles back and forth", () => {
      let set = new Set<number>();
      set = toggleExpand(set, 1);
      expect(set.has(1)).toBe(true);
      set = toggleExpand(set, 1);
      expect(set.has(1)).toBe(false);
    });
    it("returns a new Set instance", () => {
      const original = new Set([1]);
      const result = toggleExpand(original, 2);
      expect(result).not.toBe(original);
      expect(original.has(2)).toBe(false);
    });
  });

  describe("expandAll", () => {
    it("creates set with all item IDs", () => {
      const result = expandAll(items);
      expect(result.size).toBe(3);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
      expect(result.has(3)).toBe(true);
    });
    it("returns empty set for empty items", () => {
      expect(expandAll([]).size).toBe(0);
    });
  });

  describe("collapseAll", () => {
    it("returns empty set", () => {
      expect(collapseAll().size).toBe(0);
    });
  });

  describe("isAllExpanded", () => {
    it("true when all items expanded", () => {
      expect(isAllExpanded(items, new Set([1, 2, 3]))).toBe(true);
    });
    it("false when some not expanded", () => {
      expect(isAllExpanded(items, new Set([1, 2]))).toBe(false);
    });
    it("false when empty items", () => {
      expect(isAllExpanded([], new Set())).toBe(false);
    });
    it("true when extra IDs in set don't matter", () => {
      expect(isAllExpanded(items, new Set([1, 2, 3, 99]))).toBe(true);
    });
  });

  describe("hasEvaluations", () => {
    it("true when some items have evaluations", () => {
      expect(hasEvaluations(items)).toBe(true);
    });
    it("false when no items have evaluations", () => {
      expect(hasEvaluations(itemsWithoutEval)).toBe(false);
    });
    it("false for empty array", () => {
      expect(hasEvaluations([])).toBe(false);
    });
    it("true when mixed evaluation state", () => {
      const mixed = [makeItem({ id: 1, evaluation: null }), makeItem({ id: 2 })];
      expect(hasEvaluations(mixed)).toBe(true);
    });
  });

  describe("full workflow", () => {
    it("expand then collapse individual and all", () => {
      let expanded = new Set<number>();
      // Expand item 1
      expanded = toggleExpand(expanded, 1);
      expect(expanded.has(1)).toBe(true);
      // Expand item 2
      expanded = toggleExpand(expanded, 2);
      expect(expanded.has(2)).toBe(true);
      // Expand all (includes 3)
      expanded = expandAll(items);
      expect(expanded.size).toBe(3);
      expect(isAllExpanded(items, expanded)).toBe(true);
      // Collapse all
      expanded = collapseAll();
      expect(expanded.size).toBe(0);
      expect(isAllExpanded(items, expanded)).toBe(false);
    });
  });
});

describe("Item field availability", () => {
  it("has fetchedAt field", () => {
    const item = makeItem();
    expect(item.fetchedAt).toBe("2026-06-08T10:30:00.000Z");
  });

  it("has sourceReliability field", () => {
    const item = makeItem({ sourceReliability: "trusted" });
    expect(item.sourceReliability).toBe("trusted");
  });

  it("has evaluation.reason field", () => {
    const item = makeItem();
    expect(item.evaluation?.reason).toBe("这是一条AI分析的理由文本");
  });

  it("has all 4 evaluation scores", () => {
    const item = makeItem({
      evaluation: makeEval({ relevanceScore: 88, credibilityScore: 72, noveltyScore: 65, hotnessScore: 78 })
    });
    expect(item.evaluation?.relevanceScore).toBe(88);
    expect(item.evaluation?.credibilityScore).toBe(72);
    expect(item.evaluation?.noveltyScore).toBe(65);
    expect(item.evaluation?.hotnessScore).toBe(78);
  });

  it("evaluation can be null", () => {
    const item = makeItem({ evaluation: null });
    expect(item.evaluation).toBeNull();
  });

  it("has author fields", () => {
    const item = makeItem({ authorName: "游戏评测菌", authorFollowers: 50000, authorVerified: true });
    expect(item.authorName).toBe("游戏评测菌");
    expect(item.authorFollowers).toBe(50000);
    expect(item.authorVerified).toBe(true);
  });

  it("authorName defaults to null", () => {
    const item = makeItem();
    expect(item.authorName).toBeNull();
    expect(item.authorVerified).toBe(false);
  });

  it("has interactionDanmaku and interactionQuotes", () => {
    const item = makeItem({ interactionDanmaku: 999, interactionQuotes: 50 });
    expect(item.interactionDanmaku).toBe(999);
    expect(item.interactionQuotes).toBe(50);
  });
});

describe("computeHotnessScore logic", () => {
  function computeHotnessScore(item: HotspotItem): number {
    const h = item.evaluation?.hotnessScore ?? 0;
    const interaction = Math.log10(item.interactionViews + item.interactionLikes + 1) * 20;
    return Math.round(h * 0.4 + Math.min(100, interaction) * 0.6);
  }

  it("with hotness 80 + 10000 views → high score", () => {
    const score = computeHotnessScore(makeItem({
      evaluation: makeEval({ hotnessScore: 80 }),
      interactionViews: 10000,
      interactionLikes: 500
    }));
    expect(score).toBeGreaterThanOrEqual(70);
  });

  it("without evaluation + no interactions → falls to 0", () => {
    const score = computeHotnessScore(makeItem({
      evaluation: null,
      interactionViews: 0,
      interactionLikes: 0
    }));
    expect(score).toBe(0);
  });

  it("without evaluation + high interactions → still scores from interaction", () => {
    const score = computeHotnessScore(makeItem({
      evaluation: null,
      interactionViews: 100000,
      interactionLikes: 5000
    }));
    expect(score).toBeGreaterThan(50);
  });
});

describe("relativeTime logic", () => {
  function relativeTime(value: string | null): string {
    if (!value) return "";
    const now = Date.now();
    const then = new Date(value).getTime();
    if (Number.isNaN(then)) return "";
    const diff = now - then;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return "刚刚";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}天前`;
    return value;
  }

  it('returns "刚刚" for < 60 seconds ago', () => {
    const recent = new Date(Date.now() - 30000).toISOString();
    expect(relativeTime(recent)).toBe("刚刚");
  });

  it('returns "X分钟前" for minutes ago', () => {
    const past = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(relativeTime(past)).toBe("5分钟前");
  });

  it('returns "X小时前" for hours ago', () => {
    const past = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    expect(relativeTime(past)).toBe("3小时前");
  });

  it('returns "X天前" for days ago', () => {
    const past = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
    expect(relativeTime(past)).toBe("7天前");
  });

  it("returns empty for null", () => {
    expect(relativeTime(null)).toBe("");
  });
});

describe("read badge detection", () => {
  it("unread when status=new and readAt=null", () => {
    const item = makeItem({ status: "new", readAt: null });
    expect(item.status === "new" && !item.readAt).toBe(true);
  });

  it("read when status=new but readAt is set", () => {
    const item = makeItem({ status: "new", readAt: "2026-06-08T11:00:00.000Z" });
    expect(item.status === "new" && !item.readAt).toBe(false);
  });

  it("read when status=watch and readAt is set", () => {
    const item = makeItem({ status: "watch", readAt: "2026-06-08T11:00:00.000Z" });
    expect(item.status === "new" && !item.readAt).toBe(false);
  });
});

describe("formatInteraction with danmaku/quotes", () => {
  function formatInteraction(item: HotspotItem): string {
    const parts: string[] = [];
    if (item.interactionLikes > 0) parts.push(`${formatNumber(item.interactionLikes)}赞`);
    if (item.interactionReposts > 0) parts.push(`${formatNumber(item.interactionReposts)}转发`);
    if (item.interactionReplies > 0) parts.push(`${formatNumber(item.interactionReplies)}回复`);
    if (item.interactionViews > 0) parts.push(`${formatNumber(item.interactionViews)}浏览`);
    if (item.interactionDanmaku > 0) parts.push(`${formatNumber(item.interactionDanmaku)}弹幕`);
    if (item.interactionQuotes > 0) parts.push(`${formatNumber(item.interactionQuotes)}引用`);
    if (parts.length > 0) return parts.join(" · ");
    return "";
  }

  it("includes danmaku when present", () => {
    const item = makeItem({ interactionDanmaku: 5000, interactionLikes: 0, interactionViews: 0 });
    expect(formatInteraction(item)).toContain("5k弹幕");
  });

  it("includes quotes when present", () => {
    const item = makeItem({ interactionQuotes: 120, interactionLikes: 0, interactionViews: 0 });
    expect(formatInteraction(item)).toContain("120引用");
  });

  it("shows combined stats", () => {
    const item = makeItem({
      interactionLikes: 1000,
      interactionDanmaku: 500,
      interactionQuotes: 30
    });
    const result = formatInteraction(item);
    expect(result).toContain("赞");
    expect(result).toContain("弹幕");
    expect(result).toContain("引用");
  });
});
