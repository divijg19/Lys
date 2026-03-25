// src/hooks/useTheme.ts

"use client";

import { useTheme as useNextTheme } from "next-themes";
import { type Theme, themes } from "@/lib/themes";

// This is now the definitive, world-class theme hook for your application.
export function useTheme() {
  const { theme: currentTheme, setTheme } = useNextTheme();

  // The 'cycleTheme' function is our custom business logic.
  // It provides a clean API for the ThemeToggle component.
  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.name === currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    setTheme(nextTheme.name);
  };

  return {
    theme: themes.find((t) => t.name === currentTheme) || themes[0],
    setTheme: (theme: Theme) => setTheme(theme.name),
    cycleTheme,
  };
}
