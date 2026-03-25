"use client";

import * as THREE from "three";
import { CelestialBody } from "../layers/CelestialBody";
import { CliffSilhouette } from "../layers/CliffSilhouette";
import { FogLayer } from "../layers/FogLayer";
import { MountainLayer } from "../layers/MountainLayer";
import { SkyGradientPlane, type SkyVariant } from "../layers/SkyGradientPlane";
import { BirdFlock } from "../sprites/BirdFlock";

interface SunriseSceneProps {
  active?: boolean;
  pixelSize?: number;
}

export function SunriseScene({ active = true, pixelSize = 3.0 }: SunriseSceneProps) {
  const variant: SkyVariant = "sunrise";

  return (
    <>
      {/* Sky backdrop */}
      <SkyGradientPlane
        variant={variant}
        pixelSize={pixelSize}
        active={active}
      />

      {/* Sun with rays */}
      <CelestialBody
        bodyPosition={new THREE.Vector2(0.75, 0.35)}
        radius={0.12}
        bodyColor={new THREE.Vector3(1.0, 0.85, 0.6)}
        glowColor={new THREE.Vector3(1.0, 0.75, 0.45)}
        rayCount={12}
        pixelSize={pixelSize}
        position={[0, 0, -8]}
        active={active}
      />

      {/* Far mountains */}
      <MountainLayer
        mountainColor={new THREE.Vector3(0.25, 0.18, 0.22)}
        rimColor={new THREE.Vector3(1.0, 0.7, 0.4)}
        roughness={0.12}
        parallaxFactor={0.1}
        pixelSize={pixelSize}
        position={[0, -0.5, -8]}
        active={active}
      />

      {/* Mid mountains */}
      <MountainLayer
        mountainColor={new THREE.Vector3(0.16, 0.12, 0.15)}
        rimColor={new THREE.Vector3(0.95, 0.65, 0.35)}
        roughness={0.18}
        parallaxFactor={0.25}
        pixelSize={pixelSize}
        position={[0, -1.2, -6]}
        active={active}
      />

      {/* Near mountains */}
      <MountainLayer
        mountainColor={new THREE.Vector3(0.08, 0.06, 0.08)}
        rimColor={new THREE.Vector3(0.9, 0.6, 0.3)}
        roughness={0.25}
        parallaxFactor={0.4}
        pixelSize={pixelSize}
        position={[0, -1.8, -4]}
        active={active}
      />

      {/* Cliff foreground */}
      <CliffSilhouette
        cliffColor={new THREE.Vector3(0.06, 0.05, 0.06)}
        rimColor={new THREE.Vector3(0.95, 0.65, 0.35)}
        pixelSize={pixelSize}
        position={[0, -1, -2]}
        active={active}
      />

      {/* Valley mist */}
      <FogLayer
        fogColor={new THREE.Vector3(0.92, 0.82, 0.7)}
        density={0.45}
        driftSpeed={0.015}
        pixelSize={pixelSize}
        position={[0, -1, -3]}
        active={active}
      />

      {/* Birds */}
      <BirdFlock
        count={8}
        color={0x0a0808}
        active={active}
      />
    </>
  );
}
