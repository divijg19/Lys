import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { themes } from "@/lib/themes";

const globalsCss = readFileSync(path.resolve(process.cwd(), "src/styles/globals.css"), "utf8");

/**
 * Every token the `@theme` bridge in globals.css wraps in `hsl()`. If a theme block omits
 * one, the corresponding Tailwind colour utility silently resolves to nothing -- no build
 * error, just invisible text or an unstyled control.
 */
const BRIDGED_TOKENS = [
  "border",
  "input",
  "ring",
  "background",
  "foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "destructive",
  "destructive-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "popover",
  "popover-foreground",
  "card",
  "card-foreground",
] as const;

/** Tokens every theme block must also define for layout and shape. */
const STRUCTURAL_TOKENS = ["radius"] as const;

type ThemeBlock = { selector: string; body: string };

/**
 * Extract the token block for each `[data-theme="..."]`.
 *
 * A theme can legitimately have more than one rule keyed on the attribute -- the tokens
 * live in `@layer base`, the Cyberpunk chrome in `@layer utilities` -- so this selects the
 * block that actually defines `--background` rather than the first one it finds. Taking
 * the first would have silently parsed the chrome block, which contains no tokens at all.
 */
function parseThemeBlocks(css: string): Map<string, ThemeBlock> {
  const blocks = new Map<string, ThemeBlock>();
  const pattern = /\[data-theme="([a-z-]+)"\]\s*\{([^}]*)\}/g;
  let match = pattern.exec(css);
  while (match !== null) {
    const [, name, body] = match;
    if (body.includes("--background:") && !blocks.has(name)) {
      blocks.set(name, { selector: name, body });
    }
    match = pattern.exec(css);
  }
  return blocks;
}

/** Remove CSS comments so prose about a token is not read as a declaration of it. */
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

const blocks = parseThemeBlocks(globalsCss);

describe("theme token blocks in globals.css", () => {
  it("defines a block for every registered theme", () => {
    for (const theme of themes) {
      expect(blocks.has(theme.name), `block for ${theme.name}`).toBe(true);
    }
  });

  it("defines no token block for an unregistered theme", () => {
    const registered = new Set<string>(themes.map((t) => t.name as string));
    for (const name of blocks.keys()) {
      expect(registered.has(name), `${name} should be registered`).toBe(true);
    }
  });

  it.each(themes.map((t) => t.name))("%s defines every bridged token", (name) => {
    const block = blocks.get(name);
    expect(block).toBeDefined();
    for (const token of BRIDGED_TOKENS) {
      expect(block?.body, `${name} --${token}`).toMatch(new RegExp(`--${token}:\\s*\\d`));
    }
    for (const token of STRUCTURAL_TOKENS) {
      expect(block?.body, `${name} --${token}`).toMatch(new RegExp(`--${token}:\\s*[\\d.]`));
    }
  });

  it("declares each token exactly once per theme", () => {
    for (const [name, block] of blocks) {
      // Strip comments first: an explanatory comment about a token naturally contains the
      // token's own name, and counting those as declarations produced false failures.
      const declarations = stripComments(block.body);
      for (const token of BRIDGED_TOKENS) {
        const occurrences = declarations.match(new RegExp(`--${token}:`, "g")) ?? [];
        expect(occurrences.length, `${name} --${token} declared once`).toBe(1);
      }
    }
  });

  it("keeps every token value a bare HSL triplet or a plain length", () => {
    // A stray `hsl(...)` wrapper here would break opacity modifiers like `bg-primary/90`,
    // because the @theme bridge already applies hsl().
    const hslPattern = /--[\w-]+:\s*hsl\(/;
    for (const [name, block] of blocks) {
      expect(stripComments(block.body), `${name} has no nested hsl()`).not.toMatch(hslPattern);
    }
  });
});

/* ------------------------------------------------------------------ contrast --- */

/** Convert a bare `H S% L%` triplet to 8-bit sRGB. */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let rgb: [number, number, number];
  if (hp < 1) rgb = [c, x, 0];
  else if (hp < 2) rgb = [x, c, 0];
  else if (hp < 3) rgb = [0, c, x];
  else if (hp < 4) rgb = [0, x, c];
  else if (hp < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  const m = light - c / 2;
  return rgb.map((v) => Math.round((v + m) * 255)) as [number, number, number];
}

function readToken(name: string, token: string): [number, number, number] | null {
  const body = blocks.get(name)?.body;
  const match = new RegExp(`--${token}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%`).exec(body ?? "");
  if (!match) return null;
  return hslToRgb(Number(match[1]), Number(match[2]), Number(match[3]));
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const toLinear = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [high, low] = la > lb ? [la, lb] : [lb, la];
  return (high + 0.05) / (low + 0.05);
}

/** Themes this pass took ownership of. Horizon, Mirage and Simple are deferred. */
const THEMES_IN_SCOPE = ["light", "dark", "cyberpunk", "ethereal"] as const;

/**
 * Resolve a token, or fail the test.
 *
 * Deliberately throws rather than returning a sentinel. The existing icon contrast test
 * returns early when colour parsing fails, which lets it pass without ever checking
 * anything; a missing token here means a colour utility is resolving to nothing in the
 * running app, which is precisely what these assertions exist to catch.
 */
function requireToken(name: string, token: string): [number, number, number] {
  const value = readToken(name, token);
  if (value === null) {
    throw new Error(
      `Could not parse --${token} for theme "${name}". No token block found or it is malformed.`
    );
  }
  return value;
}

/**
 * Unlike the existing icon contrast test, these assertions fail loudly when a token cannot
 * be resolved rather than returning early. A silently skipped check is worse than no check.
 */
describe("theme contrast in the redesigned set", () => {
  it.each(THEMES_IN_SCOPE)("%s resolves every token used for contrast", (name) => {
    for (const token of [
      "background",
      "foreground",
      "primary",
      "primary-foreground",
      "muted",
      "muted-foreground",
    ]) {
      expect(readToken(name, token), `${name} --${token}`).not.toBeNull();
    }
  });

  it.each(THEMES_IN_SCOPE)("%s body text meets WCAG AA against the background", (name) => {
    const ratio = contrastRatio(requireToken(name, "foreground"), requireToken(name, "background"));
    expect(ratio, `${name} foreground/background`).toBeGreaterThanOrEqual(4.5);
  });

  it.each(THEMES_IN_SCOPE)("%s muted text meets WCAG AA against the background", (name) => {
    const ratio = contrastRatio(
      requireToken(name, "muted-foreground"),
      requireToken(name, "background")
    );
    expect(ratio, `${name} muted-foreground/background`).toBeGreaterThanOrEqual(4.5);
  });

  it.each(THEMES_IN_SCOPE)("%s primary button text meets WCAG AA on its fill", (name) => {
    const ratio = contrastRatio(
      requireToken(name, "primary-foreground"),
      requireToken(name, "primary")
    );
    expect(ratio, `${name} primary-foreground/primary`).toBeGreaterThanOrEqual(4.5);
  });

  it("gives cyberpunk a border visible enough to be seen", () => {
    // The previous `180 80% 20%` sat within a couple of points of --card, so every
    // hairline in the UI disappeared. This locks in the fix.
    const border = requireToken("cyberpunk", "border");
    const card = requireToken("cyberpunk", "card");
    const ratio = contrastRatio(border, card);
    expect(ratio, "cyberpunk border/card").toBeGreaterThanOrEqual(1.4);
  });
});

/* --------------------------------------------------- cyberpunk token integrity --- */

/**
 * Remove CSS comments so prose naming a token is not counted as a use of it, and prose
 * describing a token is not counted as a declaration of it.
 */
const stripAllComments = (source: string): string => stripComments(source);

function collectCpTokens(): { declared: Set<string>; used: Set<string> } {
  const declared = new Set<string>();
  const used = new Set<string>();

  // Declarations come from globals.css only.
  for (const match of stripAllComments(globalsCss).matchAll(/(--cp-[a-z0-9-]+)\s*:/g)) {
    declared.add(match[1]);
  }

  // Uses can come from the stylesheet or from inline styles in components, because several
  // Cyberpunk effects compose gradient strings in TypeScript and interpolate the token.
  for (const file of walkSrc()) {
    const source = stripAllComments(readFileSync(file, "utf8"));
    for (const match of source.matchAll(/var\(\s*(--cp-[a-z0-9-]+)/g)) {
      used.add(match[1]);
    }
  }

  return { declared, used };
}

/** Every `.css`/`.ts`/`.tsx` under `src`, as a flat list. */
function walkSrc(dir = path.resolve(process.cwd(), "src")): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkSrc(full));
    } else if (/\.(css|ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

describe("cyberpunk (--cp-*) tokens", () => {
  const { declared, used } = collectCpTokens();

  it("declares at least one --cp-* token", () => {
    // Guards the scan: an empty set would make every assertion below vacuously true.
    expect(declared.size).toBeGreaterThan(0);
  });

  it("declares no token that is never referenced", () => {
    /*
     * Six were removed in v0.2.7 for exactly this: --cp-neon-cyan, --cp-neon-magenta,
     * --cp-neon-amber, --cp-asphalt, --cp-signage-text and --cp-reflection-strength. Four
     * of them duplicated the haze tokens the scene actually reads.
     *
     * An unreferenced token is worse than no token: it reads as a live design decision and
     * invites a maintainer to "fix" a value that nothing consumes.
     */
    const dead = [...declared].filter((token) => !used.has(token)).sort();
    expect(dead, `unreferenced --cp-* tokens: ${dead.join(", ")}`).toEqual([]);
  });

  it("references no token that is never declared", () => {
    /*
     * `--cp-accent` was referenced by NeonGlow but declared nowhere. An undeclared custom
     * property makes the *entire* declaration invalid at computed-value time, so the glow
     * layer it belonged to resolved to `none` and silently drew nothing -- no build error, no
     * console warning, just a missing effect.
     */
    const undeclared = [...used].filter((token) => !declared.has(token)).sort();
    expect(undeclared, `undeclared --cp-* tokens: ${undeclared.join(", ")}`).toEqual([]);
  });

  it("keeps the token ledger balanced", () => {
    expect(declared.size).toBe(used.size);
  });
});
