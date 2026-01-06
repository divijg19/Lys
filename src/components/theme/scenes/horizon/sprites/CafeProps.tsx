"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface CafePropsProps {
  active?: boolean;
}

export function CafeProps({ active = true }: CafePropsProps) {
  const steamRef = useRef<THREE.Group>(null);
  const steamPuffs = useRef(
    Array.from({ length: 5 }, () => ({
      id: `steam-${Math.random().toString(16).slice(2)}`,
    }))
  ).current;

  useFrame((state) => {
    if (!active || !steamRef.current) return;
    const t = state.clock.elapsedTime;

    // Animate steam particles rising
    steamRef.current.children.forEach((child, i) => {
      const offset = (t * 0.3 + i * 0.5) % 2.0;
      child.position.y = -0.5 + offset * 0.5;
      child.scale.setScalar(Math.max(0.01, 0.2 - offset * 0.1));
      if ((child as THREE.Mesh).material) {
        ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = Math.max(
          0,
          0.6 - offset * 0.3
        );
      }
    });
  });

  return (
    <group position={[0, -1, -1]}>
      {/* Cafe table surface */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.05, 0.8]} />
        <meshBasicMaterial color={0x8b4513} />
      </mesh>

      {/* Table outline for pixel-art clarity */}
      <lineSegments position={[0, 0, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(1.2, 0.05, 0.8)]} />
        <lineBasicMaterial
          color={0x1a1a1a}
          linewidth={2}
        />
      </lineSegments>

      {/* Coffee cup */}
      <group position={[-0.15, 0.1, 0.1]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.09, 0.12, 12]} />
          <meshBasicMaterial color={0xffffff} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.1, 0.01, 6, 12, Math.PI]} />
          <meshBasicMaterial color={0xffffff} />
        </mesh>
        {/* Coffee inside */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.02, 12]} />
          <meshBasicMaterial color={0x3e2723} />
        </mesh>
      </group>

      {/* Saucer */}
      <mesh position={[-0.15, 0.025, 0.1]}>
        <cylinderGeometry args={[0.12, 0.12, 0.01, 16]} />
        <meshBasicMaterial color={0xf5f5f5} />
      </mesh>

      {/* Notebook / book */}
      <mesh
        position={[0.35, 0.03, -0.05]}
        rotation={[0, 0.3, 0]}
      >
        <boxGeometry args={[0.25, 0.01, 0.35]} />
        <meshBasicMaterial color={0x4a90e2} />
      </mesh>

      {/* Pen */}
      <mesh
        position={[0.45, 0.04, 0.15]}
        rotation={[0, 0, 0.8]}
      >
        <cylinderGeometry args={[0.008, 0.008, 0.15, 8]} />
        <meshBasicMaterial color={0x2c3e50} />
      </mesh>

      {/* Steam particles */}
      <group
        ref={steamRef}
        position={[-0.15, 0.15, 0.1]}
      >
        {steamPuffs.map((puff) => (
          <mesh key={puff.id}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial
              color={0xffffff}
              transparent
              opacity={0.5}
            />
          </mesh>
        ))}
      </group>

      {/* Window frame edge (partial) */}
      <group position={[-1.5, 1.5, -0.5]}>
        <mesh>
          <boxGeometry args={[0.08, 2.5, 0.05]} />
          <meshBasicMaterial color={0x5d4e37} />
        </mesh>
        <mesh position={[0.7, 0, 0]}>
          <boxGeometry args={[0.08, 2.5, 0.05]} />
          <meshBasicMaterial color={0x5d4e37} />
        </mesh>
        <mesh position={[0.35, 1.2, 0]}>
          <boxGeometry args={[0.8, 0.08, 0.05]} />
          <meshBasicMaterial color={0x5d4e37} />
        </mesh>
      </group>

      {/* Table legs (perspective) */}
      <mesh position={[-0.5, -0.3, -0.3]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
        <meshBasicMaterial color={0x5d4e37} />
      </mesh>
      <mesh position={[0.5, -0.3, -0.3]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
        <meshBasicMaterial color={0x5d4e37} />
      </mesh>
    </group>
  );
}
