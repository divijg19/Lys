/**
 * @file: src/components/theme/effects/cyberpunk/signage.ts
 * @description: Canvas-texture signage for the Cyberpunk alley.
 *
 * The previous implementation generated a `signText` string per building and then never
 * rendered it, so every "sign" was a featureless glowing rectangle. This draws the actual
 * copy, which is what sells a night market: a wall of legible, competing text.
 */

import * as THREE from "three";

/** Private-use codepoint. Effectively guaranteed to be a missing glyph. */
const MISSING_GLYPH_PROBE = "\uE000";

let cjkSupport: boolean | null = null;

/**
 * Detect whether the platform can actually render Japanese signage.
 *
 * `document.fonts.check()` is no help here: it only validates against loaded `FontFace`
 * objects and returns true for any system font regardless of coverage. So instead,
 * rasterise a CJK sample and a private-use codepoint and compare. If they produce
 * identical pixels, the sample rendered as the same "missing glyph" box.
 */
export function supportsCjkRendering(): boolean {
  if (cjkSupport !== null) return cjkSupport;
  if (typeof document === "undefined") return false;

  const ctx = document.createElement("canvas");
  ctx.width = 48;
  ctx.height = 48;
  const context = ctx.getContext("2d", { willReadFrequently: true });
  if (!context) return false;

  const rasterise = (text: string) => {
    context.clearRect(0, 0, 48, 48);
    context.font = "32px sans-serif";
    context.fillStyle = "#ffffff";
    context.textBaseline = "top";
    context.fillText(text, 4, 4);
    return context.getImageData(0, 0, 48, 48).data;
  };

  const sample = rasterise("ラーメン");
  const missing = rasterise(MISSING_GLYPH_PROBE);

  let identical = sample.length === missing.length;
  if (identical) {
    for (let i = 0; i < sample.length; i++) {
      if (sample[i] !== missing[i]) {
        identical = false;
        break;
      }
    }
  }

  // If the "missing" glyph rasterised to nothing at all (a font that genuinely has it, or
  // a canvas that drew nothing), fall back to trusting the sample is non-blank.
  let anyInk = false;
  for (let i = 3; i < missing.length; i += 4) {
    if (missing[i] > 0) {
      anyInk = true;
      break;
    }
  }

  cjkSupport = anyInk ? !identical : sample.some((_, i) => i % 4 === 3 && sample[i] > 0);
  return cjkSupport;
}

/** Test seam: reset the memoised probe result. */
export function resetCjkProbe(): void {
  cjkSupport = null;
}

const textureCache = new Map<string, THREE.CanvasTexture>();

const SIGN_PADDING = 16;

/**
 * True when the text contains glyphs outside Latin-1, i.e. CJK signs.
 *
 * Checked per code point rather than with a regex, because a `[^\u0000-\u00ff]` range
 * is flagged as containing a control character.
 */
export function isCjkText(text: string): boolean {
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (code > 0xff) return true;
  }
  return false;
}

/**
 * True for glyphs that read better stacked vertically, as on a real alley sign.
 * CJK signage is traditionally stacked; Latin copy reads horizontally.
 */
function isVerticalSign(text: string): boolean {
  return isCjkText(text);
}

/**
 * Draw a sign and return its texture, cached by content and colour.
 *
 * @param text Sign copy.
 * @param hex Neon colour for the glyphs.
 */
export function getSignTexture(text: string, hex: string): THREE.Texture {
  const vertical = isVerticalSign(text);
  const key = `${vertical ? "v" : "h"}:${text}:${hex}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const glyphs = [...text];
  const longEdge = 256;
  const canvas = document.createElement("canvas");
  canvas.width = vertical ? longEdge / 2 : longEdge * 2;
  canvas.height = vertical ? longEdge : longEdge / 2;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    // Without a 2D context there is no texture to give back; a 1x1 transparent texture
    // keeps the material valid instead of handing Three.js a broken image.
    const fallback = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
    fallback.needsUpdate = true;
    return fallback;
  }

  const cell = (canvas.width / glyphs.length) * (vertical ? 1 : 1);
  const fontSize = Math.min(cell * (vertical ? 0.72 : 0.5), canvas.height * 0.7);
  ctx.font = `700 ${fontSize}px "Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const glow = hex;
  const core = "#ffffff";

  glyphs.forEach((glyph, i) => {
    const cx = vertical ? canvas.width / 2 : (canvas.width / glyphs.length) * (i + 0.5);
    const cy = vertical ? (canvas.height / glyphs.length) * (i + 0.5) : canvas.height / 2;

    // Three passes: a wide soft halo, a tight halo, then the near-white core. This is a
    // cheap stand-in for a bloom pass and reads correctly even with postprocessing off.
    ctx.shadowColor = glow;
    ctx.shadowBlur = fontSize * 0.9;
    ctx.fillStyle = glow;
    ctx.fillText(glyph, cx, cy);
    ctx.shadowBlur = fontSize * 0.35;
    ctx.fillText(glyph, cx, cy);
    ctx.shadowBlur = 0;
    ctx.fillStyle = core;
    ctx.fillText(glyph, cx, cy);
  });

  // A thin frame ties the text to the sign box.
  ctx.strokeStyle = glow;
  ctx.lineWidth = 2;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 10;
  ctx.strokeRect(
    SIGN_PADDING * 0.5,
    SIGN_PADDING * 0.5,
    canvas.width - SIGN_PADDING,
    canvas.height - SIGN_PADDING
  );
  ctx.shadowBlur = 0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  // Signage is emissive: it must not be dimmed by the tone mapper.
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  textureCache.set(key, texture);
  return texture;
}

/** Release every cached sign texture. */
export function disposeSignTextures(): void {
  for (const texture of textureCache.values()) texture.dispose();
  textureCache.clear();
}

let glowTexture: THREE.CanvasTexture | null = null;

/**
 * A soft radial falloff sprite, used for the light pools on the wet street.
 *
 * Without an alpha falloff these read as hard-edged rectangles laid on the road, which
 * is worse than no light pools at all.
 */
export function getRadialGlowTexture(): THREE.CanvasTexture {
  if (glowTexture) return glowTexture;

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    glowTexture = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1) as never;
    return glowTexture;
  }

  // Two-stop falloff: a tight core for the specular hotspot, a wide skirt for the spill.
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.42)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  glowTexture = new THREE.CanvasTexture(canvas);
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  glowTexture.needsUpdate = true;
  return glowTexture;
}

/** Test seam: drop the memoised glow sprite. */
export function disposeGlowTexture(): void {
  glowTexture?.dispose();
  glowTexture = null;
}
