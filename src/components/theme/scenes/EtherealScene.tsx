/**
 * @file: src/components/theme/scenes/EtherealScene.tsx
 * @description: Renders the soft, animated background for the Ethereal theme.
 * Identity: "Ethereal / Lucid Dreamscape"
 */

"use client";

/**
 * The background scene component for the Ethereal theme.
 * It creates a soft, otherworldly atmosphere with a gently shifting background
 * gradient and large, floating, translucent orbs to simulate a lucid dreamscape.
 */
const EtherealScene = () => {
  return (
    <>
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
    </>
  );
};

export default EtherealScene;
