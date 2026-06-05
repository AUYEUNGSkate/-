import { XMLParser, XMLValidator } from "fast-xml-parser";
import type { Keyword, Source } from "../../shared/types";
import { cleanArticleTitle, cleanSummary, isLowQualityResult } from "./contentFilter";
import { normalizeUrl } from "./dedupe";

export interface CollectedItem {
  sourceId: number;
  keywordId: number;
  title: string;
  url: string;
  normalizedUrl: string;
  summary: string;
  publishedAt: string;
  fetchedAt: string;
  matchedKeyword: string;
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
        const feedUrl = buildFeedUrl(source.url, keyword);
        const xml = await fetchText(feedUrl);
        results.push(...parseFeed(xml, source, keyword));
      } catch (error) {
        console.warn(`[collector] ${source.name} failed:`, error instanceof Error ? error.message : error);
      }
    }
  }
  return results;
}

export function buildFeedUrl(template: string, keyword: Keyword): string {
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
    .map((item) => normalizeFeedItem(item, source, keyword, fetchedAt))
    .filter((item): item is CollectedItem => Boolean(item));
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
  fetchedAt: string
): CollectedItem | null {
  const title = text(raw.title);
  const url = extractUrl(raw);
  if (!title || !url) return null;
  const summary = cleanSummary(text(raw.description) || text(raw.summary) || text(raw.content) || "");
  if (isLowQualityResult({ title, url, summary })) return null;
  return {
    sourceId: source.id,
    keywordId: keyword.id,
    title: cleanArticleTitle(title),
    url,
    normalizedUrl: normalizeUrl(url),
    summary,
    publishedAt: parseDate(text(raw.pubDate) || text(raw.published) || text(raw.updated) || text(raw["dc:date"])) ?? fetchedAt,
    fetchedAt,
    matchedKeyword: keyword.term
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

function arrayify(value: unknown): Record<string, unknown>[] {
  const array = Array.isArray(value) ? value : [value];
  return array.filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null);
}
