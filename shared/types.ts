export type AiMode = "openrouter" | "mock";

export type RecommendedAction = "notify" | "watch" | "ignore";
export type ProviderType = "rss" | "google_news" | "brave_search" | "bilibili_search" | "weibo_hot";
export type ReliabilityTier = "official" | "trusted" | "community" | "search";
export type SummarySource = "ai" | "rss" | "metadata" | "title";
export type InteractionSource = "bilibili" | "zhihu" | "wechat" | "weibo" | "html" | "rss" | "none";

export interface Keyword {
  id: number;
  term: string;
  scope: string;
  enabled: boolean;
  accountMode: boolean;
  accountPlatform: string;
  accountUid: string;
  accountUrl: string;
  createdAt: string;
}

export interface Source {
  id: number;
  name: string;
  url: string;
  category: string;
  providerType: ProviderType;
  reliabilityTier: ReliabilityTier;
  communitySource: boolean;
  minQualityScore: number;
  enabled: boolean;
  builtin: boolean;
  createdAt: string;
}

export interface HotspotItem {
  id: number;
  sourceId: number | null;
  keywordId: number | null;
  title: string;
  url: string;
  normalizedUrl: string;
  summary: string;
  publishedAt: string;
  fetchedAt: string;
  matchedKeyword: string;
  readAt: string | null;
  status: "new" | "watch" | "ignored";
  qualityScore: number;
  qualitySignals: string[];
  evidenceCount: number;
  evidenceProviders: ProviderType[];
  evidenceSourceNames: string[];
  sourceReliability: ReliabilityTier | null;
  communitySource: boolean;
  evaluation: AiEvaluation | null;
  interactionLikes: number;
  interactionReposts: number;
  interactionReplies: number;
  interactionViews: number;
  summarySource: SummarySource;
  interactionSource: InteractionSource;
  priorityScore: number;
  freshnessScore: number;
  authorName: string | null;
  authorFollowers: number;
  authorVerified: boolean;
  interactionDanmaku: number;
  interactionQuotes: number;
}

export interface AiEvaluation {
  relevanceScore: number;
  credibilityScore: number;
  noveltyScore: number;
  hotnessScore: number;
  isImpersonationLikely: boolean;
  summary: string;
  reason: string;
  recommendedAction: RecommendedAction;
}

export interface AppSettings {
  aiMode: AiMode;
  scanIntervalMinutes: number;
  openRouterConfigured: boolean;
  openRouterModel: string;
}

export interface ScanRun {
  id: number;
  startedAt: string;
  finishedAt: string | null;
  status: "running" | "success" | "failed";
  totalFetched: number;
  totalInserted: number;
  totalEvaluated: number;
  error: string | null;
}

export interface DashboardPayload {
  settings: AppSettings;
  keywords: Keyword[];
  sources: Source[];
  items: HotspotItem[];
  lastScan: ScanRun | null;
  unreadCount: number;
}
