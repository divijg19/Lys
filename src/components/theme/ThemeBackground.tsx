/**
 * @file: src/components/theme/ThemeBackground.tsx
 * @description: Renders dynamic, theme-specific background effects.
 *
 * This client component listens to the current theme and conditionally renders
 * a set of animated divs to create unique visual effects for themes like
 * Cyberpunk, Ethereal, Horizon, and Mirage.
 *
 * It is designed to be placed in the root layout and will sit behind all
 * other page content without interfering with user interactions.
 */

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * A container for all the visual effects. It uses common CSS properties
 * to ensure effects are always in the background and non-interactive.
 */
const EffectsContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="-z-10 pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
    {children}
  </div>
);

/**
 * The main component that selects and renders the correct background effect
 * based on the currently active theme.
 */
const ThemeBackground = () => {
  // --- STATE AND HOOKS ---
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The "hydration guard" pattern. This component will only render its
  // theme-specific content after it has mounted on the client, preventing
  // server/client mismatches.
  useEffect(() => {
    setMounted(true);
  }, []);

  // While not mounted, render nothing.
  if (!mounted) {
    return null;
  }

  // --- RENDER LOGIC ---
  // A switch statement cleanly handles the rendering for each theme.
  switch (theme) {
    case "cyberpunk":
      return (
        <EffectsContainer>
          {/* A subtle glitch effect that provides texture without being distracting */}
          <div className="absolute inset-0 animate-glitch" />
          {/* Faint grid lines to enhance the high-tech aesthetic */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(var(--primary), 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--primary), 0.1) 1px, transparent 1px)",
              backgroundSize: "2rem 2rem",
            }}
          />
        </EffectsContainer>
      );

    case "ethereal":
      return (
        <EffectsContainer>
          {/* Soft, slowly moving cloud-like gradients */}
          <div
            className="absolute inset-0 animate-clouds opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 20% 80%, hsla(240, 60%, 60%, 0.3), transparent 50%), radial-gradient(ellipse at 80% 30%, hsla(300, 50%, 95%, 0.3), transparent 50%)",
            }}
          />
          {/* Gently floating orb effect */}
          <div className="absolute inset-0 animate-float" />
        </EffectsContainer>
      );

    case "horizon":
      return (
        <EffectsContainer>
          {/* Simulates a distant, slowly rotating sun */}
          <div
            className="-top-1/2 -z-10 -translate-x-1/2 absolute left-1/2 h-[200%] w-[200%] animate-sunrays"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at center, hsla(20, 90%, 60%, 0.2) 0%, transparent 60%)",
            }}
          />
          {/* Subtle heatwave distortion effect */}
          <div className="absolute inset-0 animate-heatwave opacity-10" />
          {/* Fading gradient that mimics a sunrise/sunset */}
          <div className="absolute inset-0 animate-horizon-fade opacity-20" />
        </EffectsContainer>
      );

    case "mirage":
      return (
        <EffectsContainer>
          {/* Creates a subtle, shimmering distortion across the screen */}
          <div className="absolute inset-0 animate-mirage-shift opacity-30" />
          {/* Simulates light refracting through hot air */}
          <div className="absolute inset-0 animate-refract opacity-20" />
          {/* A slow, pulsing blur effect */}
          <div className="absolute inset-0 animate-blur-pulse" />
        </EffectsContainer>
      );

    // For themes without special effects (light, dark, simple), render nothing.
    default:
      return null;
  }
};

export default ThemeBackground;
