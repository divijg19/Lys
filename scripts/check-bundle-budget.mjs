/**
 * @file: scripts/check-bundle-budget.mjs
 * @description: Fails the build when the initial JavaScript payload regresses.
 *
 * Two checks, both run against the real production output:
 *
 * 1. **Size budget.** The scripts in the prerendered homepage HTML are the ones the browser must
 *    download before it can hydrate the page. Their combined gzip size is the number that decides
 *    how quickly the site becomes interactive, so it is worth a hard ceiling.
 *
 * 2. **three.js stays out of the initial payload.** three.js is ~900 KB raw of library that only
 *    the (lazily loaded) theme scenes need. It got into the initial bundle through an import that
 *    looked harmless -- a console filter in a component that is rendered on every page -- and it
 *    was invisible in the diff, because the file that caused it did not change. A size budget
 *    alone would eventually catch it; this check catches it immediately and names the cause.
 *
 * The numbers live in `scripts/bundle-budget.json` so that raising the ceiling is a deliberate,
 * reviewable act rather than a side effect of an unrelated change.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = process.cwd();
const BUDGET_FILE = path.join(ROOT, "scripts", "bundle-budget.json");
const HTML_FILE = path.join(ROOT, ".next", "server", "app", "index.html");
const CHUNKS_DIR = path.join(ROOT, ".next", "static", "chunks");

/** Markers that only appear in three.js itself. */
const THREE_MARKERS = ["WebGLRenderer", "GLTFLoader", "PerspectiveCamera"];

function fail(message) {
  console.error(`\n✗ Bundle budget check failed\n\n${message}\n`);
  process.exit(1);
}

if (!existsSync(HTML_FILE)) {
  fail(
    `No prerendered homepage at ${path.relative(ROOT, HTML_FILE)}.\nRun \`bun run build\` first.`
  );
}

const budget = JSON.parse(readFileSync(BUDGET_FILE, "utf8"));

/** Every `.js` file under .next/static/chunks, keyed by file name. */
function collectChunks(dir) {
  const found = new Map();
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".js")) found.set(entry.name, full);
    }
  };
  walk(dir);
  return found;
}

if (!existsSync(CHUNKS_DIR)) {
  fail(`No client chunks at ${path.relative(ROOT, CHUNKS_DIR)}.`);
}

const chunks = collectChunks(CHUNKS_DIR);
const html = readFileSync(HTML_FILE, "utf8");
const scriptSources = [...html.matchAll(/<script[^>]*src="([^"]+\.js)"/g)].map((m) => m[1]);
const initialScripts = [...new Set(scriptSources)];

let rawTotal = 0;
let gzipTotal = 0;
const offenders = [];
const rows = [];

for (const src of initialScripts) {
  const file = path.basename(src);
  const full = chunks.get(file);
  if (!full) continue;
  const contents = readFileSync(full);
  const raw = contents.length;
  const gzip = gzipSync(contents, { level: 6 }).length;
  rawTotal += raw;
  gzipTotal += gzip;
  rows.push({ file, raw, gzip });

  const text = contents.toString("utf8");
  const hits = THREE_MARKERS.filter((marker) => text.includes(marker));
  if (hits.length > 0) {
    offenders.push({ file, hits });
  }
}

rows.sort((a, b) => b.gzip - a.gzip);

console.log("Initial JavaScript (from the prerendered homepage):");
for (const row of rows) {
  console.log(
    `  ${(row.raw / 1024).toFixed(1).padStart(8)} KB raw  ${(row.gzip / 1024).toFixed(1).padStart(7)} KB gzip  ${row.file}`
  );
}
console.log(
  `\n  ${(rawTotal / 1024).toFixed(1)} KB raw / ${(gzipTotal / 1024).toFixed(1)} KB gzip across ${rows.length} scripts`
);
console.log(
  `  budget: ${(budget.maxInitialRawKb / 1024).toFixed(1)} MB raw / ${(budget.maxInitialGzipKb / 1024).toFixed(1)} MB gzip`
);

if (offenders.length > 0) {
  fail(
    `three.js is in the initial payload:\n${offenders
      .map((o) => `  ${o.file} contains ${o.hits.join(", ")}`)
      .join(
        "\n"
      )}\n\nTheme scenes are loaded lazily, so three.js must only be reachable from them.\nA module that is rendered on every page cannot import it.`
  );
}

if (rawTotal > budget.maxInitialRawKb * 1024) {
  fail(
    `Initial JavaScript is ${(rawTotal / 1024).toFixed(1)} KB raw, over the ${(budget.maxInitialRawKb / 1024).toFixed(1)} MB budget.`
  );
}

if (gzipTotal > budget.maxInitialGzipKb * 1024) {
  fail(
    `Initial JavaScript is ${(gzipTotal / 1024).toFixed(1)} KB gzip, over the ${(budget.maxInitialGzipKb / 1024).toFixed(1)} MB budget.`
  );
}

console.log("\n✓ Within budget");
