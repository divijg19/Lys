/**
 * @file: src/components/theme/effects/cyberpunk/alley.ts
 * @description: Pure layout and appearance math for the Cyberpunk alley.
 *
 * Everything here is deterministic and free of Three.js objects, so it can be unit tested
 * directly: jsdom has no WebGL, and even with it, geometry math does not belong behind a
 * render loop.
 */

import { createPRNG, seedHash } from "@/lib/utils";

/** Neon palette for signage. `hex` is consumed by the 3D scene. */
export const NEON_COLORS = {
  cyan: { hex: "#00ffff", emissive: 2.2 },
  magenta: { hex: "#ff00ff", emissive: 2.2 },
  lime: { hex: "#96ff00", emissive: 2.0 },
  amber: { hex: "#ff9600", emissive: 2.0 },
  pink: { hex: "#ff1493", emissive: 2.4 },
  red: { hex: "#ff1e3c", emissive: 2.5 },
} as const;

export type NeonHue = keyof typeof NEON_COLORS;

export const NEON_HUES = Object.keys(NEON_COLORS) as NeonHue[];

/**
 * Alley geometry.
 *
 * The previous implementation moved the camera down the alley while holding building Z
 * positions fixed, and pushed each building outward in proportion to its distance from
 * the camera to fake divergence. Perspective already provides that convergence, so the
 * extra term only served to walk the buildings out of the frustum, emptying the scene as
 * the visitor scrolled. Buildings now sit at a fixed lateral offset and travel toward the
 * viewer, which is both physically right and genuinely endless.
 */
export const ALLEY_SLOTS = 12;
export const ALLEY_SPACING = 8;
/** Length of one full loop of the alley. */
export const ALLEY_SEGMENT = ALLEY_SLOTS * ALLEY_SPACING;
/** Street surface height. Buildings sit on this plane. */
export const ALLEY_STREET_Y = 0;
/** Camera height above the street. */
export const ALLEY_EYE_Y = 1.7;
/** Fixed lateral offset of each building row from the centre line. */
export const ALLEY_HALF_WIDTH = 4.8;
/**
 * Camera Z. The first building pair sits only a few units ahead, which at this FOV is
 * what puts the facades at the edges of frame. Standing further back made the alley read
 * as a distant model rather than a street the viewer is standing in.
 */
export const ALLEY_CAMERA_Z = 2;
/** How far the visitor can travel before the loop wraps. */
export const ALLEY_TRAVEL_RANGE = ALLEY_SEGMENT - ALLEY_SPACING;
/** Where the camera aims, which frames the vanishing point. */
export const ALLEY_LOOK_DISTANCE = 70;

/**
 * Wrap a value into `[0, segment)`.
 *
 * Exported for testing because the negative-input case is the one that matters: scroll
 * progress drives `scrollZ` negative, and JavaScript's `%` keeps the sign of the dividend.
 */
export function wrapIntoLoop(value: number, segment: number): number {
  if (segment <= 0) return 0;
  const wrapped = value % segment;
  return wrapped < 0 ? wrapped + segment : wrapped;
}

/**
 * Resolve a building's world Z for a given scroll offset.
 *
 * Always lands in `[-segment, 0)`, so a full complement of buildings is present at any
 * scroll depth, forever.
 */
export function alleyZ(baseZ: number, scrollZ: number, segment = ALLEY_SEGMENT): number {
  return wrapIntoLoop(baseZ + scrollZ, segment) - segment;
}

/**
 * Distance in front of the camera, clamped at zero for buildings that have passed it.
 */
export function depthFromCamera(worldZ: number, cameraZ = ALLEY_CAMERA_Z): number {
  return Math.max(0, cameraZ - worldZ);
}

/**
 * Neon brightness for a frame.
 *
 * `base` is the material's authored emissive intensity. The previous loop assigned
 * `pulse * (mat.emissiveIntensity ? 1 : 1)`, which read back the value it had just
 * written and therefore did nothing. Multiplying the authored base keeps per-sign
 * brightness intact while the shared pulse breathes.
 */
export function neonEmissiveAt(base: number, pulse: number): number {
  return base * pulse;
}

/** Shared, slow neon breath. Peaks near 1 and never fully extinguishes a sign. */
export function neonPulseAt(elapsed: number): number {
  return 0.82 + Math.sin(elapsed * 1.7) * 0.18;
}

export type AlleyBuilding = {
  id: string;
  side: "left" | "right";
  /** Slot index, 0 = nearest the start of the loop. */
  index: number;
  /** Slot centre along the alley, before wrapping. */
  baseZ: number;
  x: number;
  width: number;
  depth: number;
  height: number;
  hasNeon: boolean;
  neonHue: NeonHue;
  signText: string;
  /** Authored emissive intensity, before the shared pulse. */
  neonIntensity: number;
  hasWindow: boolean;
  /** Lit state per window row, each with a stable id for list keys. */
  windows: { id: string; isLit: boolean }[];
  hasAC: boolean;
  hasCables: boolean;
  hasPipe: boolean;
};

/** Sign copy. Latin-first, so it renders correctly without a CJK font installed. */
const SIGN_TEXT_LATIN = [
  "OPEN",
  "BAR",
  "RAMEN",
  "CLINIC",
  "24H",
  "NOODLE",
  "ARCADE",
  "LOADING",
] as const;

/** Japanese signage, used only when the platform can actually render it. */
const SIGN_TEXT_CJK = ["ラーメン", "営業中", "酒場", "診療所", "電子", "両替"] as const;

/**
 * Build the alley's building set deterministically.
 *
 * @param seed Seed string. The same seed always produces the same street, which keeps
 *   hydration consistent and makes the layout assertable in tests.
 * @param supportsCjk Whether the platform can render Japanese signage. When false the
 *   Latin copy is used instead, because a missing glyph renders as a tofu box.
 */
export function buildAlley(seed: string, supportsCjk: boolean): AlleyBuilding[] {
  const rng = createPRNG(seedHash(seed));
  const signPool = supportsCjk ? [...SIGN_TEXT_CJK, ...SIGN_TEXT_LATIN] : [...SIGN_TEXT_LATIN];

  const buildings: AlleyBuilding[] = [];

  for (const side of ["left", "right"] as const) {
    for (let i = 0; i < ALLEY_SLOTS; i++) {
      const width = 3 + rng() * 2.2;
      // Tall enough to loom over the camera; the previous 6-18 range left the upper half
      // of the frame as empty sky.
      const height = 9 + rng() * 13;
      const depth = 3 + rng() * 2;
      const windowCount = Math.max(2, Math.floor(height / 2.4));
      const windows = Array.from({ length: windowCount }, (_, w) => ({
        id: `win-${w}`,
        isLit: rng() > 0.45,
      }));
      const hue = NEON_HUES[Math.floor(rng() * NEON_HUES.length)];
      const hasNeon = rng() > 0.12;

      buildings.push({
        id: `${side}-${i}`,
        side,
        index: i,
        // Half-slot offset puts the first pair a few units in front of the camera
        // instead of a full slot-length away.
        baseZ: -(i + 0.5) * ALLEY_SPACING,
        // Small per-building jitter so the facades do not read as one extruded slab.
        x: (side === "left" ? -1 : 1) * (ALLEY_HALF_WIDTH + width * 0.5 + rng() * 0.8),
        width,
        depth,
        height,
        hasNeon,
        neonHue: hue,
        signText: signPool[Math.floor(rng() * signPool.length)],
        neonIntensity: NEON_COLORS[hue].emissive,
        // Some facades carry no windows at all, so the row is not uniformly perforated.
        hasWindow: rng() > 0.25,
        windows,
        hasAC: rng() > 0.5,
        hasCables: rng() > 0.45,
        hasPipe: rng() > 0.6,
      });
    }
  }

  return buildings;
}
