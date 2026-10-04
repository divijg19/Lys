"use client";

/**
 * @file: src/components/theme/effects/cyberpunk/NeonGlow.tsx
 * @description: Screen-blended neon wash that saturates the alley with signage colour.
 *
 * The keyframes this used to declare inline via `<style jsx>` now live in
 * animations.css. Declaring them in the component meant a second injected stylesheet
 * per instance and left the animation definitions invisible to the reduced-motion
 * kill-switch list that the rest of the app honours.
 *
 * Must be rendered inside the same isolated layer as AtmosphereBackdrop, since
 * `mix-blend-mode` composites against that layer's backdrop rather than page content.
 */

import type React from "react";

export const NeonGlow: React.FC = () => {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
    >
      {/* Primary neon gradient wash - Cyan */}
      <div
        className="animate-neon-pulse absolute inset-0 mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 35%, hsl(var(--cp-haze-cyan) / 0.35), transparent 50%)",
        }}
      />

      {/* Secondary neon gradient - Magenta */}
      <div
        className="animate-neon-pulse absolute inset-0 mix-blend-screen"
        style={{
          animationDelay: "2s",
          animationDuration: "10s",
          backgroundImage:
            "radial-gradient(circle at 75% 60%, hsl(var(--cp-haze-magenta) / 0.28), transparent 55%)",
        }}
      />

      {/* Accent neon gradient - deep violet, grounded at the street */}
      <div
        className="animate-neon-pulse absolute inset-0 mix-blend-screen"
        style={{
          animationDelay: "4s",
          animationDuration: "12s",
          /*
           * `--accent`, not `--cp-accent`.
           *
           * `--cp-accent` was referenced here but never declared in any theme block, so the
           * whole declaration was invalid at computed-value time and the entire radial
           * gradient resolved to `none`. This glow layer silently drew nothing.
           */
          backgroundImage:
            "radial-gradient(circle at 50% 82%, hsl(var(--accent) / 0.22), transparent 60%)",
        }}
      />

      {/* Vertical scan flicker - a bright band travelling down the frame. */}
      <div
        className="animate-cyber-scan absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(180deg, transparent, hsl(var(--cp-haze-cyan) / 0.35) 30%, hsl(var(--cp-haze-magenta) / 0.25) 50%, transparent 70%)",
        }}
      />

      {/* Horizontal data sweep. */}
      <div
        className="animate-data-sweep absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent, hsl(var(--cp-neon-lime) / 0.15) 45%, hsl(var(--cp-haze-magenta) / 0.12) 55%, transparent)",
        }}
      />

      {/* Perspective grid overlay for depth. */}
      <div
        className="animate-grid-drift absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--cp-haze-cyan) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--cp-haze-cyan) / 0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
};
