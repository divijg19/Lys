/**
@file: src/hooks/useTheme.ts
@description: A custom, application-specific hook for managing the portfolio's theme system.
This hook elevates the standard theme management by providing:
A Mounted State: Explicitly handles client-side hydration to prevent theme mismatches.
The Full Theme Object: Returns the complete, memoized theme object ({ name, displayName, icon }) for stable referential integrity.
Performant Actions: Wraps cycleTheme and setTheme in useCallback to prevent unnecessary re-renders in consumer components.
A Consistent API: All interactions are consolidated, type-safe, and tailored to the application's Theme data structure.
*/

"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type Theme, themes } from "@/lib/themes";

/**
 * The return type of the `useAppTheme` hook.
 */
export interface AppThemeContext {
  /** The full theme object for the currently active theme. Defaults to the first theme. */
  theme: Theme;
  /** A stable function to set the theme by passing a full Theme object. */
  setTheme: (theme: Theme) => void;
  /** A stable function to cycle to the next available theme in the list. */
  cycleTheme: () => void;
  /** A boolean indicating if the theme has been resolved on the client, safe to use for rendering. */
  isMounted: boolean;
}

/**
 * An application-specific hook for managing themes.
 */
export function useTheme(): AppThemeContext {
  const { theme: currentThemeName, setTheme: setNextTheme } = useNextTheme();
  const [isMounted, setMounted] = useState(false);

  // Effect to set the mounted state only on the client.
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Memoize the current theme object to ensure it only changes when the theme name changes.
   * This provides a stable object reference to consuming components.
   * We safely default to the first theme in the array.
   */
  const theme = useMemo(() => {
    // During server-side render or before mount, return the default theme.
    if (!currentThemeName) {
      return themes[0];
    }
    return themes.find((t) => t.name === currentThemeName) || themes[0];
  }, [currentThemeName]);

  /**
   * A memoized callback to cycle to the next theme.
   * This prevents the function from being re-created on every render.
   */
  const cycleTheme = useCallback(() => {
    const currentIndex = themes.findIndex((t) => t.name === currentThemeName);
    // Use modulo arithmetic for clean, circular iteration.
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    if (nextTheme) {
      setNextTheme(nextTheme.name);
    }
  }, [currentThemeName, setNextTheme]);

  /**
   * A memoized, type-safe wrapper for setting the theme.
   * This allows components to interact with the theme system via the `Theme` object.
   */
  const setTheme = useCallback(
    (theme: Theme) => {
      setNextTheme(theme.name);
    },
    [setNextTheme]
  );

  return {
    theme,
    setTheme,
    cycleTheme,
    isMounted,
  };
}
