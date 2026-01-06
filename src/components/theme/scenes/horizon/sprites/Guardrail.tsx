"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";

interface GuardrailProps {
  active?: boolean;
}

export function Guardrail({ active = true }: GuardrailProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!active || !groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Subtle sway in wind
    groupRef.current.rotation.z = Math.sin(t * 0.4) * 0.005;
  });

  // Guardrail posts along cliff edge
  const posts = [
    { x: 2.8, y: -2.5 },
    { x: 4.2, y: -2.6 },
    { x: 5.5, y: -2.7 },
  ];

  return (
    <group
      ref={groupRef}
      position={[0, 0, -1.5]}
    >
      {/* Posts */}
      {posts.map((p, _i) => (
        <group
          key={`post-${p.x}-${p.y}`}
          position={[p.x, p.y, 0]}
        >
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 0.6, 8]} />
            <meshBasicMaterial color={0x5d4e37} />
          </mesh>
          {/* Post cap */}
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color={0x4a3c2a} />
          </mesh>
        </group>
      ))}

      {/* Horizontal rail connecting posts */}
      <mesh position={[4.2, -2.3, 0]}>
        <boxGeometry args={[2.8, 0.04, 0.04]} />
        <meshBasicMaterial color={0x5d4e37} />
      </mesh>

      {/* Lower rail */}
      <mesh position={[4.2, -2.5, 0]}>
        <boxGeometry args={[2.8, 0.04, 0.04]} />
        <meshBasicMaterial color={0x5d4e37} />
      </mesh>

      {/* Cliff ledge line (outline) */}
      <mesh position={[4.0, -2.75, 0.1]}>
        <boxGeometry args={[3.0, 0.02, 0.02]} />
        <meshBasicMaterial color={0x2a2a2a} />
      </mesh>
    </group>
  );
}
