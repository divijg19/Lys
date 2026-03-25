"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { moonbeamFragment, moonbeamVertex } from "../shaders/moonbeam.glsl";

interface MoonbeamProps {
  moonPosition?: THREE.Vector2;
  beamColor?: THREE.Vector3;
  pixelSize?: number;
  position?: [number, number, number];
  active?: boolean;
}

export function Moonbeam({
  moonPosition = new THREE.Vector2(0.3, 0.8),
  beamColor = new THREE.Vector3(0.6, 0.7, 0.9),
  pixelSize = 3.0,
  position = [0, 0, -5],
  active = true,
}: MoonbeamProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, invalidate } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uPixelSize: { value: pixelSize },
      uMoonPos: { value: moonPosition },
      uBeamColor: { value: beamColor },
    }),
    [size.width, size.height, pixelSize, moonPosition, beamColor]
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
        vertexShader={moonbeamVertex}
        fragmentShader={moonbeamFragment}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
