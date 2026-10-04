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
import { useCallback, useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { cn } from "@/lib/utils";
import { RippleCue } from "../effects/ethereal/RippleCue";
import { type WispData, Wisps } from "../effects/ethereal/Wisps";
import { type RippleEvent, Ripples, saturateColor } from "../effects/ethereal/Ripples";
import { FrozenFrame, RepaintOnVisible } from "@/components/theme/FrozenFrame";
import { FlowingPlane } from "../effects/FlowingPlane";
import { useSceneSupport } from "@/components/theme/SceneSupport";
import { useCalmMode } from "@/hooks/useCalmMode";
import { useRippleField } from "@/hooks/useRippleField";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { type SceneMotionPolicy, sceneMotionPolicy } from "@/lib/calm";

/**
 * @param policy Resolved once by `EtherealScene` and passed down. This scene used to call
 *   `useCalmMode()` in both this component and its parent, which subscribed to the same
 *   state twice and left the two readings free to disagree for a frame.
 */
const SceneContent = ({ policy }: { policy: SceneMotionPolicy }) => {
  const { camera, gl } = useThree();
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
    enabled: policy.animated,
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

  /*
   * Drop in-flight wisps when the scene calms down.
   *
   * `useRippleField` already clears its own ripples when disabled, but these wisps are
   * local state. They finish by calling `onComplete` from a `useFrame`, and the frameloop is
   * stopped under calm mode -- so without this they would hang on screen forever, one React
   * list entry per tap, and never expire.
   */
  useEffect(() => {
    if (!policy.animated) setWisps([]);
  }, [policy.animated]);

  return (
    <>
      <FlowingPlane
        ref={surfaceRef}
        primaryColor={primary}
        secondaryColor={secondary}
        accentColor={accent}
        sourcesRef={sourcesRef}
        enabled={policy.animated}
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
  const policy = sceneMotionPolicy(useCalmMode());
  const { supported } = useSceneSupport();

  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className={cn("-z-10 absolute inset-0 animate-dreamscape-flow")}
        style={{
          backgroundSize: "200% 200%",
          // Deeper than the fallback's identical gradient. The fallback uses
          // background->muted; holding muted for the whole lower half is what made this layer
          // invisible against it.
          backgroundImage:
            "linear-gradient(165deg, hsl(var(--background)) 0%, hsl(var(--muted)) 46%, hsl(258 60% 90%) 100%)",
        }}
      />
      <div
        className={cn("-z-10 absolute inset-0")}
        style={{
          backgroundImage:
            "radial-gradient(1200px 900px at 22% 18%, hsl(var(--primary) / 0.34), transparent 62%), radial-gradient(1100px 800px at 82% 78%, hsl(var(--accent) / 0.3), transparent 58%)",
        }}
      />
      <div
        className={cn(
          "-translate-x-1/2 -translate-y-1/2 -z-10 absolute top-0 left-0 h-2/3 w-2/3 animate-float-subtle rounded-full"
        )}
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, hsl(var(--secondary) / 0.26) 0%, transparent 70%)",
          animationDuration: "22s",
        }}
      />
      <div
        className={cn(
          "-z-10 absolute right-0 bottom-0 h-2/3 w-2/3 translate-x-1/2 translate-y-1/2 animate-float-subtle rounded-full"
        )}
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, hsl(var(--primary) / 0.22) 0%, transparent 70%)",
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
      {/*
       * No WebGL: the canvas is never mounted, so it cannot throw for lack of a context.
       * The CSS atmosphere layers above are unconditional, so they still render.
       */}
      {supported && (
        <Canvas
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
          camera={{ position: [0, 2, 5], fov: 75 }}
          frameloop={policy.frameloop}
          className="absolute inset-0"
          style={{ background: "transparent" }}
        >
          <FrozenFrame />
          <RepaintOnVisible />
          <SceneContent policy={policy} />
        </Canvas>
      )}

      {/* Above the canvas: the cursor ring and hint are affordances, not scene content. */}
      <RippleCue />
    </div>
  );
};

export default EtherealScene;
