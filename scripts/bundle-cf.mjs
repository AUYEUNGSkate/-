import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["functions/api/[[...route]].ts"],
  bundle: true,
  platform: "browser",
  target: "es2022",
  format: "esm",
  outfile: "dist/functions/api/[[...route]].js",
  external: [
    "better-sqlite3",
    "express",
    "dotenv",
    "tsx",
    "concurrently",
    "react", "react-dom", "lucide-react", "motion",
    "@tailwindcss/vite", "tailwindcss", "tailwind-merge", "clsx",
    "@vitejs/plugin-react", "vite", "vitest",
    "node:fs", "node:path", "node:url", "node:crypto",
    "server/db/client.ts",
    "fast-xml-parser",
    "@libsql/client",
    "hono",
  ],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

console.log("Cloudflare Pages function bundled to functions/api/[[...route]].js");
