// Async wrapper around the sync repositories for Vercel compatibility
// When process.env.VERCEL is set, uses Turso. Otherwise uses better-sqlite3 sync (wrapped).

import { repositories as syncRepos, getDb } from "./client";
import { tursoRepos, initTursoDb } from "./turso";
import type { Keyword, Source, HotspotItem, AppSettings, ScanRun } from "../../shared/types";
import type { RawItemInput, SourceInput } from "./client";
import type { AiEvaluation } from "../../shared/types";

let initialized = false;

export async function initDb() {
  if (initialized) return;
  if (process.env.VERCEL) {
    await initTursoDb();
  } else {
    getDb(); // trigger local DB init
  }
  initialized = true;
}

export const repos = {
  settings: {
    async all(): Promise<AppSettings> {
      return process.env.VERCEL ? tursoRepos.settings.all() : syncRepos.settings.all();
    },
    async set(key: string, value: string): Promise<void> {
      if (process.env.VERCEL) await tursoRepos.settings.set(key, value);
      else syncRepos.settings.set(key, value);
    }
  },
  keywords: {
    async all(): Promise<Keyword[]> { return process.env.VERCEL ? tursoRepos.keywords.all() : syncRepos.keywords.all(); },
    async active(): Promise<Keyword[]> { return process.env.VERCEL ? tursoRepos.keywords.active() : syncRepos.keywords.active(); },
    async create(term: string, scope: string): Promise<Keyword> { return process.env.VERCEL ? tursoRepos.keywords.create(term, scope) : syncRepos.keywords.create(term, scope); },
    async update(id: number, input: any): Promise<Keyword | null> { return process.env.VERCEL ? tursoRepos.keywords.update(id, input) : syncRepos.keywords.update(id, input); },
    async delete(id: number): Promise<boolean> { return process.env.VERCEL ? tursoRepos.keywords.delete(id) : syncRepos.keywords.delete(id); },
    async byId(id: number): Promise<Keyword | null> { return process.env.VERCEL ? tursoRepos.keywords.byId(id) : syncRepos.keywords.byId(id); },
  },
  sources: {
    async all(): Promise<Source[]> { return process.env.VERCEL ? tursoRepos.sources.all() : syncRepos.sources.all(); },
    async active(): Promise<Source[]> { return process.env.VERCEL ? tursoRepos.sources.active() : syncRepos.sources.active(); },
    async create(input: SourceInput): Promise<Source> { return process.env.VERCEL ? tursoRepos.sources.create(input) : syncRepos.sources.create(input); },
    async update(id: number, input: any): Promise<Source | null> { return process.env.VERCEL ? tursoRepos.sources.update(id, input) : syncRepos.sources.update(id, input); },
    async delete(id: number): Promise<boolean> { return process.env.VERCEL ? tursoRepos.sources.delete(id) : syncRepos.sources.delete(id); },
    async byId(id: number): Promise<Source | null> { return process.env.VERCEL ? tursoRepos.sources.byId(id) : syncRepos.sources.byId(id); },
  },
  items: {
    async list(limit = 80): Promise<HotspotItem[]> { return process.env.VERCEL ? tursoRepos.items.list(limit) : syncRepos.items.list(limit); },
    async archived(limit = 100): Promise<HotspotItem[]> { return process.env.VERCEL ? tursoRepos.items.archived(limit) : syncRepos.items.archived(limit); },
    async restore(id: number): Promise<boolean> { return process.env.VERCEL ? tursoRepos.items.restore(id) : syncRepos.items.restore(id); },
    async batchRestore(ids: number[]): Promise<number> { return process.env.VERCEL ? tursoRepos.items.batchRestore(ids) : syncRepos.items.batchRestore(ids); },
    async batchDelete(ids: number[]): Promise<number> { return process.env.VERCEL ? tursoRepos.items.batchDelete(ids) : syncRepos.items.batchDelete(ids); },
    async archiveStaleItems(): Promise<number> { return process.env.VERCEL ? tursoRepos.items.archiveStaleItems() : syncRepos.items.archiveStaleItems(); },
    async byId(id: number): Promise<HotspotItem | null> { return process.env.VERCEL ? tursoRepos.items.byId(id) : syncRepos.items.byId(id); },
    async insert(input: RawItemInput): Promise<{ id: number; inserted: boolean } | null> { return process.env.VERCEL ? tursoRepos.items.insert(input) : syncRepos.items.insert(input); },
    async markRead(id: number): Promise<boolean> { return process.env.VERCEL ? tursoRepos.items.markRead(id) : syncRepos.items.markRead(id); },
    async updateStatus(id: number, status: HotspotItem["status"]): Promise<void> { if (process.env.VERCEL) await tursoRepos.items.updateStatus(id, status); else syncRepos.items.updateStatus(id, status); },
    async updatePriority(id: number, priorityScore: number, freshnessScore: number, status: string): Promise<void> { if (process.env.VERCEL) await tursoRepos.items.updatePriority(id, priorityScore, freshnessScore, status); else syncRepos.items.updatePriority(id, priorityScore, freshnessScore, status); },
    async addEvaluation(itemId: number, evaluation: AiEvaluation): Promise<void> { if (process.env.VERCEL) await tursoRepos.items.addEvaluation(itemId, evaluation); else syncRepos.items.addEvaluation(itemId, evaluation); },
  },
  scanRuns: {
    async start(): Promise<number> { return process.env.VERCEL ? tursoRepos.scanRuns.start() : syncRepos.scanRuns.start(); },
    async finish(id: number, status: "success" | "failed", totals: { fetched: number; inserted: number; evaluated: number; error?: string }): Promise<void> { if (process.env.VERCEL) await tursoRepos.scanRuns.finish(id, status, totals); else syncRepos.scanRuns.finish(id, status, totals); },
    async last(): Promise<ScanRun | null> { return process.env.VERCEL ? tursoRepos.scanRuns.last() : syncRepos.scanRuns.last(); },
  }
};

// Direct DB access for scanner
export function getDirectDb() {
  return getDb();
}
