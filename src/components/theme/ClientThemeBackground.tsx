/**
 * ClientThemeBackground: isolates the dynamic, client-only ThemeBackground import
 * so that the app root layout can remain a Server Component.
 */
"use client";

import dynamic from "next/dynamic";

const ThemeBackground = dynamic(() => import("@/components/theme/ThemeBackground"), {
  ssr: false,
});

export function ClientThemeBackground() {
  return <ThemeBackground />;
}
