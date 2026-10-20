/**
 * @file: src/lib/threeColor.ts
 * @description: Reads theme colours out of CSS custom properties and hands them to three.js.
 *
 * ## Why this exists
 *
 * The themes are defined as CSS custom properties in `src/styles/globals.css`:
 *
 *   [data-theme="ethereal"] {
 *     --primary: 250 82% 72%;
 *   }
 *
 * The 3D scenes used to turn those into a colour by string concatenation -- `hsl(${token})` --
 * and hand the result to three.js. That never worked, because three.js parses colours with
 * `Color.setStyle`, whose HSL branch only understands the **comma separated** form:
 *
 *   hsl(250, 82%, 72%)   <- parsed
 *   hsl(250 82% 72%)     <- not parsed; the colour is left at its default (white)
 *
 * So the ethereal scene's plane, ripples and wisps were all rendered achromatic white, and the
 * light theme's starfield was asked for `hsl(var(--foreground))` -- a value three.js cannot
 * resolve at all. The theme palette simply never reached the GPU.
 *
 * ## The parsing here
 *
 * The tokens are read from the computed style of `<html>`, where `data-theme` is set, and parsed
 * into hue/saturation/lightness. `setHSL` takes the hue in turns, so degrees are divided by 360.
 *
 * ## Note on imports
 *
 * This module imports three.js, so it may only be imported by modules that are themselves loaded
 * lazily. A component that renders on every page would pull the whole library into the initial
 * bundle -- which is exactly how three.js got there in the first place. `scripts/check-bundle-budget.mjs`
 * fails the build if three.js shows up in the initial payload.
 */

import { Color, SRGBColorSpace } from "three";

/** Hue in degrees (0-360), saturation and lightness in the 0-1 range. */
export type Hsl = { h: number; s: number; l: number };

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * Parse an HSL token into its components.
 *
 * Accepts every shape the tokens appear in: `250 82% 72%`, `250, 82%, 72%`,
 * `hsl(250 82% 72%)` and `hsl(250, 82%, 72%)`. Returns `null` when the value is not a colour.
 */
export function parseHslToken(token: string): Hsl | null {
  const cleaned = token
    .trim()
    .replace(/^hsl\(/i, "")
    .replace(/\)$/, "")
    .trim();

  const parts = cleaned.split(/[\s,]+/).filter(Boolean);
  if (parts.length < 3) return null;

  const hue = Number.parseFloat(parts[0]);
  const saturation = Number.parseFloat(parts[1]);
  const lightness = Number.parseFloat(parts[2]);

  if (!Number.isFinite(hue) || !Number.isFinite(saturation) || !Number.isFinite(lightness)) {
    return null;
  }

  return {
    h: ((hue % 360) + 360) % 360,
    s: clamp01(saturation / 100),
    l: clamp01(lightness / 100),
  };
}

/**
 * Convert parsed HSL components into a three.js colour.
 *
 * The colour space matters. `setHSL` defaults to three's *working* colour space (linear sRGB),
 * while `setStyle` -- the path a CSS colour string takes -- declares its input to be sRGB and
 * converts it. A CSS token is an sRGB colour, so it is declared as one here; otherwise the
 * scene's colours would be noticeably darker and more saturated than the same colour in CSS.
 */
export function hslToThreeColor(hsl: Hsl): Color {
  return new Color().setHSL(hsl.h / 360, hsl.s, hsl.l, SRGBColorSpace);
}

/**
 * Read a CSS custom property from the document root and convert it to a three.js colour.
 *
 * Falls back to `fallback` when the variable is missing or unparseable, and on the server, where
 * there is no document to read from.
 */
export function cssVarToThreeColor(
  variableName: string,
  fallback: Hsl = { h: 0, s: 0, l: 1 }
): Color {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return hslToThreeColor(fallback);
  }

  const token = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  return hslToThreeColor(parseHslToken(token) ?? fallback);
}
