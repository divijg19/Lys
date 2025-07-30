/**
 * @file: src/lib/themes.ts
 * @description: The definitive registry and single source of truth for the portfolio's seven-theme system.
 *
 * This file acts as the central hub for all theme-related data. It defines the
 * complete specification for each of the seven "aesthetic universes," including
 * their machine-readable name, user-friendly display name, a carefully
 * chosen icon, and a direct link to its client-side background component.
 *
 * By defining this data as a single, readonly constant (`as const`), we leverage
 * advanced TypeScript patterns to automatically and safely derive all related
 * types and constants. This ensures perfect synchronization across the entire
 * application, eliminating the risk of data drift and making the system
 * robust, scalable, and easy to maintain.
 */

// --> UPDATED: Added ComponentType for typing and dynamic for performance.
import type { LucideIcon } from "lucide-react";
// 1. --- ICON IMPORTS ---
// Each icon is deliberately chosen to be a simple, elegant representation of
// the emotional and visual universe its corresponding theme unlocks.
import {
  Bot, // For the high-tech, artificial nature of Cyberpunk
  Contrast, // For the high-contrast, accessibility focus of Simple
  Eye, // For the optical illusion and heat-shimmer of Mirage
  Globe, // For the satellite, Earth-observation concept of Horizon
  Moon, // For the classic representation of a dark theme
  Sparkles, // For the magical, otherworldly feel of Ethereal
  Sun, // For the classic representation of a light theme
} from "lucide-react";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// --> ADDED: Section for Dynamic Scene Imports
// -----------------------------------------------------------------------------
// By using next/dynamic, we lazy-load these large, interactive background
// components. This prevents them from being included in the initial server bundle,
// keeping the app's startup fast and lightweight. They are only loaded on the
// client-side when the theme is active.
// -----------------------------------------------------------------------------
const LightScene = dynamic(() => import("@/components/theme/scenes/LightScene"));
const DarkScene = dynamic(() => import("@/components/theme/scenes/DarkScene"));
const CyberpunkScene = dynamic(() => import("@/components/theme/scenes/CyberpunkScene"));
const EtherealScene = dynamic(() => import("@/components/theme/scenes/EtherealScene"));
const HorizonScene = dynamic(() => import("@/components/theme/scenes/HorizonScene"));
const MirageScene = dynamic(() => import("@/components/theme/scenes/MirageScene"));

// For the 'simple' theme that has no background effect, we use a "dummy"
// component that renders nothing. This ensures every theme object has a
// valid SceneComponent, maintaining a consistent data structure.
const SimpleScene = (): null => null;

// 2. --- MASTER THEME REGISTRY (SINGLE SOURCE OF TRUTH) ---
// This is the definitive list of all themes available in the portfolio.
// --> UPDATED: Each theme object now includes a `SceneComponent` property.
export const themes = [
  {
    name: "light",
    displayName: "Light",
    icon: Sun,
    docs: "Orbital Station: A luminous, high-clarity interface for focused productivity.",
    SceneComponent: LightScene,
  },
  {
    name: "dark",
    displayName: "Dark",
    icon: Moon,
    docs: "Stellar Command: A deep-space, focus-oriented interface for low-light conditions.",
    SceneComponent: DarkScene,
  },
  {
    name: "cyberpunk",
    displayName: "Cyberpunk",
    icon: Bot,
    docs: "Neo-Tokyo Streets: A high-tech, neon-infused theme with rebellious urban energy.",
    SceneComponent: CyberpunkScene,
  },
  {
    name: "ethereal",
    displayName: "Ethereal",
    icon: Sparkles,
    docs: "Mystic Dreamscape: A soft, otherworldly theme with gentle colors and fluid motion.",
    SceneComponent: EtherealScene,
  },
  {
    name: "horizon",
    displayName: "Horizon",
    icon: Globe,
    docs: "Earth Observation: A theme inspired by satellite imagery, with natural textures.",
    SceneComponent: HorizonScene,
  },
  {
    name: "mirage",
    displayName: "Mirage",
    icon: Eye,
    docs: "Desert Illusion: A warm, minimalist theme with shimmering heat-wave effects.",
    SceneComponent: MirageScene,
  },
  {
    name: "simple",
    displayName: "Simple",
    icon: Contrast,
    docs: "Maximum Accessibility: A high-contrast, motion-free theme for ultimate readability.",
    SceneComponent: SimpleScene,
  },
] as const; // Using 'as const' makes this array and its contents readonly and its types narrow.

// 3. --- DERIVED TYPES AND CONSTANTS ---
// By deriving types from the master registry above, we ensure that if we add,
// remove, or rename a theme, our TypeScript types will automatically update,
// catching any potential errors at compile time.

/**
 * A union type of all available theme names, derived directly from the registry.
 * Provides strict type-checking for theme identifiers throughout the app.
 * e.g., "light" | "dark" | "cyberpunk" | ...
 */
export type ThemeName = (typeof themes)[number]["name"];

/**
 * A constant array containing only the names of the themes.
 * This is used to configure the `next-themes` ThemeProvider, ensuring it is
 * aware of all available aesthetic universes.
 * e.g., ["light", "dark", "cyberpunk", ...]
 */
export const THEME_NAMES: ThemeName[] = themes.map((t) => t.name);

/**
 * The definitive TypeScript type for a single theme object.
 * Enforces a consistent structure for all themes defined in the registry.
 * --> UPDATED: Added the `SceneComponent` property to the type definition.
 */
export type Theme = {
  name: ThemeName;
  displayName: string;
  icon: LucideIcon;
  docs: string;
  SceneComponent: ComponentType;
};
