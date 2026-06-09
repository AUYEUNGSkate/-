import { XMLParser, XMLValidator } from "fast-xml-parser";
import type { Keyword, ProviderType, Source } from "../../shared/types";
import { getEnv } from "../config/env";
import { assessContentQuality, cleanArticleTitle, cleanSummary } from "./contentFilter";
import { normalizeUrl } from "./dedupe";
import { enrichCollectedItem, extractInteractionCounts } from "./enrichment";

export interface CollectedItem {
  sourceId: number;
  keywordId: number;
  providerType: ProviderType;
  title: string;
  url: string;
  normalizedUrl: string;
  summary: string;
  publishedAt: string;
  fetchedAt: string;
  matchedKeyword: string;
  query: string;
  rank: number;
  qualityScore: number;
  qualitySignals: string[];
  interactionLikes: number;
  interactionReposts: number;
  interactionReplies: number;
  interactionViews: number;
  summarySource: "ai" | "rss" | "metadata" | "title";
  interactionSource: "bilibili" | "zhihu" | "wechat" | "weibo" | "html" | "rss" | "none";
  authorName?: string | null;
  authorFollowers?: number;
  authorVerified?: boolean;
  interactionDanmaku?: number;
  interactionQuotes?: number;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  trimValues: true
});

function fetchWithTimeout(url: string | URL, init?: RequestInit, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

const GAME_TERMS = ["游戏", "电竞", "手游", "主机", "PS5", "Switch", "Steam", "原神", "米哈游", "腾讯", "网易", "3A", "赛博", "黑神话", "虚幻", "Unity", "育碧", "暴雪", "R星"];

export function isGameKeyword(keyword: Keyword): boolean {
  const haystack = `${keyword.term} ${keyword.scope}`.toLowerCase();
  return GAME_TERMS.some((gt) => haystack.includes(gt.toLowerCase()));
}

const GAME_MEDIA_SOURCES = new Set(["机核网", "游研社", "触乐"]);

export async function collectFromSources(keywords: Keyword[], sources: Source[]): Promise<CollectedItem[]> {
  const results: CollectedItem[] = [];
  const failures = new Map<string, { count: number; messages: Set<string> }>();
  for (const keyword of keywords) {
    const isGame = isGameKeyword(keyword);
    for (const source of sources) {
      // 非游戏关键词跳过游戏媒体 RSS 源
      if (!isGame && GAME_MEDIA_SOURCES.has(source.name)) continue;
      try {
        results.push(...await collectFromSource(keyword, source));
      } catch (error) {
        const key = `${source.name} (${source.providerType})`;
        const current = failures.get(key) ?? { count: 0, messages: new Set<string>() };
        current.count += 1;
        current.messages.add(error instanceof Error ? error.message : String(error));
        failures.set(key, current);
      }
    }
  }
  if (failures.size > 0) {
    const summary = Array.from(failures.entries())
      .map(([name, failure]) => {
        const messages = Array.from(failure.messages).slice(0, 2).join("; ");
        return `${name} x${failure.count}: ${messages}`;
      })
      .join(" | ");
    console.warn(`[collector] source failures: ${summary}`);
  }
  return results;
}

export async function collectFromSource(keyword: Keyword, source: Source): Promise<CollectedItem[]> {
  if (source.url.includes("{accountUid}") && (!keyword.accountMode || keyword.accountPlatform !== "bilibili" || !keyword.accountUid)) {
    return [];
  }
  if (source.providerType === "brave_search") {
    return collectFromBraveSearch(keyword, source);
  }
  if (source.providerType === "bilibili_search") {
    return collectFromBilibiliSearch(keyword, source);
  }
  if (source.providerType === "weibo_hot") {
    return collectFromWeiboHot(keyword, source);
  }
  const feedUrl = buildFeedUrl(source.url, keyword);
  const xml = await fetchText(feedUrl);
  let items = parseFeed(xml, source, keyword);

  // For {query} sources, also try expanded query variants for better recall
  if (source.url.includes("{query}")) {
    const expanded = expandQuery(keyword);
    for (const variant of expanded) {
      if (variant === buildQuery(keyword)) continue;
      const variantUrl = source.url.replace("{query}", encodeURIComponent(variant));
      try {
        const variantXml = await fetchText(variantUrl);
        const variantItems = parseFeed(variantXml, source, keyword);
        items = items.concat(variantItems);
      } catch {
        // skip failed variants
      }
    }
  }

  // 对不含 {query} 的全站 RSS 源，按关键词做标题+摘要相关性过滤
  if (!source.url.includes("{query}") && !keyword.accountMode) {
    const term = keyword.term.toLowerCase();
    items = items.filter((item) =>
      item.title.toLowerCase().includes(term) ||
      item.summary.toLowerCase().includes(term) ||
      (keyword.scope && keyword.scope.split(/[,，、\s]+/).some((w) =>
        item.title.includes(w) || item.summary.includes(w)
      ))
    );
  }
  return Promise.all(items.map(enrichCollectedItem));
}

export function buildFeedUrl(template: string, keyword: Keyword): string {
  if (template.includes("{accountUid}")) {
    return template.replaceAll("{accountUid}", encodeURIComponent(keyword.accountUid));
  }
  if (keyword.accountMode) {
    return template.replaceAll("{query}", encodeURIComponent(keyword.term));
  }
  const query = [keyword.term, keyword.scope].filter(Boolean).join(" ");
  // 百度搜索：引号精确匹配+排除垃圾站
  if (template.includes("baidu/search")) {
    const preciseQuery = `"${query}" -site:csdn.net -site:zhihu.com -site:jianshu.com`;
    return template.replaceAll("{query}", encodeURIComponent(preciseQuery));
  }
  return template.replaceAll("{query}", encodeURIComponent(query));
}

export function parseFeed(xml: string, source: Source, keyword: Keyword): CollectedItem[] {
  const validation = XMLValidator.validate(xml, { allowBooleanAttributes: true });
  if (validation !== true) {
    throw new Error(`Invalid XML at line ${validation.err.line}`);
  }
  const parsed = parser.parse(xml) as Record<string, unknown>;
  const rawItems = extractRawItems(parsed);
  const fetchedAt = new Date().toISOString();
  return rawItems
    .map((item, index) => normalizeFeedItem(item, source, keyword, fetchedAt, index + 1))
    .filter((item): item is CollectedItem => Boolean(item));
}

export async function collectFromBraveSearch(keyword: Keyword, source: Source): Promise<CollectedItem[]> {
  const env = getEnv();
  if (!env.braveSearchApiKey) return [];
  const query = buildQuery(keyword);
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", "10");
  url.searchParams.set("freshness", "pd");
  url.searchParams.set("country", "cn");
  url.searchParams.set("search_lang", "zh-hans");

  const response = await fetchWithTimeout(url, {
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": env.braveSearchApiKey,
      "User-Agent": "GameHotspotRadar/0.1"
    }
  });
  if (!response.ok) throw new Error(`Brave Search HTTP ${response.status}`);
  const payload = await response.json() as BraveSearchResponse;
  const fetchedAt = new Date().toISOString();
  const items = (payload.web?.results ?? [])
    .map((result, index) => normalizeSearchResult(result, source, keyword, query, fetchedAt, index + 1))
    .filter((item): item is CollectedItem => Boolean(item));
  return Promise.all(items.map(enrichCollectedItem));
}

export async function collectFromBilibiliSearch(keyword: Keyword, source: Source): Promise<CollectedItem[]> {
  const query = buildQuery(keyword);
  const url = new URL("https://api.bilibili.com/x/web-interface/search/type");
  url.searchParams.set("search_type", "video");
  url.searchParams.set("keyword", query);
  url.searchParams.set("page", "1");

  const response = await fetchWithTimeout(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://search.bilibili.com",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "zh-CN,zh;q=0.9",
      "Cookie": "buvid3=auto"
    }
  });
  if (!response.ok) throw new Error(`Bilibili Search HTTP ${response.status}`);
  const text = await response.text();
  let payload: BilibiliSearchResponse;
  try {
    payload = JSON.parse(text) as BilibiliSearchResponse;
  } catch {
    // B站 returned HTML (rate-limited), skip
    return [];
  }
  const fetchedAt = new Date().toISOString();
  const rawItems = (payload.data?.result ?? [])
    .filter((v): v is NonNullable<typeof v> => Boolean(v.bvid && v.title && (v.play ?? 0) >= 1000));

  const results: CollectedItem[] = [];
  for (let index = 0; index < rawItems.length; index++) {
    const video = rawItems[index];
    const videoUrl = video.arcurl || `https://www.bilibili.com/video/${video.bvid}`;
    const quality = assessContentQuality({ title: video.title!, url: videoUrl, summary: video.description ?? "" });
    if (quality.lowQuality) continue;
    const counts = extractInteractionCounts(video.title!);
    results.push({
      sourceId: source.id,
      keywordId: keyword.id,
      providerType: "bilibili_search" as ProviderType,
      title: cleanArticleTitle(video.title!.replace(/<[^>]*>/g, "").trim()),
      url: videoUrl,
      normalizedUrl: normalizeUrl(videoUrl),
      summary: cleanSummary(video.description ?? ""),
      publishedAt: new Date((video.pubdate ?? 0) * 1000).toISOString(),
      fetchedAt,
      matchedKeyword: keyword.term,
      query: buildQuery(keyword),
      rank: index + 1,
      qualityScore: quality.score,
      qualitySignals: quality.signals,
      interactionLikes: counts.likes,
      interactionReposts: counts.reposts,
      interactionReplies: counts.replies,
      interactionViews: video.play ?? 0,
      interactionSource: (video.play ? "bilibili" : "none") as CollectedItem["interactionSource"],
      summarySource: (video.description ? "rss" : "title") as CollectedItem["summarySource"],
    });
  }

  let enriched = await Promise.all(results.map(enrichCollectedItem));
  // 二次过滤：标题/摘要必须与关键词相关
  const term = keyword.term.toLowerCase();
  enriched = enriched.filter((item) =>
    item.title.toLowerCase().includes(term) ||
    item.summary.toLowerCase().includes(term)
  );
  return enriched;
}

let weiboHotCache: { fetchedAt: number; topics: Array<{ word: string; rank: number; raw_hot: number }> } | null = null;

export async function collectFromWeiboHot(keyword: Keyword, source: Source): Promise<CollectedItem[]> {
  const now = Date.now();
  if (weiboHotCache && now - weiboHotCache.fetchedAt < 300000) {
    return filterWeiboTopics(weiboHotCache.topics, keyword, source);
  }
  const response = await fetchWithTimeout("https://weibo.com/ajax/side/hotSearch", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Referer": "https://www.weibo.com"
    }
  });
  if (!response.ok) throw new Error(`Weibo Hot HTTP ${response.status}`);
  const payload = await response.json() as WeiboHotResponse;
  const topics = (payload.data?.realtime ?? []).map((t) => ({
    word: t.word ?? "",
    rank: t.rank ?? 0,
    raw_hot: t.raw_hot ?? 0
  }));
  weiboHotCache = { fetchedAt: now, topics };
  return filterWeiboTopics(topics, keyword, source);
}

function filterWeiboTopics(topics: Array<{ word: string; rank: number; raw_hot: number }>, keyword: Keyword, source: Source): CollectedItem[] {
  const term = keyword.term.toLowerCase();
  const gameTerms = ["游戏", "电竞", "手游", "主机", "PS5", "Switch", "Steam", "原神", "米哈游", "腾讯", "网易", "独立游戏", "3A", "赛博", "黑神话", "VR", "AI", "虚幻", "Unity", "育碧", "暴雪", "R星"];
  const fetchedAt = new Date().toISOString();
  const results: CollectedItem[] = [];
  for (const topic of topics) {
    const word = topic.word;
    const matchKeyword = word.includes(term) || term.split(" ").some((t) => word.includes(t));
    const matchGame = gameTerms.some((gt) => word.includes(gt.toLowerCase()));
    if (!matchKeyword && !matchGame) continue;
    const title = word;
    const url = `https://s.weibo.com/weibo?q=${encodeURIComponent(title)}`;
    const quality = assessContentQuality({ title, url, summary: "" });
    if (quality.lowQuality) continue;
    results.push({
      sourceId: source.id,
      keywordId: keyword.id,
      providerType: "weibo_hot" as ProviderType,
      title: cleanArticleTitle(title),
      url,
      normalizedUrl: normalizeUrl(url),
      summary: `微博热搜 #${topic.rank + 1}`,
      publishedAt: fetchedAt,
      fetchedAt,
      matchedKeyword: keyword.term,
      query: keyword.term,
      rank: 0,
      qualityScore: quality.score,
      qualitySignals: quality.signals,
      interactionLikes: 0,
      interactionReposts: 0,
      interactionReplies: 0,
      interactionViews: topic.raw_hot,
      interactionSource: ("weibo" as CollectedItem["interactionSource"]),
      summarySource: ("rss" as CollectedItem["summarySource"]),
    });
  }
  return results;
}

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetchWithTimeout(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "GameHotspotRadar/0.1"
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function extractRawItems(parsed: Record<string, unknown>): Record<string, unknown>[] {
  const rss = parsed.rss as { channel?: { item?: unknown } } | undefined;
  if (rss?.channel?.item) return arrayify(rss.channel.item);

  const feed = parsed.feed as { entry?: unknown } | undefined;
  if (feed?.entry) return arrayify(feed.entry);

  return [];
}

function normalizeFeedItem(
  raw: Record<string, unknown>,
  source: Source,
  keyword: Keyword,
  fetchedAt: string,
  rank: number
): CollectedItem | null {
  const title = text(raw.title);
  const feedUrl = extractUrl(raw);
  const url = source.providerType === "google_news" ? extractOriginalUrl(raw, feedUrl) : feedUrl;
  if (!title || !url) return null;
  const summary = cleanSummary(text(raw.description) || text(raw.summary) || text(raw.content) || "");
  const quality = assessContentQuality({ title, url, summary, sourceName: source.name, sourceCommunity: source.communitySource });
  if (quality.lowQuality) return null;
  const unresolvedGoogleProxy = source.providerType === "google_news" && /news\.google\.com/i.test(url);
  const counts = extractInteractionCounts(title);
  return {
    sourceId: source.id,
    keywordId: keyword.id,
    providerType: source.providerType,
    title: cleanArticleTitle(title),
    url,
    normalizedUrl: normalizeUrl(url),
    summary,
    publishedAt: parseDate(text(raw.pubDate) || text(raw.published) || text(raw.updated) || text(raw["dc:date"])) ?? fetchedAt,
    fetchedAt,
    matchedKeyword: keyword.term,
    query: buildQuery(keyword),
    rank,
    qualityScore: unresolvedGoogleProxy ? Math.max(0, quality.score - 18) : quality.score,
    qualitySignals: unresolvedGoogleProxy ? [...quality.signals, "Google 代理原文未恢复"] : quality.signals,
    interactionLikes: counts.likes,
    interactionReposts: counts.reposts,
    interactionReplies: counts.replies,
    interactionViews: counts.views,
    summarySource: summary ? "rss" : "title",
    interactionSource: counts.likes || counts.reposts || counts.replies || counts.views ? "rss" : "none"
  };
}

function normalizeSearchResult(
  result: BraveSearchResult,
  source: Source,
  keyword: Keyword,
  query: string,
  fetchedAt: string,
  rank: number
): CollectedItem | null {
  const title = result.title ?? "";
  const url = result.url ?? "";
  if (!title || !url) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  const summary = cleanSummary(result.description ?? "");
  const quality = assessContentQuality({ title, url, summary, sourceName: source.name, sourceCommunity: source.communitySource });
  if (quality.lowQuality) return null;
  const counts = extractInteractionCounts(title);
  return {
    sourceId: source.id,
    keywordId: keyword.id,
    providerType: "brave_search",
    title: cleanArticleTitle(title),
    url,
    normalizedUrl: normalizeUrl(url),
    summary,
    publishedAt: parseDate(result.age ?? "") ?? fetchedAt,
    fetchedAt,
    matchedKeyword: keyword.term,
    query,
    rank,
    qualityScore: quality.score,
    qualitySignals: quality.signals,
    interactionLikes: counts.likes,
    interactionReposts: counts.reposts,
    interactionReplies: counts.replies,
    interactionViews: counts.views,
    summarySource: summary ? "rss" : "title",
    interactionSource: counts.likes || counts.reposts || counts.replies || counts.views ? "rss" : "none"
  };
}

function extractUrl(raw: Record<string, unknown>): string {
  const direct = text(raw.link) || text(raw.guid);
  if (direct && /^https?:\/\//i.test(direct)) return direct;
  const link = raw.link;
  if (Array.isArray(link)) {
    const hrefLink = link.find((entry) => typeof entry === "object" && entry !== null && "@_href" in entry) as { "@_href"?: string } | undefined;
    if (hrefLink?.["@_href"]) return hrefLink["@_href"];
  }
  if (typeof link === "object" && link !== null && "@_href" in link) {
    return String((link as { "@_href": unknown })["@_href"]);
  }
  return "";
}

function extractOriginalUrl(raw: Record<string, unknown>, fallback: string): string {
  const description = text(raw.description);
  const hrefs = Array.from(description.matchAll(/href=["']([^"']+)["']/gi)).map((match) => decodeHtml(match[1]));
  const original = hrefs.find((href) => /^https?:\/\//i.test(href) && !/news\.google\.com/i.test(href));
  return original ?? fallback;
}

function buildQuery(keyword: Keyword): string {
  if (keyword.accountMode) return keyword.term;
  return [keyword.term, keyword.scope].filter(Boolean).join(" ");
}

export function expandQuery(keyword: Keyword): string[] {
  const term = keyword.term.trim();
  const scope = keyword.scope.trim();

  if (keyword.accountMode) return [term];

  const variants: string[] = [];

  // Variant 1: original combined query
  const combined = [term, scope].filter(Boolean).join(" ");
  if (combined) variants.push(combined);

  // Variant 2: term without scope (if scope differs)
  if (scope && term !== scope) {
    variants.push(term);
  }

  // Variant 3: term + scope 拆词 (token-based)
  if (scope) {
    const tokens = scope.split(/[,，、\s]+/).filter(Boolean);
    for (const token of tokens) {
      const variant = `${term} ${token}`;
      if (!variants.includes(variant) && variant !== combined) {
        variants.push(variant);
      }
    }
  }

  return variants.slice(0, 4);
}

function parseDate(value: string): string | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

function text(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (typeof value === "object" && value !== null && "#text" in value) {
    return String((value as { "#text": unknown })["#text"]).trim();
  }
  return "";
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function arrayify(value: unknown): Record<string, unknown>[] {
  const array = Array.isArray(value) ? value : [value];
  return array.filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null);
}

interface BraveSearchResponse {
  web?: {
    results?: BraveSearchResult[];
  };
}

interface BraveSearchResult {
  title?: string;
  url?: string;
  description?: string;
  age?: string;
}

interface BilibiliSearchResponse {
  data?: {
    result?: Array<{
      bvid?: string;
      title?: string;
      play?: number;
      video_review?: number;
      description?: string;
      pubdate?: number;
      arcurl?: string;
      author?: string;
    }>;
  };
}

interface WeiboHotResponse {
  data?: {
    realtime?: Array<{
      word?: string;
      rank?: number;
      raw_hot?: number;
    }>;
  };
}
