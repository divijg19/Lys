/**
 * @file: src/components/theme/scenes/MirageScene.tsx
 * @description: Renders the shimmering heat-wave effect for the Mirage theme.
 * Identity: "Mirage / Hallucinatory Oasis"
 */

"use client";

/**
 * The background scene component for the Mirage theme.
 * It creates a sense of a desert illusion through a subtle, animating
 * heat shimmer, a low-lying gradient, and a large, slow pulsing light source.
 */
const MirageScene = () => {
  return (
    <>
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
    </>
  );
};

export default MirageScene;
