/**
 * @file: src/components/theme/scenes/EtherealScene.tsx
 * @description: Renders the Ethereal theme using a robust, single-plane interaction model.
 */

"use client";

import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { useCallback, useEffect, useState } from "react";
import type * as THREE from "three";
import { cn } from "@/lib/utils";
import { type RippleData, Ripples } from "../effects/ethereal/Ripples";
import { type WispData, Wisps } from "../effects/ethereal/Wisps";
import { FlowingPlane } from "../effects/FlowingPlane";

const getCssColor = (name: string): string => {
  if (typeof window === "undefined") return "";
  return `hsl(${getComputedStyle(document.documentElement).getPropertyValue(name).trim()})`;
};

const SceneContent = () => {
  const [ripples, setRipples] = useState<RippleData[]>([]);
  const [wisps, setWisps] = useState<WispData[]>([]);
  const [lastPlaneClick, setLastPlaneClick] = useState<THREE.Vector3 | null>(null);
  const [isMounted, setMounted] = useState(false);
  const [themeColors, setThemeColors] = useState({ primary: "", accent: "" });

  useEffect(() => {
    const updateThemeColors = () =>
      setThemeColors({ primary: getCssColor("--primary"), accent: getCssColor("--accent") });
    updateThemeColors();
    setMounted(true);
    const observer = new MutationObserver(updateThemeColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const handleRemoveRipple = useCallback(
    (id: number) => setRipples((prev) => prev.filter((r) => r.id !== id)),
    []
  );
  const handleRemoveWisp = useCallback(
    (id: number) => setWisps((prev) => prev.filter((w) => w.id !== id)),
    []
  );

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setLastPlaneClick(event.point);
    setRipples((prev) => [
      ...prev,
      {
        id: performance.now(),
        position: event.point,
        creationTime: event.nativeEvent.timeStamp / 1000,
      },
    ]);
  };

  const handleContextMenu = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    event.nativeEvent.preventDefault();
    setWisps((prev) => [
      ...prev,
      {
        id: performance.now(),
        position: event.point,
        creationTime: event.nativeEvent.timeStamp / 1000,
      },
    ]);
  };

  return (
    <>
      {/* --- VISUAL ELEMENTS --- */}
      {isMounted && (
        <>
          <FlowingPlane
            color={themeColors.primary}
            latestClickPosition={lastPlaneClick}
          />
          <Ripples
            ripples={ripples}
            onComplete={handleRemoveRipple}
            color={themeColors.primary}
          />
          <Wisps
            wisps={wisps}
            onComplete={handleRemoveWisp}
            color={themeColors.accent}
          />
        </>
      )}

      {/* --- INTERACTION PLANE --- */}
      {/* This single, invisible mesh is the ONLY interactive element. */}
      {/* Its geometry is identical to the FlowingPlane, ensuring clicks are registered correctly. */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: This is a deliberate interaction plane for a decorative effect. */}
      <mesh
        position={[0, -3, 0]}
        rotation={[-Math.PI / 2.1, 0, 0]}
        onPointerDown={handlePointerDown}
        onContextMenu={handleContextMenu}
        visible={false} // Hide the plane without affecting its interactivity.
      >
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial />
      </mesh>
    </>
  );
};

const EtherealScene = () => (
  <div className="pointer-events-auto absolute inset-0">
    <div
      className={cn("-z-10 absolute inset-0 animate-dreamscape-flow")}
      style={{
        backgroundSize: "200% 200%",
        backgroundImage:
          "linear-gradient(45deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.2), hsl(var(--accent) / 0.2))",
      }}
    />
    <div
      className={cn(
        "-translate-x-1/2 -translate-y-1/2 -z-10 absolute top-0 left-0 h-2/3 w-2/3 animate-float-subtle rounded-full"
      )}
      style={{
        backgroundImage:
          "radial-gradient(ellipse at center, hsl(var(--primary) / 0.2) 0%, transparent 70%)",
        animationDuration: "15s",
      }}
    />
    <div
      className={cn(
        "-z-10 absolute right-0 bottom-0 h-2/3 w-2/3 translate-x-1/2 translate-y-1/2 animate-float-subtle rounded-full"
      )}
      style={{
        backgroundImage:
          "radial-gradient(ellipse at center, hsl(var(--accent) / 0.2) 0%, transparent 70%)",
        animationDuration: "18s",
        animationDelay: "3s",
      }}
    />
    <Canvas
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 2, 5], fov: 75 }}
      className="absolute inset-0"
      style={{ background: "transparent" }}
    >
      <SceneContent />
    </Canvas>
  </div>
);

export default EtherealScene;
