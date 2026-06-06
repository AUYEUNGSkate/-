const SPAM_PATTERNS = [
  /results\s+for/i,
  /bet365/i,
  /博彩|彩票|开奖|开户地址|体育投注|体育综合版|极速赛车|北京赛车|快三|盘口|代理/i,
  /(?:^|[\s{【])官网[}:：】]/i,
  /\b(?:852|x999)\s*\./i,
  /\.(?:tw|pw|ojd|cls|nze)\b/i,
  /api\.weibo\.com/i
];

const GENERIC_TITLES = new Set(["微博正文", "知乎", "首页", "搜索结果", "results"]);
const COMMUNITY_HOSTS = [/taptap\.cn$/i, /zhihu\.com$/i, /tieba\.baidu\.com$/i, /weibo\.com$/i, /bilibili\.com$/i];
const FORUM_PAGE_PATTERNS = [
  /第\s*\d+\s*页/,
  /\bpage[=/_-]?\d+\b/i,
  /\/forum\//i,
  /\/topic\//i,
  /\/post\//i,
  /\/question\//i
];

export interface QualityAssessment {
  score: number;
  signals: string[];
  lowQuality: boolean;
}

export function cleanArticleTitle(title: string): string {
  const decoded = decodeHtml(title)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let cleaned = decoded;
  for (let index = 0; index < 3; index += 1) {
    const next = cleaned.replace(
      /\s+-\s+(搜狐网|腾讯网|网易|新浪|新浪网|澎湃新闻|TapTap|发现好游戏|知乎专栏|游研社|触乐|竞核|游戏葡萄|哔哩哔哩|Bilibili|微博|百度贴吧|yeeyi)$/i,
      ""
    );
    if (next === cleaned) break;
    cleaned = next;
  }
  return cleaned.trim();
}

export function isLowQualityResult(input: { title: string; url?: string; summary?: string }): boolean {
  return assessContentQuality(input).lowQuality;
}

export function assessContentQuality(input: { title: string; url?: string; summary?: string }): QualityAssessment {
  const title = cleanArticleTitle(input.title);
  const haystack = `${input.title} ${input.url ?? ""} ${input.summary ?? ""}`;
  const signals: string[] = [];
  let score = 92;

  if (!title || title.length < 6) {
    signals.push("标题过短或缺失");
    score -= 55;
  }
  if (GENERIC_TITLES.has(title.toLowerCase())) {
    signals.push("泛化页面标题");
    score -= 60;
  }
  if (SPAM_PATTERNS.some((pattern) => pattern.test(haystack))) {
    signals.push("命中垃圾/博彩模式");
    score -= 75;
  }

  const symbolCount = (title.match(/[{}【】[\]".|]/g) ?? []).length;
  if (symbolCount >= 5) {
    signals.push("标题符号异常");
    score -= 35;
  }

  const latinAndDigits = (title.match(/[A-Za-z0-9]/g) ?? []).length;
  if (latinAndDigits > 24 && /[{}]|\.com|\.tw|\.pw|\.ojd|\.cls/i.test(title)) {
    signals.push("疑似搜索垃圾标题");
    score -= 45;
  }

  if (!input.summary?.trim()) {
    signals.push("摘要缺失");
    score -= 12;
  }

  const host = hostname(input.url ?? "");
  const communityHost = COMMUNITY_HOSTS.some((pattern) => pattern.test(host));
  if (communityHost) {
    signals.push("社区平台单条信号");
    score -= 10;
  }

  if (FORUM_PAGE_PATTERNS.some((pattern) => pattern.test(haystack))) {
    signals.push("疑似论坛/分页内容");
    score -= 32;
  }

  if (/api\./i.test(host) || /\/api\//i.test(input.url ?? "")) {
    signals.push("API 页面");
    score -= 45;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    signals: signals.length ? signals : ["基础质量通过"],
    lowQuality: score < 45
  };
}

export function cleanSummary(value: string): string {
  const cleaned = decodeHtml(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/<[^>]*$/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\bnews\.google\.com\/rss\/articles\/\S+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  if (/^<a\s/i.test(value) || cleaned.length > 180) {
    return cleanArticleTitle(cleaned);
  }
  return cleaned;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
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
