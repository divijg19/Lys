/**
 * @file: src/lib/themes.ts
 * @description: Single source of truth for all theme-related data.
 *
 * This file defines the themes available in the application, including their
 * machine-readable name, user-friendly display name, and a corresponding icon.
 *
 * By using `as const`, we create a readonly source from which we can safely
 * derive other types and constants, ensuring perfect synchronization between
 * our data and our types.
 */

import type { LucideIcon } from "lucide-react";
// 1. --- IMPORT THE REQUIRED ICONS ---
// We import the specific icons we'll use for each theme.
// The icon for "Simple" has been changed to `Contrast` to better
// represent its purpose as a high-contrast, accessibility-focused theme.
import {
  Bot,
  Contrast, // <-- Changed from Palette
  Eye,
  Moon,
  Mountain,
  Sparkles,
  Sun,
} from "lucide-react";

// 2. --- DEFINE THE THEMES ARRAY (SINGLE SOURCE OF TRUTH) ---
export const themes = [
  {
    name: "light",
    displayName: "Light",
    icon: Sun,
    docs: "A clean, bright interface, ideal for daytime use.",
  },
  {
    name: "dark",
    displayName: "Dark",
    icon: Moon,
    docs: "An eye-friendly, dark interface, perfect for low-light environments.",
  },
  {
    name: "cyberpunk",
    displayName: "Cyberpunk",
    icon: Bot,
    docs: "A high-tech, neon-infused theme for a futuristic feel.",
  },
  {
    name: "ethereal",
    displayName: "Ethereal",
    icon: Sparkles,
    docs: "A soft, dreamy theme with gentle colors and floating animations.",
  },
  {
    name: "horizon",
    displayName: "Horizon",
    icon: Mountain,
    docs: "A warm, sunset-inspired theme with deep and rich colors.",
  },
  {
    name: "mirage",
    displayName: "Mirage",
    icon: Eye,
    docs: "A shimmering, desert-inspired theme with heat-wave and refraction effects.",
  },
  {
    name: "simple",
    displayName: "Simple",
    icon: Contrast, // <-- Icon changed to better reflect accessibility
    docs: "A high-contrast, no-frills theme for maximum readability and accessibility.",
  },
] as const;

// 3. --- DERIVE TYPES AND CONSTANTS FROM THE SOURCE OF TRUTH ---
// This is an advanced TypeScript pattern that ensures our types and constants
// are always in sync with our `themes` array.

/**
 * A union type of all available theme names.
 * e.g., "light" | "dark" | "cyberpunk" | ...
 * This is derived automatically from the `themes` array.
 */
export type ThemeName = (typeof themes)[number]["name"];

/**
 * A constant array containing only the names of the themes.
 * Useful for configuring the `next-themes` ThemeProvider.
 * e.g., ["light", "dark", "cyberpunk", ...]
 */
export const THEME_NAMES: ThemeName[] = themes.map((t) => t.name);

/**
 * The definitive object type for a single theme.
 */
export type Theme = {
  name: ThemeName;
  displayName: string;
  icon: LucideIcon;
  docs: string;
};
