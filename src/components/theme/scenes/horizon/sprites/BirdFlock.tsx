"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface BirdFlockProps {
  count?: number;
  color?: number;
  active?: boolean;
}

export function BirdFlock({ count = 8, color = 0x0a0808, active = true }: BirdFlockProps) {
  const groupRef = useRef<THREE.Group>(null);

  const birds = useRef(
    Array.from({ length: count }, () => ({
      id: `bird-${Math.random().toString(16).slice(2)}`,
      offset: new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        Math.random() * 2 + 3,
        -5 - Math.random() * 2
      ),
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.2,
    }))
  ).current;

  useFrame((state) => {
    if (!active || !groupRef.current) return;
    const t = state.clock.elapsedTime;

    groupRef.current.children.forEach((mesh, i) => {
      const bird = birds[i];
      const flap = Math.sin(t * bird.speed * 5 + bird.phase);

      mesh.position.set(
        bird.offset.x + Math.sin(t * bird.speed + bird.phase) * 2,
        bird.offset.y + Math.sin(t * bird.speed * 0.5 + bird.phase) * 0.3,
        bird.offset.z
      );

      // Flap animation - scale Y
      mesh.scale.setY(0.8 + flap * 0.4);
    });
  });

  return (
    <group ref={groupRef}>
      {birds.map((bird) => (
        <mesh key={bird.id}>
          <boxGeometry args={[0.06, 0.02, 0.01]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}
