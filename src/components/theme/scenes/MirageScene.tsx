/**
 * @file: src/components/theme/scenes/MirageScene.tsx
 * @description: Renders the shimmering heat-wave effect for the Mirage theme.
 * Identity: "Mirage / Hallucinatory Oasis"
 */

"use client";

import { useCalmMode } from "@/hooks/useCalmMode";

/**
 * The background scene component for the Mirage theme.
 * It creates a sense of a desert illusion through a subtle, animating
 * heat shimmer, a low-lying gradient, and a large, slow pulsing light source.
 */
const MirageScene = () => {
  // Reads the same derived attributes as every other scene. This carried a private
  // readIsCalm() copy that also OR-ed in a raw matchMedia boolean, so it could disagree
  // with the shared definition.
  const isCalm = useCalmMode();

  return (
    <>
      <div
        className={`absolute inset-0 ${isCalm ? "" : "animate-heat-shimmer-subtle"}`}
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 18px, hsl(var(--foreground) / 0.035) 18px 22px, transparent 22px 48px)",
          backgroundSize: "260px 100%",
          opacity: 0.25,
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 150%, hsl(var(--secondary) / 0.18), transparent 55%)",
        }}
        aria-hidden
      />
      <div
        className="-translate-x-1/2 -translate-y-1/3 absolute top-1/2 left-1/2 h-full w-full"
        style={{
          background: "radial-gradient(ellipse, hsl(var(--primary) / 0.10) 0%, transparent 55%)",
        }}
        aria-hidden
      />
    </>
  );
};

export default MirageScene;
