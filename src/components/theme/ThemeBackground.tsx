/**
 * @file: src/components/theme/ThemeBackground.tsx
 * @description: The master orchestrator for rendering dynamic, theme-specific backgrounds.
 *
 * This component acts as an intelligent, data-driven renderer. It listens to the
 * active theme from `next-themes` and uses the master theme registry from `src/lib/themes.ts`
 * to dynamically select and render the correct background scene.
 *
 * It also handles the cross-fade animations between themes, ensuring smooth and
 * elegant transitions as the user explores different aesthetic universes.
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { themes } from "@/lib/themes"; // The single source of truth!

/**
 * Orchestrator component that selects and animates the appropriate background
 * effect based on the active theme.
 */
function ThemeBackground() {
  const { theme: activeThemeName } = useTheme();
  const [isMounted, setMounted] = useState(false);

  // Ensure the component is only rendered on the client to safely access the theme
  // and prevent hydration mismatches.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Find the complete theme object from our master array using the active theme name.
  // We provide a safe fallback to the first theme in the array (light).
  const currentTheme = themes.find((t) => t.name === activeThemeName) ?? themes[0];

  // Destructure the component and theme name directly from the theme object.
  const { SceneComponent, name: themeName } = currentTheme;

  return (
    <div
      className="-z-50 pointer-events-none fixed inset-0"
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        {/* Only render on the client after mounting. */}
        {isMounted && (
          <motion.div
            // The key is crucial! It tells React to unmount the old scene
            // and mount the new one, which triggers our enter/exit animations.
            key={themeName}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
            className="absolute inset-0"
          >
            <SceneComponent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ThemeBackground;
