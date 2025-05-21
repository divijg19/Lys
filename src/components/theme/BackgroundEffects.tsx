"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { ThemeName } from "@/lib/themeClassMap";

const CyberpunkEffect = dynamic(() => import("./effects/Cyberpunk"), { ssr: false });
const EtherealEffect = dynamic(() => import("./effects/Ethereal"), { ssr: false });
const HorizonBlazeEffect = dynamic(() => import("./effects/HorizonBlaze"), { ssr: false });
const NeoMirageEffect = dynamic(() => import("./effects/NeoMirage"), { ssr: false });
const HighContrastEffect = dynamic(() => import("./effects/HighContrast"), { ssr: false });
const ReducedMotionEffect = dynamic(() => import("./effects/LowMotion"), { ssr: false });

export default function BackgroundEffects() {
  const [theme, setTheme] = useState<ThemeName | null>(null);

  useEffect(() => {
    const updateTheme = () => {
      const current = document.documentElement.getAttribute("data-theme") as ThemeName | null;
      setTheme(current);
    };
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    updateTheme();
    return () => observer.disconnect();
  }, []);

  const effectComponent = useMemo(() => {
    const components: Partial<Record<ThemeName, React.ReactElement>> = {
      cyberpunk: <CyberpunkEffect />,
      ethereal: <EtherealEffect />,
      "horizon-blaze": <HorizonBlazeEffect />,
      "neo-mirage": <NeoMirageEffect />,
      "high-contrast": <HighContrastEffect />,
      "reduced-motion": <ReducedMotionEffect />,
    };
    return theme && components[theme] ? components[theme] : null;
  }, [theme]);

  return effectComponent;
}
