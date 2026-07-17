// Environment config - singleton pattern for both Node.js and Workers

export interface EnvConfig {
  port: number;
  databasePath: string;
  tursoUrl: string;
  tursoAuthToken: string;
  scanIntervalMinutes: number;
  aiMode: "openrouter" | "mock";
  openRouterApiKey: string;
  openRouterModel: string;
  openRouterReferer: string;
  openRouterTitle: string;
  braveSearchApiKey: string;
}

let _env: EnvConfig | null = null;

export function initEnv(overrides?: Record<string, string | undefined>): EnvConfig {
  const e = overrides ?? (typeof process !== "undefined" && process.env ? process.env as Record<string, string | undefined> : {});
  const scanIntervalMinutes = Number(e.SCAN_INTERVAL_MINUTES ?? 30);
  _env = {
    port: Number(e.PORT ?? 8787),
    databasePath: e.DATABASE_PATH ?? "./data/hotspot-radar.sqlite",
    tursoUrl: e.TURSO_URL ?? "",
    tursoAuthToken: e.TURSO_AUTH_TOKEN ?? "",
    scanIntervalMinutes: Number.isFinite(scanIntervalMinutes) ? scanIntervalMinutes : 30,
    aiMode: e.AI_MODE === "mock" ? "mock" : "openrouter",
    openRouterApiKey: e.OPEN_ROUTER ?? e.OPENROUTER_API_KEY ?? "",
    openRouterModel: e.OPENROUTER_MODEL ?? "deepseek/deepseek-v4-flash",
    openRouterReferer: e.OPENROUTER_REFERER ?? "http://localhost:5173",
    openRouterTitle: e.OPENROUTER_TITLE ?? "Game Hotspot Radar",
    braveSearchApiKey: e.BRAVE_SEARCH_API_KEY ?? ""
  };
  return _env;
}

export function getEnv(): EnvConfig {
  if (!_env) return initEnv();
  return _env;
}
