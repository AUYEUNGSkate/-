import { createClient } from "@libsql/client";
import type { Client } from "@libsql/client";
import type { AiEvaluation, AiMode, HotspotItem, InteractionSource, Keyword, ProviderType, ReliabilityTier, ScanRun, Source, SummarySource } from "../../shared/types";
import { getEnv } from "../config/env";
import { cleanArticleTitle, cleanSummary, isLowQualityResult } from "../services/contentFilter";
import { titleSimilarity } from "../services/dedupe";

export interface RawItemInput {
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
  summarySource?: SummarySource;
  interactionSource?: InteractionSource;
  authorName?: string | null;
  authorFollowers?: number;
  authorVerified?: boolean;
  interactionDanmaku?: number;
  interactionQuotes?: number;
}

export interface SourceInput {
  name: string;
  url: string;
  category: string;
  providerType?: ProviderType;
  reliabilityTier?: ReliabilityTier;
  communitySource?: boolean;
  minQualityScore?: number;
  enabled?: boolean;
  builtin?: boolean;
}

let client: Client | null = null;
let initialized = false;

export function getTursoClient(): Client {
  if (client) return client;
  const env = getEnv();
  const url = process.env.TURSO_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) throw new Error("TURSO_URL and TURSO_AUTH_TOKEN required for Turso");
  client = createClient({ url, authToken: token });
  return client;
}

async function exec(stmts: string[]) {
  const c = getTursoClient();
  for (const s of stmts) {
    await c.execute(s);
  }
}

async function run(sql: string, args?: any) {
  const c = getTursoClient();
  return c.execute({ sql, args });
}

async function all(sql: string, args?: unknown[]) {
  const result = await run(sql, args);
  return result.rows as unknown[];
}

async function get(sql: string, args?: unknown[]) {
  const result = await run(sql, args);
  return (result.rows[0] ?? null) as unknown;
}

async function lastInsertRowid() {
  const result = await get("SELECT last_insert_rowid() AS id");
  return Number((result as { id: number }).id);
}

async function initSchema() {
  await exec([
    `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS keywords (id INTEGER PRIMARY KEY AUTOINCREMENT, term TEXT NOT NULL, scope TEXT NOT NULL DEFAULT '', enabled INTEGER NOT NULL DEFAULT 1, account_mode INTEGER NOT NULL DEFAULT 0, account_platform TEXT NOT NULL DEFAULT '', account_uid TEXT NOT NULL DEFAULT '', account_url TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS sources (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, url TEXT NOT NULL, category TEXT NOT NULL, provider_type TEXT NOT NULL DEFAULT 'rss', reliability_tier TEXT NOT NULL DEFAULT 'trusted', community_source INTEGER NOT NULL DEFAULT 0, min_quality_score INTEGER NOT NULL DEFAULT 60, enabled INTEGER NOT NULL DEFAULT 1, builtin INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL, keyword_id INTEGER REFERENCES keywords(id) ON DELETE SET NULL, title TEXT NOT NULL, url TEXT NOT NULL, normalized_url TEXT NOT NULL UNIQUE, summary TEXT NOT NULL DEFAULT '', published_at TEXT NOT NULL, fetched_at TEXT NOT NULL, matched_keyword TEXT NOT NULL, read_at TEXT, status TEXT NOT NULL DEFAULT 'watch', quality_score INTEGER NOT NULL DEFAULT 70, quality_signals TEXT NOT NULL DEFAULT '[]', evidence_count INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, archived_at TEXT, interaction_likes INTEGER NOT NULL DEFAULT 0, interaction_reposts INTEGER NOT NULL DEFAULT 0, interaction_replies INTEGER NOT NULL DEFAULT 0, interaction_views INTEGER NOT NULL DEFAULT 0, summary_source TEXT NOT NULL DEFAULT 'rss', interaction_source TEXT NOT NULL DEFAULT 'none', priority_score INTEGER NOT NULL DEFAULT 0, freshness_score INTEGER NOT NULL DEFAULT 0, author_name TEXT, author_followers INTEGER NOT NULL DEFAULT 0, author_verified INTEGER NOT NULL DEFAULT 0, interaction_danmaku INTEGER NOT NULL DEFAULT 0, interaction_quotes INTEGER NOT NULL DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS ai_evaluations (id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER NOT NULL UNIQUE REFERENCES items(id) ON DELETE CASCADE, relevance_score REAL NOT NULL, credibility_score REAL NOT NULL, novelty_score REAL NOT NULL, hotness_score REAL NOT NULL, is_impersonation_likely INTEGER NOT NULL, summary TEXT NOT NULL, reason TEXT NOT NULL, recommended_action TEXT NOT NULL, raw_json TEXT NOT NULL, keyword_mentioned INTEGER NOT NULL DEFAULT 0, relevance_summary TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS scan_runs (id INTEGER PRIMARY KEY AUTOINCREMENT, started_at TEXT NOT NULL, finished_at TEXT, status TEXT NOT NULL, total_fetched INTEGER NOT NULL DEFAULT 0, total_inserted INTEGER NOT NULL DEFAULT 0, total_evaluated INTEGER NOT NULL DEFAULT 0, error TEXT)`,
    `CREATE TABLE IF NOT EXISTS item_evidence (id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE, provider_type TEXT NOT NULL, source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL, source_name TEXT NOT NULL, query TEXT NOT NULL, rank INTEGER NOT NULL DEFAULT 0, original_url TEXT NOT NULL, normalized_url TEXT NOT NULL, domain TEXT NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '', published_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(item_id, provider_type, source_id, normalized_url))`,
  ]);
}

async function seedData() {
  const env = getEnv();
  const count = await get("SELECT COUNT(*) AS count FROM settings");
  if (Number((count as { count: number }).count) === 0) {
    await run("INSERT INTO settings (key, value) VALUES ('aiMode', ?)", { "aiMode": env.aiMode });
    await run("INSERT INTO settings (key, value) VALUES ('scanIntervalMinutes', ?)", { "scanIntervalMinutes": String(env.scanIntervalMinutes) });
  }

  const kCount = await get("SELECT COUNT(*) AS count FROM keywords");
  if (Number((kCount as { count: number }).count) === 0) {
    await run("INSERT INTO keywords (term, scope) VALUES ('AI 编程', '游戏开发、生产力工具、Agent 工作流')");
    await run("INSERT INTO keywords (term, scope) VALUES ('Unity', '游戏引擎、技术更新、商业政策')");
    await run("INSERT INTO keywords (term, scope) VALUES ('游戏出海', '发行、买量、市场、平台政策')");
  }

  await ensureDefaultSources();
}

async function ensureDefaultSources() {
  const count = await get("SELECT COUNT(*) AS count FROM sources");
  if (Number((count as { count: number }).count) > 0) return;

  const sources = getDefaultSources();
  for (const s of sources) {
    await run(
      `INSERT INTO sources (name, url, category, provider_type, reliability_tier, community_source, min_quality_score, enabled, builtin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.name, s.url, s.category, s.providerType, s.reliabilityTier, Number(s.communitySource), s.minQualityScore, Number(s.enabled), Number(s.builtin)]
    );
  }
}

type SourcePreset = Required<SourceInput>;
function getDefaultSources(): SourcePreset[] {
  return [
    { name: "RSSHub 百度搜索", url: "https://rsshub.rssforever.com/baidu/search/{query}", category: "国内综合", providerType: "rss", reliabilityTier: "search", communitySource: false, minQualityScore: 70, enabled: true, builtin: true },
    { name: "微博热搜", url: "https://weibo.com/ajax/side/hotSearch", category: "搜索增强", providerType: "weibo_hot", reliabilityTier: "search", communitySource: false, minQualityScore: 50, enabled: true, builtin: true },
    { name: "机核网", url: "https://www.gcores.com/rss", category: "国内媒体", providerType: "rss", reliabilityTier: "trusted", communitySource: false, minQualityScore: 62, enabled: true, builtin: true },
    { name: "游研社", url: "https://www.yystv.cn/rss/feed", category: "国内媒体", providerType: "rss", reliabilityTier: "trusted", communitySource: false, minQualityScore: 62, enabled: true, builtin: true },
    { name: "触乐", url: "https://www.chuapp.com/feed", category: "国内媒体", providerType: "rss", reliabilityTier: "trusted", communitySource: false, minQualityScore: 62, enabled: true, builtin: true },
    { name: "B站视频搜索", url: "https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword={query}", category: "国内平台", providerType: "bilibili_search", reliabilityTier: "community", communitySource: true, minQualityScore: 70, enabled: false, builtin: true },
    { name: "Brave Search 增强", url: "{query}", category: "搜索增强", providerType: "brave_search", reliabilityTier: "search", communitySource: false, minQualityScore: 70, enabled: false, builtin: true },
  ];
}

export async function initTursoDb() {
  if (initialized) return;
  await initSchema();
  await seedData();
  initialized = true;
}

// ============ Repositories ============

interface KeywordRow {
  id: number; term: string; scope: string; enabled: number;
  account_mode: number; account_platform: string; account_uid: string; account_url: string;
  created_at: string;
}
interface SourceRow {
  id: number; name: string; url: string; category: string;
  provider_type: ProviderType; reliability_tier: ReliabilityTier;
  community_source: number; min_quality_score: number; enabled: number; builtin: number;
  created_at: string;
}
interface ScanRunRow {
  id: number; started_at: string; finished_at: string | null;
  status: "running" | "success" | "failed";
  total_fetched: number; total_inserted: number; total_evaluated: number; error: string | null;
}
interface ItemJoinedRow {
  id: number; source_id: number | null; keyword_id: number | null;
  title: string; url: string; normalized_url: string; summary: string;
  published_at: string; fetched_at: string; matched_keyword: string;
  read_at: string | null; status: "new" | "watch" | "ignored";
  quality_score: number; quality_signals: string; evidence_count: number;
  interaction_likes: number; interaction_reposts: number; interaction_replies: number; interaction_views: number;
  interaction_danmaku: number; interaction_quotes: number;
  summary_source: string; interaction_source: string;
  priority_score: number; freshness_score: number;
  author_name: string | null; author_followers: number; author_verified: number;
  source_reliability: ReliabilityTier | null; source_community: number | null;
  relevance_score: number | null; credibility_score: number | null; novelty_score: number | null; hotness_score: number | null;
  is_impersonation_likely: number | null; ai_summary: string | null; reason: string | null;
  recommended_action: "notify" | "watch" | "ignore" | null;
  keyword_mentioned: number | null; relevance_summary: string | null;
  evidence_providers: string | null; evidence_source_names: string | null;
}

function mapKeyword(row: KeywordRow): Keyword {
  return { id: row.id, term: row.term, scope: row.scope, enabled: Boolean(row.enabled), accountMode: Boolean(row.account_mode), accountPlatform: row.account_platform ?? "", accountUid: row.account_uid ?? "", accountUrl: row.account_url ?? "", createdAt: row.created_at };
}
function mapSource(row: SourceRow): Source {
  return { id: row.id, name: row.name, url: row.url, category: row.category, providerType: parseProviderType(row.provider_type), reliabilityTier: parseReliabilityTier(row.reliability_tier), communitySource: Boolean(row.community_source), minQualityScore: row.min_quality_score, enabled: Boolean(row.enabled), builtin: Boolean(row.builtin), createdAt: row.created_at };
}
function mapScanRun(row: ScanRunRow): ScanRun {
  return { id: row.id, startedAt: row.started_at, finishedAt: row.finished_at, status: row.status, totalFetched: row.total_fetched, totalInserted: row.total_inserted, totalEvaluated: row.total_evaluated, error: row.error };
}
function mapItem(row: ItemJoinedRow): HotspotItem {
  return {
    id: row.id, sourceId: row.source_id, keywordId: row.keyword_id,
    title: cleanArticleTitle(row.title), url: row.url, normalizedUrl: row.normalized_url,
    summary: cleanSummary(row.summary), publishedAt: row.published_at, fetchedAt: row.fetched_at,
    matchedKeyword: row.matched_keyword, readAt: row.read_at, status: row.status,
    qualityScore: row.quality_score, qualitySignals: parseJsonArray(row.quality_signals), evidenceCount: row.evidence_count,
    evidenceProviders: parseJsonArray(row.evidence_providers).map(parseProviderType),
    evidenceSourceNames: parseJsonArray(row.evidence_source_names),
    sourceReliability: row.source_reliability ? parseReliabilityTier(row.source_reliability) : null,
    communitySource: Boolean(row.source_community),
    interactionLikes: row.interaction_likes ?? 0, interactionReposts: row.interaction_reposts ?? 0,
    interactionReplies: row.interaction_replies ?? 0, interactionViews: row.interaction_views ?? 0,
    interactionDanmaku: row.interaction_danmaku ?? 0, interactionQuotes: row.interaction_quotes ?? 0,
    summarySource: parseSummarySource(row.summary_source), interactionSource: parseInteractionSource(row.interaction_source),
    priorityScore: row.priority_score ?? 0, freshnessScore: row.freshness_score ?? 0,
    authorName: row.author_name ?? null, authorFollowers: row.author_followers ?? 0, authorVerified: Boolean(row.author_verified),
    evaluation: row.relevance_score === null ? null : {
      relevanceScore: row.relevance_score, credibilityScore: row.credibility_score ?? 0,
      noveltyScore: row.novelty_score ?? 0, hotnessScore: row.hotness_score ?? 0,
      isImpersonationLikely: Boolean(row.is_impersonation_likely),
      summary: cleanSummary(row.ai_summary ?? ""), reason: cleanSummary(row.reason ?? ""),
      recommendedAction: row.recommended_action ?? "watch",
      keywordMentioned: Boolean(row.keyword_mentioned), relevanceSummary: row.relevance_summary ?? ""
    }
  };
}

function parseProviderType(v: string): ProviderType { return ["google_news","brave_search","bilibili_search","weibo_hot"].includes(v) ? v as ProviderType : "rss"; }
function parseReliabilityTier(v: string): ReliabilityTier { return ["official","community","search"].includes(v) ? v as ReliabilityTier : "trusted"; }
function parseSummarySource(v: string): SummarySource { return ["ai","metadata","title"].includes(v) ? v as SummarySource : "rss"; }
function parseInteractionSource(v: string): InteractionSource { return ["bilibili","zhihu","wechat","weibo","html","rss"].includes(v) ? v as InteractionSource : "none"; }
function parseJsonArray(v: string | null): string[] { if (!v) return []; try { const p = JSON.parse(v); return Array.isArray(p) ? p.map(String).filter(Boolean) : []; } catch { return []; } }

interface AccountInfo { accountMode: boolean; accountPlatform: string; accountUid: string; accountUrl: string; }
function detectAccountInfo(term: string): AccountInfo {
  const url = (term.match(/https?:\/\/\S+/i)?.[0] ?? "");
  const bilibiliUid = (term.match(/space\.bilibili\.com\/(\d+)/i)?.[1] ?? term.match(/\buid[:：\s]*(\d{3,})\b/i)?.[1] ?? "");
  if (bilibiliUid) return { accountMode: true, accountPlatform: "bilibili", accountUid: bilibiliUid, accountUrl: url };
  const patterns = [/公司$/,/团队$/,/工作室$/,/官方$/,/游戏$/,/科技$/,/平台$/,/引擎$/];
  if (patterns.some(p => p.test(term))) return { accountMode: true, accountPlatform: "", accountUid: "", accountUrl: url };
  const chineseOnly = term.replace(/[^\u4e00-\u9fff]/g, "");
  if (chineseOnly.length >= 2 && chineseOnly.length <= 3 && !term.includes(" ")) return { accountMode: true, accountPlatform: "", accountUid: "", accountUrl: url };
  return { accountMode: false, accountPlatform: "", accountUid: "", accountUrl: url };
}

export const tursoRepos = {
  settings: {
    async all() {
      const rows = await all("SELECT key, value FROM settings") as { key: string; value: string }[];
      const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
      const env = getEnv();
      return { aiMode: (map.aiMode === "mock" ? "mock" : "openrouter") as AiMode, scanIntervalMinutes: Number(map.scanIntervalMinutes ?? env.scanIntervalMinutes), openRouterConfigured: Boolean(env.openRouterApiKey), openRouterModel: env.openRouterModel };
    },
    async set(key: string, value: string) {
      await run("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [key, value]);
    }
  },
  keywords: {
    async all(): Promise<Keyword[]> {
      const rows = await all("SELECT * FROM keywords ORDER BY enabled DESC, id DESC") as KeywordRow[];
      return rows.map(mapKeyword);
    },
    async active(): Promise<Keyword[]> {
      const rows = await all("SELECT * FROM keywords WHERE enabled = 1 ORDER BY id DESC") as KeywordRow[];
      return rows.map(mapKeyword);
    },
    async create(term: string, scope: string): Promise<Keyword> {
      const acc = detectAccountInfo(term.trim());
      await run("INSERT INTO keywords (term, scope, account_mode, account_platform, account_uid, account_url) VALUES (?, ?, ?, ?, ?, ?)", [term.trim(), scope.trim(), Number(acc.accountMode), acc.accountPlatform, acc.accountUid, acc.accountUrl]);
      return (await this.byId(Number((await lastInsertRowid()))))!;
    },
    async update(id: number, input: Partial<Pick<Keyword, "term" | "scope" | "enabled" | "accountMode" | "accountPlatform" | "accountUid" | "accountUrl">>): Promise<Keyword | null> {
      const cur = await this.byId(id);
      if (!cur) return null;
      const nt = input.term?.trim() ?? cur.term;
      const det = input.term ? detectAccountInfo(nt) : null;
      await run("UPDATE keywords SET term=?, scope=?, enabled=?, account_mode=?, account_platform=?, account_uid=?, account_url=? WHERE id=?", [nt, input.scope?.trim() ?? cur.scope, typeof input.enabled==="boolean" ? Number(input.enabled) : Number(cur.enabled), typeof input.accountMode==="boolean" ? Number(input.accountMode) : Number(det?.accountMode ?? cur.accountMode), input.accountPlatform ?? det?.accountPlatform ?? cur.accountPlatform, input.accountUid ?? det?.accountUid ?? cur.accountUid, input.accountUrl ?? det?.accountUrl ?? cur.accountUrl, id]);
      return this.byId(id);
    },
    async delete(id: number) { await run("DELETE FROM keywords WHERE id = ?", [id]); return true; },
    async byId(id: number): Promise<Keyword | null> { const r = await get("SELECT * FROM keywords WHERE id = ?", [id]) as KeywordRow | null; return r ? mapKeyword(r) : null; }
  },
  sources: {
    async all(): Promise<Source[]> { const r = await all("SELECT * FROM sources ORDER BY enabled DESC, builtin DESC, id DESC") as SourceRow[]; return r.map(mapSource); },
    async active(): Promise<Source[]> { const r = await all("SELECT * FROM sources WHERE enabled = 1 ORDER BY id") as SourceRow[]; return r.map(mapSource); },
    async create(input: SourceInput): Promise<Source> {
      await run("INSERT INTO sources (name,url,category,provider_type,reliability_tier,community_source,min_quality_score,enabled,builtin) VALUES (?,?,?,?,?,?,?,?,?)", [input.name.trim(), input.url.trim(), input.category.trim()||"自定义", input.providerType??"rss", input.reliabilityTier??"trusted", Number(input.communitySource??false), input.minQualityScore??65, Number(input.enabled??true), Number(input.builtin??false)]);
      return (await this.byId(Number(await lastInsertRowid())))!;
    },
    async update(id: number, input: Partial<Omit<Source,"id"|"createdAt">>): Promise<Source|null> { const cur=await this.byId(id); if(!cur)return null; await run("UPDATE sources SET name=?,url=?,category=?,provider_type=?,reliability_tier=?,community_source=?,min_quality_score=?,enabled=? WHERE id=?", [input.name?.trim()??cur.name, input.url?.trim()??cur.url, input.category?.trim()??cur.category, input.providerType??cur.providerType, input.reliabilityTier??cur.reliabilityTier, typeof input.communitySource==="boolean"?Number(input.communitySource):Number(cur.communitySource), input.minQualityScore??cur.minQualityScore, typeof input.enabled==="boolean"?Number(input.enabled):Number(cur.enabled), id]); return this.byId(id); },
    async delete(id: number) { const s=await this.byId(id); if(!s)return false; if(s.builtin){return (await this.update(id,{enabled:false}))!==null;} await run("DELETE FROM sources WHERE id=?",[id]); return true; },
    async byId(id: number): Promise<Source|null> { const r=await get("SELECT * FROM sources WHERE id=?",[id]) as SourceRow|null; return r?mapSource(r):null; }
  },
  items: {
    async list(limit=80): Promise<HotspotItem[]> {
      const rows = await all(
        `SELECT i.*, s.reliability_tier AS source_reliability, s.community_source AS source_community, e.relevance_score, e.credibility_score, e.novelty_score, e.hotness_score, e.is_impersonation_likely, e.summary AS ai_summary, e.reason, e.recommended_action, e.keyword_mentioned, e.relevance_summary, (SELECT json_group_array(DISTINCT provider_type) FROM item_evidence WHERE item_id=i.id) AS evidence_providers, (SELECT json_group_array(DISTINCT source_name) FROM item_evidence WHERE item_id=i.id) AS evidence_source_names FROM items i LEFT JOIN sources s ON s.id=i.source_id LEFT JOIN ai_evaluations e ON e.item_id=i.id WHERE i.archived_at IS NULL AND datetime(i.published_at) >= datetime('now','-24 hours') ORDER BY i.priority_score DESC, i.published_at DESC, i.id DESC LIMIT ?`,
        [limit]
      ) as ItemJoinedRow[];
      return rows.map(mapItem).filter(item => !isLowQualityResult({title:item.title,url:item.url,summary:item.summary}));
    },
    async archived(limit=100): Promise<HotspotItem[]> {
      const rows=await all(`SELECT i.*, s.reliability_tier AS source_reliability, s.community_source AS source_community, e.relevance_score,e.credibility_score,e.novelty_score,e.hotness_score,e.is_impersonation_likely,e.summary AS ai_summary,e.reason,e.recommended_action, (SELECT json_group_array(DISTINCT provider_type) FROM item_evidence WHERE item_id=i.id) AS evidence_providers, (SELECT json_group_array(DISTINCT source_name) FROM item_evidence WHERE item_id=i.id) AS evidence_source_names FROM items i LEFT JOIN sources s ON s.id=i.source_id LEFT JOIN ai_evaluations e ON e.item_id=i.id WHERE i.archived_at IS NOT NULL ORDER BY i.archived_at DESC, i.id DESC LIMIT ?`, [limit]) as ItemJoinedRow[];
      return rows.map(mapItem);
    },
    async restore(id:number){await run("UPDATE items SET archived_at=NULL WHERE id=?",[id]);return true;},
    async batchRestore(ids:number[]){if(!ids.length)return 0;const ph=ids.map(()=>'?').join(',');const r=await run("UPDATE items SET archived_at=NULL WHERE id IN ("+ph+")",ids);return Number(r.rowsAffected);},
    async batchDelete(ids:number[]){if(!ids.length)return 0;const ph=ids.map(()=>'?').join(',');const r=await run("DELETE FROM items WHERE id IN ("+ph+")",ids);return Number(r.rowsAffected);},
    async archiveStaleItems(){
      const d1=await run("UPDATE items SET status='watch' WHERE status='new' AND archived_at IS NULL AND datetime(published_at) < datetime('now','-24 hours')");
      const d2=await run("UPDATE items SET archived_at=CURRENT_TIMESTAMP WHERE archived_at IS NULL AND datetime(published_at) < datetime('now','-24 hours') AND (read_at IS NOT NULL OR status IN ('watch','ignored'))");
      return Number(d1.rowsAffected)+Number(d2.rowsAffected);
    },
    async byId(id:number):Promise<HotspotItem|null>{
      const row=await get(`SELECT i.*, s.reliability_tier AS source_reliability, s.community_source AS source_community, e.relevance_score,e.credibility_score,e.novelty_score,e.hotness_score,e.is_impersonation_likely,e.summary AS ai_summary,e.reason,e.recommended_action,e.keyword_mentioned,e.relevance_summary, (SELECT json_group_array(DISTINCT provider_type) FROM item_evidence WHERE item_id=i.id) AS evidence_providers, (SELECT json_group_array(DISTINCT source_name) FROM item_evidence WHERE item_id=i.id) AS evidence_source_names FROM items i LEFT JOIN sources s ON s.id=i.source_id LEFT JOIN ai_evaluations e ON e.item_id=i.id WHERE i.id=?`,[id]) as ItemJoinedRow|null;
      return row?mapItem(row):null;
    },
    async insert(input: RawItemInput): Promise<{id:number;inserted:boolean}|null>{
      const rows=await all("SELECT id,title,published_at FROM items WHERE keyword_id=? ORDER BY id DESC LIMIT 120",[input.keywordId]) as Array<{id:number;title:string;published_at:string}>;
      const inputTime=new Date(input.publishedAt).getTime();
      for(const row of rows){
        const rt=new Date(row.published_at).getTime();
        if((isNaN(inputTime)||isNaN(rt)||Math.abs(inputTime-rt)<=36*60*60*1000)&&titleSimilarity(row.title,input.title)>=0.62){
          await mergeEvidence(row.id,input);
          return {id:row.id,inserted:false};
        }
      }
      try{
        await run(`INSERT INTO items (source_id,keyword_id,title,url,normalized_url,summary,published_at,fetched_at,matched_keyword,status,quality_score,quality_signals,evidence_count,interaction_likes,interaction_reposts,interaction_replies,interaction_views,interaction_danmaku,interaction_quotes,summary_source,interaction_source,author_name,author_followers,author_verified) VALUES (?,?,?,?,?,?,?,?,?,'watch',?,?,1,?,?,?,?,?,?,?,?,?,?,?)`,
          [input.sourceId,input.keywordId,input.title,input.url,input.normalizedUrl,input.summary,input.publishedAt,input.fetchedAt,input.matchedKeyword,input.qualityScore,JSON.stringify(input.qualitySignals),input.interactionLikes,input.interactionReposts,input.interactionReplies,input.interactionViews,input.interactionDanmaku??0,input.interactionQuotes??0,input.summarySource??"rss",input.interactionSource??"none",input.authorName??null,input.authorFollowers??0,input.authorVerified?1:0]);
        const id=Number(await lastInsertRowid());
        await mergeEvidence(id,input);
        return {id,inserted:true};
      }catch(e){if(e instanceof Error&&e.message.includes("UNIQUE")){const r=await get("SELECT id FROM items WHERE normalized_url=?",[input.normalizedUrl]) as {id:number}|null;if(!r)return null;await mergeEvidence(r.id,input);return {id:r.id,inserted:false};}throw e;}
    },
    async markRead(id:number){await run("UPDATE items SET read_at=CURRENT_TIMESTAMP WHERE id=?",[id]);return true;},
    async updateStatus(id:number,status:HotspotItem["status"]){await run("UPDATE items SET status=? WHERE id=?",[status,id]);},
    async addEvaluation(itemId:number, evaluation:AiEvaluation){
      await run(`INSERT INTO ai_evaluations (item_id,relevance_score,credibility_score,novelty_score,hotness_score,is_impersonation_likely,summary,reason,recommended_action,keyword_mentioned,relevance_summary,raw_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(item_id) DO UPDATE SET relevance_score=excluded.relevance_score,credibility_score=excluded.credibility_score,novelty_score=excluded.novelty_score,hotness_score=excluded.hotness_score,is_impersonation_likely=excluded.is_impersonation_likely,summary=excluded.summary,reason=excluded.reason,recommended_action=excluded.recommended_action,keyword_mentioned=excluded.keyword_mentioned,relevance_summary=excluded.relevance_summary,raw_json=excluded.raw_json`,
        [itemId,evaluation.relevanceScore,evaluation.credibilityScore,evaluation.noveltyScore,evaluation.hotnessScore,Number(evaluation.isImpersonationLikely),evaluation.summary,evaluation.reason,evaluation.recommendedAction,evaluation.keywordMentioned?1:0,evaluation.relevanceSummary??"",JSON.stringify(evaluation)]);
    }
  },
  scanRuns: {
    async start():Promise<number>{await run("INSERT INTO scan_runs (started_at,status) VALUES (?,?)",[new Date().toISOString(),"running"]);return Number(await lastInsertRowid());},
    async finish(id:number,status:"success"|"failed",totals:{fetched:number;inserted:number;evaluated:number;error?:string}){await run("UPDATE scan_runs SET finished_at=?,status=?,total_fetched=?,total_inserted=?,total_evaluated=?,error=? WHERE id=?",[new Date().toISOString(),status,totals.fetched,totals.inserted,totals.evaluated,totals.error??null,id]);},
    async last():Promise<ScanRun|null>{const r=await get("SELECT * FROM scan_runs ORDER BY id DESC LIMIT 1") as ScanRunRow|null;return r?mapScanRun(r):null;}
  }
};

async function mergeEvidence(itemId:number,input:RawItemInput){
  const src=(await tursoRepos.sources.byId(input.sourceId));
  await run("INSERT INTO item_evidence (item_id,provider_type,source_id,source_name,query,rank,original_url,normalized_url,domain,title,summary,published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(item_id,provider_type,source_id,normalized_url) DO UPDATE SET rank=MIN(rank,excluded.rank), summary=CASE WHEN length(excluded.summary)>length(summary) THEN excluded.summary ELSE summary END",
    [itemId,input.providerType,input.sourceId,src?.name??"未知来源",input.query,input.rank,input.url,input.normalizedUrl,hostname(input.normalizedUrl),input.title,input.summary,input.publishedAt]);
  const row=await get("SELECT COUNT(*) AS count FROM item_evidence WHERE item_id=?",[itemId]) as {count:number};
  await run("UPDATE items SET evidence_count=?, quality_score=MAX(quality_score,?) WHERE id=?",[row.count,input.qualityScore,itemId]);
}

function hostname(url:string):string{try{return new URL(url).hostname.toLowerCase();}catch{return"";}}
