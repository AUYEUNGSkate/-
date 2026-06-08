import "dotenv/config";
import path from "node:path";

export interface EnvConfig {
  port: number;
  databasePath: string;
  scanIntervalMinutes: number;
  aiMode: "openrouter" | "mock";
  openRouterApiKey: string;
  openRouterModel: string;
  openRouterReferer: string;
  openRouterTitle: string;
  braveSearchApiKey: string;
}

export function getEnv(): EnvConfig {
  const dbPath = process.env.VERCEL
    ? "/tmp/hotpulse.sqlite"
    : path.resolve(process.cwd(), process.env.DATABASE_PATH ?? "./data/hotspot-radar.sqlite");
  return {
    port: Number(process.env.PORT ?? 8787),
    databasePath: dbPath,
    scanIntervalMinutes: Number(process.env.SCAN_INTERVAL_MINUTES ?? 30),
    aiMode: process.env.AI_MODE === "mock" ? "mock" : "openrouter",
    openRouterApiKey: process.env.OPEN_ROUTER ?? process.env.OPENROUTER_API_KEY ?? "",
    openRouterModel: process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-v4-flash",
    openRouterReferer: process.env.OPENROUTER_REFERER ?? "http://localhost:5173",
    openRouterTitle: process.env.OPENROUTER_TITLE ?? "Game Hotspot Radar",
    braveSearchApiKey: process.env.BRAVE_SEARCH_API_KEY ?? ""
  };
}
