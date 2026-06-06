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
  interactionSource: "bilibili" | "html" | "rss" | "none";
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  trimValues: true
});

export async function collectFromSources(keywords: Keyword[], sources: Source[]): Promise<CollectedItem[]> {
  const results: CollectedItem[] = [];
  for (const keyword of keywords) {
    for (const source of sources) {
      try {
        results.push(...await collectFromSource(keyword, source));
      } catch (error) {
        console.warn(`[collector] ${source.name} failed:`, error instanceof Error ? error.message : error);
      }
    }
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
  const feedUrl = buildFeedUrl(source.url, keyword);
  const xml = await fetchText(feedUrl);
  return Promise.all(parseFeed(xml, source, keyword).map(enrichCollectedItem));
}

export function buildFeedUrl(template: string, keyword: Keyword): string {
  if (template.includes("{accountUid}")) {
    return template.replaceAll("{accountUid}", encodeURIComponent(keyword.accountUid));
  }
  if (keyword.accountMode) {
    return template.replaceAll("{query}", encodeURIComponent(keyword.term));
  }
  const query = [keyword.term, keyword.scope].filter(Boolean).join(" ");
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

  const response = await fetch(url, {
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

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
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
