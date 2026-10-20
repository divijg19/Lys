"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { DoubleSide, type Mesh, Vector2, Vector3 } from "three";
import { mountainLayerFragment, mountainLayerVertex } from "../shaders/mountainLayer.glsl";

interface MountainLayerProps {
  mountainColor?: Vector3;
  rimColor?: Vector3;
  roughness?: number;
  parallaxFactor?: number;
  pixelSize?: number;
  position?: [number, number, number];
  active?: boolean;
}

export function MountainLayer({
  mountainColor = new Vector3(0.12, 0.08, 0.1),
  rimColor = new Vector3(0.9, 0.7, 0.5),
  roughness = 0.15,
  parallaxFactor = 0.2,
  pixelSize = 3.0,
  position = [0, -1, -6],
  active = true,
}: MountainLayerProps) {
  const meshRef = useRef<Mesh>(null);
  const { size, invalidate } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new Vector2(size.width, size.height) },
      uPixelSize: { value: pixelSize },
      uMountainColor: { value: mountainColor },
      uRimColor: { value: rimColor },
      uRoughness: { value: roughness },
      uParallax: { value: parallaxFactor },
    }),
    [size.width, size.height, pixelSize, mountainColor, rimColor, roughness, parallaxFactor]
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
      <planeGeometry args={[20, 10]} />
      <shaderMaterial
        vertexShader={mountainLayerVertex}
        fragmentShader={mountainLayerFragment}
        uniforms={uniforms}
        transparent
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
