"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { heatShimmerFragment, heatShimmerVertex } from "../shaders/heatShimmer.glsl";

interface HeatShimmerProps {
  intensity?: number;
  pixelSize?: number;
  position?: [number, number, number];
  active?: boolean;
}

export function HeatShimmer({
  intensity = 1.0,
  pixelSize = 3.0,
  position = [0, 0, -1],
  active = true,
}: HeatShimmerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, invalidate } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uPixelSize: { value: pixelSize },
      uIntensity: { value: intensity },
    }),
    [size.width, size.height, pixelSize, intensity]
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
        vertexShader={heatShimmerVertex}
        fragmentShader={heatShimmerFragment}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
