import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getEnv } from "./config/env";
import { getDb, repositories } from "./db/client";
import { runScan } from "./services/scanner";

const app = express();
const env = getEnv();

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  getDb();
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/dashboard", (_req, res) => {
  res.json(getDashboard());
});

app.get("/api/settings", (_req, res) => {
  res.json(repositories.settings.all());
});

app.patch("/api/settings", (req, res) => {
  const { aiMode, scanIntervalMinutes } = req.body as { aiMode?: string; scanIntervalMinutes?: number };
  if (aiMode && !["openrouter", "mock"].includes(aiMode)) {
    return res.status(400).json({ error: "Invalid aiMode" });
  }
  if (aiMode) repositories.settings.set("aiMode", aiMode);
  if (typeof scanIntervalMinutes === "number") {
    if (scanIntervalMinutes < 5 || scanIntervalMinutes > 1440) {
      return res.status(400).json({ error: "scanIntervalMinutes must be 5-1440" });
    }
    repositories.settings.set("scanIntervalMinutes", String(Math.round(scanIntervalMinutes)));
  }
  return res.json(repositories.settings.all());
});

app.get("/api/keywords", (_req, res) => {
  res.json(repositories.keywords.all());
});

app.post("/api/keywords", (req, res) => {
  const { term, scope } = req.body as { term?: string; scope?: string };
  if (!term?.trim()) return res.status(400).json({ error: "term is required" });
  return res.status(201).json(repositories.keywords.create(term, scope ?? ""));
});

app.patch("/api/keywords/:id", (req, res) => {
  const item = repositories.keywords.update(Number(req.params.id), req.body);
  if (!item) return res.status(404).json({ error: "Keyword not found" });
  return res.json(item);
});

app.delete("/api/keywords/:id", (req, res) => {
  return res.json({ ok: repositories.keywords.delete(Number(req.params.id)) });
});

app.get("/api/sources", (_req, res) => {
  res.json(repositories.sources.all());
});

app.post("/api/sources", (req, res) => {
  const { name, url, category } = req.body as { name?: string; url?: string; category?: string };
  if (!name?.trim() || !url?.trim()) return res.status(400).json({ error: "name and url are required" });
  return res.status(201).json(repositories.sources.create({ name, url, category: category ?? "自定义" }));
});

app.patch("/api/sources/:id", (req, res) => {
  const item = repositories.sources.update(Number(req.params.id), req.body);
  if (!item) return res.status(404).json({ error: "Source not found" });
  return res.json(item);
});

app.delete("/api/sources/:id", (req, res) => {
  return res.json({ ok: repositories.sources.delete(Number(req.params.id)) });
});

app.get("/api/items", (req, res) => {
  const limit = Number(req.query.limit ?? 80);
  res.json(repositories.items.list(limit));
});

app.patch("/api/items/:id/read", (req, res) => {
  const ok = repositories.items.markRead(Number(req.params.id));
  res.json({ ok, unreadCount: visibleUnreadCount(repositories.items.list()) });
});

app.get("/api/items/archived", (req, res) => {
  const limit = Number(req.query.limit ?? 100);
  res.json(repositories.items.archived(limit));
});

app.post("/api/items/:id/restore", (req, res) => {
  res.json({ ok: repositories.items.restore(Number(req.params.id)) });
});

app.post("/api/items/batch-restore", (req, res) => {
  const { ids } = req.body as { ids?: number[] };
  if (!ids?.length) return res.status(400).json({ error: "ids is required" });
  res.json({ ok: repositories.items.batchRestore(ids) });
});

app.post("/api/items/batch-delete", (req, res) => {
  const { ids } = req.body as { ids?: number[] };
  if (!ids?.length) return res.status(400).json({ error: "ids is required" });
  res.json({ ok: repositories.items.batchDelete(ids) });
});

app.post("/api/items/archive-stale", (_req, res) => {
  const ok = repositories.items.archiveStaleItems();
  res.json({ ok, unreadCount: visibleUnreadCount(repositories.items.list()) });
});

app.post("/api/scan", async (_req, res, next) => {
  try {
    const result = await runScan();
    res.json({ result, dashboard: getDashboard() });
  } catch (error) {
    next(error);
  }
});

serveFrontendInProduction();

app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.path}` });
});

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: error.message });
});

app.listen(env.port, "127.0.0.1", () => {
  console.log(`API listening on http://127.0.0.1:${env.port}`);
});

function getDashboard() {
  const items = repositories.items.list();
  return {
    settings: repositories.settings.all(),
    keywords: repositories.keywords.all(),
    sources: repositories.sources.all(),
    items,
    lastScan: repositories.scanRuns.last(),
    unreadCount: visibleUnreadCount(items)
  };
}

function visibleUnreadCount(items: Array<{ status: string; readAt: string | null; archivedAt?: string | null }>) {
  return items.filter((item) => item.status === "new" && item.readAt === null && !item.archivedAt).length;
}

function serveFrontendInProduction() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const dist = path.resolve(__dirname, "../dist");
  app.use(express.static(dist));
  app.get("*splat", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(dist, "index.html"), (error) => {
      if (error) next();
    });
  });
}
