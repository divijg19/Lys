"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface BokehParticlesProps {
  count?: number;
  active?: boolean;
}

export function BokehParticles({ count = 100, active = true }: BokehParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, sizes, colors } = (() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = -1 - Math.random() * 3;

      sizes[i] = Math.random() * 0.08 + 0.02;

      // Warm bokeh colors (golden, amber, soft white)
      const warm = Math.random();
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.7 + warm * 0.2;
      colors[i * 3 + 2] = 0.3 + warm * 0.3;
    }

    return { positions, sizes, colors };
  })();

  useFrame((state) => {
    if (!active || !pointsRef.current) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

    const t = state.clock.elapsedTime;
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Gentle float motion
      posArray[i * 3 + 1] = positions[i * 3 + 1] + Math.sin(t * 0.3 + i) * 0.1;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Subtle opacity pulse
    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.opacity = 0.4 + Math.sin(t * 0.5) * 0.15;
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
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.45}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
