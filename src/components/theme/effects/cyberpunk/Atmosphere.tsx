"use client";

/**
 * @file: src/components/theme/effects/cyberpunk/Atmosphere.tsx
 * @description: CSS atmosphere strata for the Cyberpunk "Rain-Soaked Night Market Alley".
 *
 * These layers sit behind and in front of the WebGL alley and carry the parts of the
 * concept that are cheaper in CSS than in WebGL: the sky gradient, volumetric haze, the
 * distant skyline, and the final grade (scanlines, vignette, grain).
 *
 * Every colour resolves through the `--cp-*` tokens defined on `[data-theme="cyberpunk"]`,
 * so the scene re-tints from a single place in globals.css rather than from hex literals
 * scattered across this file.
 *
 * Both components are presentation-only and must be wrapped by the caller in an
 * `isolate` layer, so that the `mix-blend-mode` used here composites against the sky
 * rather than against page content.
 */

import { useMemo } from "react";
import { FILM_GRAIN_BACKGROUND } from "@/components/theme/effects/filmGrain";
import { createPRNG, seedHash } from "@/lib/utils";

type SkylineTower = {
  id: string;
  left: number;
  width: number;
  height: number;
  hasBeacon: boolean;
  hasAntenna: boolean;
  hasWindowPattern: boolean;
  /** 0..1 weight deciding whether the tower catches the rim light. */
  rimLight: number;
};

/** Number of towers in each skyline row. */
const SKYLINE_ROW_LENGTH = 34;

/**
 * Build a deterministic skyline row.
 *
 * Seeded so the server and client agree; the previous skyline used bare `Math.random`
 * inside `useMemo`, which produced a different silhouette on every mount.
 */
function buildSkylineRow(seed: string, options: { minHeight: number; maxHeight: number }) {
  const rng = createPRNG(seedHash(seed));
  return Array.from({ length: SKYLINE_ROW_LENGTH }, (_, i) => {
    const hasWindowPattern = rng() > 0.72;
    return {
      id: `${seed}-${i}`,
      left: (i / SKYLINE_ROW_LENGTH) * 100,
      width: 1.8 + rng() * 3.4,
      height: options.minHeight + rng() * (options.maxHeight - options.minHeight),
      hasBeacon: rng() > 0.78,
      hasAntenna: rng() > 0.82,
      hasWindowPattern,
      // Prefer unoccluded towers, which read as being closer to the light source.
      rimLight: hasWindowPattern ? rng() * 0.3 : 0.45 + rng() * 0.55,
    } satisfies SkylineTower;
  });
}

const Tower = ({ tower, rowFill }: { tower: SkylineTower; rowFill: string }) => (
  <div
    className="absolute bottom-0"
    style={{
      left: `${tower.left}%`,
      width: `${tower.width}%`,
      height: `${tower.height}%`,
      background: rowFill,
      // The inset top line reads as a rim light along the tower crown, which is what
      // separates a flat silhouette from a lit one at this scale.
      boxShadow: `inset 0 1px 0 hsl(var(--cp-skyline-rim) / ${tower.rimLight}), inset -1px 0 3px rgba(0,0,0,0.9), 0 0 25px rgba(0,0,0,0.6)`,
    }}
  >
    {tower.hasAntenna && (
      <div
        className="absolute bottom-full left-1/2 w-px -translate-x-1/2 bg-[hsl(var(--cp-skyline-rim)/0.4)]"
        style={{ height: `${tower.height * 0.35}px` }}
      />
    )}

    {tower.hasBeacon && (
      <div
        className="animate-beacon-blink absolute top-0 left-1/2 h-0.5 w-0.5 -translate-x-1/2 rounded-full bg-red-500"
        style={{ boxShadow: "0 0 6px 2px rgba(255,0,0,0.6), 0 0 12px 4px rgba(255,0,0,0.3)" }}
      />
    )}

    {tower.hasWindowPattern && (
      <div
        className="absolute top-[20%] left-[30%] h-[60%] w-[40%] opacity-20"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent 0 8px, rgba(255,200,100,0.3) 8px 10px)",
        }}
      />
    )}
  </div>
);

/**
 * Sky, haze and distant skyline.
 *
 * Rendered inside an isolated layer alongside the neon wash, in this order, so the
 * neon haze composites over the towers rather than under them.
 */
export const AtmosphereBackdrop = () => {
  const farRow = useMemo(
    () => buildSkylineRow("cyberpunk:skyline:far:v1", { minHeight: 30, maxHeight: 58 }),
    []
  );
  const nearRow = useMemo(
    () => buildSkylineRow("cyberpunk:skyline:near:v1", { minHeight: 44, maxHeight: 82 }),
    []
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Sky: deep violet overhead falling to a cold teal at street level. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, hsl(var(--cp-void)) 0%, hsl(var(--cp-sky-high)) 45%, hsl(var(--cp-sky-low)) 78%, hsl(var(--cp-void)) 100%)",
        }}
      />

      {/* Volumetric haze. Two counter-drifting bands read as street-fog catching
          different signage colours. */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          opacity: "var(--cp-haze-opacity)",
          backgroundImage:
            "radial-gradient(ellipse 60% 40% at 28% 62%, hsl(var(--cp-haze-cyan) / 0.16), transparent 70%), radial-gradient(ellipse 60% 45% at 74% 70%, hsl(var(--cp-haze-magenta) / 0.14), transparent 72%)",
        }}
      />

      {/* Distant skyline, far row then near row, for aerial depth. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[85%]"
        style={{
          opacity: "calc(var(--cp-skyline-opacity) * 0.55)",
          filter: "blur(0.6px)",
        }}
      >
        {farRow.map((tower) => (
          <Tower
            key={tower.id}
            tower={tower}
            rowFill="linear-gradient(to top, hsl(var(--cp-void)), hsl(var(--cp-skyline)))"
          />
        ))}
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-[85%]"
        style={{ opacity: "var(--cp-skyline-opacity)" }}
      >
        {nearRow.map((tower) => (
          <Tower
            key={tower.id}
            tower={tower}
            rowFill="linear-gradient(to top, hsl(var(--cp-void)), hsl(var(--cp-skyline)))"
          />
        ))}
      </div>

      {/* Ground bounce: the street throws signage colour back up at the towers. */}
      <div className="absolute inset-x-0 bottom-0 h-[22%] bg-linear-to-t from-[hsl(var(--cp-haze-cyan)/0.18)] via-[hsl(var(--cp-haze-magenta)/0.07)] to-transparent blur-md" />
      <div className="absolute inset-x-0 bottom-0 h-[10%] bg-linear-to-t from-[hsl(var(--cp-haze-cyan)/0.12)] to-transparent blur-sm" />
    </div>
  );
};

/**
 * Final grade over everything, including the 3D alley and the rain.
 *
 * Intentionally no `mix-blend-mode` here: this layer is already isolated, and blending
 * against page content would tint the UI as well as the scene.
 */
export const AtmosphereGrade = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 overflow-hidden"
  >
    {/* Horizontal scanlines, drifting downward like a CRT refresh. */}
    <div
      className="animate-rain-fall absolute inset-0 mix-blend-screen"
      style={{
        opacity: "var(--cp-scanline-opacity)",
        backgroundImage:
          "repeating-linear-gradient(180deg, transparent 0 9px, hsl(var(--cp-haze-cyan) / 0.2) 9px 10px, transparent 10px 22px)",
      }}
    />

    {/* Finer vertical interlace at a third of the strength. */}
    <div
      className="absolute inset-0 mix-blend-screen"
      style={{
        opacity: "calc(var(--cp-scanline-opacity) * 0.4)",
        backgroundImage:
          "repeating-linear-gradient(90deg, transparent 0 3px, hsl(var(--cp-haze-magenta) / 0.15) 3px 4px, transparent 4px 12px)",
      }}
    />

    {/* Vignette: pulls focus to the alley mouth at centre frame. */}
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, hsl(var(--cp-void) / 0.55) 100%)",
      }}
    />

    {/* Film grain, to break up the gradient banding that wide dark ramps produce. */}
    <div
      className="absolute inset-0 mix-blend-soft-light"
      style={{
        opacity: "var(--cp-grain-opacity)",
        backgroundImage: FILM_GRAIN_BACKGROUND,
        backgroundRepeat: "repeat",
      }}
    />
  </div>
);
