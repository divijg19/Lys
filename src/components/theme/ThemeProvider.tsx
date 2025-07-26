// src/components/theme/ThemeProvider.tsx

"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { THEME_NAMES } from "@/lib/themes";

/**
 * Provides the theme context to the entire application.
 * This component wraps the application in `src/app/layout.tsx`.
 * It's configured to work seamlessly with the theme definitions in `src/styles/globals.css`.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      // This is the crucial part that connects `next-themes` to your CSS.
      // Your CSS uses selectors like `[data-theme="dark"]`, so we must set this attribute.
      attribute="data-theme"
      // We explicitly provide the full list of our custom themes.
      // This is sourced from `src/lib/themes.ts` to ensure consistency.
      themes={[...THEME_NAMES]}
      // Set a default theme to prevent a flash of unstyled content (FOUC) on first load.
      // "light" is a safe and common default.
      defaultTheme="light"
      // We disable the system theme preference. With 7 distinct themes,
      // it's better to give the user full control rather than auto-switching
      // between just "light" and "dark".
      enableSystem={false}
      // Pass through any additional props.
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
