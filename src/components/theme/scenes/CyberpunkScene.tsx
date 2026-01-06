/**
 * @file: src/components/theme/scenes/CyberpunkScene.tsx
 * @description: Renders the "Data Rain" effect for the Cyberpunk theme.
 * Identity: "Night City Underbelly"
 */

"use client";

import { useEffect, useState } from "react";
import { CitySilhouette } from "@/components/theme/effects/cyberpunk/CitySilhouette";
import { NeonGlow } from "@/components/theme/effects/cyberpunk/NeonGlow";

/**
 * The background scene component for the Cyberpunk theme.
 * It renders the iconic, vertically-scrolling "data rain" or "digital rain" effect,
 * immediately evoking a high-tech, dystopian atmosphere.
 */
const CyberpunkScene = () => {
  // Force a remount pulse AFTER theme transition completes to fight potential race with AnimatePresence exit.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  if (!ready) return null; // brief (1 frame) skip ensures background gradient + container ready
  return (
    <div className="relative h-full w-full">
      <NeonGlow />
      <CitySilhouette />
    </div>
  );
};

export default CyberpunkScene;
