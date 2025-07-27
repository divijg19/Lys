/**
 * @file: src/components/theme/effects/Starfield.tsx
 * @description: A procedural, animated 3D starfield effect for "The Abyss" theme.
 * This component uses react-three-fiber and drei to render thousands of points in a
 * rotating sphere, creating an immersive deep space environment without static assets.
 */

"use client";

import { PointMaterial, Points } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as random from "maath/random/dist/maath-random.esm";
import type { ComponentPropsWithoutRef } from "react";
import { useRef, useState } from "react";
import type * as THREE from "three";

// Type definition for the component's props, extending the base props for the 'Points' component.
type StarfieldProps = ComponentPropsWithoutRef<typeof Points>;

export function Starfield(props: StarfieldProps) {
  // A ref to hold the THREE.Points instance. We type it explicitly for type safety.
  const ref = useRef<THREE.Points>(null);

  // Initialize the star positions once. `useState` with a function ensures this runs only on mount.
  // The points are generated in a sphere with a radius of 1.2.
  const [sphere] = useState(() => random.inSphere(new Float32Array(2400), { radius: 1.2 }));

  // The useFrame hook runs on every rendered frame, making it ideal for animations.
  useFrame((_state, delta) => {
    // A null check for robustness, ensuring the ref is available before we manipulate it.
    if (ref.current) {
      // Rotate the starfield slowly to create a sense of vast, drifting movement through space.
      ref.current.rotation.x -= delta / 40;
      ref.current.rotation.y -= delta / 60;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.005} // Defines the size of individual stars.
          sizeAttenuation={true} // Makes stars appear smaller the further they are.
          depthWrite={false} // Fixes potential transparency issues by not writing stars to the depth buffer.
        />
      </Points>
    </group>
  );
}
