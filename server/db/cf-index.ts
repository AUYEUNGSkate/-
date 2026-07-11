// Cloudflare-only DB access - uses Turso exclusively
// No better-sqlite3, no Node.js built-in modules

import { tursoRepos, initTursoDb } from "./turso";

let initialized = false;

export async function initDb() {
  if (initialized) return;
  await initTursoDb();
  initialized = true;
}

export const repos = tursoRepos;
