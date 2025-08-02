/**
 * @file: src/components/theme/scenes/CyberpunkScene.tsx
 * @description: Renders the "Data Rain" effect for the Cyberpunk theme.
 * Identity: "Night City Underbelly"
 */

"use client";

import { DataRain } from "@/components/theme/effects/cyberpunk/DataRain";

/**
 * The background scene component for the Cyberpunk theme.
 * It renders the iconic, vertically-scrolling "data rain" or "digital rain" effect,
 * immediately evoking a high-tech, dystopian atmosphere.
 */
const CyberpunkScene = () => {
  return <DataRain />;
};

export default CyberpunkScene;
