/**
 * @file: src/__tests__/styles/animationContracts.test.ts
 * @description: Guards the stylesheet contracts that jsdom cannot evaluate.
 *
 * `@keyframes` names are global once defined. A duplicate is therefore not a redeclaration but a
 * **silent override**: the browser keeps the last definition and discards the earlier ones, with
 * no warning. The CSS parses cleanly and the wrong animation plays.
 *
 * That is not hypothetical. `neon-flicker` was defined twice -- once as the Cyberpunk theme
 * animation in `animations.css` and once as the keyframes for the global `.text-neon` utility in
 * `globals.css`. Because `globals.css` imports `animations.css` near its top and its own
 * definition sits further down, the utility's version won, and the Cyberpunk flicker had never
 * run. The same file also scoped `.terminal-cursor` -- a class applied by the shared `Hero` -- with
 * a bare selector inside a block commented as Cyberpunk-specific, so the caret blinked in all
 * seven themes.
 *
 * Both are cheap to assert and invisible to every other test in the suite, so they live here.
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SRC = path.resolve(process.cwd(), "src");
const STYLES = path.join(SRC, "styles");

/** Every stylesheet under `src/styles`, so a new file cannot introduce a collision unnoticed. */
function stylesheets(dir = STYLES): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...stylesheets(full));
    else if (entry.name.endsWith(".css")) found.push(full);
  }
  return found.sort();
}

const read = (file: string): string => readFileSync(file, "utf8");
const rel = (file: string): string => path.relative(process.cwd(), file);

/** Strip block comments, so prose about a name is not read as a use of it. */
const stripComments = (source: string): string => source.replace(/\/\*[\s\S]*?\*\//g, "");

/** All `.ts`/`.tsx` under `src`, minus tests, as one blob. */
function readComponentSources(): string {
  let blob = "";
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "__tests__") walk(full);
      } else if (/\.tsx?$/.test(entry.name)) {
        blob += read(full);
      }
    }
  };
  walk(SRC);
  return blob;
}

describe("@keyframes names", () => {
  const files = stylesheets();

  it("finds the stylesheets", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("are unique across every stylesheet", () => {
    const seen = new Map<string, string[]>();
    for (const file of files) {
      for (const match of stripComments(read(file)).matchAll(/@keyframes\s+([A-Za-z0-9_-]+)/g)) {
        const name = match[1];
        seen.set(name, [...(seen.get(name) ?? []), rel(file)]);
      }
    }

    const duplicates = [...seen.entries()]
      .filter(([, locations]) => locations.length > 1)
      .map(([name, locations]) => `${name} in ${locations.join(" + ")}`);

    expect(
      duplicates,
      `duplicate @keyframes (later definition silently wins): ${duplicates.join("; ")}`
    ).toEqual([]);
  });

  it("leaves no unreferenced keyframes block", () => {
    /*
     * A definition with no reference at all is dead weight that still occupies a global name, so a
     * later rule can collide with it invisibly.
     *
     * References have to be looked for in two places, not one. A first version of this check only
     * scanned the stylesheets for `animation` / `animation-name` declarations and reported
     * `beacon-blink` and `rain-fall` as orphans. Both are genuinely used -- through Tailwind
     * arbitrary values in `CitySilhouette.tsx`:
     *
     *   animate-[beacon-blink_2s_ease-in-out_infinite]
     *   animate-[rain-fall_1.4s_linear_infinite]
     *
     * Neither appears in any `.css` file, so a stylesheet-only search cannot see them.
     */
    const allCss = files.map((f) => stripComments(read(f))).join("\n");
    const componentSource = readComponentSources();
    const orphans: string[] = [];

    for (const file of files) {
      for (const match of stripComments(read(file)).matchAll(/@keyframes\s+([A-Za-z0-9_-]+)/g)) {
        const name = match[1];
        const inCss = new RegExp(`\\banimation(?:-name)?\\b[^;{]*\\b${name}\\b`).test(allCss);
        // Anywhere in component source covers `animate-[...]`, inline styles and direct
        // `animationName` use alike.
        if (!inCss && !componentSource.includes(name)) orphans.push(`${name} (${rel(file)})`);
      }
    }

    expect(orphans, `unreferenced @keyframes: ${orphans.join("; ")}`).toEqual([]);
  });
});

describe("theme-scoped utilities", () => {
  const globals = stripComments(read(path.join(STYLES, "globals.css")));

  /**
   * Utilities applied by a *shared* component, which therefore leak across themes unless their
   * selector is scoped. Derived from live className usage rather than hardcoded, so a newly
   * shared utility is picked up automatically.
   */
  function sharedUtilityClasses(): string[] {
    const tokens = new Set<string>();

    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== "__tests__") walk(full);
          continue;
        }
        if (!/\.tsx?$/.test(entry.name)) continue;

        const source = read(full)
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/^\s*\/\/.*$/gm, "");

        // Only string and template literals: prose and JSX comments name these classes too.
        for (const match of source.matchAll(/["'`]([^"'`]*)/g)) {
          for (const token of match[1].split(/[^A-Za-z0-9_-]+/)) {
            if (token) tokens.add(token);
          }
        }
      }
    };

    walk(SRC);

    /*
     * The opt-in utilities region is intentionally unscoped -- a component names one to opt in.
     * These two are the exception, because a component that every theme renders names them
     * unconditionally. Both carry an animation, which is what makes a leak visible.
     */
    return ["terminal-cursor"].filter((name) => tokens.has(name));
  }

  it("finds the shared utility it needs to guard", () => {
    // If nothing here were live there would be no leak to catch and the assertion would be
    // vacuous, so this pins that the scan points at something real.
    expect(sharedUtilityClasses()).toContain("terminal-cursor");
  });

  it.each(sharedUtilityClasses())("scopes .%s to a theme", (className) => {
    // Capture from the start of the line so the attribute prefix is part of the match;
    // anchoring at `.class` alone would never see the prefix and would report scoped rules as
    // unscoped.
    const declarations =
      globals.match(new RegExp(`^[^\\n{]*\\.${className}\\b[^\\n{]*\\{`, "gm")) ?? [];

    expect(declarations.length, `.${className} should be declared exactly once`).toBe(1);
    for (const declaration of declarations) {
      expect(declaration, `.${className} is unscoped, so it applies to every theme`).toMatch(
        /html\[data-theme="[a-z]+"\]/
      );
    }
  });
});
