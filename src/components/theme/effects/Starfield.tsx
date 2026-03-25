/**
 * @file: src/components/theme/effects/Starfield.tsx
 * @description: A customizable, procedural, animated 3D starfield effect.
 * This definitive version is built with a focus on absolute stability by replacing
 * the fragile internal position generation logic with a robust, error-free alternative.
 */

"use client";

import { PointMaterial, Points } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ComponentPropsWithoutRef } from "react";
import { useRef, useState } from "react";
import type * as THREE from "three";

/**
 * The props for the Starfield component, allowing full customization.
 */
interface StarfieldProps {
  /** The number of stars to generate.
   * @default 2400
   */
  count?: number;
  /** The radius of the sphere in which stars are generated.
   * @default 1.2
   */
  radius?: number;
  /** The base size of each star particle.
   * @default 0.005
   */
  size?: number;
  /** The color of the stars. Can be any valid CSS color string.
   * @default "#ffffff"
   */
  color?: string;
  /**
   * The opacity of the stars, from 0 (transparent) to 1 (opaque).
   * @default 1
   */
  opacity?: number;
  /** A master multiplier for the overall rotation speed.
   * @default 1
   */
  speed?: number;
  /**
   * The divisor for the rotation speed on the X-axis. A smaller number means faster rotation.
   * @default 40
   */
  rotationXFactor?: number;
  /**
   * The divisor for the rotation speed on the Y-axis. A smaller number means faster rotation.
   * @default 60
   */
  rotationYFactor?: number;
}

/**
 * Renders a customizable, procedural 3D starfield.
 * @param {StarfieldProps & ComponentPropsWithoutRef<typeof Points>} props - Props to configure the starfield's appearance and behavior.
 */
export function Starfield({
  // --- Geometry Props ---
  count = 2400,
  radius = 1.2,
  // --- Material Props ---
  size = 0.005,
  color = "#ffffff",
  opacity = 1,
  // --- Animation Props ---
  speed = 1,
  rotationXFactor = 40,
  rotationYFactor = 60,
  // --- Passthrough Props ---
  ...props
}: StarfieldProps & ComponentPropsWithoutRef<typeof Points>) {
  const ref = useRef<THREE.Points>(null);

  // --- DEFINITIVE FIX: Replace `random.inSphere` with a mathematically stable method. ---
  const [sphere] = useState(() => {
    const points = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // This robust method for generating a point in a sphere CANNOT produce NaN values.
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = radius * Math.cbrt(Math.random());
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      points.set([x, y, z], i * 3);
    }
    return points;
  });

  // Animate the starfield using the configurable speed and rotation factors.
  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= (delta / rotationXFactor) * speed;
      ref.current.rotation.y -= (delta / rotationYFactor) * speed;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={ref}
        positions={sphere}
        stride={3}
        frustumCulled={false}
        {...props}
      >
        <PointMaterial
          transparent
          // --- Use configurable props ---
          color={color}
          size={size}
          opacity={opacity}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}
