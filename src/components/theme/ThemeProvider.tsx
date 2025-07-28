/**
@file: src/components/theme/ThemeProvider.tsx
@description: The master provider for the portfolio's seven-theme system.
This component is the heart of the theme-switching architecture. It wraps the
entire application in src/app/layout.tsx, using the next-themes
library to manage and persist the user's chosen theme.
It is meticulously configured to:
Use the data-theme attribute, perfectly aligning with our global CSS strategy.
Explicitly register all seven unique themes from our single source of truth.
Provide a safe, accessible default theme to prevent FOUC (Flash of Unstyled Content).
Isolate its state in local storage with a specific key.
Disable OS-level theme syncing to grant the user full control over their aesthetic choice.
*/

"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { THEME_NAMES } from "@/lib/themes";

/**
 * The application's main theme provider component.
 *
 * This client component wraps the NextThemesProvider, pre-configuring it with
 * the specific settings required for this portfolio's unique theme system.
 * It's intended to be used once in the root layout file.
 *
 * @param {ThemeProviderProps} props The props for the theme provider, including children.
 * @returns {React.ReactElement} The configured provider wrapping the application.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps): React.ReactElement {
  return (
    <NextThemesProvider
      // --- Core Configuration ---
      // This maps the active theme to a `data-theme` attribute on the `<html>` tag,
      // which is the lynchpin of our entire CSS variable-based theming strategy.
      attribute="data-theme"
      // Provide the explicit list of all theme names we support.
      themes={THEME_NAMES}
      // Set a safe, accessible, and performant default theme.
      defaultTheme="light"
      // Namespace the theme in local storage to prevent conflicts.
      storageKey="portfolio-v1-theme"
      // --- UX & System Integration ---
      // This is a key decision: We disable system sync to give the user
      // explicit and persistent control over the theme, regardless of OS settings.
      // The choice is made inside the app, not outside of it.
      enableSystem={false}
      // Prevents a flash of transitioning elements when the theme is first loaded
      // or switched, providing a smoother and more immediate change.
      disableTransitionOnChange
      // Pass through any additional props for extensibility.
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
