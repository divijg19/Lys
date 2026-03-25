"use client";

import * as THREE from "three";
import { CelestialBody } from "../layers/CelestialBody";
import { HeatShimmer } from "../layers/HeatShimmer";
import { OceanPlane } from "../layers/OceanPlane";
import { SkyGradientPlane, type SkyVariant } from "../layers/SkyGradientPlane";
import { BeachProps } from "../sprites/BeachProps";
import { BirdFlock } from "../sprites/BirdFlock";

interface SunsetSceneProps {
  active?: boolean;
  pixelSize?: number;
}

export function SunsetScene({ active = true, pixelSize = 3.0 }: SunsetSceneProps) {
  const variant: SkyVariant = "sunset";

  return (
    <>
      {/* Sky backdrop */}
      <SkyGradientPlane
        variant={variant}
        pixelSize={pixelSize}
        active={active}
      />

      {/* Low sun with dramatic rays */}
      <CelestialBody
        bodyPosition={new THREE.Vector2(0.15, 0.38)}
        radius={0.15}
        bodyColor={new THREE.Vector3(1.0, 0.45, 0.15)}
        glowColor={new THREE.Vector3(1.0, 0.6, 0.25)}
        rayCount={16}
        pixelSize={pixelSize}
        position={[0, 0, -8]}
        active={active}
      />

      {/* Ocean with warm colors */}
      <OceanPlane
        waterColor={new THREE.Vector3(0.12, 0.08, 0.14)}
        glowColor={new THREE.Vector3(0.95, 0.45, 0.25)}
        waveSpeed={0.25}
        pixelSize={pixelSize}
        position={[0, -2.5, -4]}
        active={active}
      />

      {/* Beach props (umbrellas, chairs, table, drinks) */}
      <BeachProps active={active} />

      {/* Heat shimmer above horizon */}
      <HeatShimmer
        intensity={1.2}
        pixelSize={pixelSize}
        position={[0, 0, -3]}
        active={active}
      />

      {/* Birds silhouettes */}
      <BirdFlock
        count={6}
        color={0x1a0808}
        active={active}
      />
    </>
  );
}
