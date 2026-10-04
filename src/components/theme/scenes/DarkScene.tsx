/**
 * @file: src/components/theme/scenes/DarkScene.tsx
 * @description: Renders a deep-space starfield for the Dark theme.
 * Identity: "The Abyss"
 */

"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Starfield } from "@/components/theme/effects/Starfield";
import { useCalmMode } from "@/hooks/useCalmMode";
import { useDocumentHidden } from "@/hooks/useDocumentVisibility";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { sceneMotionPolicy } from "@/lib/calm";

/** `--background` for the Dark theme (`240 12% 6%`), used until the token resolves. */
const BACKGROUND_FALLBACK = "#0d0d11";

/**
 * The background scene component for the Dark theme.
 * It uses the now-customizable Starfield component, configured with the
 * specific parameters that defined its original "Abyss" appearance.
 */
const DarkScene = () => {
  const isCalm = useCalmMode();
  const isHidden = useDocumentHidden();
  const { background } = useThemeTokens(["background"]);

  /*
   * Calm: freeze, do not delete.
   *
   * A starfield has a perfectly good still frame -- it is a field of points, and holding
   * them still reads as deep space rather than as a missing theme. Returning null here is
   * what made this scene disappear in production for reduced-motion visitors.
   *
   * A hidden document also stops the loop. Browsers throttle requestAnimationFrame in
   * background tabs, but that is a heuristic that varies by engine and battery state, and
   * it does nothing for this scene's own work.
   */
  const policy = sceneMotionPolicy(isCalm);
  const frameloop = isHidden || policy.frameloop === "never" ? "never" : "always";

  return (
    <Suspense fallback={null}>
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1.75]}
        frameloop={frameloop}
        style={{ background: background || BACKGROUND_FALLBACK }}
      >
        <Starfield
          // --- Recreating the original Starfield settings ---
          count={2400} // The original number of points in the Float32Array.
          radius={1.2} // The original radius of the random sphere.
          size={0.005} // The original size of each point.
          color="#ffffff" // The original hard-coded color.
          speed={1} // The default speed multiplier to match the original pace.
          rotationXFactor={40} // The original divisor for the X-axis rotation.
          rotationYFactor={60} // The original divisor for the Y-axis rotation.
        />
      </Canvas>
    </Suspense>
  );
};

export default DarkScene;
