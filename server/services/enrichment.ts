import type { InteractionSource, SummarySource } from "../../shared/types";
import { normalizeUrl } from "./dedupe";
import type { CollectedItem } from "./collector";
import { cleanSummary } from "./contentFilter";

export interface EnrichmentResult {
  url?: string;
  normalizedUrl?: string;
  summary?: string;
  summarySource?: SummarySource;
  interactionLikes?: number;
  interactionReposts?: number;
  interactionReplies?: number;
  interactionViews?: number;
  interactionSource?: InteractionSource;
}

const GAME_SITE_HOSTS = [
  "17173.com",
  "gcores.com",
  "gamersky.com",
  "3dmgame.com",
  "sohu.com",
  "163.com"
];

const REDIRECT_PARAM_KEYS = ["url", "u", "target", "dest", "destination", "redirect", "redir", "jump"];

export async function enrichCollectedItem(item: CollectedItem): Promise<CollectedItem> {
  try {
    const resolved = await withTimeout(resolveCanonicalUrl(item.url), 5000);
    const resolvedUrl = resolved?.url ?? item.url;
    const normalizedUrl = resolvedUrl === item.url ? item.normalizedUrl : normalizeUrl(resolvedUrl);
    const result = await withTimeout(enrichUrl(resolvedUrl, resolved?.html), 5000);
    if (!result && resolvedUrl === item.url) return item;
    return {
      ...item,
      url: result?.url ?? resolvedUrl,
      normalizedUrl: result?.normalizedUrl ?? normalizedUrl,
      summary: result?.summary ? result.summary : item.summary,
      summarySource: result?.summarySource ?? item.summarySource,
      interactionLikes: result?.interactionLikes ?? item.interactionLikes,
      interactionReposts: result?.interactionReposts ?? item.interactionReposts,
      interactionReplies: result?.interactionReplies ?? item.interactionReplies,
      interactionViews: result?.interactionViews ?? item.interactionViews,
      interactionSource: result?.interactionSource ?? item.interactionSource
    };
  } catch {
    return item;
  }
}

export async function enrichUrl(url: string, html = ""): Promise<EnrichmentResult | null> {
  const bvid = extractBvid(url);
  const aid = extractAid(url);
  if (bvid || aid) {
    const result = await enrichBilibiliVideo({ bvid, aid });
    return result ? { ...result, url, normalizedUrl: normalizeUrl(url) } : null;
  }
  if (isZhihu(url)) {
    const result = await enrichZhihu(url);
    return result ? { ...result, url, normalizedUrl: normalizeUrl(url) } : null;
  }
  if (isWechatMp(url)) {
    const result = await enrichWechatMp(url, html);
    return result ? { ...result, url, normalizedUrl: normalizeUrl(url) } : null;
  }
  if (isGameSite(url) || isArticleSite(url)) {
    const result = await enrichHtmlMetadata(url, html);
    return result ? { ...result, url, normalizedUrl: normalizeUrl(url) } : null;
  }
  return null;
}

export async function resolveCanonicalUrl(url: string, depth = 0): Promise<{ url: string; html: string } | null> {
  if (depth > 2) return { url, html: "" };

  const directParam = redirectParamUrl(url);
  if (directParam && directParam !== url) {
    return resolveCanonicalUrl(directParam, depth + 1);
  }

  if (!shouldResolveUrl(url)) return { url, html: "" };

  const response = await fetch(url, {
    headers: {
      "User-Agent": "GameHotspotRadar/0.1"
    },
    redirect: "follow"
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const html = await response.text();
  const finalUrl = response.url || url;
  const candidates = [
    redirectParamUrl(finalUrl),
    !isGoogleNewsUrl(finalUrl) ? finalUrl : "",
    extractOriginalUrlFromHtml(html)
  ].filter(Boolean);

  const resolvedUrl = candidates.find((candidate) => /^https?:\/\//i.test(candidate) && !isGoogleNewsUrl(candidate)) ?? finalUrl;
  if (resolvedUrl !== finalUrl && shouldResolveUrl(resolvedUrl)) {
    return resolveCanonicalUrl(resolvedUrl, depth + 1);
  }
  return { url: resolvedUrl, html: resolvedUrl === finalUrl ? html : "" };
}

export async function enrichBilibiliVideo(input: { bvid?: string; aid?: string }): Promise<EnrichmentResult | null> {
  const url = new URL("https://api.bilibili.com/x/web-interface/view");
  if (input.bvid) url.searchParams.set("bvid", input.bvid);
  if (input.aid) url.searchParams.set("aid", input.aid);
  const response = await fetchText(url.toString());
  const payload = JSON.parse(response) as BilibiliViewResponse;
  const data = payload.data;
  if (!data) return null;
  return {
    summary: cleanSummary(data.desc || data.title || ""),
    summarySource: data.desc ? "metadata" : "title",
    interactionLikes: data.stat?.like ?? 0,
    interactionReposts: data.stat?.share ?? 0,
    interactionReplies: data.stat?.reply ?? 0,
    interactionViews: data.stat?.view ?? 0,
    interactionSource: "bilibili"
  };
}

export async function enrichZhihu(url: string): Promise<EnrichmentResult | null> {
  const html = await fetchText(url);
  // 赞同数
  const likesMatch = html.match(/class="[^"]*Button.*?VoteButton.*?"[^>]*>[\s\S]*?(\d[\d,]*(?:,\d{3})*(?:\.\d+)?[kKwW万万]?)[\s\S]*?<\/button>/i) ??
    html.match(/"voteupCount"\s*:\s*(\d+)/i) ??
    html.match(/赞同[：:\s]*(\d[\d,]*(?:[kKwW万万])?)/i);
  // 评论数  
  const repliesMatch = html.match(/"commentCount"\s*:\s*(\d+)/i) ??
    html.match(/评论[：:\s]*(\d[\d,]*(?:[kKwW万万])?)/i);
  // 阅读数
  const viewsMatch = html.match(/"visitCount"\s*:\s*(\d+)/i) ??
    html.match(/浏览[：:\s]*(\d[\d,]*(?:[kKwW万万])?)/i);
  
  if (!likesMatch && !repliesMatch && !viewsMatch) return null;
  return {
    summary: metaContent(html, "description") || metaContent(html, "og:description"),
    summarySource: "metadata",
    interactionLikes: likesMatch ? parseInt(likesMatch[1].replace(/[,，]/g, ""), 10) : 0,
    interactionReplies: repliesMatch ? parseInt(repliesMatch[1].replace(/[,，]/g, ""), 10) : 0,
    interactionViews: viewsMatch ? parseInt(viewsMatch[1].replace(/[,，]/g, ""), 10) : 0,
    interactionSource: "zhihu"
  };
}

export async function enrichWechatMp(url: string, existingHtml = ""): Promise<EnrichmentResult | null> {
  const html = existingHtml || await fetchText(url);
  // 阅读数
  const viewsMatch = html.match(/var\s+read_num\s*=\s*(\d+)/i) ??
    html.match(/"read_num"\s*:\s*(\d+)/i) ??
    html.match(/var\s+readNum\s*=\s*(\d+)/i) ??
    html.match(/阅读[：:\s]*(\d[\d,]*(?:[kKwW万万])?)/i);
  // 点赞数
  const likesMatch = html.match(/var\s+like_num\s*=\s*(\d+)/i) ??
    html.match(/"like_num"\s*:\s*(\d+)/i) ??
    html.match(/var\s+likeNum\s*=\s*(\d+)/i) ??
    html.match(/点赞[：:\s]*(\d[\d,]*(?:[kKwW万万])?)/i);
  
  if (!viewsMatch && !likesMatch) return null;
  return {
    summary: metaContent(html, "description") || metaContent(html, "og:description"),
    summarySource: "metadata",
    interactionLikes: likesMatch ? parseInt(likesMatch[1].replace(/[,，]/g, ""), 10) : 0,
    interactionViews: viewsMatch ? parseInt(viewsMatch[1].replace(/[,，]/g, ""), 10) : 0,
    interactionSource: "wechat"
  };
}

export async function enrichHtmlMetadata(url: string, existingHtml = ""): Promise<EnrichmentResult | null> {
  const html = existingHtml || await fetchText(url);
  const summary =
    metaContent(html, "description") ||
    metaContent(html, "og:description") ||
    jsonLdDescription(html);
  if (!summary) return null;
  const counts = extractInteractionCounts(html);
  return {
    summary: cleanSummary(summary).slice(0, 240),
    summarySource: "metadata",
    interactionLikes: counts.likes,
    interactionReposts: counts.reposts,
    interactionReplies: counts.replies,
    interactionViews: counts.views,
    interactionSource: hasAnyCount(counts) ? "html" : "none"
  };
}

export function extractBvid(value: string): string {
  return value.match(/\b(BV[0-9A-Za-z]{8,})\b/)?.[1] ?? "";
}

export function extractAid(value: string): string {
  return value.match(/(?:\/video\/av|[?&]aid=|(?:^|\s)av)(\d+)/i)?.[1] ?? "";
}

export function extractInteractionCounts(value: string) {
  const patterns = {
    likes: /(\d+(?:\.\d+)?[kKwW万]?)\s*(?:赞|点赞|like|upvote|赞同)/i,
    reposts: /(\d+(?:\.\d+)?[kKwW万]?)\s*(?:转发|repost|share|分享)/i,
    replies: /(\d+(?:\.\d+)?[kKwW万]?)\s*(?:回复|评论|comment|reply|回答|条评价|个回答)/i,
    views: /(\d+(?:\.\d+)?[kKwW万]?)\s*(?:播放|浏览|view|阅读)/i
  };
  const result = { likes: 0, reposts: 0, replies: 0, views: 0 };
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = value.match(pattern);
    if (match) result[key as keyof typeof result] = parseNumber(match[1]);
  }
  return result;
}

export function extractOriginalUrlFromHtml(html: string): string {
  const candidates = [
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? "",
    html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? "",
    html.match(/<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^"']*url=([^"']+)["']/i)?.[1] ?? "",
    html.match(/"url"\s*:\s*"([^"]+)"/i)?.[1] ?? "",
    ...Array.from(html.matchAll(/href=["']([^"']+)["']/gi)).map((match) => decodeHtml(match[1]))
  ];
  return candidates
    .map((candidate) => decodeHtml(candidate))
    .find((candidate) => /^https?:\/\//i.test(candidate) && !isGoogleNewsUrl(candidate)) ?? "";
}

function redirectParamUrl(value: string): string {
  try {
    const url = new URL(value);
    for (const key of REDIRECT_PARAM_KEYS) {
      const candidate = url.searchParams.get(key);
      if (candidate && /^https?:\/\//i.test(candidate)) {
        try {
          return decodeURIComponent(candidate);
        } catch {
          return candidate;
        }
      }
    }
  } catch {
    return "";
  }
  return "";
}

function shouldResolveUrl(value: string): boolean {
  return isGoogleNewsUrl(value) || isShortRedirectUrl(value);
}

function isGoogleNewsUrl(value: string): boolean {
  return /news\.google\.com/i.test(value);
}

function isShortRedirectUrl(value: string): boolean {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "b23.tv" || host.endsWith(".b23.tv");
  } catch {
    return false;
  }
}

function isGameSite(value: string): boolean {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return GAME_SITE_HOSTS.some((entry) => host === entry || host.endsWith(`.${entry}`));
  } catch {
    return false;
  }
}

function isZhihu(value: string): boolean {
  return /zhihu\.com/.test(value);
}

function isWechatMp(value: string): boolean {
  return /mp\.weixin\.qq\.com/.test(value);
}

function isArticleSite(value: string): boolean {
  try {
    const host = new URL(value).hostname.toLowerCase();
    const articleHosts = [
      "news.qq.com", "tech.qq.com", "game.qq.com",
      "tech.sina.com.cn", "finance.sina.com.cn",
      "tech.163.com", "game.163.com",
      "it.sohu.com", "news.sohu.com",
      "36kr.com", "geekpark.net",
      "ithome.com", "cnbeta.com"
    ];
    return articleHosts.some((entry) => host === entry || host.endsWith(`.${entry}`));
  } catch {
    return false;
  }
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "GameHotspotRadar/0.1"
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("enrichment timeout")), timeoutMs);
      })
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function metaContent(html: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  return decodeHtml(pattern.exec(html)?.[1] ?? "");
}

function jsonLdDescription(html: string): string {
  const match = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) return "";
  try {
    const parsed = JSON.parse(match[1]) as { description?: unknown } | Array<{ description?: unknown }>;
    const entry = Array.isArray(parsed) ? parsed.find((item) => item.description) : parsed;
    return typeof entry?.description === "string" ? entry.description : "";
  } catch {
    return "";
  }
}

function parseNumber(str: string): number {
  const normalized = str.toLowerCase();
  const num = parseFloat(normalized);
  if (normalized.includes("k")) return Math.round(num * 1000);
  if (normalized.includes("w") || str.includes("万")) return Math.round(num * 10000);
  return Math.round(num);
}

function hasAnyCount(counts: { likes: number; reposts: number; replies: number; views: number }): boolean {
  return counts.likes > 0 || counts.reposts > 0 || counts.replies > 0 || counts.views > 0;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

interface BilibiliViewResponse {
  data?: {
    title?: string;
    desc?: string;
    stat?: {
      view?: number;
      like?: number;
      reply?: number;
      share?: number;
    };
  };
}
