/**
 * @file: src/components/theme/scenes/MirageScene.tsx
 * @description: Renders the shimmering heat-wave effect for the Mirage theme.
 * Identity: "Mirage / Hallucinatory Oasis"
 */

"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const readIsCalm = (): boolean => {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return root.hasAttribute("data-low-data") || root.hasAttribute("data-reduce-motion");
};

/**
 * The background scene component for the Mirage theme.
 * It creates a sense of a desert illusion through a subtle, animating
 * heat shimmer, a low-lying gradient, and a large, slow pulsing light source.
 */
const MirageScene = () => {
  const reduceMotion = usePrefersReducedMotion();
  const [isCalmFromRoot, setIsCalmFromRoot] = useState(false);

  useEffect(() => {
    const update = () => setIsCalmFromRoot(readIsCalm());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-low-data", "data-reduce-motion"],
    });
    return () => observer.disconnect();
  }, []);

  const isCalm = reduceMotion || isCalmFromRoot;

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
