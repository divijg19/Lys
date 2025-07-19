"use client";

import { useTheme } from "@/hooks/useTheme";
import { useEffect, useMemo, useState } from "react";
import { customThemes, ThemeName } from "@/lib/themeClassMap";

/**
 * Formats a theme string into a more readable label.
 * e.g., "horizon-blaze" → "Horizon Blaze"
 */
function formatThemeName(theme: string): string {
  return theme
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const activeTheme = theme ?? "light"; // Fallback to "light" to prevent hook error

  const buttonClass = useMemo(() => {
    const base =
      "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

    const themeStyles: Record<ThemeName, string> = {
      light: "bg-gray-100 text-black hover:bg-gray-200",
      dark: "bg-neutral-800 text-white hover:bg-neutral-700 ring-1 ring-white",
      cyberpunk:
        "bg-cyan-500 text-black hover:shadow-cyan-400/70 neon-glow-cyan",
      ethereal: "bg-pink-100 text-pink-800 hover:bg-pink-200",
      "horizon-blaze": "bg-orange-500 text-white hover:bg-orange-600",
      "neo-mirage": "bg-indigo-400 text-white hover:bg-indigo-500",
      "high-contrast":
        "bg-black text-yellow-300 hover:bg-yellow-300 hover:text-black",
      "reduced-motion": "bg-gray-600 text-white hover:bg-gray-700",
    };

    return `${base} ${
      themeStyles[activeTheme as ThemeName] ?? "bg-gray-300 text-black"
    }`;
  }, [activeTheme]);

  if (!mounted) return null;

  const handleThemeCycle = () => {
    const index = customThemes.indexOf(activeTheme as ThemeName);
    const nextIndex = (index + 1) % customThemes.length;
    setTheme(customThemes[nextIndex]);
  };

  const formatted = formatThemeName(activeTheme);

  return (
    <button
      onClick={handleThemeCycle}
      className={buttonClass}
      aria-label={`Switch theme. Current: ${formatted}`}
      title={`Current theme: ${formatted} (Click to switch)`}
    >
      Theme: {formatted}
    </button>
  );
}
