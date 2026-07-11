import { repositories as syncRepos, getDb } from "./client";
import { tursoRepos, initTursoDb } from "./turso";
import type { Keyword, Source, HotspotItem, AppSettings, ScanRun } from "../../shared/types";
import type { RawItemInput, SourceInput } from "./client";
import type { AiEvaluation } from "../../shared/types";

let initialized = false;

function useTurso(): boolean {
  return Boolean(
    (typeof process !== "undefined" && process.env?.TURSO_URL) ||
    (typeof process !== "undefined" && process.env?.VERCEL)
  );
}

export async function initDb() {
  if (initialized) return;
  if (useTurso()) {
    await initTursoDb();
  } else {
    getDb();
  }
  initialized = true;
}

export const repos = {
  settings: {
    async all(): Promise<AppSettings> { return useTurso() ? tursoRepos.settings.all() : syncRepos.settings.all(); },
    async set(key: string, value: string): Promise<void> { if (useTurso()) await tursoRepos.settings.set(key, value); else syncRepos.settings.set(key, value); }
  },
  keywords: {
    async all(): Promise<Keyword[]> { return useTurso() ? tursoRepos.keywords.all() : syncRepos.keywords.all(); },
    async active(): Promise<Keyword[]> { return useTurso() ? tursoRepos.keywords.active() : syncRepos.keywords.active(); },
    async create(term: string, scope: string): Promise<Keyword> { return useTurso() ? tursoRepos.keywords.create(term, scope) : syncRepos.keywords.create(term, scope); },
    async update(id: number, input: any): Promise<Keyword | null> { return useTurso() ? tursoRepos.keywords.update(id, input) : syncRepos.keywords.update(id, input); },
    async delete(id: number): Promise<boolean> { return useTurso() ? tursoRepos.keywords.delete(id) : syncRepos.keywords.delete(id); },
    async byId(id: number): Promise<Keyword | null> { return useTurso() ? tursoRepos.keywords.byId(id) : syncRepos.keywords.byId(id); },
  },
  sources: {
    async all(): Promise<Source[]> { return useTurso() ? tursoRepos.sources.all() : syncRepos.sources.all(); },
    async active(): Promise<Source[]> { return useTurso() ? tursoRepos.sources.active() : syncRepos.sources.active(); },
    async create(input: SourceInput): Promise<Source> { return useTurso() ? tursoRepos.sources.create(input) : syncRepos.sources.create(input); },
    async update(id: number, input: any): Promise<Source | null> { return useTurso() ? tursoRepos.sources.update(id, input) : syncRepos.sources.update(id, input); },
    async delete(id: number): Promise<boolean> { return useTurso() ? tursoRepos.sources.delete(id) : syncRepos.sources.delete(id); },
    async byId(id: number): Promise<Source | null> { return useTurso() ? tursoRepos.sources.byId(id) : syncRepos.sources.byId(id); },
  },
  items: {
    async list(limit = 80): Promise<HotspotItem[]> { return useTurso() ? tursoRepos.items.list(limit) : syncRepos.items.list(limit); },
    async archived(limit = 100): Promise<HotspotItem[]> { return useTurso() ? tursoRepos.items.archived(limit) : syncRepos.items.archived(limit); },
    async restore(id: number): Promise<boolean> { return useTurso() ? tursoRepos.items.restore(id) : syncRepos.items.restore(id); },
    async batchRestore(ids: number[]): Promise<number> { return useTurso() ? tursoRepos.items.batchRestore(ids) : syncRepos.items.batchRestore(ids); },
    async batchDelete(ids: number[]): Promise<number> { return useTurso() ? tursoRepos.items.batchDelete(ids) : syncRepos.items.batchDelete(ids); },
    async archiveStaleItems(): Promise<number> { return useTurso() ? tursoRepos.items.archiveStaleItems() : syncRepos.items.archiveStaleItems(); },
    async byId(id: number): Promise<HotspotItem | null> { return useTurso() ? tursoRepos.items.byId(id) : syncRepos.items.byId(id); },
    async insert(input: RawItemInput): Promise<{ id: number; inserted: boolean } | null> { return useTurso() ? tursoRepos.items.insert(input) : syncRepos.items.insert(input); },
    async markRead(id: number): Promise<boolean> { return useTurso() ? tursoRepos.items.markRead(id) : syncRepos.items.markRead(id); },
    async updateStatus(id: number, status: HotspotItem["status"]): Promise<void> { if (useTurso()) await tursoRepos.items.updateStatus(id, status); else syncRepos.items.updateStatus(id, status); },
    async updatePriority(id: number, priorityScore: number, freshnessScore: number, status: string): Promise<void> { if (useTurso()) await tursoRepos.items.updatePriority(id, priorityScore, freshnessScore, status); else syncRepos.items.updatePriority(id, priorityScore, freshnessScore, status); },
    async addEvaluation(itemId: number, evaluation: AiEvaluation): Promise<void> { if (useTurso()) await tursoRepos.items.addEvaluation(itemId, evaluation); else syncRepos.items.addEvaluation(itemId, evaluation); },
  },
  scanRuns: {
    async start(): Promise<number> { return useTurso() ? tursoRepos.scanRuns.start() : syncRepos.scanRuns.start(); },
    async finish(id: number, status: "success" | "failed", totals: { fetched: number; inserted: number; evaluated: number; error?: string }): Promise<void> { if (useTurso()) await tursoRepos.scanRuns.finish(id, status, totals); else syncRepos.scanRuns.finish(id, status, totals); },
    async last(): Promise<ScanRun | null> { return useTurso() ? tursoRepos.scanRuns.last() : syncRepos.scanRuns.last(); },
  }
};

export function getDirectDb() {
  return getDb();
}
