import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getEnv } from "./config/env";
import { repos, initDb } from "./db/index";
import { runScan } from "./services/scanner";
import { generateBriefing } from "./services/ai";

const app = express();
const env = getEnv();

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (_req, res) => {
  await initDb();
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/dashboard", async (_req, res) => {
  res.json(await getDashboard());
});

app.get("/api/settings", async (_req, res) => {
  res.json(await repos.settings.all());
});

app.patch("/api/settings", async (req, res) => {
  const { aiMode, scanIntervalMinutes } = req.body as { aiMode?: string; scanIntervalMinutes?: number };
  if (aiMode && !["openrouter", "mock"].includes(aiMode)) {
    return res.status(400).json({ error: "Invalid aiMode" });
  }
  if (aiMode) await repos.settings.set("aiMode", aiMode);
  if (typeof scanIntervalMinutes === "number") {
    if (scanIntervalMinutes < 5 || scanIntervalMinutes > 1440) {
      return res.status(400).json({ error: "scanIntervalMinutes must be 5-1440" });
    }
    await repos.settings.set("scanIntervalMinutes", String(Math.round(scanIntervalMinutes)));
  }
  return res.json(await repos.settings.all());
});

app.get("/api/keywords", async (_req, res) => {
  res.json(await repos.keywords.all());
});

app.post("/api/keywords", async (req, res) => {
  const { term, scope } = req.body as { term?: string; scope?: string };
  if (!term?.trim()) return res.status(400).json({ error: "term is required" });
  return res.status(201).json(await repos.keywords.create(term, scope ?? ""));
});

app.patch("/api/keywords/:id", async (req, res) => {
  const item = await repos.keywords.update(Number(req.params.id), req.body);
  if (!item) return res.status(404).json({ error: "Keyword not found" });
  return res.json(item);
});

app.delete("/api/keywords/:id", async (req, res) => {
  return res.json({ ok: await repos.keywords.delete(Number(req.params.id)) });
});

app.get("/api/sources", async (_req, res) => {
  res.json(await repos.sources.all());
});

app.post("/api/sources", async (req, res) => {
  const { name, url, category } = req.body as { name?: string; url?: string; category?: string };
  if (!name?.trim() || !url?.trim()) return res.status(400).json({ error: "name and url are required" });
  return res.status(201).json(await repos.sources.create({ name, url, category: category ?? "自定义" }));
});

app.patch("/api/sources/:id", async (req, res) => {
  const item = await repos.sources.update(Number(req.params.id), req.body);
  if (!item) return res.status(404).json({ error: "Source not found" });
  return res.json(item);
});

app.delete("/api/sources/:id", async (req, res) => {
  return res.json({ ok: await repos.sources.delete(Number(req.params.id)) });
});

app.get("/api/items", async (req, res) => {
  const limit = Number(req.query.limit ?? 80);
  res.json(await repos.items.list(limit));
});

app.patch("/api/items/:id/read", async (req, res) => {
  const ok = await repos.items.markRead(Number(req.params.id));
  const items = await repos.items.list();
  res.json({ ok, unreadCount: visibleUnreadCount(items) });
});

app.get("/api/items/archived", async (req, res) => {
  const limit = Number(req.query.limit ?? 100);
  res.json(await repos.items.archived(limit));
});

app.post("/api/items/:id/restore", async (req, res) => {
  res.json({ ok: await repos.items.restore(Number(req.params.id)) });
});

app.post("/api/items/batch-restore", async (req, res) => {
  const { ids } = req.body as { ids?: number[] };
  if (!ids?.length) return res.status(400).json({ error: "ids is required" });
  res.json({ ok: await repos.items.batchRestore(ids) });
});

app.post("/api/items/batch-delete", async (req, res) => {
  const { ids } = req.body as { ids?: number[] };
  if (!ids?.length) return res.status(400).json({ error: "ids is required" });
  res.json({ ok: await repos.items.batchDelete(ids) });
});

app.post("/api/items/archive-stale", async (_req, res) => {
  const ok = await repos.items.archiveStaleItems();
  const items = await repos.items.list();
  res.json({ ok, unreadCount: visibleUnreadCount(items) });
});

app.get("/api/summary", async (_req, res) => {
  try {
    const items = (await repos.items.list()).map((item) => ({
      title: item.title,
      summary: item.summary,
      matchedKeyword: item.matchedKeyword,
      priorityScore: item.priorityScore
    }));
    const briefing = await generateBriefing(items);
    res.json({ briefing });
  } catch (error) {
    res.json({ briefing: "简报生成失败，请稍后重试。" });
  }
});

app.post("/api/scan", async (_req, res, next) => {
  try {
    const result = await runScan();
    res.json({ result, dashboard: await getDashboard() });
  } catch (error) {
    next(error);
  }
});

if (!process.env.VERCEL) {
  serveFrontendInProduction();
}

app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.path}` });
});

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: error.message });
});

if (!process.env.VERCEL) {
  app.listen(env.port, "127.0.0.1", () => {
    console.log(`API listening on http://127.0.0.1:${env.port}`);
  });
}

export default app;

async function getDashboard() {
  const items = await repos.items.list();
  return {
    settings: await repos.settings.all(),
    keywords: await repos.keywords.all(),
    sources: await repos.sources.all(),
    items,
    lastScan: await repos.scanRuns.last(),
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
