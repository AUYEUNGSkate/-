import type { AiEvaluation, HotspotItem, Keyword, Source } from "../../shared/types";
import { getEnv } from "../config/env";
import { repositories } from "../db/client";
import { cleanArticleTitle, cleanSummary } from "./contentFilter";

const RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "hotspot_evaluation",
    strict: true,
    schema: {
      type: "object",
      properties: {
        relevanceScore: { type: "number", minimum: 0, maximum: 100 },
        credibilityScore: { type: "number", minimum: 0, maximum: 100 },
        noveltyScore: { type: "number", minimum: 0, maximum: 100 },
        hotnessScore: { type: "number", minimum: 0, maximum: 100 },
        isImpersonationLikely: { type: "boolean" },
        summary: { type: "string" },
        reason: { type: "string" },
        recommendedAction: { type: "string", enum: ["notify", "watch", "ignore"] }
      },
      required: [
        "relevanceScore",
        "credibilityScore",
        "noveltyScore",
        "hotnessScore",
        "isImpersonationLikely",
        "summary",
        "reason",
        "recommendedAction"
      ],
      additionalProperties: false
    }
  }
};

export function computeFreshnessScore(publishedAt: string): number {
  const ageMs = Date.now() - new Date(publishedAt).getTime();
  if (Number.isNaN(ageMs)) return 50;
  const hours = ageMs / (60 * 60 * 1000);
  if (hours < 6) return 100;
  if (hours < 12) return 85;
  if (hours < 24) return 65;
  if (hours < 48) return 35;
  return 0;
}

export function computeInteractionScore(item: Pick<HotspotItem, "interactionViews" | "interactionLikes">): number {
  const views = item.interactionViews ?? 0;
  const likes = item.interactionLikes ?? 0;
  if (views === 0 && likes === 0) return 50;
  const viewScore = views > 0 ? Math.min(100, Math.log10(views + 1) * 18) : 0;
  const likeScore = likes > 0 ? Math.min(100, Math.log10(likes + 1) * 12) : 0;
  return Math.round(Math.max(viewScore, likeScore));
}

export function computeSourceScore(item: Pick<HotspotItem, "sourceReliability" | "evidenceCount">): number {
  if (item.sourceReliability === "official") return 100;
  if (item.sourceReliability === "trusted") return 80;
  if (item.sourceReliability === "search") return 60;
  return 40;
}

export function computeEvidenceScore(evidenceCount: number): number {
  return Math.min(100, evidenceCount * 25);
}

export function computeKeywordRelevance(title: string, summary: string, keywordTerm: string): number {
  const term = keywordTerm.toLowerCase();
  const haystack = `${title} ${summary}`.toLowerCase();
  if (!term) return 50;
  // 完全匹配完整关键词
  if (haystack.includes(term)) return 100;
  // 分词匹配
  const tokens = term.split(/[,，、\s]+/).filter((t) => t.length > 1);
  if (tokens.length > 0) {
    const hitCount = tokens.filter((t) => haystack.includes(t)).length;
    if (hitCount === tokens.length) return 85;
    if (hitCount > 0) return 60 + hitCount * 10;
  }
  return 20;
}

export function computePriorityScore(item: Pick<HotspotItem, "qualityScore" | "publishedAt" | "interactionViews" | "interactionLikes" | "sourceReliability" | "evidenceCount" | "matchedKeyword" | "title" | "summary">): number {
  const freshness = computeFreshnessScore(item.publishedAt);
  const interaction = computeInteractionScore(item);
  const source = computeSourceScore(item);
  const evidence = computeEvidenceScore(item.evidenceCount);
  const relevance = computeKeywordRelevance(item.title, item.summary, item.matchedKeyword);
  const score = item.qualityScore * 0.25 + freshness * 0.25 + interaction * 0.20 + source * 0.10 + relevance * 0.15 + evidence * 0.05;
  return Math.round(Math.max(0, Math.min(100, score)));
}

export async function evaluateItem(
  item: Pick<HotspotItem, "title" | "summary" | "url" | "publishedAt" | "matchedKeyword" | "qualityScore" | "qualitySignals" | "evidenceCount" | "evidenceProviders" | "sourceReliability" | "communitySource">,
  keyword: Keyword | null,
  source: Source | null
): Promise<AiEvaluation> {
  const settings = repositories.settings.all();
  const env = getEnv();
  if (settings.aiMode === "mock" || !env.openRouterApiKey) {
    return mockEvaluation(item, keyword, source);
  }
  try {
    return await evaluateWithOpenRouter(item, keyword, source);
  } catch (error) {
    console.warn("[ai] OpenRouter failed, using mock fallback:", error instanceof Error ? error.message : error);
    return mockEvaluation(item, keyword, source);
  }
}

export function shouldMarkNew(
  evaluation: AiEvaluation,
  publishedAt: string,
  quality: Pick<HotspotItem, "qualityScore" | "evidenceCount" | "communitySource" | "sourceReliability">
): boolean {
  const ageMs = Date.now() - new Date(publishedAt).getTime();
  const within24h = Number.isNaN(ageMs) || ageMs <= 24 * 60 * 60 * 1000;
  const communityConfirmed =
    !quality.communitySource ||
    quality.evidenceCount >= 2 ||
    quality.sourceReliability === "official" ||
    evaluation.credibilityScore >= 82;
  return (
    within24h &&
    quality.qualityScore >= 70 &&
    communityConfirmed &&
    evaluation.relevanceScore >= 70 &&
    evaluation.credibilityScore >= 65 &&
    evaluation.noveltyScore >= 60 &&
    evaluation.hotnessScore >= 70 &&
    !evaluation.isImpersonationLikely &&
    evaluation.recommendedAction === "notify"
  );
}

async function evaluateWithOpenRouter(
  item: Pick<HotspotItem, "title" | "summary" | "url" | "publishedAt" | "matchedKeyword" | "qualityScore" | "qualitySignals" | "evidenceCount" | "evidenceProviders" | "sourceReliability" | "communitySource">,
  keyword: Keyword | null,
  source: Source | null
): Promise<AiEvaluation> {
  const env = getEnv();
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openRouterApiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.openRouterReferer,
      "X-OpenRouter-Title": env.openRouterTitle
    },
    body: JSON.stringify({
      model: env.openRouterModel,
      messages: [
        {
          role: "system",
          content:
            "你是游戏行业情报分析员。请判断内容是否是真正值得关注的游戏行业或技术热点，警惕标题党、冒名、旧闻重复和低可信爆料。只输出符合 JSON Schema 的结果。"
        },
        {
          role: "user",
          content: JSON.stringify({
            keyword: keyword?.term ?? item.matchedKeyword,
            scope: keyword?.scope ?? "",
            source: source ? {
              name: source.name,
              category: source.category,
              url: source.url,
              providerType: source.providerType,
              reliabilityTier: source.reliabilityTier,
              communitySource: source.communitySource,
              minQualityScore: source.minQualityScore
            } : null,
            qualitySignals: item.qualitySignals,
            evidenceCount: item.evidenceCount,
            evidenceProviders: item.evidenceProviders,
            sourceReliability: item.sourceReliability,
            communitySource: item.communitySource,
            item
          })
        }
      ],
      response_format: RESPONSE_FORMAT,
      temperature: 0.2,
      max_tokens: 800
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter HTTP ${response.status}: ${await response.text()}`);
  }
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned empty content");
  return sanitizeEvaluation(JSON.parse(content) as AiEvaluation);
}

function mockEvaluation(
  item: Pick<HotspotItem, "title" | "summary" | "url" | "publishedAt" | "matchedKeyword" | "qualityScore" | "qualitySignals" | "evidenceCount" | "evidenceProviders" | "sourceReliability" | "communitySource">,
  keyword: Keyword | null,
  source: Source | null
): AiEvaluation {
  const haystack = `${item.title} ${item.summary}`.toLowerCase();
  const term = (keyword?.term ?? item.matchedKeyword).toLowerCase();
  const techSignals = ["ai", "unity", "unreal", "steam", "agent", "编程", "游戏", "出海", "发行", "引擎"];
  const signalHits = techSignals.filter((signal) => haystack.includes(signal.toLowerCase())).length;
  const relevance = haystack.includes(term) ? 82 : Math.min(65 + signalHits * 6, 86);
  const credibilityBase = source?.reliabilityTier === "official" ? 86 : source?.reliabilityTier === "trusted" ? 78 : source?.reliabilityTier === "community" ? 58 : 70;
  const credibility = Math.min(95, credibilityBase + Math.max(0, item.evidenceCount - 1) * 8 + Math.floor((item.qualityScore - 70) / 4));
  const novelty = Date.now() - new Date(item.publishedAt).getTime() <= 24 * 60 * 60 * 1000 ? 78 : 52;
  const hotness = Math.min(58 + signalHits * 8 + (relevance > 75 ? 8 : 0), 92);
  const suspicious = /免费领取|破解|内部绝密|必看爆料/.test(item.title);
  return sanitizeEvaluation({
    relevanceScore: relevance,
    credibilityScore: suspicious ? 45 : credibility,
    noveltyScore: novelty,
    hotnessScore: suspicious ? 42 : hotness,
    isImpersonationLikely: suspicious,
    summary: item.summary ? cleanSummary(item.summary).slice(0, 120) : cleanArticleTitle(item.title),
    reason: suspicious
      ? "标题存在明显营销或爆料话术，先降级为待观察。"
      : `Mock 模式基于关键词、质量分 ${item.qualityScore}、${item.evidenceCount} 条证据和来源等级给出临时评分。`,
    recommendedAction: !suspicious && item.qualityScore >= 70 && relevance >= 70 && hotness >= 70 ? "notify" : "watch"
  });
}

function sanitizeEvaluation(input: AiEvaluation): AiEvaluation {
  return {
    relevanceScore: clamp(input.relevanceScore),
    credibilityScore: clamp(input.credibilityScore),
    noveltyScore: clamp(input.noveltyScore),
    hotnessScore: clamp(input.hotnessScore),
    isImpersonationLikely: Boolean(input.isImpersonationLikely),
    summary: cleanSummary(String(input.summary ?? "")).slice(0, 300),
    reason: String(input.reason ?? "").slice(0, 600),
    recommendedAction: ["notify", "watch", "ignore"].includes(input.recommendedAction) ? input.recommendedAction : "watch"
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Number(value) || 0));
}
