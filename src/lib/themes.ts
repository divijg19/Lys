import type { LucideIcon } from "lucide-react";
// 1. --- IMPORT THE REQUIRED ICONS ---
// We import the specific icons we'll use for each theme.
import { Bot, Eye, Moon, Mountain, Palette, Sparkles, Sun } from "lucide-react";

// 2. --- DEFINE THE THEMES ARRAY AS A CONSTANT ---
// This is the single source of truth. We use `as const` to tell TypeScript
// that this array and its contents are readonly and will never change.
export const themes = [
  {
    name: "light",
    displayName: "Light",
    icon: Sun,
  },
  {
    name: "dark",
    displayName: "Dark",
    icon: Moon,
  },
  {
    name: "cyberpunk",
    displayName: "Cyberpunk",
    icon: Bot,
  },
  {
    name: "ethereal",
    displayName: "Ethereal",
    icon: Sparkles,
  },
  {
    name: "horizon",
    displayName: "Horizon",
    icon: Mountain,
  },
  {
    name: "mirage",
    displayName: "Mirage",
    icon: Eye,
  },
  {
    name: "simple",
    displayName: "Simple",
    icon: Palette,
  },
] as const;

// 3. --- DERIVE TYPES FROM THE SOURCE OF TRUTH ---
// This is a world-class pattern. Instead of manually writing out the theme names,
// we derive them directly from the `themes` array. If you add a new theme to the
// array, this type updates automatically.

// This creates the union type: "light" | "dark" | "cyberpunk" | ...
export type ThemeName = (typeof themes)[number]["name"];

// This creates the final, robust Theme type.
export type Theme = {
  name: ThemeName;
  displayName: string;
  icon: LucideIcon; // The icon is now a required part of the theme.
};
