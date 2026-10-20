"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, DoubleSide, type Mesh, Vector2, Vector3 } from "three";
import { celestialBodyFragment, celestialBodyVertex } from "../shaders/celestialBody.glsl";

interface CelestialBodyProps {
  bodyPosition?: Vector2;
  radius?: number;
  bodyColor?: Vector3;
  glowColor?: Vector3;
  isMoon?: boolean;
  rayCount?: number;
  pixelSize?: number;
  position?: [number, number, number];
  active?: boolean;
}

export function CelestialBody({
  bodyPosition = new Vector2(0.3, 0.8),
  radius = 0.08,
  bodyColor = new Vector3(1.0, 0.95, 0.85),
  glowColor = new Vector3(1.0, 0.8, 0.5),
  isMoon = false,
  rayCount = 0,
  pixelSize = 3.0,
  position = [0, 0, -8],
  active = true,
}: CelestialBodyProps) {
  const meshRef = useRef<Mesh>(null);
  const { size, invalidate } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new Vector2(size.width, size.height) },
      uPixelSize: { value: pixelSize },
      uPosition: { value: bodyPosition },
      uRadius: { value: radius },
      uBodyColor: { value: bodyColor },
      uGlowColor: { value: glowColor },
      uIsMoon: { value: isMoon },
      uRayCount: { value: rayCount },
    }),
    [
      size.width,
      size.height,
      pixelSize,
      bodyPosition,
      radius,
      bodyColor,
      glowColor,
      isMoon,
      rayCount,
    ]
  );

  useFrame((_, delta) => {
    if (!active) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    uniforms.uTime.value += delta;
    invalidate();
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
    >
      <planeGeometry args={[20, 12]} />
      <shaderMaterial
        vertexShader={celestialBodyVertex}
        fragmentShader={celestialBodyFragment}
        uniforms={uniforms}
        transparent
        side={DoubleSide}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  );
}
