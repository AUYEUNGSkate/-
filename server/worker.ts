import { repositories } from "./db/client";
import { runScan } from "./services/scanner";
import { intervalToMilliseconds, normalizeScanIntervalMinutes } from "./services/scheduler";

async function runScheduledScan() {
  try {
    console.log(`[worker] scan started at ${new Date().toISOString()}`);
    const result = await runScan();
    console.log("[worker] scan finished", result);
  } catch (error) {
    console.error("[worker] scan failed", error);
  }
}

const settings = repositories.settings.all();
const interval = normalizeScanIntervalMinutes(settings.scanIntervalMinutes);
const intervalMs = intervalToMilliseconds(interval);

setInterval(() => {
  void runScheduledScan();
}, intervalMs);

console.log(`[worker] scheduled scan every ${interval} minutes`);
