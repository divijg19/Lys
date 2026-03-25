"use client";

import * as THREE from "three";
import { FogLayer } from "../layers/FogLayer";
import { SkyGradientPlane, type SkyVariant } from "../layers/SkyGradientPlane";
import { BokehParticles } from "../sprites/BokehParticles";
import { CafeProps } from "../sprites/CafeProps";

interface DaySceneProps {
  active?: boolean;
  pixelSize?: number;
}

export function DayScene({ active = true, pixelSize = 3.0 }: DaySceneProps) {
  const variant: SkyVariant = "day";

  return (
    <>
      {/* Sky backdrop */}
      <SkyGradientPlane
        variant={variant}
        pixelSize={pixelSize}
        active={active}
      />

      {/* Soft atmospheric haze */}
      <FogLayer
        fogColor={new THREE.Vector3(0.88, 0.7, 0.55)}
        density={0.25}
        driftSpeed={0.01}
        pixelSize={pixelSize}
        position={[0, 0, -2]}
        active={active}
      />

      {/* Dreamy bokeh particles (cafe ambiance) */}
      <BokehParticles
        count={80}
        active={active}
      />

      {/* Cafe scene (table, coffee cup, steam, window frame) */}
      <CafeProps active={active} />
    </>
  );
}
