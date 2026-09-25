/**
 * build.mjs — copies the web app into www/ for Capacitor.
 * Only the files listed in APP_FILES are shipped.
 */

import { cp, rm, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "www");

const APP_FILES = [
  "index.html",
  "manifest.webmanifest",
  "sw.js",
  "css",
  "js",
  "data",
  "assets",
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir);

for (const entry of APP_FILES) {
  await cp(path.join(root, entry), path.join(outDir, entry), {
    recursive: true,
    filter: (src) => path.basename(src) !== ".DS_Store",
  });
}

console.log(`Built ${APP_FILES.length} entries into ${path.relative(root, outDir)}/`);
