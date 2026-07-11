// functions/api/[[...route]].ts
import { Hono } from "hono";

// server/config/env.ts
var _env = null;
function initEnv(overrides) {
  const e = overrides ?? (typeof process !== "undefined" && process.env ? process.env : {});
  const scanIntervalMinutes = Number(e.SCAN_INTERVAL_MINUTES ?? 30);
  _env = {
    port: Number(e.PORT ?? 8787),
    databasePath: e.DATABASE_PATH ?? "./data/hotspot-radar.sqlite",
    scanIntervalMinutes: Number.isFinite(scanIntervalMinutes) ? scanIntervalMinutes : 30,
    aiMode: e.AI_MODE === "mock" ? "mock" : "openrouter",
    openRouterApiKey: e.OPEN_ROUTER ?? e.OPENROUTER_API_KEY ?? "",
    openRouterModel: e.OPENROUTER_MODEL ?? "deepseek/deepseek-v4-flash",
    openRouterReferer: e.OPENROUTER_REFERER ?? "http://localhost:5173",
    openRouterTitle: e.OPENROUTER_TITLE ?? "Game Hotspot Radar",
    braveSearchApiKey: e.BRAVE_SEARCH_API_KEY ?? ""
  };
  return _env;
}
function getEnv() {
  if (!_env) return initEnv();
  return _env;
}

// server/db/turso.ts
import { createClient } from "@libsql/client";

// server/services/contentFilter.ts
var SPAM_PATTERNS = [
  /results\s+for/i,
  /bet365/i,
  /博彩|彩票|开奖|开户地址|体育投注|体育综合版|极速赛车|北京赛车|快三|盘口|代理/i,
  /(?:^|[\s{【])官网[}:：】]/i,
  /\b(?:852|x999)\s*\./i,
  /\.(?:tw|pw|ojd|cls|nze)\b/i,
  /api\.weibo\.com/i
];
var GENERIC_TITLES = /* @__PURE__ */ new Set(["\u5FAE\u535A\u6B63\u6587", "\u77E5\u4E4E", "\u9996\u9875", "\u641C\u7D22\u7ED3\u679C", "results"]);
var COMMUNITY_HOSTS = [/taptap\.cn$/i, /zhihu\.com$/i, /tieba\.baidu\.com$/i, /weibo\.com$/i, /bilibili\.com$/i];
var FORUM_PAGE_PATTERNS = [
  /第\s*\d+\s*页/,
  /\bpage[=/_-]?\d+\b/i,
  /\/forum\//i,
  /\/topic\//i,
  /\/post\//i,
  /\/question\//i
];
function cleanArticleTitle(title) {
  const decoded = decodeHtml(title).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
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
function isLowQualityResult(input) {
  return assessContentQuality(input).lowQuality;
}
function assessContentQuality(input) {
  const title = cleanArticleTitle(input.title);
  const haystack = `${input.title} ${input.url ?? ""} ${input.summary ?? ""}`;
  const signals = [];
  let score = 92;
  if (!title || title.length < 6) {
    signals.push("\u6807\u9898\u8FC7\u77ED\u6216\u7F3A\u5931");
    score -= 55;
  }
  if (GENERIC_TITLES.has(title.toLowerCase())) {
    signals.push("\u6CDB\u5316\u9875\u9762\u6807\u9898");
    score -= 60;
  }
  if (SPAM_PATTERNS.some((pattern) => pattern.test(haystack))) {
    signals.push("\u547D\u4E2D\u5783\u573E/\u535A\u5F69\u6A21\u5F0F");
    score -= 75;
  }
  const symbolCount = (title.match(/[{}【】[\]".|]/g) ?? []).length;
  if (symbolCount >= 5) {
    signals.push("\u6807\u9898\u7B26\u53F7\u5F02\u5E38");
    score -= 35;
  }
  const latinAndDigits = (title.match(/[A-Za-z0-9]/g) ?? []).length;
  if (latinAndDigits > 24 && /[{}]|\.com|\.tw|\.pw|\.ojd|\.cls/i.test(title)) {
    signals.push("\u7591\u4F3C\u641C\u7D22\u5783\u573E\u6807\u9898");
    score -= 45;
  }
  if (!input.summary?.trim()) {
    signals.push("\u6458\u8981\u7F3A\u5931");
    score -= 12;
  }
  const host = hostname(input.url ?? "");
  const communityHost = COMMUNITY_HOSTS.some((pattern) => pattern.test(host));
  if (communityHost) {
    signals.push("\u793E\u533A\u5E73\u53F0\u5355\u6761\u4FE1\u53F7");
    score -= 10;
  }
  if (input.sourceCommunity && input.sourceName) {
    const platform = identifyPlatform(input.sourceName, input.url || "");
    if (isReplyContent(title)) {
      signals.push("\u56DE\u590D/\u8BC4\u8BBA\u5185\u5BB9");
      score -= 60;
    }
    const counts = extractInteractionCounts(title);
    const hasInteraction = counts.likes > 0 || counts.reposts > 0 || counts.replies > 0 || counts.views > 0;
    if (hasInteraction) {
      const thresholdCheck = checkInteractionThresholds(platform, counts);
      if (!thresholdCheck.passed) {
        signals.push(thresholdCheck.reason);
        score -= 50;
      }
    }
  }
  if (FORUM_PAGE_PATTERNS.some((pattern) => pattern.test(haystack))) {
    signals.push("\u7591\u4F3C\u8BBA\u575B/\u5206\u9875\u5185\u5BB9");
    score -= 32;
  }
  if (/api\./i.test(host) || /\/api\//i.test(input.url ?? "")) {
    signals.push("API \u9875\u9762");
    score -= 45;
  }
  if (/(?:baidu|sogou)\.com\/(?:link|sf|bai|url)/i.test(input.url ?? "")) {
    signals.push("\u641C\u7D22\u5F15\u64CE\u4E2D\u8F6C/\u7D22\u5F15\u9875");
    score -= 45;
  }
  const commaSegments = title.split(/[,，、;；\s]+/).filter((s) => s.length > 1);
  const enSegments = title.match(/[a-zA-Z]{2,}/g) ?? [];
  if (commaSegments.length >= 10 || enSegments.length >= 5 && /[\u4e00-\u9fff]/.test(title)) {
    signals.push("\u7591\u4F3CSEO\u5806\u780C\u6807\u9898");
    score -= 40;
  }
  if (/目录|索引|标签|分类汇总|搜索结果|问答$|聚合|归档$/i.test(title)) {
    signals.push("\u76EE\u5F55/\u5BFC\u822A\u7C7B\u6807\u9898");
    score -= 35;
  }
  if (/^\d{4}[-/]\d{2}[-/]\d{2}/.test(title) || title.length < 12 && !input.summary?.trim()) {
    signals.push("\u7A7A\u6216\u7EAF\u65E5\u671F\u6807\u9898");
    score -= 50;
  }
  score = Math.max(0, Math.min(100, score));
  return {
    score,
    signals: signals.length ? signals : ["\u57FA\u7840\u8D28\u91CF\u901A\u8FC7"],
    lowQuality: score < 45
  };
}
function cleanSummary(value) {
  const cleaned = decodeHtml(value).replace(/<[^>]*>/g, " ").replace(/<[^>]*$/g, " ").replace(/https?:\/\/\S+/g, " ").replace(/\bnews\.google\.com\/rss\/articles\/\S+/gi, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  if (/^<a\s/i.test(value) || cleaned.length > 180) {
    return cleanArticleTitle(cleaned);
  }
  return cleaned;
}
function identifyPlatform(sourceName, sourceUrl) {
  const name = sourceName.toLowerCase();
  const url = sourceUrl.toLowerCase();
  if (name.includes("\u5FAE\u535A") || url.includes("weibo.com")) return "weibo";
  if (name.includes("b\u7AD9") || name.includes("bilibili") || url.includes("bilibili.com")) return "bilibili";
  if (name.includes("taptap") || url.includes("taptap.cn")) return "taptap";
  if (name.includes("\u77E5\u4E4E") || url.includes("zhihu.com")) return "zhihu";
  if (name.includes("\u8D34\u5427") || url.includes("tieba.baidu.com")) return "tieba";
  return "other";
}
function isReplyContent(title) {
  const replyPatterns = [
    /^回复[:：]/,
    /^Re[:：]/i,
    /^回复@/,
    /的回复$/,
    /的评论$/,
    /^评论[:：]/,
    /^@[\w]+[\s：:]/,
    /^回复\s/
  ];
  return replyPatterns.some((pattern) => pattern.test(title.trim()));
}
function extractInteractionCounts(title) {
  const patterns = {
    likes: /(\d+(?:\.\d+)?[kK万]?)\s*(?:赞|点赞|like|upvote|赞同)/i,
    reposts: /(\d+(?:\.\d+)?[kK万]?)\s*(?:转发|repost|share)/i,
    replies: /(\d+(?:\.\d+)?[kK万]?)\s*(?:回复|评论|comment|reply|回答|条评价|个回答)/i,
    views: /(\d+(?:\.\d+)?[kK万]?)\s*(?:播放|浏览|view|阅读)/i
  };
  const result = { likes: 0, reposts: 0, replies: 0, views: 0 };
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = title.match(pattern);
    if (match) {
      result[key] = parseNumber(match[1]);
    }
  }
  return result;
}
function parseNumber(str) {
  const num = parseFloat(str);
  if (str.toLowerCase().includes("k")) return num * 1e3;
  if (str.includes("\u4E07")) return num * 1e4;
  return num;
}
function checkInteractionThresholds(platform, counts) {
  switch (platform) {
    case "weibo":
      if (counts.likes > 0 && counts.likes < 10) return { passed: false, reason: "\u70B9\u8D5E\u6570" + counts.likes + "\u4F4E\u4E8E\u9608\u503C10" };
      if (counts.reposts > 0 && counts.reposts < 5) return { passed: false, reason: "\u8F6C\u53D1\u6570" + counts.reposts + "\u4F4E\u4E8E\u9608\u503C5" };
      break;
    case "bilibili":
      if (counts.views > 0 && counts.views < 500) return { passed: false, reason: "\u64AD\u653E\u91CF" + counts.views + "\u4F4E\u4E8E\u9608\u503C500" };
      if (counts.likes > 0 && counts.likes < 10) return { passed: false, reason: "\u70B9\u8D5E\u6570" + counts.likes + "\u4F4E\u4E8E\u9608\u503C10" };
      break;
    case "taptap":
      if (counts.replies > 0 && counts.replies < 5) return { passed: false, reason: "\u8BC4\u4EF7\u6570" + counts.replies + "\u4F4E\u4E8E\u9608\u503C5" };
      break;
    case "zhihu":
      if (counts.replies > 0 && counts.replies < 5) return { passed: false, reason: "\u56DE\u7B54\u6570" + counts.replies + "\u4F4E\u4E8E\u9608\u503C5" };
      if (counts.likes > 0 && counts.likes < 10) return { passed: false, reason: "\u8D5E\u540C\u6570" + counts.likes + "\u4F4E\u4E8E\u9608\u503C10" };
      break;
    case "tieba":
      if (counts.replies > 0 && counts.replies < 10) return { passed: false, reason: "\u56DE\u590D\u6570" + counts.replies + "\u4F4E\u4E8E\u9608\u503C10" };
      break;
  }
  return { passed: true, reason: "" };
}
function hostname(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}
function decodeHtml(value) {
  return value.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// server/services/dedupe.ts
var TRACKING_PARAMS = /* @__PURE__ */ new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid"
]);
function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    for (const key of Array.from(parsed.searchParams.keys())) {
      if (TRACKING_PARAMS.has(key.toLowerCase())) parsed.searchParams.delete(key);
    }
    parsed.hostname = parsed.hostname.toLowerCase();
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.trim();
  }
}
function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}
function titleSimilarity(left, right) {
  const a = new Set(titleTokens(left));
  const b = new Set(titleTokens(right));
  if (a.size === 0 || b.size === 0) return 0;
  const intersection = Array.from(a).filter((token) => b.has(token)).length;
  const union = (/* @__PURE__ */ new Set([...a, ...b])).size;
  return intersection / union;
}
function titleTokens(title) {
  const normalized = normalizeTitle(title);
  const wordTokens = normalized.split(" ").filter((token) => token.length > 1);
  const cjkChars = Array.from(normalized.replace(/\s+/g, "")).filter((char) => /\p{Script=Han}/u.test(char));
  const cjkBigrams = [];
  for (let index = 0; index < cjkChars.length - 1; index += 1) {
    cjkBigrams.push(`${cjkChars[index]}${cjkChars[index + 1]}`);
  }
  return [...wordTokens, ...cjkBigrams];
}

// server/db/turso.ts
var client = null;
var initialized = false;
function getTursoClient(overrides) {
  if (client) return client;
  const url = overrides?.TURSO_URL ?? process.env.TURSO_URL;
  const token = overrides?.TURSO_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) throw new Error("TURSO_URL and TURSO_AUTH_TOKEN required for Turso");
  client = createClient({ url, authToken: token });
  return client;
}
async function exec(stmts) {
  const c = getTursoClient();
  for (const s of stmts) {
    await c.execute(s);
  }
}
async function run(sql, args) {
  const c = getTursoClient();
  return c.execute({ sql, args });
}
async function all(sql, args) {
  const result = await run(sql, args);
  return result.rows;
}
async function get(sql, args) {
  const result = await run(sql, args);
  return result.rows[0] ?? null;
}
async function lastInsertRowid() {
  const result = await get("SELECT last_insert_rowid() AS id");
  return Number(result.id);
}
async function initSchema() {
  await exec([
    `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS keywords (id INTEGER PRIMARY KEY AUTOINCREMENT, term TEXT NOT NULL, scope TEXT NOT NULL DEFAULT '', enabled INTEGER NOT NULL DEFAULT 1, account_mode INTEGER NOT NULL DEFAULT 0, account_platform TEXT NOT NULL DEFAULT '', account_uid TEXT NOT NULL DEFAULT '', account_url TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS sources (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, url TEXT NOT NULL, category TEXT NOT NULL, provider_type TEXT NOT NULL DEFAULT 'rss', reliability_tier TEXT NOT NULL DEFAULT 'trusted', community_source INTEGER NOT NULL DEFAULT 0, min_quality_score INTEGER NOT NULL DEFAULT 60, enabled INTEGER NOT NULL DEFAULT 1, builtin INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL, keyword_id INTEGER REFERENCES keywords(id) ON DELETE SET NULL, title TEXT NOT NULL, url TEXT NOT NULL, normalized_url TEXT NOT NULL UNIQUE, summary TEXT NOT NULL DEFAULT '', published_at TEXT NOT NULL, fetched_at TEXT NOT NULL, matched_keyword TEXT NOT NULL, read_at TEXT, status TEXT NOT NULL DEFAULT 'watch', quality_score INTEGER NOT NULL DEFAULT 70, quality_signals TEXT NOT NULL DEFAULT '[]', evidence_count INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, archived_at TEXT, interaction_likes INTEGER NOT NULL DEFAULT 0, interaction_reposts INTEGER NOT NULL DEFAULT 0, interaction_replies INTEGER NOT NULL DEFAULT 0, interaction_views INTEGER NOT NULL DEFAULT 0, summary_source TEXT NOT NULL DEFAULT 'rss', interaction_source TEXT NOT NULL DEFAULT 'none', priority_score INTEGER NOT NULL DEFAULT 0, freshness_score INTEGER NOT NULL DEFAULT 0, author_name TEXT, author_followers INTEGER NOT NULL DEFAULT 0, author_verified INTEGER NOT NULL DEFAULT 0, interaction_danmaku INTEGER NOT NULL DEFAULT 0, interaction_quotes INTEGER NOT NULL DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS ai_evaluations (id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER NOT NULL UNIQUE REFERENCES items(id) ON DELETE CASCADE, relevance_score REAL NOT NULL, credibility_score REAL NOT NULL, novelty_score REAL NOT NULL, hotness_score REAL NOT NULL, is_impersonation_likely INTEGER NOT NULL, summary TEXT NOT NULL, reason TEXT NOT NULL, recommended_action TEXT NOT NULL, raw_json TEXT NOT NULL, keyword_mentioned INTEGER NOT NULL DEFAULT 0, relevance_summary TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS scan_runs (id INTEGER PRIMARY KEY AUTOINCREMENT, started_at TEXT NOT NULL, finished_at TEXT, status TEXT NOT NULL, total_fetched INTEGER NOT NULL DEFAULT 0, total_inserted INTEGER NOT NULL DEFAULT 0, total_evaluated INTEGER NOT NULL DEFAULT 0, error TEXT)`,
    `CREATE TABLE IF NOT EXISTS item_evidence (id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE, provider_type TEXT NOT NULL, source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL, source_name TEXT NOT NULL, query TEXT NOT NULL, rank INTEGER NOT NULL DEFAULT 0, original_url TEXT NOT NULL, normalized_url TEXT NOT NULL, domain TEXT NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '', published_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(item_id, provider_type, source_id, normalized_url))`
  ]);
}
async function seedData() {
  const env = getEnv();
  const count = await get("SELECT COUNT(*) AS count FROM settings");
  if (Number(count.count) === 0) {
    await run("INSERT INTO settings (key, value) VALUES ('aiMode', ?)", [env.aiMode]);
    await run("INSERT INTO settings (key, value) VALUES ('scanIntervalMinutes', ?)", [String(env.scanIntervalMinutes)]);
  }
  const kCount = await get("SELECT COUNT(*) AS count FROM keywords");
  if (Number(kCount.count) === 0) {
    await run("INSERT INTO keywords (term, scope) VALUES ('AI \u7F16\u7A0B', '\u6E38\u620F\u5F00\u53D1\u3001\u751F\u4EA7\u529B\u5DE5\u5177\u3001Agent \u5DE5\u4F5C\u6D41')");
    await run("INSERT INTO keywords (term, scope) VALUES ('Unity', '\u6E38\u620F\u5F15\u64CE\u3001\u6280\u672F\u66F4\u65B0\u3001\u5546\u4E1A\u653F\u7B56')");
    await run("INSERT INTO keywords (term, scope) VALUES ('\u6E38\u620F\u51FA\u6D77', '\u53D1\u884C\u3001\u4E70\u91CF\u3001\u5E02\u573A\u3001\u5E73\u53F0\u653F\u7B56')");
  }
  await ensureDefaultSources();
}
async function ensureDefaultSources() {
  const count = await get("SELECT COUNT(*) AS count FROM sources");
  if (Number(count.count) > 0) return;
  const sources = getDefaultSources();
  for (const s of sources) {
    await run(
      `INSERT INTO sources (name, url, category, provider_type, reliability_tier, community_source, min_quality_score, enabled, builtin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.name, s.url, s.category, s.providerType, s.reliabilityTier, Number(s.communitySource), s.minQualityScore, Number(s.enabled), Number(s.builtin)]
    );
  }
}
function getDefaultSources() {
  return [
    { name: "RSSHub \u767E\u5EA6\u641C\u7D22", url: "https://rsshub.rssforever.com/baidu/search/{query}", category: "\u56FD\u5185\u7EFC\u5408", providerType: "rss", reliabilityTier: "search", communitySource: false, minQualityScore: 70, enabled: true, builtin: true },
    { name: "\u5FAE\u535A\u70ED\u641C", url: "https://weibo.com/ajax/side/hotSearch", category: "\u641C\u7D22\u589E\u5F3A", providerType: "weibo_hot", reliabilityTier: "search", communitySource: false, minQualityScore: 50, enabled: true, builtin: true },
    { name: "\u673A\u6838\u7F51", url: "https://www.gcores.com/rss", category: "\u56FD\u5185\u5A92\u4F53", providerType: "rss", reliabilityTier: "trusted", communitySource: false, minQualityScore: 62, enabled: true, builtin: true },
    { name: "\u6E38\u7814\u793E", url: "https://www.yystv.cn/rss/feed", category: "\u56FD\u5185\u5A92\u4F53", providerType: "rss", reliabilityTier: "trusted", communitySource: false, minQualityScore: 62, enabled: true, builtin: true },
    { name: "\u89E6\u4E50", url: "https://www.chuapp.com/feed", category: "\u56FD\u5185\u5A92\u4F53", providerType: "rss", reliabilityTier: "trusted", communitySource: false, minQualityScore: 62, enabled: true, builtin: true },
    { name: "B\u7AD9\u89C6\u9891\u641C\u7D22", url: "https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword={query}", category: "\u56FD\u5185\u5E73\u53F0", providerType: "bilibili_search", reliabilityTier: "community", communitySource: true, minQualityScore: 70, enabled: false, builtin: true },
    { name: "Brave Search \u589E\u5F3A", url: "{query}", category: "\u641C\u7D22\u589E\u5F3A", providerType: "brave_search", reliabilityTier: "search", communitySource: false, minQualityScore: 70, enabled: false, builtin: true }
  ];
}
async function initTursoDb() {
  if (initialized) return;
  await initSchema();
  await seedData();
  initialized = true;
}
function mapKeyword(row) {
  return { id: row.id, term: row.term, scope: row.scope, enabled: Boolean(row.enabled), accountMode: Boolean(row.account_mode), accountPlatform: row.account_platform ?? "", accountUid: row.account_uid ?? "", accountUrl: row.account_url ?? "", createdAt: row.created_at };
}
function mapSource(row) {
  return { id: row.id, name: row.name, url: row.url, category: row.category, providerType: parseProviderType(row.provider_type), reliabilityTier: parseReliabilityTier(row.reliability_tier), communitySource: Boolean(row.community_source), minQualityScore: row.min_quality_score, enabled: Boolean(row.enabled), builtin: Boolean(row.builtin), createdAt: row.created_at };
}
function mapScanRun(row) {
  return { id: row.id, startedAt: row.started_at, finishedAt: row.finished_at, status: row.status, totalFetched: row.total_fetched, totalInserted: row.total_inserted, totalEvaluated: row.total_evaluated, error: row.error };
}
function mapItem(row) {
  return {
    id: row.id,
    sourceId: row.source_id,
    keywordId: row.keyword_id,
    title: cleanArticleTitle(row.title),
    url: row.url,
    normalizedUrl: row.normalized_url,
    summary: cleanSummary(row.summary),
    publishedAt: row.published_at,
    fetchedAt: row.fetched_at,
    matchedKeyword: row.matched_keyword,
    readAt: row.read_at,
    status: row.status,
    qualityScore: row.quality_score,
    qualitySignals: parseJsonArray(row.quality_signals),
    evidenceCount: row.evidence_count,
    evidenceProviders: parseJsonArray(row.evidence_providers).map(parseProviderType),
    evidenceSourceNames: parseJsonArray(row.evidence_source_names),
    sourceReliability: row.source_reliability ? parseReliabilityTier(row.source_reliability) : null,
    communitySource: Boolean(row.source_community),
    interactionLikes: row.interaction_likes ?? 0,
    interactionReposts: row.interaction_reposts ?? 0,
    interactionReplies: row.interaction_replies ?? 0,
    interactionViews: row.interaction_views ?? 0,
    interactionDanmaku: row.interaction_danmaku ?? 0,
    interactionQuotes: row.interaction_quotes ?? 0,
    summarySource: parseSummarySource(row.summary_source),
    interactionSource: parseInteractionSource(row.interaction_source),
    priorityScore: row.priority_score ?? 0,
    freshnessScore: row.freshness_score ?? 0,
    authorName: row.author_name ?? null,
    authorFollowers: row.author_followers ?? 0,
    authorVerified: Boolean(row.author_verified),
    evaluation: row.relevance_score === null ? null : {
      relevanceScore: row.relevance_score,
      credibilityScore: row.credibility_score ?? 0,
      noveltyScore: row.novelty_score ?? 0,
      hotnessScore: row.hotness_score ?? 0,
      isImpersonationLikely: Boolean(row.is_impersonation_likely),
      summary: cleanSummary(row.ai_summary ?? ""),
      reason: cleanSummary(row.reason ?? ""),
      recommendedAction: row.recommended_action ?? "watch",
      keywordMentioned: Boolean(row.keyword_mentioned),
      relevanceSummary: row.relevance_summary ?? ""
    }
  };
}
function parseProviderType(v) {
  return ["google_news", "brave_search", "bilibili_search", "weibo_hot"].includes(v) ? v : "rss";
}
function parseReliabilityTier(v) {
  return ["official", "community", "search"].includes(v) ? v : "trusted";
}
function parseSummarySource(v) {
  return ["ai", "metadata", "title"].includes(v) ? v : "rss";
}
function parseInteractionSource(v) {
  return ["bilibili", "zhihu", "wechat", "weibo", "html", "rss"].includes(v) ? v : "none";
}
function parseJsonArray(v) {
  if (!v) return [];
  try {
    const p = JSON.parse(v);
    return Array.isArray(p) ? p.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}
function detectAccountInfo(term) {
  const url = term.match(/https?:\/\/\S+/i)?.[0] ?? "";
  const bilibiliUid = term.match(/space\.bilibili\.com\/(\d+)/i)?.[1] ?? term.match(/\buid[:：\s]*(\d{3,})\b/i)?.[1] ?? "";
  if (bilibiliUid) return { accountMode: true, accountPlatform: "bilibili", accountUid: bilibiliUid, accountUrl: url };
  const patterns = [/公司$/, /团队$/, /工作室$/, /官方$/, /游戏$/, /科技$/, /平台$/, /引擎$/];
  if (patterns.some((p) => p.test(term))) return { accountMode: true, accountPlatform: "", accountUid: "", accountUrl: url };
  const chineseOnly = term.replace(/[^\u4e00-\u9fff]/g, "");
  if (chineseOnly.length >= 2 && chineseOnly.length <= 3 && !term.includes(" ")) return { accountMode: true, accountPlatform: "", accountUid: "", accountUrl: url };
  return { accountMode: false, accountPlatform: "", accountUid: "", accountUrl: url };
}
var tursoRepos = {
  settings: {
    async all() {
      const rows = await all("SELECT key, value FROM settings");
      const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
      const env = getEnv();
      return { aiMode: map.aiMode === "mock" ? "mock" : "openrouter", scanIntervalMinutes: Number(map.scanIntervalMinutes ?? env.scanIntervalMinutes), openRouterConfigured: Boolean(env.openRouterApiKey), openRouterModel: env.openRouterModel };
    },
    async set(key, value) {
      await run("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [key, value]);
    }
  },
  keywords: {
    async all() {
      const rows = await all("SELECT * FROM keywords ORDER BY enabled DESC, id DESC");
      return rows.map(mapKeyword);
    },
    async active() {
      const rows = await all("SELECT * FROM keywords WHERE enabled = 1 ORDER BY id DESC");
      return rows.map(mapKeyword);
    },
    async create(term, scope) {
      const acc = detectAccountInfo(term.trim());
      await run("INSERT INTO keywords (term, scope, account_mode, account_platform, account_uid, account_url) VALUES (?, ?, ?, ?, ?, ?)", [term.trim(), scope.trim(), Number(acc.accountMode), acc.accountPlatform, acc.accountUid, acc.accountUrl]);
      return await this.byId(Number(await lastInsertRowid()));
    },
    async update(id, input) {
      const cur = await this.byId(id);
      if (!cur) return null;
      const nt = input.term?.trim() ?? cur.term;
      const det = input.term ? detectAccountInfo(nt) : null;
      await run("UPDATE keywords SET term=?, scope=?, enabled=?, account_mode=?, account_platform=?, account_uid=?, account_url=? WHERE id=?", [nt, input.scope?.trim() ?? cur.scope, typeof input.enabled === "boolean" ? Number(input.enabled) : Number(cur.enabled), typeof input.accountMode === "boolean" ? Number(input.accountMode) : Number(det?.accountMode ?? cur.accountMode), input.accountPlatform ?? det?.accountPlatform ?? cur.accountPlatform, input.accountUid ?? det?.accountUid ?? cur.accountUid, input.accountUrl ?? det?.accountUrl ?? cur.accountUrl, id]);
      return this.byId(id);
    },
    async delete(id) {
      await run("DELETE FROM keywords WHERE id = ?", [id]);
      return true;
    },
    async byId(id) {
      const r = await get("SELECT * FROM keywords WHERE id = ?", [id]);
      return r ? mapKeyword(r) : null;
    }
  },
  sources: {
    async all() {
      const r = await all("SELECT * FROM sources ORDER BY enabled DESC, builtin DESC, id DESC");
      return r.map(mapSource);
    },
    async active() {
      const r = await all("SELECT * FROM sources WHERE enabled = 1 ORDER BY id");
      return r.map(mapSource);
    },
    async create(input) {
      await run("INSERT INTO sources (name,url,category,provider_type,reliability_tier,community_source,min_quality_score,enabled,builtin) VALUES (?,?,?,?,?,?,?,?,?)", [input.name.trim(), input.url.trim(), input.category.trim() || "\u81EA\u5B9A\u4E49", input.providerType ?? "rss", input.reliabilityTier ?? "trusted", Number(input.communitySource ?? false), input.minQualityScore ?? 65, Number(input.enabled ?? true), Number(input.builtin ?? false)]);
      return await this.byId(Number(await lastInsertRowid()));
    },
    async update(id, input) {
      const cur = await this.byId(id);
      if (!cur) return null;
      await run("UPDATE sources SET name=?,url=?,category=?,provider_type=?,reliability_tier=?,community_source=?,min_quality_score=?,enabled=? WHERE id=?", [input.name?.trim() ?? cur.name, input.url?.trim() ?? cur.url, input.category?.trim() ?? cur.category, input.providerType ?? cur.providerType, input.reliabilityTier ?? cur.reliabilityTier, typeof input.communitySource === "boolean" ? Number(input.communitySource) : Number(cur.communitySource), input.minQualityScore ?? cur.minQualityScore, typeof input.enabled === "boolean" ? Number(input.enabled) : Number(cur.enabled), id]);
      return this.byId(id);
    },
    async delete(id) {
      const s = await this.byId(id);
      if (!s) return false;
      if (s.builtin) {
        return await this.update(id, { enabled: false }) !== null;
      }
      await run("DELETE FROM sources WHERE id=?", [id]);
      return true;
    },
    async byId(id) {
      const r = await get("SELECT * FROM sources WHERE id=?", [id]);
      return r ? mapSource(r) : null;
    }
  },
  items: {
    async list(limit = 80) {
      const rows = await all(
        `SELECT i.*, s.reliability_tier AS source_reliability, s.community_source AS source_community, e.relevance_score, e.credibility_score, e.novelty_score, e.hotness_score, e.is_impersonation_likely, e.summary AS ai_summary, e.reason, e.recommended_action, e.keyword_mentioned, e.relevance_summary, (SELECT json_group_array(DISTINCT provider_type) FROM item_evidence WHERE item_id=i.id) AS evidence_providers, (SELECT json_group_array(DISTINCT source_name) FROM item_evidence WHERE item_id=i.id) AS evidence_source_names FROM items i LEFT JOIN sources s ON s.id=i.source_id LEFT JOIN ai_evaluations e ON e.item_id=i.id WHERE i.archived_at IS NULL AND datetime(i.published_at) >= datetime('now','-24 hours') ORDER BY i.priority_score DESC, i.published_at DESC, i.id DESC LIMIT ?`,
        [limit]
      );
      return rows.map(mapItem).filter((item) => !isLowQualityResult({ title: item.title, url: item.url, summary: item.summary }));
    },
    async archived(limit = 100) {
      const rows = await all(`SELECT i.*, s.reliability_tier AS source_reliability, s.community_source AS source_community, e.relevance_score,e.credibility_score,e.novelty_score,e.hotness_score,e.is_impersonation_likely,e.summary AS ai_summary,e.reason,e.recommended_action, (SELECT json_group_array(DISTINCT provider_type) FROM item_evidence WHERE item_id=i.id) AS evidence_providers, (SELECT json_group_array(DISTINCT source_name) FROM item_evidence WHERE item_id=i.id) AS evidence_source_names FROM items i LEFT JOIN sources s ON s.id=i.source_id LEFT JOIN ai_evaluations e ON e.item_id=i.id WHERE i.archived_at IS NOT NULL ORDER BY i.archived_at DESC, i.id DESC LIMIT ?`, [limit]);
      return rows.map(mapItem);
    },
    async restore(id) {
      await run("UPDATE items SET archived_at=NULL WHERE id=?", [id]);
      return true;
    },
    async batchRestore(ids) {
      if (!ids.length) return 0;
      const ph = ids.map(() => "?").join(",");
      const r = await run("UPDATE items SET archived_at=NULL WHERE id IN (" + ph + ")", ids);
      return Number(r.rowsAffected);
    },
    async batchDelete(ids) {
      if (!ids.length) return 0;
      const ph = ids.map(() => "?").join(",");
      const r = await run("DELETE FROM items WHERE id IN (" + ph + ")", ids);
      return Number(r.rowsAffected);
    },
    async archiveStaleItems() {
      const d1 = await run("UPDATE items SET status='watch' WHERE status='new' AND archived_at IS NULL AND datetime(published_at) < datetime('now','-24 hours')");
      const d2 = await run("UPDATE items SET archived_at=CURRENT_TIMESTAMP WHERE archived_at IS NULL AND datetime(published_at) < datetime('now','-24 hours') AND (read_at IS NOT NULL OR status IN ('watch','ignored'))");
      return Number(d1.rowsAffected) + Number(d2.rowsAffected);
    },
    async byId(id) {
      const row = await get(`SELECT i.*, s.reliability_tier AS source_reliability, s.community_source AS source_community, e.relevance_score,e.credibility_score,e.novelty_score,e.hotness_score,e.is_impersonation_likely,e.summary AS ai_summary,e.reason,e.recommended_action,e.keyword_mentioned,e.relevance_summary, (SELECT json_group_array(DISTINCT provider_type) FROM item_evidence WHERE item_id=i.id) AS evidence_providers, (SELECT json_group_array(DISTINCT source_name) FROM item_evidence WHERE item_id=i.id) AS evidence_source_names FROM items i LEFT JOIN sources s ON s.id=i.source_id LEFT JOIN ai_evaluations e ON e.item_id=i.id WHERE i.id=?`, [id]);
      return row ? mapItem(row) : null;
    },
    async insert(input) {
      const rows = await all("SELECT id,title,published_at FROM items WHERE keyword_id=? ORDER BY id DESC LIMIT 120", [input.keywordId]);
      const inputTime = new Date(input.publishedAt).getTime();
      for (const row of rows) {
        const rt = new Date(row.published_at).getTime();
        if ((isNaN(inputTime) || isNaN(rt) || Math.abs(inputTime - rt) <= 36 * 60 * 60 * 1e3) && titleSimilarity(row.title, input.title) >= 0.62) {
          await mergeEvidence(row.id, input);
          return { id: row.id, inserted: false };
        }
      }
      try {
        await run(
          `INSERT INTO items (source_id,keyword_id,title,url,normalized_url,summary,published_at,fetched_at,matched_keyword,status,quality_score,quality_signals,evidence_count,interaction_likes,interaction_reposts,interaction_replies,interaction_views,interaction_danmaku,interaction_quotes,summary_source,interaction_source,author_name,author_followers,author_verified) VALUES (?,?,?,?,?,?,?,?,?,'watch',?,?,1,?,?,?,?,?,?,?,?,?,?,?)`,
          [input.sourceId, input.keywordId, input.title, input.url, input.normalizedUrl, input.summary, input.publishedAt, input.fetchedAt, input.matchedKeyword, input.qualityScore, JSON.stringify(input.qualitySignals), input.interactionLikes, input.interactionReposts, input.interactionReplies, input.interactionViews, input.interactionDanmaku ?? 0, input.interactionQuotes ?? 0, input.summarySource ?? "rss", input.interactionSource ?? "none", input.authorName ?? null, input.authorFollowers ?? 0, input.authorVerified ? 1 : 0]
        );
        const id = Number(await lastInsertRowid());
        await mergeEvidence(id, input);
        return { id, inserted: true };
      } catch (e) {
        if (e instanceof Error && e.message.includes("UNIQUE")) {
          const r = await get("SELECT id FROM items WHERE normalized_url=?", [input.normalizedUrl]);
          if (!r) return null;
          await mergeEvidence(r.id, input);
          return { id: r.id, inserted: false };
        }
        throw e;
      }
    },
    async markRead(id) {
      await run("UPDATE items SET read_at=CURRENT_TIMESTAMP WHERE id=?", [id]);
      return true;
    },
    async updateStatus(id, status) {
      await run("UPDATE items SET status=? WHERE id=?", [status, id]);
    },
    async updatePriority(id, priorityScore, freshnessScore, status) {
      await run("UPDATE items SET priority_score=?,freshness_score=?,status=? WHERE id=?", [priorityScore, freshnessScore, status, id]);
    },
    async addEvaluation(itemId, evaluation) {
      await run(
        `INSERT INTO ai_evaluations (item_id,relevance_score,credibility_score,novelty_score,hotness_score,is_impersonation_likely,summary,reason,recommended_action,keyword_mentioned,relevance_summary,raw_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(item_id) DO UPDATE SET relevance_score=excluded.relevance_score,credibility_score=excluded.credibility_score,novelty_score=excluded.novelty_score,hotness_score=excluded.hotness_score,is_impersonation_likely=excluded.is_impersonation_likely,summary=excluded.summary,reason=excluded.reason,recommended_action=excluded.recommended_action,keyword_mentioned=excluded.keyword_mentioned,relevance_summary=excluded.relevance_summary,raw_json=excluded.raw_json`,
        [itemId, evaluation.relevanceScore, evaluation.credibilityScore, evaluation.noveltyScore, evaluation.hotnessScore, Number(evaluation.isImpersonationLikely), evaluation.summary, evaluation.reason, evaluation.recommendedAction, evaluation.keywordMentioned ? 1 : 0, evaluation.relevanceSummary ?? "", JSON.stringify(evaluation)]
      );
    }
  },
  scanRuns: {
    async start() {
      await run("INSERT INTO scan_runs (started_at,status) VALUES (?,?)", [(/* @__PURE__ */ new Date()).toISOString(), "running"]);
      return Number(await lastInsertRowid());
    },
    async finish(id, status, totals) {
      await run("UPDATE scan_runs SET finished_at=?,status=?,total_fetched=?,total_inserted=?,total_evaluated=?,error=? WHERE id=?", [(/* @__PURE__ */ new Date()).toISOString(), status, totals.fetched, totals.inserted, totals.evaluated, totals.error ?? null, id]);
    },
    async last() {
      const r = await get("SELECT * FROM scan_runs ORDER BY id DESC LIMIT 1");
      return r ? mapScanRun(r) : null;
    }
  }
};
async function mergeEvidence(itemId, input) {
  const src = await tursoRepos.sources.byId(input.sourceId);
  await run(
    "INSERT INTO item_evidence (item_id,provider_type,source_id,source_name,query,rank,original_url,normalized_url,domain,title,summary,published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(item_id,provider_type,source_id,normalized_url) DO UPDATE SET rank=MIN(rank,excluded.rank), summary=CASE WHEN length(excluded.summary)>length(summary) THEN excluded.summary ELSE summary END",
    [itemId, input.providerType, input.sourceId, src?.name ?? "\u672A\u77E5\u6765\u6E90", input.query, input.rank, input.url, input.normalizedUrl, hostname2(input.normalizedUrl), input.title, input.summary, input.publishedAt]
  );
  const row = await get("SELECT COUNT(*) AS count FROM item_evidence WHERE item_id=?", [itemId]);
  await run("UPDATE items SET evidence_count=?, quality_score=MAX(quality_score,?) WHERE id=?", [row.count, input.qualityScore, itemId]);
}
function hostname2(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

// server/db/cf-index.ts
var initialized2 = false;
async function initDb() {
  if (initialized2) return;
  await initTursoDb();
  initialized2 = true;
}
var repos = tursoRepos;

// server/services/collector.ts
import { XMLParser, XMLValidator } from "fast-xml-parser";

// server/services/enrichment.ts
var GAME_SITE_HOSTS = [
  "17173.com",
  "gcores.com",
  "gamersky.com",
  "3dmgame.com",
  "sohu.com",
  "163.com"
];
var REDIRECT_PARAM_KEYS = ["url", "u", "target", "dest", "destination", "redirect", "redir", "jump"];
async function enrichCollectedItem(item) {
  try {
    const resolved = await withTimeout(resolveCanonicalUrl(item.url), 5e3);
    const resolvedUrl = resolved?.url ?? item.url;
    const normalizedUrl = resolvedUrl === item.url ? item.normalizedUrl : normalizeUrl(resolvedUrl);
    const result = await withTimeout(enrichUrl(resolvedUrl, resolved?.html), 5e3);
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
      interactionSource: result?.interactionSource ?? item.interactionSource,
      authorName: result?.authorName ?? item.authorName,
      authorFollowers: result?.authorFollowers ?? item.authorFollowers,
      authorVerified: result?.authorVerified ?? item.authorVerified,
      interactionDanmaku: result?.interactionDanmaku ?? item.interactionDanmaku,
      interactionQuotes: result?.interactionQuotes ?? item.interactionQuotes
    };
  } catch {
    return item;
  }
}
async function enrichUrl(url, html = "") {
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
async function resolveCanonicalUrl(url, depth = 0) {
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
async function enrichBilibiliVideo(input) {
  const url = new URL("https://api.bilibili.com/x/web-interface/view");
  if (input.bvid) url.searchParams.set("bvid", input.bvid);
  if (input.aid) url.searchParams.set("aid", input.aid);
  const response = await fetchText(url.toString());
  const payload = JSON.parse(response);
  const data = payload.data;
  if (!data) return null;
  return {
    summary: cleanSummary(data.desc || data.title || ""),
    summarySource: data.desc ? "metadata" : "title",
    interactionLikes: data.stat?.like ?? 0,
    interactionReposts: data.stat?.share ?? 0,
    interactionReplies: data.stat?.reply ?? 0,
    interactionViews: data.stat?.view ?? 0,
    interactionDanmaku: data.stat?.danmaku ?? 0,
    interactionSource: "bilibili",
    authorName: data.owner?.name ?? null,
    authorFollowers: data.owner?.follower ?? 0,
    authorVerified: data.owner?.official_verify?.type === 0
  };
}
async function enrichZhihu(url) {
  const html = await fetchText(url);
  const likesMatch = html.match(/class="[^"]*Button.*?VoteButton.*?"[^>]*>[\s\S]*?(\d[\d,]*(?:,\d{3})*(?:\.\d+)?[kKwW万万]?)[\s\S]*?<\/button>/i) ?? html.match(/"voteupCount"\s*:\s*(\d+)/i) ?? html.match(/赞同[：:\s]*(\d[\d,]*(?:[kKwW万万])?)/i);
  const repliesMatch = html.match(/"commentCount"\s*:\s*(\d+)/i) ?? html.match(/评论[：:\s]*(\d[\d,]*(?:[kKwW万万])?)/i);
  const viewsMatch = html.match(/"visitCount"\s*:\s*(\d+)/i) ?? html.match(/浏览[：:\s]*(\d[\d,]*(?:[kKwW万万])?)/i);
  if (!likesMatch && !repliesMatch && !viewsMatch) return null;
  return {
    summary: metaContent(html, "description") || metaContent(html, "og:description"),
    summarySource: "metadata",
    interactionLikes: likesMatch ? parseInt(likesMatch[1].replace(/[,，]/g, ""), 10) : 0,
    interactionReplies: repliesMatch ? parseInt(repliesMatch[1].replace(/[,，]/g, ""), 10) : 0,
    interactionViews: viewsMatch ? parseInt(viewsMatch[1].replace(/[,，]/g, ""), 10) : 0,
    interactionSource: "zhihu",
    authorName: extractZhihuAuthor(html)
  };
}
function extractZhihuAuthor(html) {
  const m = html.match(/class="[^"]*AuthorInfo[^"]*"[^>]*>[\s\S]*?class="[^"]*UserLink[^"]*"[^>]*>([^<]+)</i) ?? html.match(/"author"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"/i) ?? html.match(/<meta[^>]+itemprop="name"[^>]+content="([^"]+)"/i);
  return m?.[1]?.trim() ?? null;
}
async function enrichWechatMp(url, existingHtml = "") {
  const html = existingHtml || await fetchText(url);
  const viewsMatch = html.match(/var\s+read_num\s*=\s*(\d+)/i) ?? html.match(/"read_num"\s*:\s*(\d+)/i) ?? html.match(/var\s+readNum\s*=\s*(\d+)/i) ?? html.match(/阅读[：:\s]*(\d[\d,]*(?:[kKwW万万])?)/i);
  const likesMatch = html.match(/var\s+like_num\s*=\s*(\d+)/i) ?? html.match(/"like_num"\s*:\s*(\d+)/i) ?? html.match(/var\s+likeNum\s*=\s*(\d+)/i) ?? html.match(/点赞[：:\s]*(\d[\d,]*(?:[kKwW万万])?)/i);
  if (!viewsMatch && !likesMatch) return null;
  return {
    summary: metaContent(html, "description") || metaContent(html, "og:description"),
    summarySource: "metadata",
    interactionLikes: likesMatch ? parseInt(likesMatch[1].replace(/[,，]/g, ""), 10) : 0,
    interactionViews: viewsMatch ? parseInt(viewsMatch[1].replace(/[,，]/g, ""), 10) : 0,
    interactionSource: "wechat",
    authorName: extractWechatAuthor(html)
  };
}
function extractWechatAuthor(html) {
  const m = html.match(/class="[^"]*rich_media_meta_text[^"]*"[^>]*>([^<]+)</i) ?? html.match(/var\s+nickname\s*=\s*"([^"]+)"/i) ?? html.match(/"nickname"\s*:\s*"([^"]+)"/i);
  return m?.[1]?.trim() ?? null;
}
async function enrichHtmlMetadata(url, existingHtml = "") {
  const html = existingHtml || await fetchText(url);
  const summary = metaContent(html, "description") || metaContent(html, "og:description") || jsonLdDescription(html);
  if (!summary) return null;
  const counts = extractInteractionCounts2(html);
  return {
    summary: cleanSummary(summary).slice(0, 240),
    summarySource: "metadata",
    interactionLikes: counts.likes,
    interactionReposts: counts.reposts,
    interactionReplies: counts.replies,
    interactionViews: counts.views,
    interactionSource: hasAnyCount(counts) ? "html" : "none",
    authorName: metaContent(html, "author") || null
  };
}
function extractBvid(value) {
  return value.match(/\b(BV[0-9A-Za-z]{8,})\b/)?.[1] ?? "";
}
function extractAid(value) {
  return value.match(/(?:\/video\/av|[?&]aid=|(?:^|\s)av)(\d+)/i)?.[1] ?? "";
}
function extractInteractionCounts2(value) {
  const patterns = {
    likes: /(\d+(?:\.\d+)?[kKwW万]?)\s*(?:赞|点赞|like|upvote|赞同)/i,
    reposts: /(\d+(?:\.\d+)?[kKwW万]?)\s*(?:转发|repost|share|分享)/i,
    replies: /(\d+(?:\.\d+)?[kKwW万]?)\s*(?:回复|评论|comment|reply|回答|条评价|个回答)/i,
    views: /(\d+(?:\.\d+)?[kKwW万]?)\s*(?:播放|浏览|view|阅读)/i
  };
  const result = { likes: 0, reposts: 0, replies: 0, views: 0 };
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = value.match(pattern);
    if (match) result[key] = parseNumber2(match[1]);
  }
  return result;
}
function extractOriginalUrlFromHtml(html) {
  const candidates = [
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? "",
    html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? "",
    html.match(/<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^"']*url=([^"']+)["']/i)?.[1] ?? "",
    html.match(/"url"\s*:\s*"([^"]+)"/i)?.[1] ?? "",
    ...Array.from(html.matchAll(/href=["']([^"']+)["']/gi)).map((match) => decodeHtml2(match[1]))
  ];
  return candidates.map((candidate) => decodeHtml2(candidate)).find((candidate) => /^https?:\/\//i.test(candidate) && !isGoogleNewsUrl(candidate)) ?? "";
}
function redirectParamUrl(value) {
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
function shouldResolveUrl(value) {
  return isGoogleNewsUrl(value) || isShortRedirectUrl(value);
}
function isGoogleNewsUrl(value) {
  return /news\.google\.com/i.test(value);
}
function isShortRedirectUrl(value) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "b23.tv" || host.endsWith(".b23.tv");
  } catch {
    return false;
  }
}
function isGameSite(value) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return GAME_SITE_HOSTS.some((entry) => host === entry || host.endsWith(`.${entry}`));
  } catch {
    return false;
  }
}
function isZhihu(value) {
  return /zhihu\.com/.test(value);
}
function isWechatMp(value) {
  return /mp\.weixin\.qq\.com/.test(value);
}
function isArticleSite(value) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    const articleHosts = [
      "news.qq.com",
      "tech.qq.com",
      "game.qq.com",
      "tech.sina.com.cn",
      "finance.sina.com.cn",
      "tech.163.com",
      "game.163.com",
      "it.sohu.com",
      "news.sohu.com",
      "36kr.com",
      "geekpark.net",
      "ithome.com",
      "cnbeta.com"
    ];
    return articleHosts.some((entry) => host === entry || host.endsWith(`.${entry}`));
  } catch {
    return false;
  }
}
async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "GameHotspotRadar/0.1"
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}
async function withTimeout(promise, timeoutMs) {
  let timeout;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error("enrichment timeout")), timeoutMs);
      })
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
function metaContent(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  return decodeHtml2(pattern.exec(html)?.[1] ?? "");
}
function jsonLdDescription(html) {
  const match = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) return "";
  try {
    const parsed = JSON.parse(match[1]);
    const entry = Array.isArray(parsed) ? parsed.find((item) => item.description) : parsed;
    return typeof entry?.description === "string" ? entry.description : "";
  } catch {
    return "";
  }
}
function parseNumber2(str) {
  const normalized = str.toLowerCase();
  const num = parseFloat(normalized);
  if (normalized.includes("k")) return Math.round(num * 1e3);
  if (normalized.includes("w") || str.includes("\u4E07")) return Math.round(num * 1e4);
  return Math.round(num);
}
function hasAnyCount(counts) {
  return counts.likes > 0 || counts.reposts > 0 || counts.replies > 0 || counts.views > 0;
}
function decodeHtml2(value) {
  return value.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// server/services/collector.ts
var parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  trimValues: true
});
function fetchWithTimeout(url, init, timeoutMs = 8e3) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}
var GAME_TERMS = ["\u6E38\u620F", "\u7535\u7ADE", "\u624B\u6E38", "\u4E3B\u673A", "PS5", "Switch", "Steam", "\u539F\u795E", "\u7C73\u54C8\u6E38", "\u817E\u8BAF", "\u7F51\u6613", "3A", "\u8D5B\u535A", "\u9ED1\u795E\u8BDD", "\u865A\u5E7B", "Unity", "\u80B2\u78A7", "\u66B4\u96EA", "R\u661F"];
function isGameKeyword(keyword) {
  const haystack = `${keyword.term} ${keyword.scope}`.toLowerCase();
  return GAME_TERMS.some((gt) => haystack.includes(gt.toLowerCase()));
}
var GAME_MEDIA_SOURCES = /* @__PURE__ */ new Set(["\u673A\u6838\u7F51", "\u6E38\u7814\u793E", "\u89E6\u4E50"]);
async function collectFromSources(keywords, sources) {
  const results = [];
  const failures = /* @__PURE__ */ new Map();
  const tasks = [];
  for (const keyword of keywords) {
    const isGame = isGameKeyword(keyword);
    for (const source of sources) {
      if (!isGame && GAME_MEDIA_SOURCES.has(source.name)) continue;
      tasks.push(
        collectFromSource(keyword, source).catch((error) => {
          const key = `${source.name} (${source.providerType})`;
          const current = failures.get(key) ?? { count: 0, messages: /* @__PURE__ */ new Set() };
          current.count += 1;
          current.messages.add(error instanceof Error ? error.message : String(error));
          failures.set(key, current);
          return [];
        })
      );
    }
  }
  const batches = await Promise.all(tasks);
  for (const batch of batches) {
    results.push(...batch);
  }
  if (failures.size > 0) {
    const summary = Array.from(failures.entries()).map(([name, failure]) => {
      const messages = Array.from(failure.messages).slice(0, 2).join("; ");
      return `${name} x${failure.count}: ${messages}`;
    }).join(" | ");
    console.warn(`[collector] source failures: ${summary}`);
  }
  return results;
}
async function collectFromSource(keyword, source) {
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
  const xml = await fetchText2(feedUrl);
  let items = parseFeed(xml, source, keyword);
  if (source.url.includes("{query}")) {
    const expanded = expandQuery(keyword);
    for (const variant of expanded) {
      if (variant === buildQuery(keyword)) continue;
      const variantUrl = source.url.replace("{query}", encodeURIComponent(variant));
      try {
        const variantXml = await fetchText2(variantUrl);
        const variantItems = parseFeed(variantXml, source, keyword);
        items = items.concat(variantItems);
      } catch {
      }
    }
  }
  if (!source.url.includes("{query}") && !keyword.accountMode) {
    const term = keyword.term.toLowerCase();
    items = items.filter(
      (item) => item.title.toLowerCase().includes(term) || item.summary.toLowerCase().includes(term) || keyword.scope && keyword.scope.split(/[,，、\s]+/).some(
        (w) => item.title.includes(w) || item.summary.includes(w)
      )
    );
  }
  return Promise.all(items.map(enrichCollectedItem));
}
function buildFeedUrl(template, keyword) {
  if (template.includes("{accountUid}")) {
    return template.replaceAll("{accountUid}", encodeURIComponent(keyword.accountUid));
  }
  if (keyword.accountMode) {
    return template.replaceAll("{query}", encodeURIComponent(keyword.term));
  }
  const query = [keyword.term, keyword.scope].filter(Boolean).join(" ");
  if (template.includes("baidu/search")) {
    const preciseQuery = `"${query}" -site:csdn.net -site:zhihu.com -site:jianshu.com`;
    return template.replaceAll("{query}", encodeURIComponent(preciseQuery));
  }
  return template.replaceAll("{query}", encodeURIComponent(query));
}
function parseFeed(xml, source, keyword) {
  const validation = XMLValidator.validate(xml, { allowBooleanAttributes: true });
  if (validation !== true) {
    throw new Error(`Invalid XML at line ${validation.err.line}`);
  }
  const parsed = parser.parse(xml);
  const rawItems = extractRawItems(parsed);
  const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
  return rawItems.map((item, index) => normalizeFeedItem(item, source, keyword, fetchedAt, index + 1)).filter((item) => Boolean(item));
}
async function collectFromBraveSearch(keyword, source) {
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
  const payload = await response.json();
  const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
  const items = (payload.web?.results ?? []).map((result, index) => normalizeSearchResult(result, source, keyword, query, fetchedAt, index + 1)).filter((item) => Boolean(item));
  return Promise.all(items.map(enrichCollectedItem));
}
async function collectFromBilibiliSearch(keyword, source) {
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
  const text2 = await response.text();
  let payload;
  try {
    payload = JSON.parse(text2);
  } catch {
    return [];
  }
  const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
  const rawItems = (payload.data?.result ?? []).filter((v) => Boolean(v.bvid && v.title && (v.play ?? 0) >= 1e3));
  const results = [];
  for (let index = 0; index < rawItems.length; index++) {
    const video = rawItems[index];
    const videoUrl = video.arcurl || `https://www.bilibili.com/video/${video.bvid}`;
    const quality = assessContentQuality({ title: video.title, url: videoUrl, summary: video.description ?? "" });
    if (quality.lowQuality) continue;
    const counts = extractInteractionCounts2(video.title);
    results.push({
      sourceId: source.id,
      keywordId: keyword.id,
      providerType: "bilibili_search",
      title: cleanArticleTitle(video.title.replace(/<[^>]*>/g, "").trim()),
      url: videoUrl,
      normalizedUrl: normalizeUrl(videoUrl),
      summary: cleanSummary(video.description ?? ""),
      publishedAt: new Date((video.pubdate ?? 0) * 1e3).toISOString(),
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
      interactionSource: video.play ? "bilibili" : "none",
      summarySource: video.description ? "rss" : "title"
    });
  }
  let enriched = await Promise.all(results.map(enrichCollectedItem));
  const term = keyword.term.toLowerCase();
  enriched = enriched.filter(
    (item) => item.title.toLowerCase().includes(term) || item.summary.toLowerCase().includes(term)
  );
  return enriched;
}
var weiboHotCache = null;
async function collectFromWeiboHot(keyword, source) {
  const now = Date.now();
  if (weiboHotCache && now - weiboHotCache.fetchedAt < 3e5) {
    return filterWeiboTopics(weiboHotCache.topics, keyword, source);
  }
  const response = await fetchWithTimeout("https://weibo.com/ajax/side/hotSearch", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Referer": "https://www.weibo.com"
    }
  });
  if (!response.ok) throw new Error(`Weibo Hot HTTP ${response.status}`);
  const payload = await response.json();
  const topics = (payload.data?.realtime ?? []).map((t) => ({
    word: t.word ?? "",
    rank: t.rank ?? 0,
    raw_hot: t.raw_hot ?? 0
  }));
  weiboHotCache = { fetchedAt: now, topics };
  return filterWeiboTopics(topics, keyword, source);
}
function filterWeiboTopics(topics, keyword, source) {
  const term = keyword.term.toLowerCase();
  const gameTerms = ["\u6E38\u620F", "\u7535\u7ADE", "\u624B\u6E38", "\u4E3B\u673A", "PS5", "Switch", "Steam", "\u539F\u795E", "\u7C73\u54C8\u6E38", "\u817E\u8BAF", "\u7F51\u6613", "\u72EC\u7ACB\u6E38\u620F", "3A", "\u8D5B\u535A", "\u9ED1\u795E\u8BDD", "VR", "AI", "\u865A\u5E7B", "Unity", "\u80B2\u78A7", "\u66B4\u96EA", "R\u661F"];
  const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
  const results = [];
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
      providerType: "weibo_hot",
      title: cleanArticleTitle(title),
      url,
      normalizedUrl: normalizeUrl(url),
      summary: `\u5FAE\u535A\u70ED\u641C #${topic.rank + 1}`,
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
      interactionSource: "weibo",
      summarySource: "rss"
    });
  }
  return results;
}
async function fetchText2(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15e3);
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
function extractRawItems(parsed) {
  const rss = parsed.rss;
  if (rss?.channel?.item) return arrayify(rss.channel.item);
  const feed = parsed.feed;
  if (feed?.entry) return arrayify(feed.entry);
  return [];
}
function normalizeFeedItem(raw, source, keyword, fetchedAt, rank) {
  const title = text(raw.title);
  const feedUrl = extractUrl(raw);
  const url = source.providerType === "google_news" ? extractOriginalUrl(raw, feedUrl) : feedUrl;
  if (!title || !url) return null;
  const summary = cleanSummary(text(raw.description) || text(raw.summary) || text(raw.content) || "");
  const quality = assessContentQuality({ title, url, summary, sourceName: source.name, sourceCommunity: source.communitySource });
  if (quality.lowQuality) return null;
  const unresolvedGoogleProxy = source.providerType === "google_news" && /news\.google\.com/i.test(url);
  const counts = extractInteractionCounts2(title);
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
    qualitySignals: unresolvedGoogleProxy ? [...quality.signals, "Google \u4EE3\u7406\u539F\u6587\u672A\u6062\u590D"] : quality.signals,
    interactionLikes: counts.likes,
    interactionReposts: counts.reposts,
    interactionReplies: counts.replies,
    interactionViews: counts.views,
    summarySource: summary ? "rss" : "title",
    interactionSource: counts.likes || counts.reposts || counts.replies || counts.views ? "rss" : "none"
  };
}
function normalizeSearchResult(result, source, keyword, query, fetchedAt, rank) {
  const title = result.title ?? "";
  const url = result.url ?? "";
  if (!title || !url) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  const summary = cleanSummary(result.description ?? "");
  const quality = assessContentQuality({ title, url, summary, sourceName: source.name, sourceCommunity: source.communitySource });
  if (quality.lowQuality) return null;
  const counts = extractInteractionCounts2(title);
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
function extractUrl(raw) {
  const direct = text(raw.link) || text(raw.guid);
  if (direct && /^https?:\/\//i.test(direct)) return direct;
  const link = raw.link;
  if (Array.isArray(link)) {
    const hrefLink = link.find((entry) => typeof entry === "object" && entry !== null && "@_href" in entry);
    if (hrefLink?.["@_href"]) return hrefLink["@_href"];
  }
  if (typeof link === "object" && link !== null && "@_href" in link) {
    return String(link["@_href"]);
  }
  return "";
}
function extractOriginalUrl(raw, fallback) {
  const description = text(raw.description);
  const hrefs = Array.from(description.matchAll(/href=["']([^"']+)["']/gi)).map((match) => decodeHtml3(match[1]));
  const original = hrefs.find((href) => /^https?:\/\//i.test(href) && !/news\.google\.com/i.test(href));
  return original ?? fallback;
}
function buildQuery(keyword) {
  if (keyword.accountMode) return keyword.term;
  return [keyword.term, keyword.scope].filter(Boolean).join(" ");
}
function expandQuery(keyword) {
  const term = keyword.term.trim();
  const scope = keyword.scope.trim();
  if (keyword.accountMode) return [term];
  const variants = [];
  const combined = [term, scope].filter(Boolean).join(" ");
  if (combined) variants.push(combined);
  if (scope && term !== scope) {
    variants.push(term);
  }
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
function parseDate(value) {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}
function text(value) {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (typeof value === "object" && value !== null && "#text" in value) {
    return String(value["#text"]).trim();
  }
  return "";
}
function decodeHtml3(value) {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
function arrayify(value) {
  const array = Array.isArray(value) ? value : [value];
  return array.filter((entry) => typeof entry === "object" && entry !== null);
}

// server/services/ai.ts
var RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "hotspot_evaluation",
    strict: true,
    schema: {
      type: "object",
      properties: {
        relevanceScore: { type: "number", minimum: 0, maximum: 100 },
        credibilityScore: { type: "number", minimum: 0, maximum: 100 },
        noveltyScore: { type: "number", minimum: 0, maximum: 100 },
        hotnessScore: { type: "number", minimum: 0, maximum: 100 },
        isImpersonationLikely: { type: "boolean" },
        summary: { type: "string" },
        reason: { type: "string" },
        recommendedAction: { type: "string", enum: ["notify", "watch", "ignore"] },
        keywordMentioned: { type: "boolean" },
        relevanceSummary: { type: "string" }
      },
      required: [
        "relevanceScore",
        "credibilityScore",
        "noveltyScore",
        "hotnessScore",
        "isImpersonationLikely",
        "summary",
        "reason",
        "recommendedAction",
        "keywordMentioned",
        "relevanceSummary"
      ],
      additionalProperties: false
    }
  }
};
var loggedOpenRouterFallbacks = /* @__PURE__ */ new Set();
function computeFreshnessScore(publishedAt) {
  const ageMs = Date.now() - new Date(publishedAt).getTime();
  if (Number.isNaN(ageMs)) return 50;
  const hours = ageMs / (60 * 60 * 1e3);
  if (hours < 6) return 100;
  if (hours < 12) return 85;
  if (hours < 24) return 65;
  if (hours < 48) return 35;
  return 0;
}
function computeInteractionScore(item) {
  const views = item.interactionViews ?? 0;
  const likes = item.interactionLikes ?? 0;
  if (views === 0 && likes === 0) return 50;
  const viewScore = views > 0 ? Math.min(100, Math.log10(views + 1) * 18) : 0;
  const likeScore = likes > 0 ? Math.min(100, Math.log10(likes + 1) * 12) : 0;
  return Math.round(Math.max(viewScore, likeScore));
}
function computeSourceScore(item) {
  if (item.sourceReliability === "official") return 100;
  if (item.sourceReliability === "trusted") return 80;
  if (item.sourceReliability === "search") return 60;
  return 40;
}
function computeEvidenceScore(evidenceCount) {
  return Math.min(100, evidenceCount * 25);
}
function computeKeywordRelevance(title, summary, keywordTerm) {
  const term = keywordTerm.toLowerCase().trim();
  const haystack = `${title} ${summary}`.toLowerCase();
  if (!term) return 50;
  if (haystack.includes(term)) return 100;
  const tokens = term.split(/[,，、\s]+/).filter((t) => t.length > 1);
  if (tokens.length > 0) {
    const hits = tokens.filter((t) => haystack.includes(t));
    const hitRatio = hits.length / tokens.length;
    const titleHasKeyword = tokens.some((t) => title.toLowerCase().includes(t));
    if (hitRatio >= 1) return 85;
    if (hitRatio >= 0.5 && titleHasKeyword) return 70;
    if (hitRatio >= 0.5) return 50;
    if (hitRatio > 0) return 30;
    return 0;
  }
  if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(term) && term.length >= 2) {
    const bigrams = generateBigrams(term);
    if (bigrams.length === 0) return 0;
    const hits = bigrams.filter((bg) => haystack.includes(bg));
    const hitRatio = hits.length / bigrams.length;
    const titleHasAny = bigrams.some((bg) => title.toLowerCase().includes(bg));
    if (hitRatio >= 1) return 85;
    if (hitRatio >= 0.67 && titleHasAny) return 65;
    if (hitRatio >= 0.67) return 60;
    if (hitRatio >= 0.5 && titleHasAny) return 45;
    if (hitRatio >= 0.5) return 35;
    if (hitRatio > 0) return 20;
    return 0;
  }
  return 0;
}
function generateBigrams(text2) {
  const bigrams = [];
  const chars = [...text2];
  for (let i = 0; i < chars.length - 1; i++) {
    bigrams.push(chars[i] + chars[i + 1]);
  }
  return bigrams;
}
function computePriorityScore(item) {
  const freshness = computeFreshnessScore(item.publishedAt);
  const interaction = computeInteractionScore(item);
  const source = computeSourceScore(item);
  const evidence = computeEvidenceScore(item.evidenceCount);
  const relevance = computeKeywordRelevance(item.title, item.summary, item.matchedKeyword);
  const score = relevance * 0.3 + item.qualityScore * 0.2 + freshness * 0.2 + interaction * 0.15 + source * 0.1 + evidence * 0.05;
  return Math.round(Math.max(0, Math.min(100, score)));
}
async function generateBriefing(items) {
  const env = getEnv();
  if (!env.openRouterApiKey) return generateMockBriefing(items);
  const topItems = items.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 10).map((item, i) => `${i + 1}. [${item.matchedKeyword}] ${item.title}${item.summary ? ` \u2014 ${item.summary.slice(0, 80)}` : ""}`).join("\n");
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openRouterApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: env.openRouterModel,
        messages: [
          { role: "system", content: "\u4F60\u662F\u8D44\u8BAF\u7B80\u62A5\u52A9\u624B\u3002\u6839\u636E\u7ED9\u51FA\u7684\u70ED\u70B9\u6761\u76EE\uFF0C\u7528 2-3 \u53E5\u8BDD\u505A\u4E00\u4EFD\u4E2D\u6587\u7B80\u62A5\uFF0C\u6982\u62EC\u5F53\u524D\u6700\u503C\u5F97\u5173\u6CE8\u7684\u4E3B\u9898\u548C\u8D8B\u52BF\u3002\u8BED\u6C14\u7B80\u6D01\u4E13\u4E1A\uFF0C\u4E0D\u8D85\u8FC7 120 \u5B57\uFF0C\u4E0D\u5206\u70B9\u3002" },
          { role: "user", content: topItems }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    });
    if (!response.ok) return generateMockBriefing(items);
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || generateMockBriefing(items);
  } catch {
    return generateMockBriefing(items);
  }
}
function generateMockBriefing(items) {
  const top = items.sort((a, b) => 0).slice(0, 5);
  const keywords = [...new Set(top.map((i) => i.matchedKeyword))].slice(0, 3).join("\u3001");
  return `\u5F53\u524D\u76D1\u63A7\u5230 ${items.length} \u6761\u70ED\u70B9\uFF0C\u4E3B\u8981\u6D89\u53CA ${keywords} \u7B49\u9886\u57DF\uFF0C\u5176\u4E2D\u591A\u7BC7\u5185\u5BB9\u5173\u6CE8\u6700\u65B0\u52A8\u6001\u4E0E\u6280\u672F\u8D8B\u52BF\u3002`;
}
async function evaluateItem(item, keyword, source, settings) {
  if (!settings) settings = { aiMode: "openrouter", scanIntervalMinutes: 30, openRouterConfigured: true, openRouterModel: "deepseek/deepseek-v4-flash" };
  const env = getEnv();
  if (settings.aiMode === "mock" || !env.openRouterApiKey) {
    return mockEvaluation(item, keyword, source);
  }
  try {
    return await evaluateWithOpenRouter(item, keyword, source);
  } catch (error) {
    logOpenRouterFallback(error);
    return mockEvaluation(item, keyword, source);
  }
}
async function evaluateWithOpenRouter(item, keyword, source) {
  const env = getEnv();
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openRouterApiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.openRouterReferer,
      "X-OpenRouter-Title": env.openRouterTitle
    },
    body: JSON.stringify({
      model: env.openRouterModel,
      messages: [
        {
          role: "system",
          content: `\u4F60\u6839\u636E\u7ED9\u5B9A\u7684\u5173\u952E\u8BCD\u5224\u65AD\u6587\u7AE0\u7684\u76F8\u5173\u6027\u3002
\u6838\u5FC3\u4EFB\u52A1\uFF1A\u8BC4\u4F30\u6587\u7AE0\u662F\u5426**\u771F\u6B63\u8BA8\u8BBA**\u4E86\u5173\u952E\u8BCD\u6240\u4EE3\u8868\u7684\u8BDD\u9898\uFF0C\u800C\u975E\u4EC5\u5B57\u9762\u63D0\u53CA\u3002
keywordMentioned: \u6587\u7AE0\u662F\u5426\u786E\u5B9E\u6D89\u53CA\u5173\u952E\u8BCD\u4E3B\u9898\uFF08\u533A\u5206"\u63D0\u5230\u4E86\u8BCD"\u4E0E"\u8BA8\u8BBA\u4E86\u8BDD\u9898"\uFF09\u3002
relevanceScore: \u6587\u7AE0\u5185\u5BB9\u4E0E\u5173\u952E\u8BCD\u7684\u76F4\u63A5\u5173\u8054\u7A0B\u5EA6\uFF080=\u5B8C\u5168\u65E0\u5173\uFF0C100=\u9AD8\u5EA6\u6838\u5FC3\uFF09\u3002
relevanceSummary: \u7528\u4E00\u53E5\u8BDD\uFF08\u226450\u5B57\uFF09\u8BF4\u660E\u6587\u7AE0\u4E0E\u5173\u952E\u8BCD\u7684\u5177\u4F53\u5173\u8054\u3002
relevanceScore \u4E25\u683C\u6309\u5982\u4E0B\u6807\u51C6\uFF1A
0-20: \u5B8C\u5168\u65E0\u5173\u6216\u4EC5\u5076\u7136\u51FA\u73B0\u5173\u952E\u8BCD\uFF1B20-40: \u4EC5\u5B57\u9762\u63D0\u53CA\u4F46\u672A\u5B9E\u8D28\u6027\u8BA8\u8BBA\uFF1B
40-60: \u90E8\u5206\u76F8\u5173\u4F46\u6838\u5FC3\u4E3B\u9898\u4E0D\u540C\uFF1B60-80: \u76F8\u5173\u4F46\u975E\u4E13\u6CE8\u8BE5\u8BDD\u9898\uFF1B
80-100: \u6587\u7AE0\u6838\u5FC3\u4E3B\u9898\u5C31\u662F\u8BE5\u5173\u952E\u8BCD\u8BDD\u9898\u3002
\u53EA\u8F93\u51FA\u7B26\u5408 JSON Schema \u7684\u7ED3\u679C\u3002`
        },
        {
          role: "user",
          content: JSON.stringify({
            keyword: keyword?.term ?? item.matchedKeyword,
            scope: keyword?.scope ?? "",
            source: source ? {
              name: source.name,
              category: source.category,
              url: source.url,
              providerType: source.providerType,
              reliabilityTier: source.reliabilityTier,
              communitySource: source.communitySource,
              minQualityScore: source.minQualityScore
            } : null,
            qualitySignals: item.qualitySignals,
            evidenceCount: item.evidenceCount,
            evidenceProviders: item.evidenceProviders,
            sourceReliability: item.sourceReliability,
            communitySource: item.communitySource,
            item
          })
        }
      ],
      response_format: RESPONSE_FORMAT,
      temperature: 0.2,
      max_tokens: 800
    })
  });
  if (!response.ok) {
    throw new Error(`OpenRouter HTTP ${response.status}: ${summarizeOpenRouterError(await response.text())}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned empty content");
  return sanitizeEvaluation(JSON.parse(content));
}
function mockEvaluation(item, keyword, source) {
  const haystack = `${item.title} ${item.summary}`.toLowerCase();
  const term = (keyword?.term ?? item.matchedKeyword).toLowerCase();
  const baseMatch = computeKeywordRelevance(item.title, item.summary, term);
  const keywordMentioned = baseMatch >= 50;
  const relevance = keywordMentioned ? baseMatch : Math.min(baseMatch, 20);
  const credibilityBase = source?.reliabilityTier === "official" ? 86 : source?.reliabilityTier === "trusted" ? 78 : source?.reliabilityTier === "community" ? 58 : 70;
  const credibility = Math.min(95, credibilityBase + Math.max(0, item.evidenceCount - 1) * 8 + Math.floor((item.qualityScore - 70) / 4));
  const novelty = Date.now() - new Date(item.publishedAt).getTime() <= 24 * 60 * 60 * 1e3 ? 78 : 52;
  const hotness = relevance > 60 ? Math.min(50 + relevance * 0.35, 90) : 35;
  const suspicious = /免费领取|破解|内部绝密|必看爆料/.test(item.title);
  const relevanceSummary = keywordMentioned ? `\u6807\u9898\u4E0E\u6458\u8981\u4E2D\u5305\u542B\u5173\u952E\u8BCD"${term}"\u7684\u76F8\u5173\u8BA8\u8BBA` : `\u5185\u5BB9\u672A\u660E\u663E\u6D89\u53CA\u5173\u952E\u8BCD"${term}"\u7684\u6838\u5FC3\u8BDD\u9898`;
  return sanitizeEvaluation({
    relevanceScore: relevance,
    credibilityScore: suspicious ? 45 : credibility,
    noveltyScore: novelty,
    hotnessScore: suspicious ? 42 : hotness,
    isImpersonationLikely: suspicious,
    summary: item.summary ? cleanSummary(item.summary).slice(0, 120) : cleanArticleTitle(item.title),
    reason: suspicious ? "\u6807\u9898\u5B58\u5728\u660E\u663E\u8425\u9500\u6216\u7206\u6599\u8BDD\u672F\uFF0C\u5148\u964D\u7EA7\u4E3A\u5F85\u89C2\u5BDF\u3002" : `Mock: baseMatch=${baseMatch}, keywordMentioned=${keywordMentioned}`,
    recommendedAction: !suspicious && relevance >= 60 && item.qualityScore >= 70 ? "notify" : "watch",
    keywordMentioned,
    relevanceSummary
  });
}
function sanitizeEvaluation(input) {
  const credibilityScore = clamp(input.credibilityScore);
  const isImpersonationLikely = Boolean(input.isImpersonationLikely) && !(credibilityScore >= 75 && clamp(Math.max(input.relevanceScore, input.noveltyScore)) >= 70);
  return {
    relevanceScore: clamp(input.relevanceScore),
    credibilityScore,
    noveltyScore: clamp(input.noveltyScore),
    hotnessScore: clamp(input.hotnessScore),
    isImpersonationLikely,
    summary: cleanSummary(String(input.summary ?? "")).slice(0, 300),
    reason: String(input.reason ?? "").slice(0, 600),
    recommendedAction: ["notify", "watch", "ignore"].includes(input.recommendedAction) ? input.recommendedAction : "watch",
    keywordMentioned: Boolean(input.keywordMentioned),
    relevanceSummary: String(input.relevanceSummary ?? "").slice(0, 120)
  };
}
function isKeywordMentioned(title, summary, keywordTerm) {
  return computeKeywordRelevance(title, summary, keywordTerm) >= 30;
}
function computeFinalRelevance(item) {
  const baseMatch = computeKeywordRelevance(item.title, item.summary, item.matchedKeyword);
  const hasEval = item.evaluation !== null && item.evaluation !== void 0;
  const aiRelevance = item.evaluation?.relevanceScore ?? 0;
  const keywordMentioned = item.evaluation?.keywordMentioned ?? baseMatch >= 30;
  let semanticBoost = 1;
  if (hasEval) {
    if (aiRelevance >= 80) semanticBoost = 1.3;
    else if (aiRelevance >= 60) semanticBoost = 1.1;
    else if (aiRelevance >= 40) semanticBoost = 1;
    else if (aiRelevance >= 20) semanticBoost = 0.9;
    else semanticBoost = 0.8;
  }
  const mentionedBonus = keywordMentioned ? 1 : 0.3;
  return Math.round(Math.min(100, baseMatch * mentionedBonus * semanticBoost));
}
function clamp(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}
function logOpenRouterFallback(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (loggedOpenRouterFallbacks.has(message)) return;
  loggedOpenRouterFallbacks.add(message);
  console.warn(`[ai] OpenRouter unavailable, using mock fallback: ${message}`);
}
function summarizeOpenRouterError(text2) {
  try {
    const payload = JSON.parse(text2);
    const code = payload.error?.code ? `code ${payload.error.code}` : "request failed";
    const message = payload.error?.message ?? "unknown error";
    return `${code} - ${message}`;
  } catch {
    return text2.slice(0, 240);
  }
}

// server/services/scanner-cf.ts
var scanning = false;
async function runScanCollect() {
  if (scanning) return { skipped: true, reason: "scan already running" };
  scanning = true;
  const scanRunId = await repos.scanRuns.start();
  const totals = { fetched: 0, inserted: 0, evaluated: 0 };
  try {
    const keywords = await repos.keywords.active();
    let sources = await repos.sources.active();
    sources = sources.filter((s) => s.providerType === "rss" && !s.name.includes("B\u7AD9"));
    console.log(`[scanner-cf] ${keywords.length} keywords, ${sources.length} sources`);
    const collected = await collectFromSources(keywords, sources);
    totals.fetched = collected.length;
    const deduped = deduplicateBatch(collected);
    console.log(`[scanner-cf] collected=${collected.length} deduped=${deduped.length}`);
    for (const raw of deduped) {
      const source = sources.find((s) => s.id === raw.sourceId) ?? null;
      if (source && raw.qualityScore < source.minQualityScore) continue;
      const keywordRelevance = computeKeywordRelevance(raw.title, raw.summary, raw.matchedKeyword);
      if (keywordRelevance < 50) continue;
      const result = await repos.items.insert(raw);
      if (result?.inserted) totals.inserted += 1;
    }
    await repos.scanRuns.finish(scanRunId, "success", totals);
    scanning = false;
    return { skipped: false, ...totals, scanRunId };
  } catch (error) {
    scanning = false;
    const msg = error instanceof Error ? error.message : String(error);
    await repos.scanRuns.finish(scanRunId, "failed", { ...totals, error: msg });
    throw error;
  }
}
async function runScanEvaluate() {
  try {
    const keywords = await repos.keywords.active();
    const sources = await repos.sources.active();
    const allItems = await repos.items.list(50);
    const candidates = allItems.filter((i) => !i.evaluation).sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0)).slice(0, 3);
    let evaluated = 0;
    for (const item of candidates) {
      if (!isKeywordMentioned(item.title, item.summary, item.matchedKeyword)) {
        await repos.items.updateStatus(item.id, "ignored");
        continue;
      }
      const keyword = keywords.find((k) => k.id === item.keywordId) ?? null;
      const source = sources.find((s) => s.id === item.sourceId) ?? null;
      try {
        const evaluation = await evaluateItem(item, keyword, source);
        await repos.items.addEvaluation(item.id, evaluation);
        evaluated += 1;
      } catch (err) {
        console.error(`[scanner-cf] AI eval failed for item ${item.id}:`, err);
      }
    }
    const rescore = allItems.slice(0, 20);
    for (const item of rescore) {
      const priorityScore = computePriorityScore(item);
      const freshnessScore = computeFreshnessScore(item.publishedAt);
      const finalRelevance = computeFinalRelevance(item);
      let status;
      if (finalRelevance < 30) status = "ignored";
      else if (finalRelevance < 50) status = priorityScore >= 75 ? "watch" : "ignored";
      else if (priorityScore >= 75) status = "new";
      else if (priorityScore >= 50) status = "watch";
      else status = "ignored";
      await repos.items.updatePriority(item.id, priorityScore, freshnessScore, status);
    }
    console.log(`[scanner-cf] AI evaluated=${evaluated}, rescored=${rescore.length}`);
    return { evaluated };
  } catch (error) {
    console.error("[scanner-cf] evaluate phase failed:", error);
  }
}
function deduplicateBatch(items) {
  const seenUrls = /* @__PURE__ */ new Set();
  const result = [];
  for (const item of items) {
    if (seenUrls.has(item.normalizedUrl)) continue;
    seenUrls.add(item.normalizedUrl);
    const dup = result.find((e) => e.keywordId === item.keywordId && titleSimilarity(e.title, item.title) >= 0.65);
    if (dup) continue;
    result.push(item);
  }
  return result;
}

// functions/api/[[...route]].ts
var app = new Hono();
var envInitialized = false;
app.use("*", async (c, next) => {
  if (!envInitialized) {
    initEnv(c.env);
    await initDb();
    envInitialized = true;
  }
  await next();
});
app.get("/api/health", async (c) => {
  return c.json({ ok: true, time: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/dashboard", async (c) => {
  const items = await repos.items.list();
  return c.json({
    settings: await repos.settings.all(),
    keywords: await repos.keywords.all(),
    sources: await repos.sources.all(),
    items,
    lastScan: await repos.scanRuns.last(),
    unreadCount: items.filter((i) => i.status === "new" && !i.readAt).length
  });
});
app.get("/api/settings", async (c) => {
  return c.json(await repos.settings.all());
});
app.patch("/api/settings", async (c) => {
  const body = await c.req.json();
  if (body.aiMode && !["openrouter", "mock"].includes(body.aiMode)) {
    return c.json({ error: "Invalid aiMode" }, 400);
  }
  if (body.aiMode) await repos.settings.set("aiMode", body.aiMode);
  if (typeof body.scanIntervalMinutes === "number") {
    if (body.scanIntervalMinutes < 5 || body.scanIntervalMinutes > 1440) {
      return c.json({ error: "scanIntervalMinutes must be 5-1440" }, 400);
    }
    await repos.settings.set("scanIntervalMinutes", String(Math.round(body.scanIntervalMinutes)));
  }
  return c.json(await repos.settings.all());
});
app.get("/api/keywords", async (c) => {
  return c.json(await repos.keywords.all());
});
app.post("/api/keywords", async (c) => {
  const body = await c.req.json();
  if (!body.term?.trim()) return c.json({ error: "term is required" }, 400);
  const kw = await repos.keywords.create(body.term, body.scope ?? "");
  return c.json(kw, 201);
});
app.patch("/api/keywords/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const item = await repos.keywords.update(id, body);
  if (!item) return c.json({ error: "Keyword not found" }, 404);
  return c.json(item);
});
app.delete("/api/keywords/:id", async (c) => {
  const id = Number(c.req.param("id"));
  return c.json({ ok: await repos.keywords.delete(id) });
});
app.get("/api/sources", async (c) => {
  return c.json(await repos.sources.all());
});
app.post("/api/sources", async (c) => {
  const body = await c.req.json();
  if (!body.name?.trim() || !body.url?.trim()) return c.json({ error: "name and url are required" }, 400);
  const src = await repos.sources.create({ name: body.name, url: body.url, category: body.category ?? "\u81EA\u5B9A\u4E49" });
  return c.json(src, 201);
});
app.patch("/api/sources/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const item = await repos.sources.update(id, body);
  if (!item) return c.json({ error: "Source not found" }, 404);
  return c.json(item);
});
app.delete("/api/sources/:id", async (c) => {
  const id = Number(c.req.param("id"));
  return c.json({ ok: await repos.sources.delete(id) });
});
app.get("/api/items", async (c) => {
  const limit = Number(c.req.query("limit") ?? 80);
  return c.json(await repos.items.list(limit));
});
app.patch("/api/items/:id/read", async (c) => {
  const id = Number(c.req.param("id"));
  const ok = await repos.items.markRead(id);
  const items = await repos.items.list();
  return c.json({ ok, unreadCount: items.filter((i) => i.status === "new" && !i.readAt).length });
});
app.get("/api/items/archived", async (c) => {
  const limit = Number(c.req.query("limit") ?? 100);
  return c.json(await repos.items.archived(limit));
});
app.post("/api/items/:id/restore", async (c) => {
  const id = Number(c.req.param("id"));
  return c.json({ ok: await repos.items.restore(id) });
});
app.post("/api/items/batch-restore", async (c) => {
  const { ids } = await c.req.json();
  if (!ids?.length) return c.json({ error: "ids is required" }, 400);
  return c.json({ ok: await repos.items.batchRestore(ids) });
});
app.post("/api/items/batch-delete", async (c) => {
  const { ids } = await c.req.json();
  if (!ids?.length) return c.json({ error: "ids is required" }, 400);
  return c.json({ ok: await repos.items.batchDelete(ids) });
});
app.post("/api/items/archive-stale", async (c) => {
  const ok = await repos.items.archiveStaleItems();
  const items = await repos.items.list();
  return c.json({ ok, unreadCount: items.filter((i) => i.status === "new" && !i.readAt).length });
});
app.get("/api/summary", async (c) => {
  try {
    const items = (await repos.items.list()).map((item) => ({
      title: item.title,
      summary: item.summary,
      matchedKeyword: item.matchedKeyword,
      priorityScore: item.priorityScore
    }));
    const briefing = await generateBriefing(items);
    return c.json({ briefing });
  } catch {
    return c.json({ briefing: "\u7B80\u62A5\u751F\u6210\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" });
  }
});
app.post("/api/scan", async (c) => {
  try {
    const result = await runScanCollect();
    const items = await repos.items.list();
    const dashboard = {
      settings: await repos.settings.all(),
      keywords: await repos.keywords.all(),
      sources: await repos.sources.all(),
      items,
      lastScan: await repos.scanRuns.last(),
      unreadCount: items.filter((i) => i.status === "new" && !i.readAt).length
    };
    const waitUntil = c.env.__waitUntil;
    if (waitUntil) {
      waitUntil(runScanEvaluate().catch((err) => console.error("[scan-eval]", err)));
    }
    return c.json({ result, dashboard });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
app.all("*", (c) => c.json({ error: `Not found: ${c.req.path}` }, 404));
async function onRequest(ctx) {
  const env = { ...ctx.env, __waitUntil: ctx.waitUntil };
  return app.fetch(ctx.request, env, ctx);
}
export {
  onRequest
};
