"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { cliffSilhouetteFragment, cliffSilhouetteVertex } from "../shaders/cliffSilhouette.glsl";

interface CliffSilhouetteProps {
  cliffColor?: THREE.Vector3;
  rimColor?: THREE.Vector3;
  pixelSize?: number;
  position?: [number, number, number];
  active?: boolean;
}

export function CliffSilhouette({
  cliffColor = new THREE.Vector3(0.06, 0.05, 0.06),
  rimColor = new THREE.Vector3(0.9, 0.65, 0.35),
  pixelSize = 3.0,
  position = [0, 0, -2],
  active = true,
}: CliffSilhouetteProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, invalidate } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uPixelSize: { value: pixelSize },
      uCliffColor: { value: cliffColor },
      uRimColor: { value: rimColor },
    }),
    [size.width, size.height, pixelSize, cliffColor, rimColor]
  );

  useFrame((_, delta) => {
    if (!active) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    uniforms.uTime.value += delta * 0.1;
    invalidate();
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
    >
      <planeGeometry args={[20, 12]} />
      <shaderMaterial
        vertexShader={cliffSilhouetteVertex}
        fragmentShader={cliffSilhouetteFragment}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
