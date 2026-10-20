/**
 * ClientThemeBackground: isolates the dynamic, client-only ThemeBackground import
 * so that the app root layout can remain a Server Component.
 *
 * Note that this component deliberately does *not* import three.js, directly or indirectly. It is
 * rendered eagerly on every page, so anything it imports is in the initial bundle; three.js is
 * ~98 KB gzip of library that only the (lazily loaded) theme scenes need. The Three.js console
 * filter that used to live here now lives with the scenes -- see
 * `src/components/theme/scenes/installThreeConsole.ts`.
 */
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import ThemeBackground from "@/components/theme/ThemeBackground";

export function ClientThemeBackground() {
  const { theme } = useTheme();

  /*
   * The `simple` theme deliberately has no background scene, so this returns null for it.
   *
   * That decision cannot be made during the first render, though. `next-themes` resolves its theme
   * from `localStorage` inside a `useState` initialiser that short-circuits on the server
   * (`typeof window === "undefined" ? undefined : localStorage.getItem(...)`). The server therefore
   * renders with `theme === undefined` and emits a `ThemeBackground`, while the client's first
   * render already sees `"simple"` and emits nothing. Every other theme renders the same component
   * either way and so never diverges, which is why this only surfaced for `simple` -- as a
   * hydration error on every page load, forcing a full client re-render of the tree.
   *
   * Gating on a mounted flag makes the first client render identical to the server's. The cost is
   * one frame of fallback gradient behind the page for `simple` visitors, which is not visible:
   * the layer sits at `-z-50` and `<body>` paints an opaque background over it.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (mounted && theme === "simple") return null;
  return <ThemeBackground />;
}
