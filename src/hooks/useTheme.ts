// src/hooks/useTheme.ts

"use client";

import { useEffect, useState, useCallback } from "react";
import { customThemes, ThemeName } from "@/lib/themeClassMap";

const THEME_STORAGE_KEY = "portfolio-theme";

// Type guard
function isValidTheme(value: string): value is ThemeName {
  return customThemes.includes(value as ThemeName);
}

export function useTheme(defaultTheme: ThemeName = "light") {
  const [theme, setThemeState] = useState<ThemeName>(defaultTheme);

  const applyThemeToDocument = useCallback((newTheme: ThemeName) => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    root.classList.remove(...customThemes);
    root.classList.add(newTheme);
    root.setAttribute("data-theme", newTheme); // Optional for DaisyUI, shadcn, etc.
  }, []);

  const setTheme = useCallback(
    (newTheme: ThemeName) => {
      setThemeState(newTheme);
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      applyThemeToDocument(newTheme);
    },
    [applyThemeToDocument],
  );

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);

    if (stored && isValidTheme(stored)) {
      setTheme(stored);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        setTheme("reduced-motion");
      } else {
        setTheme(prefersDark ? "dark" : "light");
      }
    }
  }, [setTheme]);

  // Respond to system preference only when no stored theme exists
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) return;

    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    darkQuery.addEventListener("change", handleChange);
    return () => darkQuery.removeEventListener("change", handleChange);
  }, [setTheme]);

  // Add themeClasses for card styling
  const themeClasses = {
    card: (() => {
      switch (theme) {
        case "cyberpunk":
          return "bg-cyberpunk/80 border-cyberpunk shadow-cyberpunk";
        case "ethereal":
          return "bg-ethereal/80 border-ethereal shadow-ethereal";
        case "horizon-blaze":
          return "bg-horizon/80 border-horizon shadow-horizon";
        case "neo-mirage":
          return "bg-mirage/80 border-mirage shadow-mirage";
        case "high-contrast":
          return "bg-black text-white border-white";
        case "reduced-motion":
          return "bg-gray-200 dark:bg-gray-800 border-gray-400";
        default:
          return "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700";
      }
    })(),
  };

  return { theme, setTheme, themeClasses };
}
