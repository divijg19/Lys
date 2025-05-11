"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import clsx from "clsx";

import type { ThemeName } from "@/lib/themeClassMap";

// Dynamically imported background effect components
const CyberpunkEffect = dynamic(() => import("./effects/Cyberpunk"), {
  ssr: false,
});
const EtherealEffect = dynamic(() => import("./effects/Ethereal"), {
  ssr: false,
});
const HorizonBlazeEffect = dynamic(() => import("./effects/HorizonBlaze"), {
  ssr: false,
});
const NeoMirageEffect = dynamic(() => import("./effects/NeoMirage"), {
  ssr: false,
});
const HighContrastEffect = dynamic(() => import("./effects/HighContrast"), {
  ssr: false,
});
const ReducedMotionEffect = dynamic(() => import("./effects/LowMotion"), {
  ssr: false,
}); // Ensure filename matches import

export default function BackgroundEffects() {
  const [theme, setTheme] = useState<ThemeName | null>(null);

  useEffect(() => {
    const updateTheme = () => {
      const current = document.documentElement.getAttribute(
        "data-theme",
      ) as ThemeName | null;
      setTheme(current);
    };

    // Watch for changes to the data-theme attribute
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    updateTheme(); // Initial detection

    return () => observer.disconnect();
  }, []);

  const effectComponent = useMemo(() => {
    const components: Partial<Record<ThemeName, JSX.Element>> = {
      cyberpunk: <CyberpunkEffect />,
      ethereal: <EtherealEffect />,
      "horizon-blaze": <HorizonBlazeEffect />,
      "neo-mirage": <NeoMirageEffect />,
      "high-contrast": <HighContrastEffect />,
      "reduced-motion": <ReducedMotionEffect />,
    };

    return theme ? (components[theme] ?? null) : null;
  }, [theme]);

  return (
    <div
      className={clsx(
        "pointer-events-none fixed inset-0 z-[-1] overflow-hidden",
        "transition-opacity duration-700 ease-in-out",
      )}
      aria-hidden="true"
    >
      {effectComponent}
    </div>
  );
}
