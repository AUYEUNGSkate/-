import cron from "node-cron";
import { repositories } from "./db/client";
import { runScan } from "./services/scanner";

const settings = repositories.settings.all();
const interval = Math.max(5, Math.min(1440, settings.scanIntervalMinutes));
const expression = `*/${interval} * * * *`;

const task = cron.createTask(
  expression,
  async () => {
    try {
      console.log(`[worker] scan started at ${new Date().toISOString()}`);
      const result = await runScan();
      console.log("[worker] scan finished", result);
    } catch (error) {
      console.error("[worker] scan failed", error);
    }
  },
  { noOverlap: true }
);

task.start();
console.log(`[worker] scheduled scan every ${interval} minutes (${expression})`);
