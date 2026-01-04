/**
 * ClientThemeBackground: isolates the dynamic, client-only ThemeBackground import
 * so that the app root layout can remain a Server Component.
 */
"use client";

import { useTheme } from "next-themes";
import ThemeBackground from "@/components/theme/ThemeBackground";

export function ClientThemeBackground() {
  const { theme } = useTheme();

  const suppress = theme === "simple";

  if (suppress) return null;
  return <ThemeBackground />;
}
