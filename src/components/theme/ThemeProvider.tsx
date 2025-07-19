"use client";

import { useEffect } from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

import { customThemes } from "@/lib/themeClassMap";
import { geistMono, geistSans } from "@/lib/fonts";
import BodyClassWrapper from "./BodyClassWrapper";

/**
 * Applies global font, selection, and transition styles to the <body> tag.
 * Ensures no SSR mismatch by running only on the client.
 */
function BaseBodySetup() {
  useEffect(() => {
    document.body.classList.add(
      "antialiased",
      "transition-colors",
      "duration-300",
      "selection:bg-black/90",
      "selection:text-white",
      "dark:selection:bg-purple-800",
      "print:bg-white",
      geistSans.variable,
      geistMono.variable,
    );
  }, []);

  return null;
}

/**
 * Custom ThemeProvider combining:
 * - next-themes for theme context and switching
 * - Tailwind class support via `attribute="class"`
 * - App-wide body class setup and wrapper
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={[...customThemes]}
      {...props}
    >
      <BaseBodySetup />
      <BodyClassWrapper>{children}</BodyClassWrapper>
    </NextThemesProvider>
  );
}
