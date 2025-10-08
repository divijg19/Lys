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
import { type Theme, themes } from "@/lib/themes"; // The single source of truth!
import { themeScenes } from "./themeScenes";

// Lightweight gradient backgrounds keyed by theme for low-data / reduced-motion situations.
const FALLBACK_GRADIENTS: Record<string, string> = {
  light: "bg-gradient-to-br from-white via-neutral-100 to-neutral-200",
  dark: "bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700",
  cyberpunk: "bg-gradient-to-br from-fuchsia-700 via-pink-600 to-rose-500",
  ethereal: "bg-gradient-to-br from-indigo-200 via-violet-200 to-rose-200",
  horizon: "bg-gradient-to-br from-sky-500 via-amber-300 to-rose-400",
  mirage: "bg-gradient-to-br from-orange-200 via-amber-100 to-rose-100",
  simple: "bg-gradient-to-br from-white to-neutral-100 dark:from-black dark:to-neutral-900",
};

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
  const { sceneKey, name: themeName } = currentTheme as Theme;
  const SceneComponent = themeScenes[sceneKey] || (() => null);

  // Environment-derived gating flags (applied by ClientAttrWrapper and user prefs)
  // Detect user / system preferences. We only suppress heavy scenes if BOTH low-data and reduce-motion
  // are explicitly signaled, unless an override env disables suppression.
  const isLowData = (() => {
    if (typeof document === "undefined") return false;
    const root = document.documentElement;
    const lowData = root.hasAttribute("data-low-data");
    const reduceMotion = root.hasAttribute("data-reduce-motion");
    const override = process.env.NEXT_PUBLIC_FORCE_SCENES === "1";
    if (override) return false;
    // Previously: lowData OR reduceMotion (overly aggressive). Now require both.
    return lowData && reduceMotion;
  })();

  const fallbackClass = FALLBACK_GRADIENTS[themeName] || FALLBACK_GRADIENTS.light;

  return (
    <div
      className="-z-50 pointer-events-none fixed inset-0"
      aria-hidden="true"
    >
      {/* Fallback gradient (z-order below scene) */}
      <div className={`absolute inset-0 z-[-1] transition-opacity duration-500 ${fallbackClass}`} />
      <AnimatePresence mode="wait">
        {isMounted && !isLowData && (
          <motion.div
            key={themeName}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } }}
            className="absolute inset-0 z-0"
          >
            <SceneComponent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ThemeBackground;
