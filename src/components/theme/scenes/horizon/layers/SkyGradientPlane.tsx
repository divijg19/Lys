"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { skyGradientFragment, skyGradientVertex } from "../shaders/skyGradient.glsl";

export type SkyVariant = "sunrise" | "sunset" | "night-city" | "day";

interface SkyGradientPlaneProps {
  variant: SkyVariant;
  pixelSize?: number;
  active?: boolean;
}

const variantToInt = (v: SkyVariant): number => {
  switch (v) {
    case "sunrise":
      return 0;
    case "sunset":
      return 1;
    case "night-city":
      return 2;
    default:
      return 3;
  }
};

export function SkyGradientPlane({
  variant,
  pixelSize = 3.0,
  active = true,
}: SkyGradientPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, invalidate } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uPixelSize: { value: pixelSize },
      uVariant: { value: variantToInt(variant) },
    }),
    [size.width, size.height, pixelSize, variant]
  );

  useFrame((_, delta) => {
    if (!active) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    uniforms.uTime.value += delta * 0.2;
    invalidate();
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, -10]}
    >
      <planeGeometry args={[20, 12]} />
      <shaderMaterial
        vertexShader={skyGradientVertex}
        fragmentShader={skyGradientFragment}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
