import { repos } from "../db/index";
import { collectFromSources } from "./collector";
import { titleSimilarity } from "./dedupe";
import { evaluateItem, computePriorityScore, computeFreshnessScore, isKeywordMentioned, computeFinalRelevance, computeKeywordRelevance } from "./ai";
import type { CollectedItem } from "./collector";
import type { HotspotItem } from "../../shared/types";

let scanning = false;

export async function runScan() {
  if (scanning) {
    return { skipped: true, reason: "scan already running" };
  }

  scanning = true;
  const scanRunId = await repos.scanRuns.start();
  const totals = { fetched: 0, inserted: 0, evaluated: 0 };
  const isVercel = Boolean(process.env.VERCEL);

  try {
    const keywords = await repos.keywords.active();
    let sources = await repos.sources.active();

    if (isVercel) {
      sources = sources.filter((s) => s.providerType === "rss" && !s.name.includes("B站"));
      console.log(`[scanner] Vercel fast mode: ${sources.length} sources`);
    }

    const collected = await collectFromSources(keywords, sources);
    totals.fetched = collected.length;

    const deduped = deduplicateBatch(collected);
    console.log(`[scanner] collected=${collected.length} deduped=${deduped.length}`);

    const insertedIds: number[] = [];
    for (const raw of deduped) {
      const source = sources.find((entry) => entry.id === raw.sourceId) ?? null;
      if (source && raw.qualityScore < source.minQualityScore) continue;

      // Keyword relevance gate: skip items that don't actually mention the keyword
      const keywordRelevance = computeKeywordRelevance(raw.title, raw.summary, raw.matchedKeyword);
      if (keywordRelevance < 50) {
        console.log(`[scanner] low relevance (${keywordRelevance}): "${raw.matchedKeyword}" → "${raw.title.slice(0, 50)}"`);
        continue;
      }

      const result = await repos.items.insert(raw);
      if (!result) continue;
      if (result.inserted) {
        totals.inserted += 1;
        insertedIds.push(result.id);
      }
    }

    const scoredItems: Array<{ id: number; priorityScore: number; freshnessScore: number }> = [];
    for (const itemId of insertedIds) {
      const item = await repos.items.byId(itemId);
      if (!item) continue;
      const freshnessScore = computeFreshnessScore(item.publishedAt);
      const priorityScore = computePriorityScore(item);
      scoredItems.push({ id: itemId, priorityScore, freshnessScore });
    }

    const existingTop = (await repos.items.list(50))
      .filter((i) => i.evaluation !== null && !insertedIds.includes(i.id))
      .slice(0, 8);
    for (const item of existingTop) {
      scoredItems.push({ id: item.id, priorityScore: item.priorityScore, freshnessScore: item.freshnessScore });
    }

    scoredItems.sort((a, b) => b.priorityScore - a.priorityScore);
    const seenIds = new Set<number>();
    const aiCandidates = scoredItems.filter((s) => {
      if (seenIds.has(s.id)) return false;
      seenIds.add(s.id);
      return true;
    }).slice(0, isVercel ? 1 : 15);

    for (const candidate of aiCandidates) {
        const item = await repos.items.byId(candidate.id);
        if (!item) continue;

        if (!isKeywordMentioned(item.title, item.summary, item.matchedKeyword)) {
          console.log(`[scanner] skip AI eval (keyword not mentioned): ${item.title.slice(0, 40)}`);
          await repos.items.updateStatus(candidate.id, "ignored");
          continue;
        }

        const keyword = item.keywordId ? keywords.find((entry) => entry.id === item.keywordId) ?? null : null;
        const source = item.sourceId ? sources.find((entry) => entry.id === item.sourceId) ?? null : null;
        const evaluation = await evaluateItem(item, keyword, source);
        await repos.items.addEvaluation(candidate.id, evaluation);
        totals.evaluated += 1;
      }

    for (const candidate of scoredItems) {
      const item = await repos.items.byId(candidate.id);
      if (!item) continue;
      const finalRelevance = computeFinalRelevance(item);
      let status: "new" | "watch" | "ignored";

      if (finalRelevance < 30) {
        status = "ignored";
      } else if (finalRelevance < 50) {
        status = candidate.priorityScore >= 75 ? "watch" : "ignored";
      } else if (candidate.priorityScore >= 75) {
        status = "new";
      } else if (candidate.priorityScore >= 50) {
        status = "watch";
      } else {
        status = "ignored";
      }

      await repos.items.updatePriority(candidate.id, candidate.priorityScore, candidate.freshnessScore, status);
    }

    await repos.scanRuns.finish(scanRunId, "success", totals);
    const archivedCount = await repos.items.archiveStaleItems();
    if (archivedCount > 0) {
      console.log("[scanner] Archived " + archivedCount + " old items");
    }

    return { skipped: false, ...totals };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await repos.scanRuns.finish(scanRunId, "failed", { ...totals, error: message });
    throw error;
  } finally {
    scanning = false;
  }
}

function deduplicateBatch(items: CollectedItem[]): CollectedItem[] {
  const seenUrls = new Set<string>();
  const result: CollectedItem[] = [];

  for (const item of items) {
    if (seenUrls.has(item.normalizedUrl)) continue;
    seenUrls.add(item.normalizedUrl);

    const duplicate = result.find((existing) =>
      existing.keywordId === item.keywordId &&
      titleSimilarity(existing.title, item.title) >= 0.65
    );
    if (duplicate) continue;

    result.push(item);
  }

  return result;
}
