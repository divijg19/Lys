/**
 * ClientThemeBackground: isolates the dynamic, client-only ThemeBackground import
 * so that the app root layout can remain a Server Component.
 */
"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useReducedData } from "@/hooks/useReducedData";

const ThemeBackground = dynamic(() => import("@/components/theme/ThemeBackground"), {
  ssr: false,
});

export function ClientThemeBackground() {
  const reduceMotion = usePrefersReducedMotion();
  const { reducedData } = useReducedData();
  const { theme } = useTheme();
  const [enabled, setEnabled] = useState(false);

  const forceScenes = process.env.NEXT_PUBLIC_FORCE_SCENES === "1";
  const suppress = !forceScenes && (reduceMotion || reducedData || theme === "simple");

  useEffect(() => {
    if (suppress) {
      setEnabled(false);
      return;
    }
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, options?: { timeout?: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    const start = () => setEnabled(true);
    const idleId =
      typeof win.requestIdleCallback === "function"
        ? win.requestIdleCallback(start, { timeout: 1500 })
        : window.setTimeout(start, 800);

    return () => {
      if (typeof win.cancelIdleCallback === "function" && typeof idleId === "number") {
        win.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, [suppress]);

  if (suppress || !enabled) return null;
  return <ThemeBackground />;
}
