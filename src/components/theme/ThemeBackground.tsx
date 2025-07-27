/**
 * @file: src/components/theme/ThemeBackground.tsx
 * @description: Renders dynamic, theme-specific background effects for the portfolio.
 *
 * This client component listens to the active theme via the useTheme hook and
 * conditionally renders a unique, animated background. Each theme's effect is
 * encapsulated in its own component for clarity and maintainability.
 *
 * It is designed to be placed in the root layout, sitting behind all other
 * content without interfering with user interactions, enhancing the emotional
 * and visual distinctiveness of each theme.
 */

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// A container to hold all background effects, ensuring they are behind all content
// and non-interactive.
const EffectsContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="-z-50 pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
    {children}
  </div>
);

// --- Theme Background Implementations ---

// Theme 1: Solarpunk Skyscraper
const SolarpunkBackground = () => (
  <EffectsContainer>
    {/* Layer 1: A very subtle texture, like smart glass or recycled paper. */}
    <div
      className="absolute inset-0 opacity-[0.02]"
      style={{ backgroundImage: "url(/assets/backgrounds/noise.png)", backgroundRepeat: "repeat" }}
    />
    {/* Layer 2: A large, soft, moving sunbeam that gives the scene life. */}
    <div
      className="absolute inset-0 animate-gradient-pan"
      style={{
        backgroundSize: "200% 200%",
        backgroundImage:
          "radial-gradient(circle at 50% 0%, hsl(var(--primary)/0.15) 0%, transparent 40%)",
        animationDuration: "20s",
      }}
    />
    {/* Layer 3: A static, holographic overlay of organic leaf veins. */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: "url(/assets/backgrounds/leaf-veins.svg)",
        backgroundRepeat: "repeat",
        maskImage: "linear-gradient(to bottom, transparent, black 80%)",
      }}
    />
  </EffectsContainer>
);

// Theme 2: Cosmic Noir
const DarkBackground = () => (
  <EffectsContainer>
    <div
      className="absolute inset-0 animate-star-scroll opacity-40"
      style={{
        backgroundImage: "url(/assets/backgrounds/stars-sm.png)",
        backgroundRepeat: "repeat",
        animationDuration: "400s",
      }}
    />
    <div
      className="absolute inset-0 animate-star-scroll opacity-60"
      style={{
        backgroundImage: "url(/assets/backgrounds/stars-md.png)",
        backgroundRepeat: "repeat",
        animationDuration: "250s",
      }}
    />
    <div
      className="absolute inset-0 animate-deep-star-scroll"
      style={{
        backgroundImage: "url(/assets/backgrounds/stars-lg.png)",
        backgroundRepeat: "repeat",
        animationDuration: "150s",
      }}
    />
  </EffectsContainer>
);

// Theme 3: Midnight Alley
const CyberpunkBackground = () => (
  <EffectsContainer>
    <div
      className="absolute inset-0 bg-bottom bg-contain bg-no-repeat opacity-50"
      style={{ backgroundImage: "url(/assets/backgrounds/city-silhouette.svg)" }}
    />
    <div
      className="-skew-x-12 absolute top-[10%] left-[10%] h-[20%] w-[30%] animate-neon-flicker opacity-80"
      style={{
        background: "radial-gradient(hsl(var(--primary)/0.3), transparent 70%)",
        animationDuration: "6s",
      }}
    />
    <div
      className="absolute inset-0 animate-data-rain"
      style={{
        backgroundImage: "url(/assets/backgrounds/data-rain.png)",
        backgroundRepeat: "repeat",
        opacity: 0.4,
        maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
      }}
    />
  </EffectsContainer>
);

// Theme 4: Lucid Dreamscape
const EtherealBackground = () => (
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

// Theme 5: Dynamic Day Cycle
const HorizonBackground = () => (
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

// Theme 6: Hallucinatory Oasis
const MirageBackground = () => (
  <EffectsContainer>
    <div className="absolute inset-0 animate-heat-shimmer-subtle" />
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse at 50% 150%, hsl(var(--primary)/0.2), transparent 50%)",
      }}
    />
    <div
      className="-translate-x-1/2 -translate-y-1/3 absolute top-1/2 left-1/2 h-full w-full animate-pulse"
      style={{
        background: "radial-gradient(ellipse, hsl(var(--accent)/0.15) 0%, transparent 50%)",
        animationDuration: "15s",
      }}
    />
  </EffectsContainer>
);

// Theme 7: E-Ink Reader
const EInkBackground = () => (
  <EffectsContainer>
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: "url(/assets/backgrounds/noise.png)",
        backgroundRepeat: "repeat",
      }}
    />
  </EffectsContainer>
);

// --- Main Component ---
const ThemeBackground = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  switch (theme) {
    case "light":
      return <SolarpunkBackground />;
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
      return <EInkBackground />;
    default:
      return null;
  }
};

export default ThemeBackground;
