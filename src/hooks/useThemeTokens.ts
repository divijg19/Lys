"use client";

/**
 * @file: src/hooks/useThemeTokens.ts
 * @description: Resolves CSS custom properties into colour strings usable outside CSS.
 *
 * Theme tokens are stored as bare HSL triplets (`220 90% 50%`) so that CSS can wrap
 * them in `hsl()` and still apply opacity modifiers. That is convenient for stylesheets
 * but not for APIs that cannot parse CSS: `THREE.Color`, canvas 2D `fillStyle` and
 * WebGL uniforms all reject `hsl(var(--foreground))`.
 *
 * This hook reads the resolved values once per theme change and returns them wrapped
 * in a concrete `hsl()` string. Returns empty strings during SSR so callers can treat
 * an unresolved token as "not ready yet" rather than feeding a broken value to a
 * renderer.
 */

import { useEffect, useState } from "react";

/** The attribute that every theme mutation flows through (set by next-themes). */
const THEME_ATTRIBUTE = "data-theme";

/** Read a token from the document root and wrap it in `hsl()`. */
function resolveToken(name: string): string {
  if (typeof document === "undefined") return "";
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return raw ? `hsl(${raw})` : "";
}

/** Read a token from the document root and wrap it in `hsl()` with an explicit alpha. */
function resolveTokenAlpha(name: string, alpha: number): string {
  if (typeof document === "undefined") return "";
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return raw ? `hsl(${raw} / ${alpha})` : "";
}

/**
 * Resolve the given token names to `hsl()` strings, re-reading them whenever the
 * active theme changes.
 *
 * @param names Token names without the leading `--`, e.g. `primary`.
 * @returns A record keyed by the requested names. Empty strings before resolution.
 *
 * @example
 * const { primary, foreground } = useThemeTokens(["primary", "foreground"]);
 * // -> { primary: "hsl(180 100% 55%)", foreground: "hsl(180 100% 95%)" }
 */
export function useThemeTokens<const N extends readonly string[]>(
  names: N
): Record<N[number], string> {
  const [tokens, setTokens] = useState<Record<N[number], string>>(
    () => Object.fromEntries(names.map((name) => [name, ""])) as Record<N[number], string>
  );

  // `names` is a literal array at every call site; joining it gives a stable dependency
  // so callers do not have to memoise their array to avoid a re-read on every render.
  const key = names.join(",");

  useEffect(() => {
    const requested = key.split(",").filter(Boolean);

    const update = () => {
      setTokens(
        Object.fromEntries(requested.map((name) => [name, resolveToken(name)])) as Record<
          N[number],
          string
        >
      );
    };

    update();

    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [THEME_ATTRIBUTE],
    });
    return () => observer.disconnect();
  }, [key]);

  return tokens;
}

/**
 * Resolve a single token with an explicit alpha channel, re-reading on theme change.
 * Useful for translucent overlays where the base token is a bare triplet.
 */
export function useThemeTokenAlpha(name: string, alpha: number): string {
  const [value, setValue] = useState("");

  useEffect(() => {
    const update = () => setValue(resolveTokenAlpha(name, alpha));

    update();

    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [THEME_ATTRIBUTE],
    });
    return () => observer.disconnect();
  }, [name, alpha]);

  return value;
}

/**
 * Standalone (non-reactive) token read for use inside animation loops, where reading
 * from React state would add a dependency on the render cycle. Callers are
 * responsible for invoking this again after a theme change.
 */
export function readThemeToken(name: string): string {
  return resolveToken(name);
}
