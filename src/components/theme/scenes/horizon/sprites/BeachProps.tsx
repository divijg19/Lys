"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";

interface BeachPropsProps {
  active?: boolean;
}

export function BeachProps({ active = true }: BeachPropsProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!active || !groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Sway umbrellas subtly
    groupRef.current.children.forEach((child, i) => {
      if (child.userData.type === "umbrella") {
        child.rotation.z = Math.sin(t * 0.5 + i) * 0.02;
      }
    });
  });

  // Umbrella positions (pixel-perfect placement)
  const umbrellas = [
    { x: -2.5, y: -2.3, z: -2, color: 0xe84c3d, scale: 0.8 },
    { x: 0.5, y: -2.4, z: -2.5, color: 0x3498db, scale: 0.9 },
    { x: 3.2, y: -2.2, z: -2.2, color: 0xf39c12, scale: 0.85 },
  ];

  return (
    <group ref={groupRef}>
      {/* Beach umbrellas */}
      {umbrellas.map((u, _i) => (
        <group
          key={`umbrella-${u.x}-${u.y}-${u.color}`}
          position={[u.x, u.y, u.z]}
          userData={{ type: "umbrella" }}
        >
          {/* Pole */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
            <meshBasicMaterial color={0x5d4e37} />
          </mesh>
          {/* Canopy */}
          <mesh
            position={[0, 0.4, 0]}
            scale={u.scale}
          >
            <coneGeometry args={[0.35, 0.25, 8]} />
            <meshBasicMaterial color={u.color} />
          </mesh>
          {/* Outline rings for pixel-art feel */}
          <mesh
            position={[0, 0.4, 0]}
            scale={u.scale}
          >
            <torusGeometry args={[0.35, 0.01, 4, 8]} />
            <meshBasicMaterial color={0x1a1a1a} />
          </mesh>
        </group>
      ))}

      {/* Beach chairs */}
      <group position={[-2.2, -2.6, -1.8]}>
        <mesh>
          <boxGeometry args={[0.35, 0.08, 0.4]} />
          <meshBasicMaterial color={0xffffff} />
        </mesh>
        <mesh position={[0, 0.18, -0.12]}>
          <boxGeometry args={[0.35, 0.32, 0.08]} />
          <meshBasicMaterial color={0xffffff} />
        </mesh>
      </group>

      {/* Small table */}
      <group position={[0.8, -2.5, -2.2]}>
        <mesh>
          <cylinderGeometry args={[0.25, 0.25, 0.05, 12]} />
          <meshBasicMaterial color={0xffffff} />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 6]} />
          <meshBasicMaterial color={0xcccccc} />
        </mesh>
      </group>

      {/* Drinks on table */}
      <group position={[0.65, -2.27, -2.2]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.05, 0.12, 8]} />
          <meshBasicMaterial color={0xffaa00} />
        </mesh>
      </group>
      <group position={[0.95, -2.27, -2.2]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.05, 0.12, 8]} />
          <meshBasicMaterial color={0xff4455} />
        </mesh>
      </group>
    </group>
  );
}
