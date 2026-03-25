"use client";

import * as THREE from "three";
import { CelestialBody } from "../layers/CelestialBody";
import { CitySilhouette } from "../layers/CitySilhouette";
import { Moonbeam } from "../layers/Moonbeam";
import { OceanPlane } from "../layers/OceanPlane";
import { SkyGradientPlane, type SkyVariant } from "../layers/SkyGradientPlane";
import { Guardrail } from "../sprites/Guardrail";
import { MiniCooperSprite } from "../sprites/MiniCooperSprite";
import { StarField } from "../sprites/StarField";

interface NightCitySceneProps {
  active?: boolean;
  pixelSize?: number;
}

export function NightCityScene({ active = true, pixelSize = 3.0 }: NightCitySceneProps) {
  const variant: SkyVariant = "night-city";
  const moonPos = new THREE.Vector2(0.25, 0.78);

  return (
    <>
      {/* Sky backdrop */}
      <SkyGradientPlane
        variant={variant}
        pixelSize={pixelSize}
        active={active}
      />

      {/* Stars */}
      <StarField
        count={200}
        active={active}
      />

      {/* Moon */}
      <CelestialBody
        bodyPosition={moonPos}
        radius={0.1}
        bodyColor={new THREE.Vector3(0.95, 0.93, 0.88)}
        glowColor={new THREE.Vector3(0.7, 0.75, 0.85)}
        isMoon
        rayCount={0}
        pixelSize={pixelSize}
        position={[0, 0, -9]}
        active={active}
      />

      {/* Volumetric moonbeam */}
      <Moonbeam
        moonPosition={moonPos}
        beamColor={new THREE.Vector3(0.55, 0.65, 0.85)}
        pixelSize={pixelSize}
        position={[0, 0, -8]}
        active={active}
      />

      {/* Distant city skyline with glowing windows */}
      <CitySilhouette
        buildingColor={new THREE.Vector3(0.06, 0.05, 0.08)}
        windowColor={new THREE.Vector3(0.95, 0.85, 0.4)}
        glowColor={new THREE.Vector3(0.25, 0.45, 0.75)}
        density={1.0}
        pixelSize={pixelSize}
        position={[0, 0, -7]}
        active={active}
      />

      {/* Dark ocean with moonlight reflection */}
      <OceanPlane
        waterColor={new THREE.Vector3(0.03, 0.04, 0.08)}
        glowColor={new THREE.Vector3(0.5, 0.6, 0.8)}
        waveSpeed={0.15}
        pixelSize={pixelSize}
        position={[0, -3, -5]}
        active={active}
      />

      {/* Cliff edge guardrail */}
      <Guardrail active={active} />

      {/* Parked red Mini Cooper with headlights */}
      <MiniCooperSprite active={active} />
    </>
  );
}
