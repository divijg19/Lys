"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface StarFieldProps {
  count?: number;
  active?: boolean;
}

export function StarField({ count = 200, active = true }: StarFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { invalidate } = useThree();

  const { positions, sizes } = (() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 10 - 2;
      positions[i * 3 + 2] = -12 - Math.random() * 2;

      sizes[i] = Math.random() * 0.03 + 0.01;
    }

    return { positions, sizes };
  })();

  useFrame((state) => {
    if (!active || !pointsRef.current) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

    const material = pointsRef.current.material as THREE.PointsMaterial;
    const t = state.clock.elapsedTime;

    // Subtle twinkle
    material.opacity = 0.7 + Math.sin(t * 0.5) * 0.2;

    invalidate();
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={0xffffff}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
