"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import type { SkyVariant } from "./layers/SkyGradientPlane";
import { DayScene } from "./phases/DayScene";
import { NightCityScene } from "./phases/NightCityScene";
import { SunriseScene } from "./phases/SunriseScene";
import { SunsetScene } from "./phases/SunsetScene";
import { HorizonPostFX } from "./postfx/HorizonPostFX";
import { FrozenFrame, RepaintOnVisible } from "@/components/theme/FrozenFrame";

interface HorizonTheaterCanvasProps {
  variant: SkyVariant;
  isCalm?: boolean;
}

export function HorizonTheaterCanvas({ variant, isCalm = false }: HorizonTheaterCanvasProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const pixelSize = isCalm ? 4.0 : 3.0;
  const dpr = isCalm
    ? 0.5
    : typeof window !== "undefined"
      ? Math.min(window.devicePixelRatio * 0.7, 0.85)
      : 0.75;

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 5], fov: 50 }}
      /*
       * "demand" in both states, deliberately.
       *
       * This used to be `isCalm ? "never" : "demand"`. `"never"` cannot be painted at all:
       * R3F's `invalidate()` early-returns for that frameloop, so `gl.render` is never
       * reached and the theatre stays blank in calm mode. `FrozenFrame` below requests the
       * single calm frame instead, so the scene is drawn once and held.
       *
       * The non-calm path is already `demand` (the scene self-invalidates while animating),
       * so this is now uniform.
       */
      frameloop="demand"
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <FrozenFrame />
      <RepaintOnVisible />
      <Suspense fallback={null}>
        {variant === "sunrise" && (
          <SunriseScene
            active={!isCalm}
            pixelSize={pixelSize}
          />
        )}
        {variant === "sunset" && (
          <SunsetScene
            active={!isCalm}
            pixelSize={pixelSize}
          />
        )}
        {variant === "night-city" && (
          <NightCityScene
            active={!isCalm}
            pixelSize={pixelSize}
          />
        )}
        {variant === "day" && (
          <DayScene
            active={!isCalm}
            pixelSize={pixelSize}
          />
        )}

        <HorizonPostFX
          enabled={!isCalm}
          variant={variant}
        />
      </Suspense>
    </Canvas>
  );
}
