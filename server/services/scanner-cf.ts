// Cloudflare-specific scanner: split collect and AI evaluation
// Phase 1 returns immediately, Phase 2 runs in waitUntil background

import { repos } from "../db/cf-index";
import { collectFromSources } from "./collector";
import { titleSimilarity } from "./dedupe";
import { evaluateItem, computePriorityScore, computeFreshnessScore, isKeywordMentioned, computeFinalRelevance, computeKeywordRelevance } from "./ai";
import type { CollectedItem } from "./collector";

let scanning = false;

export async function runScanCollect() {
  if (scanning) return { skipped: true, reason: "scan already running" };
  scanning = true;
  const scanRunId = await repos.scanRuns.start();
  const totals = { fetched: 0, inserted: 0, evaluated: 0 };

  try {
    const keywords = await repos.keywords.active();
    let sources = await repos.sources.active();
    // Cloudflare: only RSS sources for speed
    sources = sources.filter((s) => s.providerType === "rss" && !s.name.includes("B站"));
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

export async function runScanEvaluate() {
  try {
    const keywords = await repos.keywords.active();
    const sources = await repos.sources.active();
    const allItems = await repos.items.list(50);

    // Pick top items without evaluation
    const candidates = allItems
      .filter((i) => !i.evaluation)
      .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
      .slice(0, 3);

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

    // Rescore all existing items
    const rescore = allItems.slice(0, 20);
    for (const item of rescore) {
      const priorityScore = computePriorityScore(item);
      const freshnessScore = computeFreshnessScore(item.publishedAt);
      const finalRelevance = computeFinalRelevance(item);
      let status: "new" | "watch" | "ignored";
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

function deduplicateBatch(items: CollectedItem[]): CollectedItem[] {
  const seenUrls = new Set<string>();
  const result: CollectedItem[] = [];
  for (const item of items) {
    if (seenUrls.has(item.normalizedUrl)) continue;
    seenUrls.add(item.normalizedUrl);
    const dup = result.find((e) => e.keywordId === item.keywordId && titleSimilarity(e.title, item.title) >= 0.65);
    if (dup) continue;
    result.push(item);
  }
  return result;
}
