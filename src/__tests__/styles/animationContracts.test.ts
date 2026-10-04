/**
 * @file: src/__tests__/styles/animationContracts.test.ts
 * @description: Guards on the stylesheets that jsdom cannot evaluate.
 *
 * Two classes of defect, both of which shipped before being caught by hand:
 *
 * - **Duplicate `@keyframes` names across files.** The cascade keeps the *last* definition and
 *   silently discards the earlier one. `neon-flicker` was defined twice -- once as the Cyberpunk
 *   theme animation in `animations.css` and once as the keyframes for the global `.text-neon`
 *   utility in `globals.css` -- so the Theme 3 definition, including its `opacity: 0.7` dip,
 *   had never run. Nothing warns; the CSS parses cleanly and the wrong animation plays.
 * - **Opt-in utilities leaking across themes.** `.terminal-cursor` sat in a block commented
 *   as Cyberpunk-specific, with a bare class selector, so `@keyframes cursor-blink` -- which is
 *   global, because keyframes always are -- animated the hero caret in all seven themes.
 *   Confirmed with `document.getAnimations()`, which reported `cursor-blink` running once per
 *   theme including light, dark, ethereal, horizon and mirage.
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

/**
 * Every bare token appearing inside a string or template literal in `src`, excluding tests.
 *
 * That is the set of class names a component could actually apply. A plain substring search
 * over the file is not sufficient: prose and JSX comments name these classes constantly
 * ("the final grade (scanlines, vignette, grain)"), so `.scanlines` looked live when nothing
 * applies it -- and a guard pointed at a class nobody renders can only ever pass vacuously.
 */
function collectStringLiteralTokens(): Set<string> {
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

      for (const match of source.matchAll(/["'`]([^"'`]*)/g)) {
        for (const token of match[1].split(/[^A-Za-z0-9_-]+/)) {
          if (token) tokens.add(token);
        }
      }
    }
  };

  walk(SRC);
  return tokens;
}

describe("@keyframes names", () => {
  const files = stylesheets();

  it("finds the stylesheets", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("are unique across every stylesheet", () => {
    /*
     * `@keyframes` are global once defined, so a duplicate name is a silent override rather than
     * a redeclaration: the browser keeps the last and drops the rest, with no warning. That is
     * how `neon-flicker` ended up defined twice and how the Cyberpunk flicker's `opacity` dip
     * stopped being reachable.
     */
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

    expect(duplicates, `duplicate @keyframes: ${duplicates.join("; ")}`).toEqual([]);
  });

  it("leaves no unreferenced keyframes block", () => {
    /*
     * A definition with no `animation` reference is dead weight that still occupies a global
     * name, so a later rule can collide with it invisibly. `neon-flicker` outlived its last
     * consumer -- `.animate-neon-flicker`, removed in `b340fb3` -- for about a year.
     */
    const all = files.map((f) => stripComments(read(f))).join("\n");
    const orphans: string[] = [];

    for (const file of files) {
      for (const match of stripComments(read(file)).matchAll(/@keyframes\s+([A-Za-z0-9_-]+)/g)) {
        const name = match[1];
        const referenced = new RegExp(`\\banimation(?:-name)?\\b[^;{]*\\b${name}\\b`).test(all);
        if (!referenced) orphans.push(`${name} (${rel(file)})`);
      }
    }

    expect(orphans, `unreferenced @keyframes: ${orphans.join("; ")}`).toEqual([]);
  });
});

describe("cyberpunk utility scoping", () => {
  const globals = read(path.join(STYLES, "globals.css"));
  const literals = collectStringLiteralTokens();

  /**
   * The opt-in utilities region: from its marker comment to the keyframes block.
   *
   * Anything here is global unless its selector is prefixed, so this is where a cross-theme leak
   * originates. The five dead utilities in this region (`text-glitch`, `text-neon`,
   * `holographic`, `scanlines`, `cyber-grid`) are inert and cannot leak, so they are excluded
   * by having no consumer.
   */
  function utilitiesRegion(): string {
    const lines = globals.split("\n");
    const start = lines.findIndex((l) => /CYBERPUNK UTILITIES/.test(l));
    const end = lines.findIndex((l, i) => i > start && /CYBERPUNK ANIMATIONS/.test(l));
    expect(start, "found the cyberpunk utilities marker").toBeGreaterThan(-1);
    expect(end, "found the cyberpunk keyframes marker").toBeGreaterThan(start);
    return lines.slice(start, end).join("\n");
  }

  /**
   * Class names appearing in selector position anywhere in the region.
   *
   * Deliberately not anchored to the start of the line. Anchoring at `^\s*\.` matches only bare
   * selectors, so the moment a rule *is* scoped -- `html[data-theme="cyberpunk"] .foo {` -- it
   * stops being collected and the guard goes vacuous exactly when it matters. Only lines that
   * open a block count as selectors, so decimal values such as `0.5rem` are not mistaken for
   * class names.
   */
  function declaredUtilities(): string[] {
    const names = new Set<string>();
    for (const line of stripComments(utilitiesRegion()).split("\n")) {
      if (!line.includes("{")) continue;
      for (const match of line.matchAll(/\.([a-z][a-z0-9-]*)\b/g)) names.add(match[1]);
    }
    return [...names].sort();
  }

  /** Of those, the ones something actually applies. */
  function liveUtilities(): string[] {
    const themeAgnostic = new Set(["floating-footer"]);
    return declaredUtilities().filter((c) => !themeAgnostic.has(c) && literals.has(c));
  }

  /** Full selector declarations of `className`, captured from the line start so prefixes count. */
  function declarationsOf(className: string, source: string): string[] {
    return source.match(new RegExp(`^[^\\n{]*\\.${className}\\b[^\\n{]*\\{`, "gm")) ?? [];
  }

  it("finds a live utility to guard, and it is the caret", () => {
    // Pins that the scan points at something real. If nothing here were live there would be no
    // leak to catch, and every assertion below would be vacuous.
    expect(liveUtilities()).toContain("terminal-cursor");
  });

  it.each(liveUtilities())("scopes .%s to the cyberpunk theme", (className) => {
    const declarations = declarationsOf(className, stripComments(utilitiesRegion()));
    expect(declarations.length, `.${className} should be declared in this region`).toBeGreaterThan(
      0
    );

    for (const declaration of declarations) {
      expect(
        declaration,
        `.${className} is declared unscoped, so it applies to every theme`
      ).toMatch(/html\[data-theme="cyberpunk"\]/);
    }
  });

  it("declares terminal-cursor exactly once, scoped", () => {
    // Captured from the line start so the theme-attribute prefix is part of the match; anchoring
    // at `.terminal-cursor` alone would never see the prefix.
    const declarations = declarationsOf("terminal-cursor", stripComments(globals));
    expect(declarations.length, `terminal-cursor declared ${declarations.length} time(s)`).toBe(1);
    expect(declarations[0]).toMatch(/html\[data-theme="cyberpunk"\]/);
  });
});
