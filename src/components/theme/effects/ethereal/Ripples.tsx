/**
 * @file: src/components/theme/effects/ethereal/Ripples.tsx
 * @description: Manages and renders the on-click ripple effects.
 * @update: Reverted to its original state but with rotation hardcoded to match the scene.
 */

"use client";

import { shaderMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const RippleMaterial = shaderMaterial(
  { uColor: new THREE.Color(0.9, 0.8, 1.0), uRadius: 0.0, uOpacity: 0.0 },
  `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  `uniform vec3 uColor; uniform float uRadius; uniform float uOpacity; varying vec2 vUv;
   void main() {
     vec2 center = vec2(0.5);
     float dist = distance(vUv, center);
     float ring = smoothstep(uRadius - 0.03, uRadius, dist) - smoothstep(uRadius, uRadius + 0.03, dist);
     float halo = smoothstep(uRadius - 0.12, uRadius - 0.05, dist) - smoothstep(uRadius - 0.05, uRadius + 0.02, dist);
     float strength = ring + halo * 0.35;
     gl_FragColor = vec4(uColor, strength * uOpacity);
   }`
);

interface IRippleMaterial extends THREE.ShaderMaterial {
  uniforms: {
    uColor: { value: THREE.Color };
    uRadius: { value: number };
    uOpacity: { value: number };
  };
}

type RippleProps = {
  id: number;
  position: THREE.Vector3;
  creationTime: number;
  onComplete: (id: number) => void;
  color: string;
};

export type RippleData = { id: number; position: THREE.Vector3; creationTime: number };
export type RipplesProps = {
  ripples: RippleData[];
  onComplete: (id: number) => void;
  color: string;
};

const Ripple = ({ id, position, creationTime, onComplete, color }: RippleProps) => {
  const ref = useRef<IRippleMaterial>(null);
  const hasCompleted = useRef(false);
  const material = useMemo(() => {
    const mat = new RippleMaterial();
    mat.uniforms.uColor.value = new THREE.Color(color);
    return mat;
  }, [color]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const elapsedTime = clock.getElapsedTime() - creationTime;
    const lifespan = 1.5;
    if (elapsedTime > lifespan) {
      if (!hasCompleted.current) {
        onComplete(id);
        hasCompleted.current = true;
      }
      return;
    }
    const progress = elapsedTime / lifespan;
    ref.current.uniforms.uRadius.value = progress * 2.0;
    ref.current.uniforms.uOpacity.value = 0.32 * (1.0 - progress);
  });

  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2.1, 0, 0]}
    >
      <planeGeometry args={[5, 5]} />
      <primitive
        ref={ref}
        object={material}
        attach="material"
        transparent
      />
    </mesh>
  );
};

export const Ripples = ({ ripples, onComplete, color }: RipplesProps) => (
  <group>
    {ripples.map((ripple) => (
      <Ripple
        key={ripple.id}
        {...ripple}
        onComplete={onComplete}
        color={color}
      />
    ))}
  </group>
);
