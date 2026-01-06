"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { citySilhouetteFragment, citySilhouetteVertex } from "../shaders/citySilhouette.glsl";

interface CitySilhouetteProps {
  buildingColor?: THREE.Vector3;
  windowColor?: THREE.Vector3;
  glowColor?: THREE.Vector3;
  density?: number;
  pixelSize?: number;
  position?: [number, number, number];
  active?: boolean;
}

export function CitySilhouette({
  buildingColor = new THREE.Vector3(0.08, 0.06, 0.1),
  windowColor = new THREE.Vector3(0.9, 0.8, 0.3),
  glowColor = new THREE.Vector3(0.3, 0.5, 0.8),
  density = 1.0,
  pixelSize = 3.0,
  position = [0, 0, -7],
  active = true,
}: CitySilhouetteProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, invalidate } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uPixelSize: { value: pixelSize },
      uBuildingColor: { value: buildingColor },
      uWindowColor: { value: windowColor },
      uGlowColor: { value: glowColor },
      uDensity: { value: density },
    }),
    [size.width, size.height, pixelSize, buildingColor, windowColor, glowColor, density]
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
      <planeGeometry args={[20, 10]} />
      <shaderMaterial
        vertexShader={citySilhouetteVertex}
        fragmentShader={citySilhouetteFragment}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
