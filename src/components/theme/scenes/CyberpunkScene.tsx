/**
 * @file: src/components/theme/scenes/CyberpunkScene.tsx
 * @description: Renders the "Data Rain" effect for the Cyberpunk theme.
 * Identity: "Night City Underbelly" -- a rain-soaked night market alley.
 */

"use client";

import { useEffect, useState } from "react";
import {
  AtmosphereBackdrop,
  AtmosphereGrade,
} from "@/components/theme/effects/cyberpunk/Atmosphere";
import { CitySilhouette } from "@/components/theme/effects/cyberpunk/CitySilhouette";
import { NeonGlow } from "@/components/theme/effects/cyberpunk/NeonGlow";
import { useCalmMode } from "@/hooks/useCalmMode";
import { sceneMotionPolicy } from "@/lib/calm";

/**
 * The background scene component for the Cyberpunk theme.
 * It renders the iconic, vertically-scrolling "data rain" or "digital rain" effect,
 * immediately evoking a high-tech, dystopian atmosphere.
 *
 * The scene is composed as three explicitly ordered layers. Each is wrapped in its own
 * `isolate` stacking context so that descendant z-index values stay contained and the
 * paint order follows DOM order alone. Backdrop and neon wash share a layer on purpose:
 * `mix-blend-mode` composites against the backdrop of its own stacking context, so
 * isolating the neon wash separately would leave it blending against transparency and
 * silently dropping the effect.
 */
const CyberpunkScene = () => {
  // Force a remount pulse AFTER theme transition completes to fight potential race with AnimatePresence exit.
  const [ready, setReady] = useState(false);
  const policy = sceneMotionPolicy(useCalmMode());

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!ready) return null; // brief (1 frame) skip ensures background gradient + container ready

  /*
   * Calm: freeze, do not delete.
   *
   * This scene used to return null under calm, standing down the whole theme. That shipped
   * as a production regression -- Cyberpunk, Light and Dark all vanished for visitors whose
   * browser reported reduced motion or a constrained connection, while Ethereal, Horizon and
   * Mirage carried on.
   *
   * The rationale for deleting was that the alley is a continuous 60fps scroll with a bloom
   * pass. But that cost argument only justifies dropping the *animated* parts, not the theme.
   * So `CitySilhouette` now renders a still frame: no rain, no lightning, no post-processing,
   * one frameloop step to position the street, and the backdrop, neon wash and grade layers
   * left intact -- they are already static CSS.
   */
  return (
    <div className="relative isolate h-full w-full">
      {/* Layer 1: sky, haze and distant skyline, with the neon wash over it. */}
      <div className="pointer-events-none absolute inset-0 isolate overflow-hidden">
        <AtmosphereBackdrop />
        <NeonGlow />
      </div>

      {/* Layer 2: the WebGL alley, lightning and rain. */}
      <div className="pointer-events-none absolute inset-0 isolate overflow-hidden">
        <CitySilhouette policy={policy} />
      </div>

      {/* Layer 3: scanlines, vignette and grain, over everything. */}
      <div className="pointer-events-none absolute inset-0 isolate overflow-hidden">
        <AtmosphereGrade />
      </div>
    </div>
  );
};

export default CyberpunkScene;
