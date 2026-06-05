import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type { AiEvaluation, AiMode, HotspotItem, Keyword, ScanRun, Source } from "../../shared/types";
import { getEnv } from "../config/env";
import { cleanArticleTitle, cleanSummary, isLowQualityResult } from "../services/contentFilter";

export interface RawItemInput {
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

export interface SourceInput {
  name: string;
  url: string;
  category: string;
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
  `);
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

export function getDefaultSources(): Required<SourceInput>[] {
  return [
    {
      name: "国内综合新闻",
      url: "https://news.google.com/rss/search?q={query}%20(%E6%B8%B8%E6%88%8F%20OR%20%E6%89%8B%E6%B8%B8%20OR%20%E5%8E%82%E5%95%86%20OR%20%E7%89%88%E5%8F%B7)&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "国内综合",
      enabled: true,
      builtin: true
    },
    {
      name: "微博热点",
      url: "https://news.google.com/rss/search?q={query}%20site%3Aweibo.com&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "国内平台",
      enabled: true,
      builtin: true
    },
    {
      name: "B站内容",
      url: "https://news.google.com/rss/search?q={query}%20site%3Abilibili.com&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "国内平台",
      enabled: true,
      builtin: true
    },
    {
      name: "TapTap 社区",
      url: "https://news.google.com/rss/search?q={query}%20site%3Ataptap.cn&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "国内平台",
      enabled: true,
      builtin: true
    },
    {
      name: "知乎讨论",
      url: "https://news.google.com/rss/search?q={query}%20site%3Azhihu.com&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "国内平台",
      enabled: true,
      builtin: true
    },
    {
      name: "微信公众号文章",
      url: "https://news.google.com/rss/search?q={query}%20site%3Amp.weixin.qq.com&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "国内平台",
      enabled: true,
      builtin: true
    },
    {
      name: "百度贴吧讨论",
      url: "https://news.google.com/rss/search?q={query}%20site%3Atieba.baidu.com&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "国内平台",
      enabled: true,
      builtin: true
    },
    {
      name: "国内游戏媒体",
      url: "https://news.google.com/rss/search?q={query}%20(%E6%B8%B8%E6%88%8F%E8%91%A1%E8%90%84%20OR%20%E7%AB%9E%E6%A0%B8%20OR%20%E6%B8%B8%E7%A0%94%E7%A4%BE%20OR%20%E8%A7%A6%E4%B9%90)&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "国内媒体",
      enabled: true,
      builtin: true
    }
  ];
}

function ensureDefaultSources(db: Database.Database) {
  const findByName = db.prepare("SELECT id FROM sources WHERE name = ?");
  const insertSource = db.prepare(`
    INSERT INTO sources (name, url, category, enabled, builtin)
    VALUES (@name, @url, @category, @enabled, @builtin)
  `);
  const updateSource = db.prepare(`
    UPDATE sources
    SET url = @url, category = @category, enabled = @enabled, builtin = 1
    WHERE id = @id
  `);
  const upsertDefaults = db.transaction((sources: Required<SourceInput>[]) => {
    for (const source of sources) {
      const row = findByName.get(source.name) as { id: number } | undefined;
      const payload = {
        ...source,
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
      const info = getDb().prepare("INSERT INTO keywords (term, scope) VALUES (?, ?)").run(term.trim(), scope.trim());
      return this.byId(Number(info.lastInsertRowid))!;
    },
    update(id: number, input: Partial<Pick<Keyword, "term" | "scope" | "enabled">>): Keyword | null {
      const current = this.byId(id);
      if (!current) return null;
      getDb().prepare("UPDATE keywords SET term = ?, scope = ?, enabled = ? WHERE id = ?").run(
        input.term?.trim() ?? current.term,
        input.scope?.trim() ?? current.scope,
        typeof input.enabled === "boolean" ? Number(input.enabled) : Number(current.enabled),
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
        INSERT INTO sources (name, url, category, enabled, builtin)
        VALUES (@name, @url, @category, @enabled, @builtin)
      `).run({
        name: input.name.trim(),
        url: input.url.trim(),
        category: input.category.trim() || "自定义",
        enabled: Number(input.enabled ?? true),
        builtin: Number(input.builtin ?? false)
      });
      return this.byId(Number(info.lastInsertRowid))!;
    },
    update(id: number, input: Partial<Omit<Source, "id" | "createdAt">>): Source | null {
      const current = this.byId(id);
      if (!current) return null;
      getDb().prepare(`
        UPDATE sources SET name = ?, url = ?, category = ?, enabled = ? WHERE id = ?
      `).run(
        input.name?.trim() ?? current.name,
        input.url?.trim() ?? current.url,
        input.category?.trim() ?? current.category,
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
          e.relevance_score,
          e.credibility_score,
          e.novelty_score,
          e.hotness_score,
          e.is_impersonation_likely,
          e.summary AS ai_summary,
          e.reason,
          e.recommended_action
        FROM items i
        LEFT JOIN ai_evaluations e ON e.item_id = i.id
        ORDER BY i.read_at IS NOT NULL, i.published_at DESC, i.id DESC
        LIMIT ?
      `).all(limit) as ItemJoinedRow[];
      return rows
        .map(mapItem)
        .filter((item) => !isLowQualityResult({ title: item.title, url: item.url, summary: item.summary }));
    },
    unreadCount(): number {
      const row = getDb().prepare("SELECT COUNT(*) AS count FROM items WHERE read_at IS NULL AND status = 'new'").get() as { count: number };
      return row.count;
    },
    insert(input: RawItemInput): number | null {
      try {
        const info = getDb().prepare(`
          INSERT INTO items (
            source_id, keyword_id, title, url, normalized_url, summary,
            published_at, fetched_at, matched_keyword, status
          ) VALUES (
            @sourceId, @keywordId, @title, @url, @normalizedUrl, @summary,
            @publishedAt, @fetchedAt, @matchedKeyword, 'watch'
          )
        `).run(input);
        return Number(info.lastInsertRowid);
      } catch (error) {
        if (error instanceof Error && error.message.includes("UNIQUE")) return null;
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
          is_impersonation_likely, summary, reason, recommended_action, raw_json
        ) VALUES (
          @itemId, @relevanceScore, @credibilityScore, @noveltyScore, @hotnessScore,
          @isImpersonationLikely, @summary, @reason, @recommendedAction, @rawJson
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
  created_at: string;
}

interface SourceRow {
  id: number;
  name: string;
  url: string;
  category: string;
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
  relevance_score: number | null;
  credibility_score: number | null;
  novelty_score: number | null;
  hotness_score: number | null;
  is_impersonation_likely: number | null;
  ai_summary: string | null;
  reason: string | null;
  recommended_action: "notify" | "watch" | "ignore" | null;
}

function mapKeyword(row: KeywordRow): Keyword {
  return {
    id: row.id,
    term: row.term,
    scope: row.scope,
    enabled: Boolean(row.enabled),
    createdAt: row.created_at
  };
}

function mapSource(row: SourceRow): Source {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    category: row.category,
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
    evaluation: row.relevance_score === null ? null : {
      relevanceScore: row.relevance_score,
      credibilityScore: row.credibility_score ?? 0,
      noveltyScore: row.novelty_score ?? 0,
      hotnessScore: row.hotness_score ?? 0,
      isImpersonationLikely: Boolean(row.is_impersonation_likely),
      summary: cleanSummary(row.ai_summary ?? ""),
      reason: cleanSummary(row.reason ?? ""),
      recommendedAction: row.recommended_action ?? "watch"
    }
  };
}
