import { getDb, repositories } from "../db/client";
import { collectFromSources } from "./collector";
import { titleSimilarity } from "./dedupe";
import { evaluateItem, computePriorityScore, computeFreshnessScore } from "./ai";
import type { CollectedItem } from "./collector";

let scanning = false;

export async function runScan() {
  if (scanning) {
    return { skipped: true, reason: "scan already running" };
  }

  scanning = true;
  const scanRunId = repositories.scanRuns.start();
  const totals = { fetched: 0, inserted: 0, evaluated: 0 };

  try {
    const keywords = repositories.keywords.active();
    const sources = repositories.sources.active();
    const collected = await collectFromSources(keywords, sources);
    totals.fetched = collected.length;

    // Step 1: Batch dedup within collected items
    const deduped = deduplicateBatch(collected);
    console.log(`[scanner] collected=${collected.length} deduped=${deduped.length}`);

    // Step 2: Freshness + quality filtering + insert
    const insertedIds: number[] = [];
    for (const raw of deduped) {
      const source = sources.find((entry) => entry.id === raw.sourceId) ?? null;
      if (source && raw.qualityScore < source.minQualityScore) continue;

      const result = repositories.items.insert(raw);
      if (!result) continue;
      if (result.inserted) {
        totals.inserted += 1;
        insertedIds.push(result.id);
      }
    }

    // Step 3: Compute priority scores for all new items
    const scoredItems: Array<{ id: number; priorityScore: number; freshnessScore: number }> = [];
    for (const itemId of insertedIds) {
      const item = repositories.items.byId(itemId);
      if (!item) continue;
      const freshnessScore = computeFreshnessScore(item.publishedAt);
      const priorityScore = computePriorityScore(item);
      scoredItems.push({ id: itemId, priorityScore, freshnessScore });
    }

    // Step 4: Sort by priority, pick top 15 for AI evaluation
    scoredItems.sort((a, b) => b.priorityScore - a.priorityScore);
    const aiCount = Math.min(15, scoredItems.length);
    const aiCandidates = scoredItems.slice(0, aiCount);

    for (const candidate of aiCandidates) {
      const item = repositories.items.byId(candidate.id);
      if (!item) continue;
      const keyword = item.keywordId ? keywords.find((entry) => entry.id === item.keywordId) ?? null : null;
      const source = item.sourceId ? sources.find((entry) => entry.id === item.sourceId) ?? null : null;
      const evaluation = await evaluateItem(item, keyword, source);
      repositories.items.addEvaluation(candidate.id, evaluation);
      totals.evaluated += 1;
    }

    // Step 5: Classify all items with priority score
    for (const candidate of scoredItems) {
      const item = repositories.items.byId(candidate.id);
      if (!item) continue;
      const evaluation = item.evaluation;
      let status: "new" | "watch" | "ignored";

      if (candidate.priorityScore >= 75) {
        status = "new";
      } else if (candidate.priorityScore >= 50) {
        status = "watch";
      } else {
        status = "ignored";
      }

      // Save priority scores
      getDb().prepare("UPDATE items SET priority_score = ?, freshness_score = ?, status = ? WHERE id = ?")
        .run(candidate.priorityScore, candidate.freshnessScore, status, candidate.id);
    }

    // Step 6: Auto-archive
    repositories.scanRuns.finish(scanRunId, "success", totals);
    const archivedCount = repositories.items.archiveStaleItems();
    if (archivedCount > 0) {
      console.log("[scanner] Archived " + archivedCount + " old items");
    }

    return { skipped: false, ...totals };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    repositories.scanRuns.finish(scanRunId, "failed", { ...totals, error: message });
    throw error;
  } finally {
    scanning = false;
  }
}

function deduplicateBatch(items: CollectedItem[]): CollectedItem[] {
  const seenUrls = new Set<string>();
  const result: CollectedItem[] = [];

  for (const item of items) {
    // Exact URL dedup
    if (seenUrls.has(item.normalizedUrl)) continue;
    seenUrls.add(item.normalizedUrl);

    // Title similarity dedup against already-accepted items
    const duplicate = result.find((existing) =>
      existing.keywordId === item.keywordId &&
      titleSimilarity(existing.title, item.title) >= 0.65
    );
    if (duplicate) continue;

    result.push(item);
  }

	return result;
}
