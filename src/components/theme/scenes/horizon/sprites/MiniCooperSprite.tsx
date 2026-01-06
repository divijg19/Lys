"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface MiniCooperSpriteProps {
  active?: boolean;
}

export function MiniCooperSprite({ active = true }: MiniCooperSpriteProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headlightRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!active || !groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Subtle idle sway
    groupRef.current.position.y = -2.8 + Math.sin(t * 0.8) * 0.01;

    // Headlight flicker
    if (headlightRef.current) {
      (headlightRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.85 + Math.sin(t * 3.0) * 0.15;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[3.5, -2.8, -2]}
    >
      {/* Car body (simplified iconic mini cooper shape) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.25, 0.35]} />
        <meshBasicMaterial color={0xdc143c} />
      </mesh>

      {/* Car roof */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.35, 0.18, 0.32]} />
        <meshBasicMaterial color={0xffffff} />
      </mesh>

      {/* Hood */}
      <mesh position={[-0.32, -0.05, 0]}>
        <boxGeometry args={[0.08, 0.15, 0.35]} />
        <meshBasicMaterial color={0xdc143c} />
      </mesh>

      {/* Wheels */}
      <mesh
        position={[-0.22, -0.15, -0.2]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.08, 0.08, 0.06, 12]} />
        <meshBasicMaterial color={0x1a1a1a} />
      </mesh>
      <mesh
        position={[-0.22, -0.15, 0.2]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.08, 0.08, 0.06, 12]} />
        <meshBasicMaterial color={0x1a1a1a} />
      </mesh>
      <mesh
        position={[0.22, -0.15, -0.2]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.08, 0.08, 0.06, 12]} />
        <meshBasicMaterial color={0x1a1a1a} />
      </mesh>
      <mesh
        position={[0.22, -0.15, 0.2]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.08, 0.08, 0.06, 12]} />
        <meshBasicMaterial color={0x1a1a1a} />
      </mesh>

      {/* Headlights */}
      <mesh
        ref={headlightRef}
        position={[-0.38, -0.05, -0.12]}
      >
        <circleGeometry args={[0.03, 12]} />
        <meshBasicMaterial
          color={0xffffaa}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh position={[-0.38, -0.05, 0.12]}>
        <circleGeometry args={[0.03, 12]} />
        <meshBasicMaterial
          color={0xffffaa}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Headlight beams (cones) */}
      <mesh
        position={[-0.45, -0.05, -0.12]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshBasicMaterial
          color={0xffffdd}
          transparent
          opacity={0.2}
        />
      </mesh>
      <mesh
        position={[-0.45, -0.05, 0.12]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshBasicMaterial
          color={0xffffdd}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Outline edges for pixel-art clarity */}
      <lineSegments position={[0, 0, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(0.6, 0.25, 0.35)]} />
        <lineBasicMaterial
          color={0x1a1a1a}
          linewidth={2}
        />
      </lineSegments>
      <lineSegments position={[0, 0.15, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(0.35, 0.18, 0.32)]} />
        <lineBasicMaterial
          color={0x1a1a1a}
          linewidth={2}
        />
      </lineSegments>
    </group>
  );
}
