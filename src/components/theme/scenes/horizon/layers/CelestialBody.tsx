"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { celestialBodyFragment, celestialBodyVertex } from "../shaders/celestialBody.glsl";

interface CelestialBodyProps {
  bodyPosition?: THREE.Vector2;
  radius?: number;
  bodyColor?: THREE.Vector3;
  glowColor?: THREE.Vector3;
  isMoon?: boolean;
  rayCount?: number;
  pixelSize?: number;
  position?: [number, number, number];
  active?: boolean;
}

export function CelestialBody({
  bodyPosition = new THREE.Vector2(0.3, 0.8),
  radius = 0.08,
  bodyColor = new THREE.Vector3(1.0, 0.95, 0.85),
  glowColor = new THREE.Vector3(1.0, 0.8, 0.5),
  isMoon = false,
  rayCount = 0,
  pixelSize = 3.0,
  position = [0, 0, -8],
  active = true,
}: CelestialBodyProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, invalidate } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
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
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
