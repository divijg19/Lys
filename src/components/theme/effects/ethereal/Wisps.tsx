/**
 * @file: src/components/theme/effects/ethereal/Wisps.tsx
 * @description: Manages and renders the on-demand particle wisps.
 * @update: Particle physics have been refined for a more organic, swirling, and buoyant motion.
 */

"use client";

import { PointMaterial, Points } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  type BufferAttribute,
  type Color,
  Euler,
  Object3D,
  type PointsMaterial,
  type Points as ThreePoints,
  Vector3,
} from "three";

import { effectProgress } from "@/lib/effectsLifetime";

// Configuration constants for the wisp effect.
const WISP_LIFESPAN_SECONDS = 3.5; // Slightly longer lifespan
const PARTICLE_COUNT = 56;
const WISP_MAX_OPACITY = 0.55;

/*
 * The size of a wisp, in world units.
 *
 * The wisps live on the interaction surface, eight units from the camera, where the view is
 * about 12.3 units tall. At this size a wisp is a couple of per cent of the screen -- a soft
 * mote you can actually see. The size used to be 0.07 units, on a point that sat tens of units
 * away at a grazing angle: the particles came out about a pixel across.
 */
const PARTICLE_BASE_SIZE = 0.35;

/**
 * The opacity a wisp is drawn with, from its progress through its life.
 *
 * The fade used to be computed from an age that could be negative -- which made the particles
 * invisible -- so the arithmetic lives in a function that can be tested on its own.
 */
export const wispOpacity = (progress: number) => (1 - progress ** 2) * WISP_MAX_OPACITY;

// --- TYPE DEFINITIONS ---
type WispProps = {
  id: number;
  position: Vector3;
  creationTime: number;
  onComplete: (id: number) => void;
  color: Color;
};

// Particle data structure now includes velocity and rotation for more complex physics.
type Particle = {
  position: Vector3;
  velocity: Vector3;
  rotation: Euler;
  size: number;
};

export type WispData = { id: number; position: Vector3; creationTime: number };
export type WispsProps = { wisps: WispData[]; onComplete: (id: number) => void; color: Color };

// --- COMPONENTS ---
const Wisp = ({ id, position, creationTime, onComplete, color }: WispProps) => {
  const ref = useRef<ThreePoints>(null);
  const hasCompleted = useRef(false);

  // Initialize particles with random positions and velocities around the origin point.
  const particles = useMemo(() => {
    const temp: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.2;
      temp.push({
        position: new Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          (Math.random() - 0.5) * 0.2
        ),
        velocity: new Vector3(
          (Math.random() - 0.5) * 0.004,
          0.0016 + Math.random() * 0.0026, // Gentle upward buoyancy
          (Math.random() - 0.5) * 0.004
        ),
        rotation: new Euler(0, 0, 0),
        size: PARTICLE_BASE_SIZE * (0.5 + Math.random() * 0.5),
      });
    }
    return temp;
  }, []);

  const dummy = useMemo(() => new Object3D(), []);

  useFrame(({ clock }) => {
    if (!ref.current?.geometry || !ref.current?.material) return;

    /*
     * `clock.elapsedTime` rather than `clock.getElapsedTime()`: the latter advances the clock as
     * a side effect of reading it, and the creation time recorded by the scene is read from the
     * same accumulator. Reading the property keeps both ends of the comparison on one clock.
     */
    const age = clock.elapsedTime - creationTime;
    const { complete, progress } = effectProgress(
      clock.elapsedTime,
      creationTime,
      WISP_LIFESPAN_SECONDS
    );

    if (complete) {
      if (!hasCompleted.current) {
        onComplete(id);
        hasCompleted.current = true;
      }
      return;
    }

    const positions = ref.current.geometry.attributes.position as BufferAttribute;

    // Animate each particle based on its unique velocity and add a gentle swirl.
    particles.forEach((particle, i) => {
      // Apply a swirling force (curl noise)
      const swirlStrength = 0.0014;
      particle.velocity.x += Math.sin(age + i) * swirlStrength;
      particle.velocity.z += Math.cos(age + i) * swirlStrength;

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
    (ref.current.material as PointsMaterial).opacity = wispOpacity(progress);
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
          blending={AdditiveBlending}
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
