import type { AiEvaluation, AppSettings, HotspotItem, Keyword, Source } from "../../shared/types";
import { getEnv } from "../config/env";
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
        recommendedAction: { type: "string", enum: ["notify", "watch", "ignore"] },
        keywordMentioned: { type: "boolean" },
        relevanceSummary: { type: "string" }
      },
      required: [
        "relevanceScore",
        "credibilityScore",
        "noveltyScore",
        "hotnessScore",
        "isImpersonationLikely",
        "summary",
        "reason",
        "recommendedAction",
        "keywordMentioned",
        "relevanceSummary"
      ],
      additionalProperties: false
    }
  }
};

const loggedOpenRouterFallbacks = new Set<string>();

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
  const term = keywordTerm.toLowerCase().trim();
  const haystack = `${title} ${summary}`.toLowerCase();
  if (!term) return 50;

  // Tier 1: Full keyword match anywhere
  if (haystack.includes(term)) return 100;

  // Tier 2: Token-based matching (space/comma separated keywords)
  const tokens = term.split(/[,，、\s]+/).filter((t) => t.length > 1);
  if (tokens.length > 0) {
    const hits = tokens.filter((t) => haystack.includes(t));
    const hitRatio = hits.length / tokens.length;
    const titleHasKeyword = tokens.some((t) => title.toLowerCase().includes(t));

    if (hitRatio >= 1.0) return 85;
    if (hitRatio >= 0.5 && titleHasKeyword) return 70;
    if (hitRatio >= 0.5) return 50;
    if (hitRatio > 0) return 30;
    return 0;
  }

  // Tier 3: CJK single-token keyword — use bigram partial matching
  if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(term) && term.length >= 2) {
    const bigrams = generateBigrams(term);
    if (bigrams.length === 0) return 0;
    const hits = bigrams.filter((bg) => haystack.includes(bg));
    const hitRatio = hits.length / bigrams.length;
    const titleHasAny = bigrams.some((bg) => title.toLowerCase().includes(bg));

    if (hitRatio >= 1.0) return 85;
    if (hitRatio >= 0.67 && titleHasAny) return 65;
    if (hitRatio >= 0.67) return 60;
    if (hitRatio >= 0.5 && titleHasAny) return 45;
    if (hitRatio >= 0.5) return 35;
    if (hitRatio > 0) return 20;
    return 0;
  }

  return 0;
}

function generateBigrams(text: string): string[] {
  const bigrams: string[] = [];
  const chars = [...text];
  for (let i = 0; i < chars.length - 1; i++) {
    bigrams.push(chars[i] + chars[i + 1]);
  }
  return bigrams;
}

export function computePriorityScore(item: Pick<HotspotItem, "qualityScore" | "publishedAt" | "interactionViews" | "interactionLikes" | "sourceReliability" | "evidenceCount" | "matchedKeyword" | "title" | "summary">): number {
  const freshness = computeFreshnessScore(item.publishedAt);
  const interaction = computeInteractionScore(item);
  const source = computeSourceScore(item);
  const evidence = computeEvidenceScore(item.evidenceCount);
  const relevance = computeKeywordRelevance(item.title, item.summary, item.matchedKeyword);
  const score = relevance * 0.30 + item.qualityScore * 0.20 + freshness * 0.20 + interaction * 0.15 + source * 0.10 + evidence * 0.05;
  return Math.round(Math.max(0, Math.min(100, score)));
}

export async function generateBriefing(items: Array<{ title: string; summary: string; matchedKeyword: string; priorityScore: number }>): Promise<string> {
  const env = getEnv();
  if (!env.openRouterApiKey) return generateMockBriefing(items);

  const topItems = items
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 10)
    .map((item, i) => `${i + 1}. [${item.matchedKeyword}] ${item.title}${item.summary ? ` — ${item.summary.slice(0, 80)}` : ""}`)
    .join("\n");

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openRouterApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: env.openRouterModel,
        messages: [
          { role: "system", content: "你是资讯简报助手。根据给出的热点条目，用 2-3 句话做一份中文简报，概括当前最值得关注的主题和趋势。语气简洁专业，不超过 120 字，不分点。" },
          { role: "user", content: topItems }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    });
    if (!response.ok) return generateMockBriefing(items);
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content?.trim() || generateMockBriefing(items);
  } catch {
    return generateMockBriefing(items);
  }
}

function generateMockBriefing(items: Array<{ title: string; matchedKeyword: string }>): string {
  const top = items.sort((a, b) => 0).slice(0, 5);
  const keywords = [...new Set(top.map((i) => i.matchedKeyword))].slice(0, 3).join("、");
  return `当前监控到 ${items.length} 条热点，主要涉及 ${keywords} 等领域，其中多篇内容关注最新动态与技术趋势。`;
}

export async function evaluateItem(
  item: Pick<HotspotItem, "title" | "summary" | "url" | "publishedAt" | "matchedKeyword" | "qualityScore" | "qualitySignals" | "evidenceCount" | "evidenceProviders" | "sourceReliability" | "communitySource">,
  keyword: Keyword | null,
  source: Source | null,
  settings?: AppSettings
): Promise<AiEvaluation> {
  if (!settings) settings = { aiMode: "openrouter", scanIntervalMinutes: 30, openRouterConfigured: true, openRouterModel: "deepseek/deepseek-v4-flash" };
  const env = getEnv();
  if (settings.aiMode === "mock" || !env.openRouterApiKey) {
    return mockEvaluation(item, keyword, source);
  }
  try {
    return await evaluateWithOpenRouter(item, keyword, source);
  } catch (error) {
    logOpenRouterFallback(error);
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
          content: `你根据给定的关键词判断文章的相关性。
核心任务：评估文章是否**真正讨论**了关键词所代表的话题，而非仅字面提及。
keywordMentioned: 文章是否确实涉及关键词主题（区分"提到了词"与"讨论了话题"）。
relevanceScore: 文章内容与关键词的直接关联程度（0=完全无关，100=高度核心）。
relevanceSummary: 用一句话（≤50字）说明文章与关键词的具体关联。
relevanceScore 严格按如下标准：
0-20: 完全无关或仅偶然出现关键词；20-40: 仅字面提及但未实质性讨论；
40-60: 部分相关但核心主题不同；60-80: 相关但非专注该话题；
80-100: 文章核心主题就是该关键词话题。
只输出符合 JSON Schema 的结果。`
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
    throw new Error(`OpenRouter HTTP ${response.status}: ${summarizeOpenRouterError(await response.text())}`);
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
  const baseMatch = computeKeywordRelevance(item.title, item.summary, term);
  const keywordMentioned = baseMatch >= 50;
  const relevance = keywordMentioned ? baseMatch : Math.min(baseMatch, 20);
  const credibilityBase = source?.reliabilityTier === "official" ? 86 : source?.reliabilityTier === "trusted" ? 78 : source?.reliabilityTier === "community" ? 58 : 70;
  const credibility = Math.min(95, credibilityBase + Math.max(0, item.evidenceCount - 1) * 8 + Math.floor((item.qualityScore - 70) / 4));
  const novelty = Date.now() - new Date(item.publishedAt).getTime() <= 24 * 60 * 60 * 1000 ? 78 : 52;
  const hotness = relevance > 60 ? Math.min(50 + relevance * 0.35, 90) : 35;
  const suspicious = /免费领取|破解|内部绝密|必看爆料/.test(item.title);
  const relevanceSummary = keywordMentioned
    ? `标题与摘要中包含关键词"${term}"的相关讨论`
    : `内容未明显涉及关键词"${term}"的核心话题`;

  return sanitizeEvaluation({
    relevanceScore: relevance,
    credibilityScore: suspicious ? 45 : credibility,
    noveltyScore: novelty,
    hotnessScore: suspicious ? 42 : hotness,
    isImpersonationLikely: suspicious,
    summary: item.summary ? cleanSummary(item.summary).slice(0, 120) : cleanArticleTitle(item.title),
    reason: suspicious
      ? "标题存在明显营销或爆料话术，先降级为待观察。"
      : `Mock: baseMatch=${baseMatch}, keywordMentioned=${keywordMentioned}`,
    recommendedAction: !suspicious && relevance >= 60 && item.qualityScore >= 70 ? "notify" : "watch",
    keywordMentioned,
    relevanceSummary
  });
}

function sanitizeEvaluation(input: AiEvaluation): AiEvaluation {
  const credibilityScore = clamp(input.credibilityScore);
  const isImpersonationLikely = Boolean(input.isImpersonationLikely)
    && !(credibilityScore >= 75 && clamp(Math.max(input.relevanceScore, input.noveltyScore)) >= 70);

  return {
    relevanceScore: clamp(input.relevanceScore),
    credibilityScore,
    noveltyScore: clamp(input.noveltyScore),
    hotnessScore: clamp(input.hotnessScore),
    isImpersonationLikely,
    summary: cleanSummary(String(input.summary ?? "")).slice(0, 300),
    reason: String(input.reason ?? "").slice(0, 600),
    recommendedAction: ["notify", "watch", "ignore"].includes(input.recommendedAction) ? input.recommendedAction : "watch",
    keywordMentioned: Boolean(input.keywordMentioned),
    relevanceSummary: String(input.relevanceSummary ?? "").slice(0, 120)
  };
}

export function isKeywordMentioned(title: string, summary: string, keywordTerm: string): boolean {
  return computeKeywordRelevance(title, summary, keywordTerm) >= 30;
}

export function computeFinalRelevance(item: Pick<HotspotItem, "title" | "summary" | "matchedKeyword" | "evaluation">): number {
  const baseMatch = computeKeywordRelevance(item.title, item.summary, item.matchedKeyword);
  const hasEval = item.evaluation !== null && item.evaluation !== undefined;
  const aiRelevance = item.evaluation?.relevanceScore ?? 0;
  const keywordMentioned = item.evaluation?.keywordMentioned ?? (baseMatch >= 30);

  // Semantic boost from AI evaluation (only applied when AI eval exists)
  let semanticBoost = 1.0;
  if (hasEval) {
    if (aiRelevance >= 80) semanticBoost = 1.3;
    else if (aiRelevance >= 60) semanticBoost = 1.1;
    else if (aiRelevance >= 40) semanticBoost = 1.0;
    else if (aiRelevance >= 20) semanticBoost = 0.9;
    else semanticBoost = 0.8;
  }

  const mentionedBonus = keywordMentioned ? 1.0 : 0.3;

  return Math.round(Math.min(100, baseMatch * mentionedBonus * semanticBoost));
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function logOpenRouterFallback(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (loggedOpenRouterFallbacks.has(message)) return;
  loggedOpenRouterFallbacks.add(message);
  console.warn(`[ai] OpenRouter unavailable, using mock fallback: ${message}`);
}

function summarizeOpenRouterError(text: string): string {
  try {
    const payload = JSON.parse(text) as { error?: { message?: string; code?: number | string } };
    const code = payload.error?.code ? `code ${payload.error.code}` : "request failed";
    const message = payload.error?.message ?? "unknown error";
    return `${code} - ${message}`;
  } catch {
    return text.slice(0, 240);
  }
}
