"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { fogLayerFragment, fogLayerVertex } from "../shaders/fogLayer.glsl";

interface FogLayerProps {
  fogColor?: THREE.Vector3;
  density?: number;
  driftSpeed?: number;
  pixelSize?: number;
  position?: [number, number, number];
  active?: boolean;
}

export function FogLayer({
  fogColor = new THREE.Vector3(0.8, 0.85, 0.9),
  density = 0.35,
  driftSpeed = 0.02,
  pixelSize = 3.0,
  position = [0, 0, 0],
  active = true,
}: FogLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, invalidate } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uPixelSize: { value: pixelSize },
      uFogColor: { value: fogColor },
      uDensity: { value: density },
      uDriftSpeed: { value: driftSpeed },
    }),
    [size.width, size.height, pixelSize, fogColor, density, driftSpeed]
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
        vertexShader={fogLayerVertex}
        fragmentShader={fogLayerFragment}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}
