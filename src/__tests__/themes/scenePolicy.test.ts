/**
 * @file: src/__tests__/themes/scenePolicy.test.ts
 * @description: Guards the v0.2.7 rule: calm means freeze, never delete.
 *
 * Two layers of test, because they fail for different reasons:
 *
 * 1. `sceneMotionPolicy` unit tests. These pin the capability table, so the calm policy can
 *    never quietly regrow a "remove the scene" affordance.
 * 2. A source scan of the whole theme layer. jsdom has no WebGL, so the scenes cannot be
 *    mounted and asserted on directly -- and the original regression shipped *because*
 *    nothing asserted on them. Scanning for the exact pattern that caused the outage turns
 *    "impossible to test" into "cheap to check", and it fails loudly the moment someone
 *    reintroduces `if (isCalm) return null`.
 *
 * The scan covers `src/components/theme` recursively, not just `scenes/`, because the same
 * mistake is just as easy in an effect component and just as visible when it goes wrong.
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CALM_SCENE_POLICY,
  type CalmReason,
  calmReasonFrom,
  MOTIVE_SCENE_POLICY,
  readCalmReasonFromElement,
  sceneMotionPolicy,
} from "@/lib/calm";

describe("calmReasonFrom", () => {
  it("is null when neither signal applies", () => {
    expect(calmReasonFrom({ reduceMotion: false, lowData: false })).toBeNull();
  });

  it("prefers reduce-motion over low-data when both apply", () => {
    // Reduced motion is an explicit, persistent user choice; a connection type is
    // transient, so it should not win the label when both are true.
    expect(calmReasonFrom({ reduceMotion: true, lowData: true })).toBe("reduce-motion");
  });

  it.each([
    [{ reduceMotion: true, lowData: false }, "reduce-motion"],
    [{ reduceMotion: false, lowData: true }, "low-data"],
  ] as const)("resolves %o to %s", (flags, expected) => {
    expect(calmReasonFrom(flags)).toBe(expected);
  });
});

describe("readCalmReasonFromElement", () => {
  it("is null for a missing element", () => {
    expect(readCalmReasonFromElement(null)).toBeNull();
    expect(readCalmReasonFromElement(undefined)).toBeNull();
  });

  it("reads the reason off a detached element", () => {
    const el = document.createElement("html");
    el.setAttribute("data-low-data", "true");
    expect(readCalmReasonFromElement(el)).toBe("low-data");
  });

  it.each([...["data-reduce-motion", "data-low-data"]] as const)(
    "treats %s with any value, including 'false', as calm",
    (attribute) => {
      // Presence is the signal, not the value. A literal "false" must never be read as a
      // request for motion.
      const el = document.createElement("html");
      el.setAttribute(attribute, "false");
      expect(readCalmReasonFromElement(el)).not.toBeNull();
    }
  );
});

describe("sceneMotionPolicy", () => {
  it("stops every motion capability when calm", () => {
    const policy = sceneMotionPolicy(true);
    for (const [key, value] of Object.entries(policy)) {
      if (key === "frameloop") {
        expect(value, "frameloop holds a single frame").toBe("never");
        continue;
      }
      expect(value, `${key} must be disabled while calm`).toBe(false);
    }
  });

  it("enables every motion capability when motion is allowed", () => {
    const policy = sceneMotionPolicy(false);
    expect(policy).toEqual(MOTIVE_SCENE_POLICY);
    for (const [key, value] of Object.entries(policy)) {
      if (key === "frameloop") {
        expect(value).toBe("always");
        continue;
      }
      expect(value, `${key} must be enabled`).toBe(true);
    }
  });

  it("has no capability that removes a scene", () => {
    /*
     * The structural assertion behind the whole release.
     *
     * `SceneMotionPolicy` deliberately has no `hidden`/`mounted`/`remove` member, so there is
     * no way to express "delete this theme" through the policy. If a future change needs to,
     * it has to add the field here, where the intent is explicit.
     */
    const forbidden = ["hidden", "mounted", "removed", "omit", "delete"];
    for (const policy of [CALM_SCENE_POLICY, MOTIVE_SCENE_POLICY]) {
      for (const key of forbidden) {
        expect(Object.keys(policy), `policy must not expose "${key}"`).not.toContain(key);
      }
    }
  });

  it("returns the shared frozen objects rather than fresh copies", () => {
    // Callers pass this policy into effects and prop chains. Returning a new object on every
    // render would change the identity each time and re-trigger those dependencies.
    expect(sceneMotionPolicy(true)).toBe(CALM_SCENE_POLICY);
    expect(sceneMotionPolicy(false)).toBe(MOTIVE_SCENE_POLICY);
  });

  it("uses 'never' rather than 'demand' so a frozen frame needs no invalidate()", () => {
    // "demand" only paints when something calls invalidate(); a calm scene that renders
    // nothing else would stay unpainted. "never" performs one render on mount.
    expect(CALM_SCENE_POLICY.frameloop).toBe("never");
  });
});

/* --------------------------------------------- scenes must not delete themselves --- */

const THEME_DIR = path.resolve(process.cwd(), "src/components/theme");

/**
 * Files allowed to hide themselves under calm mode, keyed by path relative to THEME_DIR, with
 * the reason each is exempt.
 *
 * Kept as an explicit list rather than a blanket allowlist of effects so that adding a new
 * exemption is a deliberate act.
 */
const ALLOWED_TO_HIDE: Record<string, string> = {
  "effects/ethereal/RippleCue.tsx":
    "an interaction affordance, not scene content: it invites a tap that calm mode will not answer",
};

/** Every `.tsx` under THEME_DIR, as paths relative to it. */
function themeComponentFiles(dir: string = THEME_DIR): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...themeComponentFiles(full));
    } else if (entry.name.endsWith(".tsx")) {
      found.push(path.relative(THEME_DIR, full).split(path.sep).join("/"));
    }
  }
  return found.sort();
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

const themeFiles = themeComponentFiles();

describe("theme components never return null under calm mode", () => {
  it("finds the theme component files", () => {
    // Guards the scan itself: a path change that silently matches nothing would turn this
    // whole file green while asserting nothing.
    expect(themeFiles.length).toBeGreaterThan(0);
    expect(themeFiles).toContain("scenes/LightScene.tsx");
    expect(themeFiles).toContain("scenes/DarkScene.tsx");
    expect(themeFiles).toContain("scenes/CyberpunkScene.tsx");
  });

  it.each(themeFiles)("%s does not delete itself under calm", (file) => {
    if (file in ALLOWED_TO_HIDE) return;
    const source = stripComments(readFileSync(path.join(THEME_DIR, file), "utf8"));
    expect(source, `${file} must not early-return null on a calm flag`).not.toMatch(
      /if\s*\(\s*(isCalm|calm|reduceMotion|noAnim)\s*\)\s*return\s+null/
    );
  });

  it("keeps the exemption list honest: every exemption exists and is still used", () => {
    for (const [file, reason] of Object.entries(ALLOWED_TO_HIDE)) {
      expect(reason, `${file} exemption needs a reason`).toBeTruthy();
      expect(themeFiles, `${file} exemption points at a real file`).toContain(file);
      const source = stripComments(readFileSync(path.join(THEME_DIR, file), "utf8"));
      expect(
        source,
        `${file} is on the allowlist but no longer hides itself; drop the exemption`
      ).toMatch(/if\s*\(\s*isCalm\s*\)\s*return\s+null/);
    }
  });
});

describe("calm reason is published for production diagnosis", () => {
  it("is documented as a stable diagnostic contract", () => {
    const source = readFileSync(path.resolve(process.cwd(), "src/lib/calm.ts"), "utf8");
    for (const reason of ["reduce-motion", "low-data"] satisfies CalmReason[]) {
      expect(source, `reason "${reason}" must be part of the published contract`).toContain(
        `"${reason}"`
      );
    }
  });
});
