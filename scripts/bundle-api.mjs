import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["server/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: "api/index.js",
  external: [
    "better-sqlite3",
    "express",
    "dotenv",
    "fast-xml-parser",
    "tsx",
  ],
  banner: {
    js: 'process.env.VERCEL = "1";'
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

console.log("API bundle built to api/index.js");
