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

const readIsCalm = (): boolean => {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return root.hasAttribute("data-low-data") || root.hasAttribute("data-reduce-motion");
};

const SceneContent = ({ isCalm }: { isCalm: boolean }) => {
  const [ripples, setRipples] = useState<RippleData[]>([]);
  const [wisps, setWisps] = useState<WispData[]>([]);
  const [lastPlaneClick, setLastPlaneClick] = useState<THREE.Vector3 | null>(null);
  const [isMounted, setMounted] = useState(false);
  const [themeColors, setThemeColors] = useState({ primary: "", secondary: "", accent: "" });

  useEffect(() => {
    const updateThemeColors = () => {
      setThemeColors({
        primary: getCssColor("--primary"),
        secondary: getCssColor("--secondary"),
        accent: getCssColor("--accent"),
      });
    };

    updateThemeColors();
    setMounted(true);
    const observer = new MutationObserver(updateThemeColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isCalm) return;
    setRipples([]);
    setWisps([]);
    setLastPlaneClick(null);
  }, [isCalm]);

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
    if (isCalm) return;
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
    if (isCalm) return;
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
            primaryColor={themeColors.primary}
            secondaryColor={themeColors.secondary}
            accentColor={themeColors.accent}
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

const EtherealScene = () => {
  const [isCalm, setIsCalm] = useState(false);

  useEffect(() => {
    const update = () => setIsCalm(readIsCalm());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-low-data", "data-reduce-motion"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="pointer-events-auto absolute inset-0">
      <div
        className={cn("-z-10 absolute inset-0 animate-dreamscape-flow")}
        style={{
          backgroundSize: "200% 200%",
          backgroundImage: "linear-gradient(135deg, hsl(var(--background)), hsl(var(--muted)))",
        }}
      />
      <div
        className={cn("-z-10 absolute inset-0")}
        style={{
          backgroundImage:
            "radial-gradient(1200px 900px at 22% 18%, hsl(var(--primary) / 0.22), transparent 60%), radial-gradient(1100px 800px at 82% 78%, hsl(var(--accent) / 0.18), transparent 55%)",
        }}
      />
      <div
        className={cn(
          "-translate-x-1/2 -translate-y-1/2 -z-10 absolute top-0 left-0 h-2/3 w-2/3 animate-float-subtle rounded-full"
        )}
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, hsl(var(--secondary) / 0.14) 0%, transparent 68%)",
          animationDuration: "22s",
        }}
      />
      <div
        className={cn(
          "-z-10 absolute right-0 bottom-0 h-2/3 w-2/3 translate-x-1/2 translate-y-1/2 animate-float-subtle rounded-full"
        )}
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, hsl(var(--primary) / 0.12) 0%, transparent 68%)",
          animationDuration: "26s",
          animationDelay: "2s",
        }}
      />
      <div
        className={cn("-z-10 absolute inset-0")}
        style={{
          backgroundImage:
            "radial-gradient(1200px 800px at 50% 0%, transparent 40%, hsl(var(--background) / 0.6) 100%)",
        }}
      />
      <Canvas
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 2, 5], fov: 75 }}
        frameloop={isCalm ? "demand" : "always"}
        className="absolute inset-0"
        style={{ background: "transparent" }}
      >
        <SceneContent isCalm={isCalm} />
      </Canvas>
    </div>
  );
};

export default EtherealScene;
