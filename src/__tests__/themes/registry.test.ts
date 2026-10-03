import { describe, expect, it } from "vitest";
import { THEME_NAMES, THEME_SCENE_KEYS, themes } from "@/lib/themes";
import { themeScenes } from "@/components/theme/themeScenes";

/**
 * The registry in `lib/themes.ts` is the single source of truth that `ThemeProvider`,
 * `ThemeToggle`, `ThemeBackground` and the fallback gradients all derive from. A drift
 * between it and the scene map would render a theme with no background and no error, so
 * these assertions guard the contract rather than any particular design.
 */
describe("theme registry", () => {
  it("derives THEME_NAMES from the registry, in order", () => {
    expect(THEME_NAMES).toEqual(themes.map((t) => t.name));
  });

  it("derives THEME_SCENE_KEYS from the registry, in order", () => {
    expect(THEME_SCENE_KEYS).toEqual(themes.map((t) => t.sceneKey));
  });

  it("has unique theme names", () => {
    expect(new Set(THEME_NAMES).size).toBe(THEME_NAMES.length);
  });

  it("has unique scene keys", () => {
    expect(new Set(THEME_SCENE_KEYS).size).toBe(THEME_SCENE_KEYS.length);
  });

  it("gives every theme a display name and documentation string", () => {
    for (const theme of themes) {
      expect(theme.displayName.trim(), `${theme.name} displayName`).not.toBe("");
      expect(theme.docs.trim(), `${theme.name} docs`).not.toBe("");
    }
  });

  it("provides a scene component for every declared scene key", () => {
    for (const key of THEME_SCENE_KEYS) {
      // Scenes are loaded through `next/dynamic`, which returns a lazy component wrapper
      // object rather than a bare function, so accept either valid component form.
      const scene: unknown = themeScenes[key];
      const renderable =
        typeof scene === "function" || (typeof scene === "object" && scene !== null);
      expect(renderable, `scene for ${key} is a renderable component`).toBe(true);
    }
  });

  it("has no scene components for undeclared keys", () => {
    expect(Object.keys(themeScenes).sort()).toEqual([...THEME_SCENE_KEYS].sort());
  });

  it("keeps the four themes under active redesign wired to their scenes", () => {
    // Guards against a rename silently detaching a scene from its theme.
    const expected: Record<string, string> = {
      light: "lightScene",
      dark: "darkScene",
      cyberpunk: "cyberpunkScene",
      ethereal: "etherealScene",
    };
    for (const [name, sceneKey] of Object.entries(expected)) {
      const theme = themes.find((t) => t.name === name);
      expect(theme, `${name} exists`).toBeDefined();
      expect(theme?.sceneKey).toBe(sceneKey);
    }
  });
});
