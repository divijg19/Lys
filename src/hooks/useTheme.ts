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

  return { theme, setTheme };
}
