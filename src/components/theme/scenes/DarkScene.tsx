/**
 * @file: src/components/theme/scenes/DarkScene.tsx
 * @description: Renders a deep-space starfield for the Dark theme.
 * Identity: "The Abyss"
 */

"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Starfield } from "@/components/theme/effects/Starfield";

/**
 * The background scene component for the Dark theme.
 * It uses the now-customizable Starfield component, configured with the
 * specific parameters that defined its original "Abyss" appearance.
 */
const DarkScene = () => {
  return (
    <Suspense fallback={null}>
      <Canvas
        camera={{ position: [0, 0, 1] }}
        style={{ background: "#030304" }}
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
