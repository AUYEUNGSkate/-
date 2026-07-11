import { Hono } from "hono";
import { initEnv } from "../../server/config/env";
import { repos, initDb } from "../../server/db/cf-index";
import { runScan } from "../../server/services/scanner";
import { generateBriefing } from "../../server/services/ai";

const app = new Hono();

// Init env from Cloudflare bindings on first request
let envInitialized = false;

app.use("*", async (c, next) => {
  if (!envInitialized) {
    initEnv(c.env as Record<string, string>);
    await initDb();
    envInitialized = true;
  }
  await next();
});

app.get("/api/health", async (c) => {
  return c.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/dashboard", async (c) => {
  const items = await repos.items.list();
  return c.json({
    settings: await repos.settings.all(),
    keywords: await repos.keywords.all(),
    sources: await repos.sources.all(),
    items,
    lastScan: await repos.scanRuns.last(),
    unreadCount: items.filter((i) => i.status === "new" && !i.readAt).length,
  });
});

app.get("/api/settings", async (c) => {
  return c.json(await repos.settings.all());
});

app.patch("/api/settings", async (c) => {
  const body = await c.req.json<{ aiMode?: string; scanIntervalMinutes?: number }>();
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
  const body = await c.req.json<{ term?: string; scope?: string }>();
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
  const body = await c.req.json<{ name?: string; url?: string; category?: string }>();
  if (!body.name?.trim() || !body.url?.trim()) return c.json({ error: "name and url are required" }, 400);
  const src = await repos.sources.create({ name: body.name, url: body.url, category: body.category ?? "自定义" });
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
  const { ids } = await c.req.json<{ ids?: number[] }>();
  if (!ids?.length) return c.json({ error: "ids is required" }, 400);
  return c.json({ ok: await repos.items.batchRestore(ids) });
});

app.post("/api/items/batch-delete", async (c) => {
  const { ids } = await c.req.json<{ ids?: number[] }>();
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
      priorityScore: item.priorityScore,
    }));
    const briefing = await generateBriefing(items);
    return c.json({ briefing });
  } catch {
    return c.json({ briefing: "简报生成失败，请稍后重试。" });
  }
});

app.post("/api/scan", async (c) => {
  try {
    const result = await runScan();
    const items = await repos.items.list();
    return c.json({
      result,
      dashboard: {
        settings: await repos.settings.all(),
        keywords: await repos.keywords.all(),
        sources: await repos.sources.all(),
        items,
        lastScan: await repos.scanRuns.last(),
        unreadCount: items.filter((i) => i.status === "new" && !i.readAt).length,
      },
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.all("*", (c) => c.json({ error: `Not found: ${c.req.path}` }, 404));

export const onRequest = app.fetch;
