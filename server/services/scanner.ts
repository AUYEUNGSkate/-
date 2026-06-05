import type { HotspotItem } from "../../shared/types";
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

    for (const raw of collected) {
      if (!isWithinHours(raw.publishedAt, 24)) continue;
      const itemId = repositories.items.insert(raw);
      if (!itemId) continue;

      totals.inserted += 1;
      const keyword = keywords.find((entry) => entry.id === raw.keywordId) ?? null;
      const source = sources.find((entry) => entry.id === raw.sourceId) ?? null;
      const itemForAi: Pick<HotspotItem, "title" | "summary" | "url" | "publishedAt" | "matchedKeyword"> = {
        title: raw.title,
        summary: raw.summary,
        url: raw.url,
        publishedAt: raw.publishedAt,
        matchedKeyword: raw.matchedKeyword
      };
      const evaluation = await evaluateItem(itemForAi, keyword, source);
      repositories.items.addEvaluation(itemId, evaluation);
      repositories.items.updateStatus(
        itemId,
        shouldMarkNew(evaluation, raw.publishedAt)
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
