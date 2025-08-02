/**
 * @file: src/components/theme/scenes/EtherealScene.tsx
 * @description: Renders the interactive, dream-like background for the Ethereal theme, combining CSS visuals with WebGL effects.
 * @identity: "Ethereal / Lucid Dreamscape"
 */

"use client";

import { Canvas, type ThreeEvent, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { type RippleData, Ripples } from "../effects/ethereal/Ripples";
import { type WispData, Wisps } from "../effects/ethereal/Wisps";

// Helper function to read CSS variables from the DOM.
const getCssColor = (name: string): string => {
  if (typeof window === "undefined") return "";
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return `hsl(${value})`;
};

/**
 * Manages the state and interactions within the Three.js canvas.
 */
const SceneContent = () => {
  const [ripples, setRipples] = useState<RippleData[]>([]);
  const [wisps, setWisps] = useState<WispData[]>([]);
  const { viewport } = useThree();
  const [isMounted, setMounted] = useState(false);

  const [themeColors, setThemeColors] = useState({
    primary: "",
    accent: "",
  });

  // Observer to update 3D element colors when the theme changes.
  useEffect(() => {
    const updateThemeColors = () => {
      setThemeColors({
        primary: getCssColor("--primary"),
        accent: getCssColor("--accent"),
      });
    };
    updateThemeColors(); // Initial color grab
    setMounted(true); // Signal that client is mounted and colors are synced

    const observer = new MutationObserver(updateThemeColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const handleRemoveRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleRemoveWisp = useCallback((id: number) => {
    setWisps((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setRipples((prev) => [
      ...prev,
      { id: performance.now(), position: event.point, creationTime: event.nativeEvent.timeStamp / 1000 },
    ]);
  };

  const handleContextMenu = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    event.nativeEvent.preventDefault();
    setWisps((prev) => [
      ...prev,
      { id: performance.now(), position: event.point, creationTime: event.nativeEvent.timeStamp / 1000 },
    ]);
  };

  return (
    <>
      {/* REFINEMENT: Only render effects after mounting to prevent color flicker */}
      {isMounted && (
        <>
          <Ripples ripples={ripples} onComplete={handleRemoveRipple} color={themeColors.primary} />
          <Wisps wisps={wisps} onComplete={handleRemoveWisp} color={themeColors.accent} />
        </>
      )}

      {/* biome-ignore lint/a11y/noStaticElementInteractions: This is a deliberate interaction plane for a decorative effect. */}
      <mesh onPointerDown={handlePointerDown} onContextMenu={handleContextMenu} visible={false}>
        <planeGeometry args={[viewport.width, viewport.height]} />
      </mesh>
    </>
  );
};

/**
 * The main component for the Ethereal theme background.
 */
const EtherealScene = () => {
  return (
    <div className="absolute inset-0">
      {/* --- CSS BACKGROUND LAYERS --- */}
      <div
        className={cn("-z-10 absolute inset-0 animate-dreamscape-flow")}
        style={{
          backgroundSize: "200% 200%",
          backgroundImage: "linear-gradient(45deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.2), hsl(var(--accent) / 0.2))",
        }}
      />
      <div
        className={cn("-translate-x-1/2 -translate-y-1/2 -z-10 absolute top-0 left-0 h-2/3 w-2/3 animate-float-subtle rounded-full")}
        style={{
          backgroundImage: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.2) 0%, transparent 70%)",
          animationDuration: "15s",
        }}
      />
      <div
        className={cn("-z-10 absolute right-0 bottom-0 h-2/3 w-2/3 translate-x-1/2 translate-y-1/2 animate-float-subtle rounded-full")}
        style={{
          backgroundImage: "radial-gradient(ellipse at center, hsl(var(--accent) / 0.2) 0%, transparent 70%)",
          animationDuration: "18s",
          animationDelay: "3s",
        }}
      />

      {/* --- INTERACTIVE WEBGL LAYER --- */}
      <Canvas
        gl={{ alpha: true }}
        className="absolute inset-0"
        style={{ background: "transparent" }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
};

export default EtherealScene;