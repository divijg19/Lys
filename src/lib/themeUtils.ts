// src/lib/themeUtils.ts

import { customThemes, themeLabels, ThemeName } from "./themeClassMap";

/**
 * Represents a single theme option with its label and internal value.
 */
export interface ThemeOption {
  name: string;
  value: ThemeName;
}

/**
 * All available themes for UI usage (dropdowns, switchers, etc.)
 */
export const themes: ThemeOption[] = customThemes.map((theme) => ({
  value: theme,
  name: themeLabels[theme],
}));

const THEME_STORAGE_KEY = "portfolio-theme";

/**
 * Returns the index of a theme by its internal value.
 */
export const getThemeIndex = (value: string): number =>
  themes.findIndex((t) => t.value === value);

/**
 * Applies a theme by updating the `data-theme` attribute and root classes.
 */
export const applyTheme = (theme: ThemeName): void => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.remove(...customThemes);
  root.classList.add(theme);
};

/**
 * Sets a theme by index and persists it in localStorage.
 */
export const setTheme = (index: number): void => {
  const theme = themes[index];
  if (!theme) return;

  applyTheme(theme.value);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(THEME_STORAGE_KEY, theme.value);
  }
};

/**
 * Retrieves the saved theme from localStorage if it exists and is valid.
 */
export const getSavedTheme = (): ThemeName | undefined => {
  if (typeof localStorage === "undefined") return undefined;

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return customThemes.includes(stored as ThemeName)
    ? (stored as ThemeName)
    : undefined;
};

/**
 * Initializes the theme on first load: saved preference or fallback to default.
 */
export const initializeTheme = (): void => {
  const savedTheme = getSavedTheme();
  const index = savedTheme ? getThemeIndex(savedTheme) : 0;
  setTheme(index !== -1 ? index : 0);
};

/**
 * Cycles to the next available theme and sets it.
 */
export const cycleTheme = (): void => {
  const savedTheme = getSavedTheme();
  const currentIndex = savedTheme ? getThemeIndex(savedTheme) : 0;
  const nextIndex = (currentIndex + 1) % themes.length;
  setTheme(nextIndex);
};
