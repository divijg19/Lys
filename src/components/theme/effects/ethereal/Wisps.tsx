/**
 * @file: src/components/theme/effects/ethereal/Wisps.tsx
 * @description: Manages and renders the on-demand particle wisps.
 * @update: Particle physics have been refined for a more organic, swirling, and buoyant motion.
 */

"use client";

import { PointMaterial, Points } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Configuration constants for the wisp effect.
const WISP_LIFESPAN_SECONDS = 3.5; // Slightly longer lifespan
const PARTICLE_COUNT = 56;
const WISP_MAX_OPACITY = 0.55;
const PARTICLE_BASE_SIZE = 0.07;

// --- TYPE DEFINITIONS ---
type WispProps = {
  id: number;
  position: THREE.Vector3;
  creationTime: number;
  onComplete: (id: number) => void;
  color: string;
};

// Particle data structure now includes velocity and rotation for more complex physics.
type Particle = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  size: number;
};

export type WispData = { id: number; position: THREE.Vector3; creationTime: number };
export type WispsProps = { wisps: WispData[]; onComplete: (id: number) => void; color: string };

// --- COMPONENTS ---
const Wisp = ({ id, position, creationTime, onComplete, color }: WispProps) => {
  const ref = useRef<THREE.Points>(null);
  const hasCompleted = useRef(false);

  // Initialize particles with random positions and velocities around the origin point.
  const particles = useMemo(() => {
    const temp: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.2;
      temp.push({
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          (Math.random() - 0.5) * 0.2
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.004,
          0.0016 + Math.random() * 0.0026, // Gentle upward buoyancy
          (Math.random() - 0.5) * 0.004
        ),
        rotation: new THREE.Euler(0, 0, 0),
        size: PARTICLE_BASE_SIZE * (0.5 + Math.random() * 0.5),
      });
    }
    return temp;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!ref.current?.geometry || !ref.current?.material) return;

    const elapsedTime = clock.getElapsedTime() - creationTime;
    const progress = elapsedTime / WISP_LIFESPAN_SECONDS;

    if (progress >= 1) {
      if (!hasCompleted.current) {
        onComplete(id);
        hasCompleted.current = true;
      }
      return;
    }

    const positions = ref.current.geometry.attributes.position as THREE.BufferAttribute;

    // Animate each particle based on its unique velocity and add a gentle swirl.
    particles.forEach((particle, i) => {
      // Apply a swirling force (curl noise)
      const swirlStrength = 0.0014;
      particle.velocity.x += Math.sin(elapsedTime + i) * swirlStrength;
      particle.velocity.z += Math.cos(elapsedTime + i) * swirlStrength;

      // Update position
      particle.position.add(particle.velocity);

      // Apply drag so they slow down over time
      particle.velocity.multiplyScalar(0.982);

      // Set the final calculated position for this frame
      dummy.position.copy(particle.position);

      // Set position in the buffer attribute
      positions.setXYZ(i, dummy.position.x, dummy.position.y, dummy.position.z);
    });

    positions.needsUpdate = true;
    // Fade out the entire wisp as it reaches the end of its life
    (ref.current.material as THREE.PointsMaterial).opacity =
      (1.0 - progress ** 2) * WISP_MAX_OPACITY;
  });

  // We now render a static Points object whose vertices are moved in the useFrame loop.
  // The initial positions of the points are set from the `particles` array.
  const initialPositions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = particles[i].position.x;
      pos[i * 3 + 1] = particles[i].position.y;
      pos[i * 3 + 2] = particles[i].position.z;
    }
    return pos;
  }, [particles]);

  return (
    // The entire Points cloud is moved to the click position.
    <group position={position}>
      <Points
        ref={ref}
        positions={initialPositions}
      >
        <PointMaterial
          transparent
          color={color}
          size={PARTICLE_BASE_SIZE}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
};

export const Wisps = ({ wisps, onComplete, color }: WispsProps) => {
  return (
    <group>
      {wisps.map((wisp) => (
        <Wisp
          key={wisp.id}
          {...wisp}
          onComplete={onComplete}
          color={color}
        />
      ))}
    </group>
  );
};
