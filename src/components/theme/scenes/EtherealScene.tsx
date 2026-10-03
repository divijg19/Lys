/**
 * @file: src/components/theme/scenes/EtherealScene.tsx
 * @description: The Ethereal theme: an interactive, liquid field of light.
 *
 * Interaction is handled by `useRippleField`, which listens on `window` and raycasts by
 * hand. The canvas cannot receive pointer events of its own: it sits at `-z-50` behind a
 * full-viewport `relative z-10` page wrapper, so hit-testing always resolves to that
 * wrapper. See the hook for the full reasoning.
 */

"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useRef, useState } from "react";
import type * as THREE from "three";
import { cn } from "@/lib/utils";
import { RippleCue } from "../effects/ethereal/RippleCue";
import { type WispData, Wisps } from "../effects/ethereal/Wisps";
import { type RippleEvent, Ripples, saturateColor } from "../effects/ethereal/Ripples";
import { FlowingPlane } from "../effects/FlowingPlane";
import { useCalmMode } from "@/hooks/useCalmMode";
import { useRippleField } from "@/hooks/useRippleField";
import { useThemeTokens } from "@/hooks/useThemeTokens";

const SceneContent = () => {
  const { camera, gl } = useThree();
  const isCalm = useCalmMode();
  const { primary, secondary, accent } = useThemeTokens(["primary", "secondary", "accent"]);

  /** The surface whose plane defines where ripples land. */
  const surfaceRef = useRef<THREE.Mesh>(null);
  /**
   * Wisps are the accent-coloured motes that drift up from a ripple.
   *
   * Derived from deliberate taps only (strength >= 1), so they stay a reward for
   * interacting rather than another thing happening at random.
   */
  const [wisps, setWisps] = useState<WispData[]>([]);

  /**
   * A deliberate tap sends up both a ripple and a burst of motes, sharing one id and one
   * clock so they cannot drift apart.
   */
  const handleRipple = useCallback((ripple: RippleEvent) => {
    if (ripple.strength < 1) return;
    setWisps((prev) => [
      ...prev,
      { id: ripple.id, position: ripple.position, createdAt: ripple.createdAt },
    ]);
  }, []);

  const { sourcesRef, ripples, removeRipple, setSceneTime } = useRippleField({
    surfaceRef,
    camera,
    domElement: gl.domElement,
    enabled: !isCalm,
    allowAmbient: true,
    onRipple: handleRipple,
  });

  /*
   * Advance the shared scene clock before anything else runs this frame.
   *
   * A negative priority runs earlier in R3F's frame pipeline, so the value every ripple
   * reads on its own `useFrame` is already current. This is what keeps ripples, wisps and
   * the surface displacement agreeing on one clock.
   */
  useFrame(({ clock }) => {
    setSceneTime(clock.getElapsedTime());
  }, -100);

  const handleRemoveWisp = useCallback((id: number) => {
    setWisps((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return (
    <>
      <FlowingPlane
        ref={surfaceRef}
        primaryColor={primary}
        secondaryColor={secondary}
        accentColor={accent}
        sourcesRef={sourcesRef}
        enabled={!isCalm}
      />

      <Ripples
        ripples={ripples}
        onComplete={removeRipple}
        color={saturateColor(primary)}
      />

      <Wisps
        wisps={wisps}
        onComplete={handleRemoveWisp}
        color={accent}
      />
    </>
  );
};

const EtherealScene = () => {
  const isCalm = useCalmMode();

  return (
    <div className="pointer-events-none absolute inset-0">
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
        <SceneContent />
      </Canvas>

      {/* Above the canvas: the cursor ring and hint are affordances, not scene content. */}
      <RippleCue />
    </div>
  );
};

export default EtherealScene;
