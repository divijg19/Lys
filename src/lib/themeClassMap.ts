// src/lib/themeClassMap.ts

// 🔹 Strictly typed list of custom themes used throughout the app
export const customThemes = [
  "light",
  "dark",
  "cyberpunk",
  "ethereal",
  "horizon-blaze",
  "neo-mirage",
  "high-contrast",
  "reduced-motion",
] as const;

export type ThemeName = (typeof customThemes)[number];

// 🔹 Map of body classes applied based on active theme
export const themeClassMap: Record<ThemeName, string[]> = {
  light: [],
  dark: [],
  cyberpunk: ["bg-cyberpunk", "scrollbar-neon"],
  ethereal: ["bg-ethereal", "scrollbar-soft"],
  "horizon-blaze": ["bg-horizon", "animate-sunrise"],
  "neo-mirage": ["bg-mirage", "animate-water"],
  "high-contrast": ["contrast-high"],
  "reduced-motion": ["motion-reduced"],
};

// 🔹 Optional: Map for human-readable theme labels (for dropdowns/tooltips)
export const themeLabels: Record<ThemeName, string> = {
  light: "Light",
  dark: "Dark",
  cyberpunk: "Cyberpunk",
  ethereal: "Ethereal",
  "horizon-blaze": "Horizon Blaze",
  "neo-mirage": "Neo Mirage",
  "high-contrast": "High Contrast",
  "reduced-motion": "Reduced Motion",
};
