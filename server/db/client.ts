import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
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

let singleton: Database.Database | null = null;

export function getDb(): Database.Database {
  if (singleton) return singleton;
  const env = getEnv();
  fs.mkdirSync(path.dirname(env.databasePath), { recursive: true });
  singleton = new Database(env.databasePath);
  singleton.pragma("journal_mode = WAL");
  singleton.pragma("foreign_keys = ON");
  initializeSchema(singleton);
  seedDefaults(singleton);
  return singleton;
}

export function closeDb() {
  singleton?.close();
  singleton = null;
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS keywords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      term TEXT NOT NULL,
      scope TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      category TEXT NOT NULL,
      provider_type TEXT NOT NULL DEFAULT 'rss',
      reliability_tier TEXT NOT NULL DEFAULT 'trusted',
      community_source INTEGER NOT NULL DEFAULT 0,
      min_quality_score INTEGER NOT NULL DEFAULT 60,
      enabled INTEGER NOT NULL DEFAULT 1,
      builtin INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
      keyword_id INTEGER REFERENCES keywords(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      normalized_url TEXT NOT NULL UNIQUE,
      summary TEXT NOT NULL DEFAULT '',
      published_at TEXT NOT NULL,
      fetched_at TEXT NOT NULL,
      matched_keyword TEXT NOT NULL,
      read_at TEXT,
      status TEXT NOT NULL DEFAULT 'watch',
      quality_score INTEGER NOT NULL DEFAULT 70,
      quality_signals TEXT NOT NULL DEFAULT '[]',
      evidence_count INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL UNIQUE REFERENCES items(id) ON DELETE CASCADE,
      relevance_score REAL NOT NULL,
      credibility_score REAL NOT NULL,
      novelty_score REAL NOT NULL,
      hotness_score REAL NOT NULL,
      is_impersonation_likely INTEGER NOT NULL,
      summary TEXT NOT NULL,
      reason TEXT NOT NULL,
      recommended_action TEXT NOT NULL,
      raw_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scan_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      status TEXT NOT NULL,
      total_fetched INTEGER NOT NULL DEFAULT 0,
      total_inserted INTEGER NOT NULL DEFAULT 0,
      total_evaluated INTEGER NOT NULL DEFAULT 0,
      error TEXT
    );

    CREATE TABLE IF NOT EXISTS item_evidence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      provider_type TEXT NOT NULL,
      source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
      source_name TEXT NOT NULL,
      query TEXT NOT NULL,
      rank INTEGER NOT NULL DEFAULT 0,
      original_url TEXT NOT NULL,
      normalized_url TEXT NOT NULL,
      domain TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      published_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(item_id, provider_type, source_id, normalized_url)
    );
  `);

  addColumnIfMissing(db, "sources", "provider_type", "TEXT NOT NULL DEFAULT 'rss'");
  addColumnIfMissing(db, "sources", "reliability_tier", "TEXT NOT NULL DEFAULT 'trusted'");
  addColumnIfMissing(db, "sources", "community_source", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "sources", "min_quality_score", "INTEGER NOT NULL DEFAULT 60");
  addColumnIfMissing(db, "items", "quality_score", "INTEGER NOT NULL DEFAULT 70");
  addColumnIfMissing(db, "items", "quality_signals", "TEXT NOT NULL DEFAULT '[]'");
  addColumnIfMissing(db, "items", "evidence_count", "INTEGER NOT NULL DEFAULT 1");
  addColumnIfMissing(db, "items", "archived_at", "TEXT");
  addColumnIfMissing(db, "items", "interaction_likes", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "interaction_reposts", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "interaction_replies", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "interaction_views", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "summary_source", "TEXT NOT NULL DEFAULT 'rss'");
  addColumnIfMissing(db, "items", "interaction_source", "TEXT NOT NULL DEFAULT 'none'");
  addColumnIfMissing(db, "items", "priority_score", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "freshness_score", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "author_name", "TEXT");
  addColumnIfMissing(db, "items", "author_followers", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "author_verified", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "interaction_danmaku", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "interaction_quotes", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "ai_evaluations", "keyword_mentioned", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "ai_evaluations", "relevance_summary", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "keywords", "account_mode", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "keywords", "account_platform", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "keywords", "account_uid", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "keywords", "account_url", "TEXT NOT NULL DEFAULT ''");
}

function addColumnIfMissing(db: Database.Database, table: string, column: string, definition: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!columns.some((entry) => entry.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function seedDefaults(db: Database.Database) {
  const env = getEnv();
  const settingCount = db.prepare("SELECT COUNT(*) AS count FROM settings").get() as { count: number };
  if (settingCount.count === 0) {
    const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (@key, @value)");
    insertSetting.run({ key: "aiMode", value: env.aiMode });
    insertSetting.run({ key: "scanIntervalMinutes", value: String(env.scanIntervalMinutes) });
  }

  const keywordCount = db.prepare("SELECT COUNT(*) AS count FROM keywords").get() as { count: number };
  if (keywordCount.count === 0) {
    const insertKeyword = db.prepare("INSERT INTO keywords (term, scope) VALUES (@term, @scope)");
    insertKeyword.run({ term: "AI 编程", scope: "游戏开发、生产力工具、Agent 工作流" });
    insertKeyword.run({ term: "Unity", scope: "游戏引擎、技术更新、商业政策" });
    insertKeyword.run({ term: "游戏出海", scope: "发行、买量、市场、平台政策" });
  }

  ensureDefaultSources(db);
}

type SourcePreset = Required<SourceInput>;

export function getDefaultSources(): SourcePreset[] {
  return [
    {
      name: "RSSHub 百度搜索",
      url: "https://rsshub.rssforever.com/baidu/search/{query}",
      category: "国内综合",
      providerType: "rss",
      reliabilityTier: "search",
      communitySource: false,
      minQualityScore: 70,
      enabled: true,
      builtin: true
    },
    {
      name: "微博热搜",
      url: "https://weibo.com/ajax/side/hotSearch",
      category: "搜索增强",
      providerType: "weibo_hot",
      reliabilityTier: "search",
      communitySource: false,
      minQualityScore: 50,
      enabled: true,
      builtin: true
    },
    {
      name: "国内综合新闻",
      url: "https://news.google.com/rss/search?q={query}%20(%E6%B8%B8%E6%88%8F%20OR%20%E6%89%8B%E6%B8%B8%20OR%20%E5%8E%82%E5%95%86%20OR%20%E7%89%88%E5%8F%B7)&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "国内综合",
      providerType: "google_news",
      reliabilityTier: "search",
      communitySource: false,
      minQualityScore: 68,
      enabled: false,
      builtin: true
    },
    {
      name: "微博热点",
      url: "https://news.google.com/rss/search?q={query}%20site%3Aweibo.com&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "国内平台",
      providerType: "google_news",
      reliabilityTier: "community",
      communitySource: true,
      minQualityScore: 78,
      enabled: false,
      builtin: true
    },
    {
      name: "B站内容",
      url: "https://news.google.com/rss/search?q={query}%20site%3Abilibili.com&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "国内平台",
      providerType: "google_news",
      reliabilityTier: "community",
      communitySource: true,
      minQualityScore: 76,
      enabled: false,
      builtin: true
    },
    {
      name: "B站账号视频",
      url: "https://rsshub.app/bilibili/user/video/{accountUid}",
      category: "账号源",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 65,
      enabled: true,
      builtin: true
    },
    {
      name: "B站账号动态",
      url: "https://rsshub.app/bilibili/user/dynamic/{accountUid}",
      category: "账号源",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 65,
      enabled: true,
      builtin: true
    },
    {
      name: "TapTap 社区",
      url: "https://news.google.com/rss/search?q={query}%20site%3Ataptap.cn&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "国内平台",
      providerType: "google_news",
      reliabilityTier: "community",
      communitySource: true,
      minQualityScore: 82,
      enabled: false,
      builtin: true
    },
    {
      name: "知乎讨论",
      url: "https://news.google.com/rss/search?q={query}%20site%3Azhihu.com&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "国内平台",
      providerType: "google_news",
      reliabilityTier: "community",
      communitySource: true,
      minQualityScore: 78,
      enabled: false,
      builtin: true
    },
    {
      name: "微信公众号文章",
      url: "https://news.google.com/rss/search?q={query}%20site%3Amp.weixin.qq.com&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "国内平台",
      providerType: "google_news",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 72,
      enabled: false,
      builtin: true
    },
    {
      name: "百度贴吧讨论",
      url: "https://news.google.com/rss/search?q={query}%20site%3Atieba.baidu.com&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "国内平台",
      providerType: "google_news",
      reliabilityTier: "community",
      communitySource: true,
      minQualityScore: 84,
      enabled: false,
      builtin: true
    },
    {
      name: "国内游戏媒体",
      url: "https://news.google.com/rss/search?q={query}%20(%E6%B8%B8%E6%88%8F%E8%91%A1%E8%90%84%20OR%20%E7%AB%9E%E6%A0%B8%20OR%20%E6%B8%B8%E7%A0%94%E7%A4%BE%20OR%20%E8%A7%A6%E4%B9%90)&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "国内媒体",
      providerType: "google_news",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 66,
      enabled: false,
      builtin: true
    },
    {
      name: "机核网",
      url: "https://www.gcores.com/rss",
      category: "国内媒体",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 62,
      enabled: true,
      builtin: true
    },
    {
      name: "游研社",
      url: "https://www.yystv.cn/rss/feed",
      category: "国内媒体",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 62,
      enabled: true,
      builtin: true
    },
    {
      name: "触乐",
      url: "https://www.chuapp.com/feed",
      category: "国内媒体",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 62,
      enabled: true,
      builtin: true
    },
    {
      name: "游民星空",
      url: "https://rsshub.rssforever.com/gamersky/news",
      category: "国内媒体",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 62,
      enabled: false,
      builtin: true
    },
    {
      name: "3DM 游戏",
      url: "https://rsshub.app/3dm/news",
      category: "国内媒体",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 62,
      enabled: true,
      builtin: true
    },
    {
      name: "搜狐游戏",
      url: "https://rsshub.app/sohu/game",
      category: "国内综合",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 62,
      enabled: true,
      builtin: true
    },
    {
      name: "网易游戏",
      url: "https://rsshub.app/163/dy",
      category: "国内综合",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 62,
      enabled: true,
      builtin: true
    },
    {
      name: "17173 新闻",
      url: "https://rsshub.app/17173/news",
      category: "国内媒体",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 62,
      enabled: true,
      builtin: true
    },
    {
      name: "Brave Search 增强",
      url: "{query}",
      category: "搜索增强",
      providerType: "brave_search",
      reliabilityTier: "search",
      communitySource: false,
      minQualityScore: 70,
      enabled: false,
      builtin: true
    }
  ];
}

function ensureDefaultSources(db: Database.Database) {
  const findByName = db.prepare("SELECT id FROM sources WHERE name = ?");
  const insertSource = db.prepare(`
    INSERT INTO sources (
      name, url, category, provider_type, reliability_tier,
      community_source, min_quality_score, enabled, builtin
    )
    VALUES (
      @name, @url, @category, @providerType, @reliabilityTier,
      @communitySource, @minQualityScore, @enabled, @builtin
    )
  `);
  const updateSource = db.prepare(`
    UPDATE sources
    SET
      url = @url,
      category = @category,
      provider_type = @providerType,
      reliability_tier = @reliabilityTier,
      community_source = @communitySource,
      min_quality_score = @minQualityScore,
      builtin = 1
    WHERE id = @id
  `);
  const upsertDefaults = db.transaction((sources: SourcePreset[]) => {
    for (const source of sources) {
      const row = findByName.get(source.name) as { id: number } | undefined;
      const payload = {
        ...source,
        providerType: source.providerType,
        reliabilityTier: source.reliabilityTier,
        communitySource: Number(source.communitySource),
        minQualityScore: source.minQualityScore,
        enabled: Number(source.enabled),
        builtin: Number(source.builtin)
      };
      if (row) {
        updateSource.run({ ...payload, id: row.id });
      } else {
        insertSource.run(payload);
      }
    }
  });
  upsertDefaults(getDefaultSources());

  db.prepare(`
    UPDATE sources
    SET enabled = 0
    WHERE builtin = 1 AND name IN (
      'Google News 全球游戏技术',
      'Google News AI 编程',
      'Google News 中文游戏行业'
    )
  `).run();
}

export const repositories = {
  settings: {
    all() {
      const db = getDb();
      const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
      const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
      const env = getEnv();
      return {
        aiMode: (map.aiMode === "mock" ? "mock" : "openrouter") as AiMode,
        scanIntervalMinutes: Number(map.scanIntervalMinutes ?? env.scanIntervalMinutes),
        openRouterConfigured: Boolean(env.openRouterApiKey),
        openRouterModel: env.openRouterModel
      };
    },
    set(key: string, value: string) {
      getDb().prepare(`
        INSERT INTO settings (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `).run(key, value);
    }
  },
  keywords: {
    all(): Keyword[] {
      const rows = getDb().prepare("SELECT * FROM keywords ORDER BY enabled DESC, id DESC").all() as KeywordRow[];
      return rows.map(mapKeyword);
    },
    active(): Keyword[] {
      const rows = getDb().prepare("SELECT * FROM keywords WHERE enabled = 1 ORDER BY id DESC").all() as KeywordRow[];
      return rows.map(mapKeyword);
    },
    create(term: string, scope: string): Keyword {
      const account = detectAccountInfo(term.trim());
      const info = getDb().prepare(`
        INSERT INTO keywords (term, scope, account_mode, account_platform, account_uid, account_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(term.trim(), scope.trim(), Number(account.accountMode), account.accountPlatform, account.accountUid, account.accountUrl);
      return this.byId(Number(info.lastInsertRowid))!;
    },
    update(id: number, input: Partial<Pick<Keyword, "term" | "scope" | "enabled" | "accountMode" | "accountPlatform" | "accountUid" | "accountUrl">>): Keyword | null {
      const current = this.byId(id);
      if (!current) return null;
      const nextTerm = input.term?.trim() ?? current.term;
      const detected = input.term ? detectAccountInfo(nextTerm) : null;
      getDb().prepare(`
        UPDATE keywords
        SET term = ?, scope = ?, enabled = ?, account_mode = ?, account_platform = ?, account_uid = ?, account_url = ?
        WHERE id = ?
      `).run(
        nextTerm,
        input.scope?.trim() ?? current.scope,
        typeof input.enabled === "boolean" ? Number(input.enabled) : Number(current.enabled),
        typeof input.accountMode === "boolean" ? Number(input.accountMode) : Number(detected?.accountMode ?? current.accountMode),
        input.accountPlatform ?? detected?.accountPlatform ?? current.accountPlatform,
        input.accountUid ?? detected?.accountUid ?? current.accountUid,
        input.accountUrl ?? detected?.accountUrl ?? current.accountUrl,
        id
      );
      return this.byId(id);
    },
    delete(id: number) {
      return getDb().prepare("DELETE FROM keywords WHERE id = ?").run(id).changes > 0;
    },
    byId(id: number): Keyword | null {
      const row = getDb().prepare("SELECT * FROM keywords WHERE id = ?").get(id) as KeywordRow | undefined;
      return row ? mapKeyword(row) : null;
    }
  },
  sources: {
    all(): Source[] {
      const rows = getDb().prepare("SELECT * FROM sources ORDER BY enabled DESC, builtin DESC, id DESC").all() as SourceRow[];
      return rows.map(mapSource);
    },
    active(): Source[] {
      const rows = getDb().prepare("SELECT * FROM sources WHERE enabled = 1 ORDER BY id").all() as SourceRow[];
      return rows.map(mapSource);
    },
    create(input: SourceInput): Source {
      const info = getDb().prepare(`
        INSERT INTO sources (
          name, url, category, provider_type, reliability_tier,
          community_source, min_quality_score, enabled, builtin
        )
        VALUES (
          @name, @url, @category, @providerType, @reliabilityTier,
          @communitySource, @minQualityScore, @enabled, @builtin
        )
      `).run({
        name: input.name.trim(),
        url: input.url.trim(),
        category: input.category.trim() || "自定义",
        providerType: input.providerType ?? inferProviderType(input.url),
        reliabilityTier: input.reliabilityTier ?? "trusted",
        communitySource: Number(input.communitySource ?? false),
        minQualityScore: input.minQualityScore ?? 65,
        enabled: Number(input.enabled ?? true),
        builtin: Number(input.builtin ?? false)
      });
      return this.byId(Number(info.lastInsertRowid))!;
    },
    update(id: number, input: Partial<Omit<Source, "id" | "createdAt">>): Source | null {
      const current = this.byId(id);
      if (!current) return null;
      getDb().prepare(`
        UPDATE sources
        SET
          name = ?,
          url = ?,
          category = ?,
          provider_type = ?,
          reliability_tier = ?,
          community_source = ?,
          min_quality_score = ?,
          enabled = ?
        WHERE id = ?
      `).run(
        input.name?.trim() ?? current.name,
        input.url?.trim() ?? current.url,
        input.category?.trim() ?? current.category,
        input.providerType ?? current.providerType,
        input.reliabilityTier ?? current.reliabilityTier,
        typeof input.communitySource === "boolean" ? Number(input.communitySource) : Number(current.communitySource),
        input.minQualityScore ?? current.minQualityScore,
        typeof input.enabled === "boolean" ? Number(input.enabled) : Number(current.enabled),
        id
      );
      return this.byId(id);
    },
    delete(id: number) {
      const source = this.byId(id);
      if (!source) return false;
      if (source.builtin) {
        return this.update(id, { enabled: false }) !== null;
      }
      return getDb().prepare("DELETE FROM sources WHERE id = ?").run(id).changes > 0;
    },
    byId(id: number): Source | null {
      const row = getDb().prepare("SELECT * FROM sources WHERE id = ?").get(id) as SourceRow | undefined;
      return row ? mapSource(row) : null;
    }
  },
  items: {
    list(limit = 80): HotspotItem[] {
      const rows = getDb().prepare(`
        SELECT
          i.*,
          i.interaction_likes,
          i.interaction_reposts,
          i.interaction_replies,
          i.interaction_views,
          i.interaction_danmaku,
          i.interaction_quotes,
          i.priority_score,
          i.freshness_score,
          i.author_name,
          i.author_followers,
          i.author_verified,
          s.reliability_tier AS source_reliability,
          s.community_source AS source_community,
          e.relevance_score,
          e.credibility_score,
          e.novelty_score,
          e.hotness_score,
          e.is_impersonation_likely,
          e.summary AS ai_summary,
          e.reason,
          e.recommended_action,
          e.keyword_mentioned,
          e.relevance_summary,
          (
            SELECT json_group_array(DISTINCT provider_type)
            FROM item_evidence
            WHERE item_id = i.id
          ) AS evidence_providers,
          (
            SELECT json_group_array(DISTINCT source_name)
            FROM item_evidence
            WHERE item_id = i.id
          ) AS evidence_source_names
        FROM items i
        LEFT JOIN sources s ON s.id = i.source_id
        LEFT JOIN ai_evaluations e ON e.item_id = i.id
        WHERE i.archived_at IS NULL
          AND datetime(i.published_at) >= datetime('now', '-24 hours')
        ORDER BY i.priority_score DESC, i.published_at DESC, i.id DESC
        LIMIT ?
      `).all(limit) as ItemJoinedRow[];
      return rows
        .map(mapItem)
        .filter((item) => !isLowQualityResult({ title: item.title, url: item.url, summary: item.summary }));
    },
    unreadCount(): number {
      return this.list(1000).filter((item) => item.status === "new" && item.readAt === null).length;
    },
    archived(limit = 100): HotspotItem[] {
      const rows = getDb().prepare(`SELECT
        i.*,
        i.interaction_likes,
        i.interaction_reposts,
        i.interaction_replies,
        i.interaction_views,
        i.interaction_danmaku,
        i.interaction_quotes,
        i.author_name,
        i.author_followers,
        i.author_verified,
        s.reliability_tier AS source_reliability,
        s.community_source AS source_community,
        e.relevance_score,
        e.credibility_score,
        e.novelty_score,
        e.hotness_score,
        e.is_impersonation_likely,
        e.summary AS ai_summary,
        e.reason,
        e.recommended_action,
        (SELECT json_group_array(DISTINCT provider_type) FROM item_evidence WHERE item_id = i.id) AS evidence_providers,
        (SELECT json_group_array(DISTINCT source_name) FROM item_evidence WHERE item_id = i.id) AS evidence_source_names
      FROM items i
      LEFT JOIN sources s ON s.id = i.source_id
      LEFT JOIN ai_evaluations e ON e.item_id = i.id
      WHERE i.archived_at IS NOT NULL
      ORDER BY i.archived_at DESC, i.id DESC
      LIMIT ?`).all(limit) as ItemJoinedRow[];
      return rows.map(mapItem);
    },
    restore(id: number) {
      return getDb().prepare("UPDATE items SET archived_at = NULL WHERE id = ?").run(id).changes > 0;
    },
    batchRestore(ids: number[]) {
      if (ids.length === 0) return 0;
      const placeholders = ids.map(() => '?').join(',');
      return getDb().prepare("UPDATE items SET archived_at = NULL WHERE id IN (" + placeholders + ")").run(...ids).changes;
    },
    batchDelete(ids: number[]) {
      if (ids.length === 0) return 0;
      const placeholders = ids.map(() => '?').join(',');
      return getDb().prepare("DELETE FROM items WHERE id IN (" + placeholders + ")").run(...ids).changes;
    },
    archiveOldReadItems() {
      return this.archiveStaleItems();
    },
    archiveStaleItems() {
      const db = getDb();
      const demoted = db.prepare(`
        UPDATE items
        SET status = 'watch'
        WHERE status = 'new'
          AND archived_at IS NULL
          AND datetime(published_at) < datetime('now', '-24 hours')
      `).run().changes;
      const archived = db.prepare(`
        UPDATE items
        SET archived_at = CURRENT_TIMESTAMP
        WHERE archived_at IS NULL
          AND datetime(published_at) < datetime('now', '-24 hours')
          AND (read_at IS NOT NULL OR status IN ('watch', 'ignored'))
      `).run().changes;
      return demoted + archived;
    },
    byId(id: number): HotspotItem | null {
      const row = getDb().prepare(`
        SELECT
          i.*,
          s.reliability_tier AS source_reliability,
          s.community_source AS source_community,
          e.relevance_score,
          e.credibility_score,
          e.novelty_score,
          e.hotness_score,
          e.is_impersonation_likely,
          e.summary AS ai_summary,
          e.reason,
          e.recommended_action,
          e.keyword_mentioned,
          e.relevance_summary,
          (
            SELECT json_group_array(DISTINCT provider_type)
            FROM item_evidence
            WHERE item_id = i.id
          ) AS evidence_providers,
          (
            SELECT json_group_array(DISTINCT source_name)
            FROM item_evidence
            WHERE item_id = i.id
          ) AS evidence_source_names
        FROM items i
        LEFT JOIN sources s ON s.id = i.source_id
        LEFT JOIN ai_evaluations e ON e.item_id = i.id
        WHERE i.id = ?
      `).get(id) as ItemJoinedRow | undefined;
      return row ? mapItem(row) : null;
    },
    insert(input: RawItemInput): { id: number; inserted: boolean } | null {
      const db = getDb();
      const similarId = findSimilarItemId(db, input);
      if (similarId) {
        mergeItemEvidence(db, similarId, input);
        return { id: similarId, inserted: false };
      }

      try {
        const info = db.prepare(`
          INSERT INTO items (
            source_id, keyword_id, title, url, normalized_url, summary,
            published_at, fetched_at, matched_keyword, status,
            quality_score, quality_signals, evidence_count,
            interaction_likes, interaction_reposts, interaction_replies, interaction_views,
            interaction_danmaku, interaction_quotes,
            summary_source, interaction_source,
            author_name, author_followers, author_verified
          ) VALUES (
            @sourceId, @keywordId, @title, @url, @normalizedUrl, @summary,
            @publishedAt, @fetchedAt, @matchedKeyword, 'watch',
            @qualityScore, @qualitySignalsJson, 1,
            @interactionLikes, @interactionReposts, @interactionReplies, @interactionViews,
            @interactionDanmaku, @interactionQuotes,
            @summarySource, @interactionSource,
            @authorName, @authorFollowers, @authorVerified
          )
        `).run({
          ...input,
          qualitySignalsJson: JSON.stringify(input.qualitySignals),
          summarySource: input.summarySource ?? "rss",
          interactionSource: input.interactionSource ?? "none",
          interactionDanmaku: input.interactionDanmaku ?? 0,
          interactionQuotes: input.interactionQuotes ?? 0,
          authorName: input.authorName ?? null,
          authorFollowers: input.authorFollowers ?? 0,
          authorVerified: input.authorVerified ? 1 : 0
        });
        const itemId = Number(info.lastInsertRowid);
        mergeItemEvidence(db, itemId, input);
        return { id: itemId, inserted: true };
      } catch (error) {
        if (error instanceof Error && error.message.includes("UNIQUE")) {
          const row = db.prepare("SELECT id FROM items WHERE normalized_url = ?").get(input.normalizedUrl) as { id: number } | undefined;
          if (!row) return null;
          mergeItemEvidence(db, row.id, input);
          return { id: row.id, inserted: false };
        }
        throw error;
      }
    },
    markRead(id: number) {
      return getDb().prepare("UPDATE items SET read_at = CURRENT_TIMESTAMP WHERE id = ?").run(id).changes > 0;
    },
    updateStatus(id: number, status: HotspotItem["status"]) {
      getDb().prepare("UPDATE items SET status = ? WHERE id = ?").run(status, id);
    },
    addEvaluation(itemId: number, evaluation: AiEvaluation) {
      getDb().prepare(`
        INSERT INTO ai_evaluations (
          item_id, relevance_score, credibility_score, novelty_score, hotness_score,
          is_impersonation_likely, summary, reason, recommended_action,
          keyword_mentioned, relevance_summary, raw_json
        ) VALUES (
          @itemId, @relevanceScore, @credibilityScore, @noveltyScore, @hotnessScore,
          @isImpersonationLikely, @summary, @reason, @recommendedAction,
          @keywordMentioned, @relevanceSummary, @rawJson
        )
        ON CONFLICT(item_id) DO UPDATE SET
          relevance_score = excluded.relevance_score,
          credibility_score = excluded.credibility_score,
          novelty_score = excluded.novelty_score,
          hotness_score = excluded.hotness_score,
          is_impersonation_likely = excluded.is_impersonation_likely,
          summary = excluded.summary,
          reason = excluded.reason,
          recommended_action = excluded.recommended_action,
          keyword_mentioned = excluded.keyword_mentioned,
          relevance_summary = excluded.relevance_summary,
          raw_json = excluded.raw_json
      `).run({
        itemId,
        relevanceScore: evaluation.relevanceScore,
        credibilityScore: evaluation.credibilityScore,
        noveltyScore: evaluation.noveltyScore,
        hotnessScore: evaluation.hotnessScore,
        isImpersonationLikely: Number(evaluation.isImpersonationLikely),
        summary: evaluation.summary,
        reason: evaluation.reason,
        recommendedAction: evaluation.recommendedAction,
        keywordMentioned: evaluation.keywordMentioned ? 1 : 0,
        relevanceSummary: evaluation.relevanceSummary ?? "",
        rawJson: JSON.stringify(evaluation)
      });
    }
  },
  scanRuns: {
    start(): number {
      const info = getDb().prepare("INSERT INTO scan_runs (started_at, status) VALUES (?, 'running')").run(new Date().toISOString());
      return Number(info.lastInsertRowid);
    },
    finish(id: number, status: "success" | "failed", totals: { fetched: number; inserted: number; evaluated: number; error?: string }) {
      getDb().prepare(`
        UPDATE scan_runs
        SET finished_at = ?, status = ?, total_fetched = ?, total_inserted = ?, total_evaluated = ?, error = ?
        WHERE id = ?
      `).run(new Date().toISOString(), status, totals.fetched, totals.inserted, totals.evaluated, totals.error ?? null, id);
    },
    last(): ScanRun | null {
      const row = getDb().prepare("SELECT * FROM scan_runs ORDER BY id DESC LIMIT 1").get() as ScanRunRow | undefined;
      return row ? mapScanRun(row) : null;
    }
  }
};

interface KeywordRow {
  id: number;
  term: string;
  scope: string;
  enabled: number;
  account_mode: number;
  account_platform: string;
  account_uid: string;
  account_url: string;
  created_at: string;
}

interface SourceRow {
  id: number;
  name: string;
  url: string;
  category: string;
  provider_type: ProviderType;
  reliability_tier: ReliabilityTier;
  community_source: number;
  min_quality_score: number;
  enabled: number;
  builtin: number;
  created_at: string;
}

interface ScanRunRow {
  id: number;
  started_at: string;
  finished_at: string | null;
  status: "running" | "success" | "failed";
  total_fetched: number;
  total_inserted: number;
  total_evaluated: number;
  error: string | null;
}

interface ItemJoinedRow {
  id: number;
  source_id: number | null;
  keyword_id: number | null;
  title: string;
  url: string;
  normalized_url: string;
  summary: string;
  published_at: string;
  fetched_at: string;
  matched_keyword: string;
  read_at: string | null;
  status: "new" | "watch" | "ignored";
  quality_score: number;
  quality_signals: string;
  evidence_count: number;
  interaction_likes: number;
  interaction_reposts: number;
  interaction_replies: number;
  interaction_views: number;
  interaction_danmaku: number;
  interaction_quotes: number;
  summary_source: string;
  interaction_source: string;
  priority_score: number;
  freshness_score: number;
  author_name: string | null;
  author_followers: number;
  author_verified: number;
  source_reliability: ReliabilityTier | null;
  source_community: number | null;
  relevance_score: number | null;
  credibility_score: number | null;
  novelty_score: number | null;
  hotness_score: number | null;
  is_impersonation_likely: number | null;
  ai_summary: string | null;
  reason: string | null;
  recommended_action: "notify" | "watch" | "ignore" | null;
  keyword_mentioned: number | null;
  relevance_summary: string | null;
  evidence_providers: string | null;
  evidence_source_names: string | null;
}

function mapKeyword(row: KeywordRow): Keyword {
  return {
    id: row.id,
    term: row.term,
    scope: row.scope,
    enabled: Boolean(row.enabled),
    accountMode: Boolean(row.account_mode),
    accountPlatform: row.account_platform ?? "",
    accountUid: row.account_uid ?? "",
    accountUrl: row.account_url ?? "",
    createdAt: row.created_at
  };
}

function mapSource(row: SourceRow): Source {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    category: row.category,
    providerType: parseProviderType(row.provider_type),
    reliabilityTier: parseReliabilityTier(row.reliability_tier),
    communitySource: Boolean(row.community_source),
    minQualityScore: row.min_quality_score,
    enabled: Boolean(row.enabled),
    builtin: Boolean(row.builtin),
    createdAt: row.created_at
  };
}

function mapScanRun(row: ScanRunRow): ScanRun {
  return {
    id: row.id,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    status: row.status,
    totalFetched: row.total_fetched,
    totalInserted: row.total_inserted,
    totalEvaluated: row.total_evaluated,
    error: row.error
  };
}

function mapItem(row: ItemJoinedRow): HotspotItem {
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

function inferProviderType(url: string): ProviderType {
  if (/news\.google\.com\/rss/i.test(url)) return "google_news";
  return "rss";
}

function parseProviderType(value: string): ProviderType {
  if (value === "google_news" || value === "brave_search" || value === "bilibili_search" || value === "weibo_hot") return value;
  return "rss";
}

function parseReliabilityTier(value: string): ReliabilityTier {
  if (value === "official" || value === "community" || value === "search") return value;
  return "trusted";
}

function parseSummarySource(value: string): SummarySource {
  if (value === "ai" || value === "metadata" || value === "title") return value;
  return "rss";
}

function parseInteractionSource(value: string): InteractionSource {
  if (value === "bilibili" || value === "html" || value === "rss") return value;
  return "none";
}

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map((entry) => String(entry)).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function findSimilarItemId(db: Database.Database, input: RawItemInput): number | null {
  const rows = db.prepare(`
    SELECT id, title, published_at
    FROM items
    WHERE keyword_id = ?
    ORDER BY id DESC
    LIMIT 120
  `).all(input.keywordId) as Array<{ id: number; title: string; published_at: string }>;

  const inputTime = new Date(input.publishedAt).getTime();
  for (const row of rows) {
    const rowTime = new Date(row.published_at).getTime();
    const closeInTime = Number.isNaN(inputTime) || Number.isNaN(rowTime) || Math.abs(inputTime - rowTime) <= 36 * 60 * 60 * 1000;
    if (closeInTime && titleSimilarity(row.title, input.title) >= 0.62) return row.id;
  }
  return null;
}

function mergeItemEvidence(db: Database.Database, itemId: number, input: RawItemInput) {
  const source = repositories.sources.byId(input.sourceId);
  db.prepare(`
    INSERT INTO item_evidence (
      item_id, provider_type, source_id, source_name, query, rank,
      original_url, normalized_url, domain, title, summary, published_at
    ) VALUES (
      @itemId, @providerType, @sourceId, @sourceName, @query, @rank,
      @url, @normalizedUrl, @domain, @title, @summary, @publishedAt
    )
    ON CONFLICT(item_id, provider_type, source_id, normalized_url) DO UPDATE SET
      rank = MIN(rank, excluded.rank),
      summary = CASE WHEN length(excluded.summary) > length(summary) THEN excluded.summary ELSE summary END
  `).run({
    ...input,
    itemId,
    sourceName: source?.name ?? "未知来源",
    domain: hostname(input.normalizedUrl)
  });

  const row = db.prepare("SELECT COUNT(*) AS count FROM item_evidence WHERE item_id = ?").get(itemId) as { count: number };
  db.prepare(`
    UPDATE items
    SET
      evidence_count = ?,
      quality_score = MAX(quality_score, ?),
      quality_signals = CASE
        WHEN ? > quality_score THEN ?
        ELSE quality_signals
      END
    WHERE id = ?
  `).run(row.count, input.qualityScore, input.qualityScore, JSON.stringify(input.qualitySignals), itemId);
}

interface AccountInfo {
  accountMode: boolean;
  accountPlatform: string;
  accountUid: string;
  accountUrl: string;
}

function detectAccountInfo(term: string): AccountInfo {
  const url = extractUrlLike(term);
  const bilibiliUid = extractBilibiliUid(term);
  if (bilibiliUid) {
    return {
      accountMode: true,
      accountPlatform: "bilibili",
      accountUid: bilibiliUid,
      accountUrl: url
    };
  }

  const accountPatterns = [
    /公司$/,
    /团队$/,
    /工作室$/,
    /官方$/,
    /游戏$/,
    /科技$/,
    /平台$/,
    /引擎$/,
  ];
  if (accountPatterns.some(p => p.test(term))) {
    return { accountMode: true, accountPlatform: "", accountUid: "", accountUrl: url };
  }
  // 短中文关键词且无空格，可能是组织名
  const chineseOnly = term.replace(/[^\u4e00-\u9fff]/g, "");
  if (chineseOnly.length >= 2 && chineseOnly.length <= 3 && !term.includes(" ")) {
    return { accountMode: true, accountPlatform: "", accountUid: "", accountUrl: url };
  }
  return { accountMode: false, accountPlatform: "", accountUid: "", accountUrl: url };
}

function extractUrlLike(value: string): string {
  const match = value.match(/https?:\/\/\S+/i);
  return match?.[0] ?? "";
}

function extractBilibiliUid(value: string): string {
  const spaceMatch = value.match(/space\.bilibili\.com\/(\d+)/i);
  if (spaceMatch) return spaceMatch[1];
  const uidMatch = value.match(/\buid[:：\s]*(\d{3,})\b/i);
  if (uidMatch) return uidMatch[1];
  return "";
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}
