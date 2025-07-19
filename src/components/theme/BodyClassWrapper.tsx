// src/components/theme/BodyClassWrapper.tsx

"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

const themeClassMap: Record<string, string[]> = {
  light: [],
  dark: [],
  cyberpunk: ["bg-cyberpunk", "scrollbar-neon"],
  ethereal: ["bg-ethereal", "scrollbar-soft"],
  "horizon-blaze": ["bg-horizon", "animate-sunrise"],
  "neo-mirage": ["bg-mirage", "animate-water"],
  "high-contrast": ["contrast-high"],
  "reduced-motion": ["motion-reduced"],
};

interface Props {
  children: React.ReactNode;
}

/**
 * Injects theme-specific classes into <body> on client only.
 * Uses effect to safely handle hydration and theme transitions.
 */
export default function BodyClassWrapper({ children }: Props) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const prevThemeClasses = useRef<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !resolvedTheme) return;

    const theme = resolvedTheme;
    const newClasses = themeClassMap[theme] ?? [];

    // Add new theme classes
    newClasses.forEach((cls) => document.body.classList.add(cls));

    // Remove old classes that are no longer needed
    prevThemeClasses.current.forEach((cls) => {
      if (!newClasses.includes(cls)) {
        document.body.classList.remove(cls);
      }
    });

    prevThemeClasses.current = newClasses;

    // Clean up on unmount
    return () => {
      newClasses.forEach((cls) => document.body.classList.remove(cls));
    };
  }, [resolvedTheme, mounted]);

  return <>{children}</>;
}
