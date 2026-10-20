"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { DoubleSide, type Mesh, Vector2, Vector3 } from "three";
import { oceanWavesFragment, oceanWavesVertex } from "../shaders/oceanWaves.glsl";

interface OceanPlaneProps {
  waterColor?: Vector3;
  glowColor?: Vector3;
  waveSpeed?: number;
  pixelSize?: number;
  position?: [number, number, number];
  active?: boolean;
}

export function OceanPlane({
  waterColor = new Vector3(0.08, 0.1, 0.18),
  glowColor = new Vector3(0.6, 0.7, 0.9),
  waveSpeed = 0.3,
  pixelSize = 3.0,
  position = [0, -2, -4],
  active = true,
}: OceanPlaneProps) {
  const meshRef = useRef<Mesh>(null);
  const { size, invalidate } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new Vector2(size.width, size.height) },
      uPixelSize: { value: pixelSize },
      uWaterColor: { value: waterColor },
      uGlowColor: { value: glowColor },
      uWaveSpeed: { value: waveSpeed },
    }),
    [size.width, size.height, pixelSize, waterColor, glowColor, waveSpeed]
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
      <planeGeometry args={[20, 8]} />
      <shaderMaterial
        vertexShader={oceanWavesVertex}
        fragmentShader={oceanWavesFragment}
        uniforms={uniforms}
        transparent
        side={DoubleSide}
      />
    </mesh>
  );
}
