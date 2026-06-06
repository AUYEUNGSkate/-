import { repositories } from "../db/client";
import { collectFromSources } from "./collector";
import { isWithinHours } from "./dedupe";
import { evaluateItem, shouldMarkNew } from "./ai";

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
    const insertedItemIds = new Set<number>();

    for (const raw of collected) {
      if (!isWithinHours(raw.publishedAt, 24)) continue;
      const source = sources.find((entry) => entry.id === raw.sourceId) ?? null;
      if (source && raw.qualityScore < source.minQualityScore) continue;

      const result = repositories.items.insert(raw);
      if (!result) continue;
      if (result.inserted) {
        totals.inserted += 1;
        insertedItemIds.add(result.id);
      }
    }

    for (const itemId of insertedItemIds) {
      const item = repositories.items.byId(itemId);
      if (!item) continue;
      const keyword = item.keywordId ? keywords.find((entry) => entry.id === item.keywordId) ?? null : null;
      const source = item.sourceId ? sources.find((entry) => entry.id === item.sourceId) ?? null : null;
      const evaluation = await evaluateItem(item, keyword, source);
      repositories.items.addEvaluation(itemId, evaluation);
      repositories.items.updateStatus(
        itemId,
        shouldMarkNew(evaluation, item.publishedAt, item)
          ? "new"
          : evaluation.recommendedAction === "ignore"
            ? "ignored"
            : "watch"
      );
      totals.evaluated += 1;
    }

    repositories.scanRuns.finish(scanRunId, "success", totals);
    return { skipped: false, ...totals };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    repositories.scanRuns.finish(scanRunId, "failed", { ...totals, error: message });
    throw error;
  } finally {
    scanning = false;
  }
}
