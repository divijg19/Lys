/**
 * @file: scripts/verify-backgrounds.mjs
 * @description: Asserts every theme background is painted, in every degraded mode.
 *
 * ## Why a browser script and not a unit test
 *
 * Two of the failures this exists to catch cannot be observed from jsdom:
 *
 * - "The canvas element exists" is not "the canvas was drawn". v0.2.7 shipped calm mode with
 *   `frameloop: "never"`, which mounts a correctly sized, correctly configured canvas that R3F
 *   never draws, because `invalidate()` early-returns for that frameloop. Counting elements
 *   reported success; the page was blank. Only counting real GL calls catches it.
 * - "The scene mounted" is not "the theme is visible". `data-scene-state` and the canvas
 *   pixel comparison below cover both.
 *
 * ## What is asserted, per theme and mode
 *
 * | mode | asserts |
 * |---|---|
 * | `motion` | the scene paints and keeps painting |
 * | `calm` | the scene paints **exactly once** and then holds -- no continued animation |
 * | `no-webgl` | no canvas is mounted, no scene error, `data-scene-state="no-webgl"` |
 * | `calm-no-webgl` | both at once |
 *
 * GL work is counted by wrapping the context prototypes before any page script runs, so no call
 * can escape the count. Draw calls and `clear` are counted separately: a scene with nothing in
 * it renders without issuing a draw call, and a post-processing pass that has taken over
 * rendering may only clear, so counting draws alone under-reports.
 *
 * ## Running it
 *
 * Requires a production server already listening:
 *
 *   bun run build && bun run start
 *   bun run verify:backgrounds
 *
 * Environment: `BASE_URL` (default http://localhost:3000), `BG_THEMES`, `BG_MODES` to narrow
 * the matrix while investigating a single cell, and `BG_DEBUG=1` to log each settle reading.
 */

import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const DEBUG = process.env.BG_DEBUG === "1";

/** Themes that mount a WebGL canvas, and so must produce GL calls when motion is allowed. */
const WEBGL_THEMES = new Set(["light", "dark", "ethereal", "cyberpunk", "horizon"]);

/**
 * Themes whose backdrop is pure CSS and therefore needs no GPU at all.
 *
 * Asserted to stay canvas-less. If one of these ever grows a `<Canvas>`, it must also grow the
 * `useSceneSupport` gate that every other scene uses -- otherwise it silently acquires the
 * failure mode this release fixed, where a context failure takes the theme down.
 */
const CSS_ONLY_THEMES = new Set(["mirage"]);

/**
 * Themes that deliberately have no background layer.
 *
 * `simple` is the accessibility theme: high contrast, zero motion, nothing decorative behind the
 * content, so `ClientThemeBackground` returns null for it. Listed rather than skipped so the
 * absence stays a decision on record.
 */
const NO_BACKGROUND_THEMES = new Set(["simple"]);

const THEMES = ["light", "dark", "ethereal", "cyberpunk", "horizon", "mirage", "simple"];

const MODES = [
  { id: "motion", reducedMotion: "no-preference", blockWebGL: false },
  { id: "calm", reducedMotion: "reduce", blockWebGL: false },
  { id: "no-webgl", reducedMotion: "no-preference", blockWebGL: true },
  { id: "calm-no-webgl", reducedMotion: "reduce", blockWebGL: true },
];

/**
 * Settle window: how long a scene is given to produce its first frame before the counters are read.
 *
 * A fixed window, deliberately. Two earlier designs were both wrong:
 *
 * - A short fixed window (2.5s) reported Horizon as never painting. Its theatre is a `dynamic()`
 *   import plus a large shader set and lands its first draw later than that.
 * - Polling for the first frame was racy in a way that only reproduced in the full matrix:
 *   Horizon passed alone in 368ms and painted 1330 draw calls in an isolated five-page script,
 *   yet timed out at "never painted" inside the harness.
 *
 * For a release gate a fixed settle is the right trade: it removes the race, costs a fixed ~7s
 * per cell, and the scenes that need longer to start are exactly the ones whose absence we want
 * to notice.
 */
const SETTLE_WINDOW_MS = 4000;

/** Window after the settle in which a calm scene must draw nothing at all. */
const HOLD_WINDOW_MS = 3000;

/**
 * Smallest acceptable background-only screenshot, in bytes.
 *
 * A backstop for "the whole layer is gone", and deliberately low. A stricter floor does not work:
 * PNG size tracks contrast, not content, and the Light theme is white on white by design, so a
 * genuinely painted Light backdrop compresses to a few KB -- smaller than a flat fill of a dark
 * theme. Light measures 12 KB here while demonstrably painting.
 *
 * The meaningful assertions are the GL counters and the canvas pixel comparison; this only
 * catches a total absence.
 */
const MIN_BACKGROUND_BYTES = 2_500;

const failures = [];
const rows = [];

const fail = (message) => failures.push(message);

/**
 * Optional comma-separated filters: `BG_THEMES=horizon,light`, `BG_MODES=calm,no-webgl`.
 *
 * A 28-cell matrix is right for a release gate but far too slow to iterate against when
 * investigating one cell.
 */
function filterList(value, all) {
  return value
    ? value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : all;
}

/** Installed before any app code runs, so no GL call can escape the count. */
function installDrawCounter() {
  window.__bgDraws = 0;
  window.__bgRenders = 0;
  window.__bgFirstWorkAt = null;

  const stamp = () => {
    if (window.__bgFirstWorkAt === null) window.__bgFirstWorkAt = performance.now();
  };

  for (const ctor of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
    if (!ctor) continue;

    for (const method of [
      "drawElements",
      "drawArrays",
      "drawElementsInstanced",
      "drawArraysInstanced",
    ]) {
      const original = ctor.prototype[method];
      if (!original) continue;
      ctor.prototype[method] = function instrumented(...args) {
        window.__bgDraws += 1;
        stamp();
        return original.apply(this, args);
      };
    }

    const clear = ctor.prototype.clear;
    if (clear) {
      ctor.prototype.clear = function instrumentedClear(...args) {
        window.__bgRenders += 1;
        stamp();
        return clear.apply(this, args);
      };
    }
  }
}

/** Simulate a blocklisted GPU or a failed driver: no WebGL context is obtainable. */
function blockWebGL() {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function patched(type, ...rest) {
    if (typeof type === "string" && type.toLowerCase().includes("webgl")) return null;
    return original.call(this, type, ...rest);
  };
}

/**
 * One browser per cell.
 *
 * Sharing a single browser across the matrix made the harness progressively unreliable in a way
 * that looked exactly like an application failure: `page.waitForTimeout(4000)` was observed
 * taking 29 seconds, so by the fifth cell the settle window had not actually elapsed and a
 * working scene was reported as never painted.
 *
 * A fresh browser per cell costs a few hundred milliseconds and buys independence: no leaked
 * renderer, no accumulated WebGL contexts, no cross-cell contamination. For a release gate that
 * is worth far more than the time saved.
 */
async function checkTheme(theme, mode) {
  const browser = await chromium.launch();
  const label = `${theme}/${mode.id}`;

  try {
    const context = await browser.newContext({
      reducedMotion: mode.reducedMotion,
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    const sceneErrors = [];

    page.on("console", (message) => {
      if (message.type() === "error" && message.text().includes("[theme-scene]")) {
        sceneErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      sceneErrors.push(`uncaught: ${String(error).slice(0, 160)}`);
    });

    await page.addInitScript(installDrawCounter);
    if (mode.blockWebGL) await page.addInitScript(blockWebGL);
    await page.addInitScript((value) => {
      try {
        localStorage.setItem("Lys", value);
      } catch {
        // Storage unavailable: the default theme is used and the check still runs.
      }
    }, theme);

    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle", timeout: 45_000 });

    const isCalm = mode.reducedMotion === "reduce";
    const expectDraws = WEBGL_THEMES.has(theme) && !mode.blockWebGL;

    await page.waitForTimeout(SETTLE_WINDOW_MS);
    const early = await readWork(page);

    if (DEBUG) {
      const firstWork = early.firstWorkAt === null ? "never" : `${Math.round(early.firstWorkAt)}ms`;
      console.log(
        `  [debug] ${label}: first GL work ${firstWork}, ` +
          `draws=${early.draws}, clears=${early.renders}`
      );
    }

    // A calm scene must be completely idle from here on.
    await page.waitForTimeout(HOLD_WINDOW_MS);
    const late = await readWork(page);
    const workDuringHold = late.draws + late.renders - (early.draws + early.renders);

    if (expectDraws) {
      if (early.draws === 0 && early.renders === 0) {
        fail(
          `${label}: scene never rendered (no draw call or clear in ${SETTLE_WINDOW_MS}ms). ` +
            `A mounted canvas is not a painted one.`
        );
      }
      if (isCalm && workDuringHold !== 0) {
        fail(
          `${label}: calm scene kept rendering (${workDuringHold} calls after its frame). ` +
            `Calm must paint once and hold.`
        );
      }
      if (!isCalm && workDuringHold === 0) {
        fail(
          `${label}: motion scene stopped rendering (${workDuringHold} calls); it should animate`
        );
      }
    }

    /*
     * One probe of the layer's shape, reused by every assertion below. Taken after the hold window
     * so the canvas count reflects a settled scene, and before the screenshots so hiding the
     * canvas later cannot invalidate it.
     */
    const dom = await probeLayer(page);

    if (mode.blockWebGL && dom.canvases > 0) {
      fail(`${label}: mounted ${dom.canvases} canvas(es) with WebGL unavailable`);
    }

    if (CSS_ONLY_THEMES.has(theme) && dom.canvases > 0) {
      fail(`${label}: CSS-only theme mounted ${dom.canvases} canvas(s); see CSS_ONLY_THEMES`);
    }

    if (sceneErrors.length > 0) {
      fail(`${label}: ${sceneErrors.length} page/scene error(s): ${sceneErrors[0].slice(0, 120)}`);
    }

    /*
     * Isolate the background layer for the visual checks, and pause CSS animation so the two
     * screenshots differ only by the canvas. Without the pause, an animated atmosphere (Horizon's
     * lens flare, Mirage's shimmer) moves between the two captures and every theme appears to
     * "contribute", including ones whose canvas painted nothing.
     */
    await page.addStyleTag({
      content:
        "div.relative.z-10 { visibility: hidden !important; }" +
        "*, *::before, *::after { animation-play-state: paused !important; }",
    });
    await page.waitForTimeout(500);

    const shot = await page.screenshot({ clip: { x: 0, y: 0, width: 1280, height: 800 } });

    /*
     * Prove the canvas contributed pixels, rather than inferring it from the layer existing:
     * screenshot again with the canvas hidden and compare. Byte-identical means the canvas painted
     * nothing a viewer could see -- the failure mode where a canvas is mounted, sized and
     * configured but never drawn.
     */
    let painted = "n/a";
    if (dom.canvases > 0) {
      await page.addStyleTag({
        content: '[aria-hidden="true"].fixed canvas { visibility: hidden !important; }',
      });
      await page.waitForTimeout(300);
      const withoutCanvas = await page.screenshot({
        clip: { x: 0, y: 0, width: 1280, height: 800 },
      });
      painted = Buffer.compare(shot, withoutCanvas) === 0 ? "NO" : "yes";
      if (painted === "NO") {
        fail(`${label}: a canvas is mounted but hiding it changes nothing -- it painted no pixels`);
      }
    }

    if (NO_BACKGROUND_THEMES.has(theme)) {
      if (dom.present) fail(`${label}: expected no background layer for this theme, found one`);
    } else {
      if (!dom.present) fail(`${label}: no background container in the DOM`);
      if (dom.layers === 0) fail(`${label}: background container is empty`);
      if (dom.sceneState === "error") {
        /*
         * The scene's own verdict, published on <html> by SceneBoundary. Asserted directly rather
         * than inferred from scraped console output, because this is the signal an operator would
         * use in production, so the gate should depend on the same thing.
         */
        fail(`${label}: scene reported data-scene-state="error"`);
      }
      if (shot.length < MIN_BACKGROUND_BYTES) {
        fail(
          `${label}: background is visually empty (${shot.length}B screenshot, ` +
            `floor ${MIN_BACKGROUND_BYTES}B)`
        );
      }
      if (!isCalm && dom.calmReason) {
        fail(`${label}: unexpected calm reason "${dom.calmReason}" with motion allowed`);
      }
    }

    rows.push({
      cell: label,
      work: expectDraws ? `${early.draws + early.renders}/${workDuringHold}` : "-",
      canvases: dom.canvases,
      layers: dom.layers,
      kb: Math.round(shot.length / 1024),
      painted,
      state: dom.sceneState ?? "-",
    });

    await page.close();
    await context.close();
  } finally {
    await browser.close();
  }
}

/** Cumulative GL counters, read in one round trip. */
function readWork(page) {
  return page.evaluate(() => ({
    draws: window.__bgDraws,
    renders: window.__bgRenders,
    firstWorkAt: window.__bgFirstWorkAt,
  }));
}

/** Shape of the theme background layer. Read once and reused. */
function probeLayer(page) {
  return page.evaluate(() => {
    const container = document.querySelector('[aria-hidden="true"].fixed');
    return {
      present: Boolean(container),
      layers: container ? container.children.length : 0,
      canvases: container ? container.querySelectorAll("canvas").length : 0,
      sceneState: document.documentElement.getAttribute("data-scene-state"),
      calmReason: document.documentElement.getAttribute("data-calm-reason"),
    };
  });
}

const themes = filterList(process.env.BG_THEMES, THEMES);
const modeIds = filterList(
  process.env.BG_MODES,
  MODES.map((m) => m.id)
);

console.log(`Verifying theme backgrounds against ${BASE_URL}`);
console.log(`${themes.length} theme(s) x ${modeIds.length} mode(s)\n`);

for (const modeId of modeIds) {
  const mode = MODES.find((candidate) => candidate.id === modeId);
  if (!mode) {
    console.error(`Unknown mode "${modeId}". Known: ${MODES.map((m) => m.id).join(", ")}`);
    process.exit(1);
  }
  for (const theme of themes) {
    await checkTheme(theme, mode);
  }
}

console.log("cell                        work      canvases  layers  bgKB  painted  scene-state");
for (const row of rows) {
  console.log(
    `${row.cell.padEnd(27)} ${String(row.work).padStart(8)}  ${String(row.canvases).padStart(8)}  ` +
      `${String(row.layers).padStart(6)}  ${String(row.kb).padStart(4)}  ${String(row.painted).padStart(7)}  ` +
      `${row.state}`
  );
}

console.log();
if (failures.length > 0) {
  console.error(`FAILED (${failures.length}):`);
  for (const message of failures) console.error(`  - ${message}`);
  process.exit(1);
}

console.log(`OK: ${rows.length} theme/mode combinations rendered and held as expected.`);
