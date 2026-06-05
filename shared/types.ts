export type AiMode = "openrouter" | "mock";

export type RecommendedAction = "notify" | "watch" | "ignore";

export interface Keyword {
  id: number;
  term: string;
  scope: string;
  enabled: boolean;
  createdAt: string;
}

export interface Source {
  id: number;
  name: string;
  url: string;
  category: string;
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
  evaluation: AiEvaluation | null;
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
