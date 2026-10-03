/**
 * @file: src/components/theme/scenes/DarkScene.tsx
 * @description: Renders a deep-space starfield for the Dark theme.
 * Identity: "The Abyss"
 */

"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { Starfield } from "@/components/theme/effects/Starfield";
import { useCalmMode } from "@/hooks/useCalmMode";
import { useThemeTokens } from "@/hooks/useThemeTokens";

/** `--background` for the Dark theme (`240 12% 6%`), used until the token resolves. */
const BACKGROUND_FALLBACK = "#0d0d11";

/**
 * Track whether the document is visible.
 *
 * A background tab has its requestAnimationFrame callbacks throttled by the browser,
 * which is a heuristic rather than a guarantee and varies by engine and battery state.
 * Switching the renderer to a hard stop is both cheaper and deterministic.
 */
function useDocumentHidden(): boolean {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const update = () => setIsHidden(document.visibilityState === "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return isHidden;
}

/**
 * The background scene component for the Dark theme.
 * It uses the now-customizable Starfield component, configured with the
 * specific parameters that defined its original "Abyss" appearance.
 */
const DarkScene = () => {
  const isCalm = useCalmMode();
  const isHidden = useDocumentHidden();
  const { background } = useThemeTokens(["background"]);

  // Reduced-motion / low-data: render nothing so the static fallback gradient painted
  // by ThemeBackground shows through. A continuously rotating starfield has no
  // meaningful still frame.
  if (isCalm) return null;

  return (
    <Suspense fallback={null}>
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1.75]}
        frameloop={isHidden ? "never" : "always"}
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
