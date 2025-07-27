/**
 * @file: src/components/theme/ThemeBackground.tsx
 * @description: Renders dynamic, procedurally generated background effects.
 * This component listens to the active theme via the useTheme hook and
 * conditionally renders a unique, animated background for each theme.
 */

"use client";

import { Canvas } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { Suspense, useEffect, useState } from "react";
import { DataRain } from "@/components/theme/effects/DataRain";
import { Starfield } from "@/components/theme/effects/Starfield";

// A container to hold all background effects, ensuring they are behind all content
// and non-interactive.
const EffectsContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="-z-50 pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
    {children}
  </div>
);

// --- Theme Background Implementations ---

const LightBackground = () => {
  // Identity: "Modernist Gallery"
  return (
    <EffectsContainer>
      <div className="bg-[radial-gradient(ellipse_at_50%_-50%,hsl(var(--foreground)/0.03),transparent_60%)]" />
    </EffectsContainer>
  );
};

const DarkBackground = () => {
  // Identity: "The Abyss"
  return (
    <EffectsContainer>
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Starfield />
        </Canvas>
      </Suspense>
    </EffectsContainer>
  );
};

const CyberpunkBackground = () => {
  // Identity: "Corporate Dystopia"
  return (
    <EffectsContainer>
      <DataRain />
    </EffectsContainer>
  );
};

const EtherealBackground = () => {
  // Identity: "Ethereal / Lucid Dreamscape"
  return (
    <EffectsContainer>
      <div
        className="absolute inset-0 animate-dreamscape-flow"
        style={{
          backgroundSize: "200% 200%",
          backgroundImage:
            "linear-gradient(45deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.2), hsl(var(--accent) / 0.2))",
        }}
      />
      <div
        className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-0 h-2/3 w-2/3 animate-float-subtle rounded-full"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, hsl(var(--primary) / 0.2) 0%, transparent 70%)",
          animationDuration: "15s",
        }}
      />
      <div
        className="absolute right-0 bottom-0 h-2/3 w-2/3 translate-x-1/2 translate-y-1/2 animate-float-subtle rounded-full"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, hsl(var(--accent) / 0.2) 0%, transparent 70%)",
          animationDuration: "18s",
          animationDelay: "3s",
        }}
      />
    </EffectsContainer>
  );
};

const HorizonBackground = () => {
  // Identity: "Horizon / Dynamic Day Cycle"
  return (
    <EffectsContainer>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, hsl(30, 100%, 65%), hsl(260, 100%, 15%), hsl(224, 71%, 4%))",
        }}
      />
      <div
        className="-translate-x-1/2 absolute top-2/3 left-1/2 h-96 w-96 animate-lens-flare-pulse rounded-full opacity-30"
        style={{ background: "radial-gradient(ellipse, white, transparent 60%)" }}
      />
      <div
        className="absolute inset-0 animate-sky-pan opacity-20"
        style={{
          backgroundImage: "url(/assets/backgrounds/clouds.png)",
          backgroundSize: "auto 100%",
        }}
      />
      <div
        className="absolute right-0 bottom-0 left-0 h-1/4 opacity-80"
        style={{
          background: "hsl(var(--background))",
          maskImage: "url(/assets/backgrounds/dunes.svg)",
          maskSize: "cover",
          maskPosition: "bottom",
        }}
      />
    </EffectsContainer>
  );
};

const MirageBackground = () => {
  // Identity: "Mirage / Hallucinatory Oasis"
  return (
    <EffectsContainer>
      <div className="absolute inset-0 animate-heat-shimmer-subtle" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 150%, hsl(25, 80%, 45%)/0.2, transparent 50%)",
        }}
      />
      <div
        className="-translate-x-1/2 -translate-y-1/3 absolute top-1/2 left-1/2 h-full w-full animate-pulse"
        style={{
          background: "radial-gradient(ellipse, hsl(var(--primary)/0.1) 0%, transparent 50%)",
          animationDuration: "15s",
        }}
      />
    </EffectsContainer>
  );
};

const SimpleBackground = () => {
  // Identity: "Simple / Naturalist"
  const noiseUrl = `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;
  return (
    <EffectsContainer>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: noiseUrl }} />
    </EffectsContainer>
  );
};

/**
 * Orchestrator component that selects the appropriate background effect based on the active theme.
 * It handles the client-side mounting state to prevent server-client mismatches.
 */
const ThemeBackground = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure the component is only rendered on the client to safely access the theme.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  switch (theme) {
    case "light":
      return <LightBackground />;
    case "dark":
      return <DarkBackground />;
    case "cyberpunk":
      return <CyberpunkBackground />;
    case "ethereal":
      return <EtherealBackground />;
    case "horizon":
      return <HorizonBackground />;
    case "mirage":
      return <MirageBackground />;
    case "simple":
      return <SimpleBackground />;
    default:
      return null;
  }
};

export default ThemeBackground;
