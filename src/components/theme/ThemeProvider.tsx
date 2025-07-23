// src/components/theme/ThemeProvider.tsx

"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { themes } from "@/lib/themes";

// This is the definitive ThemeProvider for your world-class portfolio.
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      // THE OPTIMAL FIX: Use `data-theme` to match our globals.css
      attribute="data-theme"
      // Provide the full list of themes to next-themes.
      themes={themes.map((t) => t.name)}
      // Disable the system theme preference, as we have custom themes.
      enableSystem={false}
      // Set a default theme to prevent flashes of unstyled content.
      defaultTheme="light"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
