/**
 * @file: src/components/theme/scenes/LightScene.tsx
 * @description: Renders the "White Void" experience for the Light theme.
 * This component acts as the main orchestrator for the entire scene, managing state
 * and assembling all the modular effects and interactive elements.
 */

"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { CameraRig } from "@/components/theme/effects/light/CameraRig";
import { CelestialDebrisField } from "@/components/theme/effects/light/CelestialDebrisField";
import { HUD } from "@/components/theme/effects/light/HUD";
import { TheAnomaly } from "@/components/theme/effects/light/TheAnomaly";
// --- Import all the modularized, stable components ---
import { Starfield } from "@/components/theme/effects/Starfield";

// --- The Main Scene Component ---
const LightScene = () => {
  // All state is now managed cleanly in this top-level component.
  const [isThirdPerson, setIsThirdPerson] = useState(false);
  const [distance, setDistance] = useState<number>(0);
  const [scanTarget, setScanTarget] = useState<string | null>(null);
  const [hasReachedAnomaly, setHasReachedAnomaly] = useState(false);

  // This callback is passed down to the CameraRig to trigger the scene's climax.
  const handleReachAnomaly = () => {
    if (!hasReachedAnomaly) {
      setHasReachedAnomaly(true);
      setIsThirdPerson(true); // Force cinematic third-person view for the event
    }
  };

  return (
    <>
      {/* The entire UI is a single, self-contained component. */}
      <HUD
        isThirdPerson={isThirdPerson}
        setIsThirdPerson={setIsThirdPerson}
        hasReachedAnomaly={hasReachedAnomaly}
        distance={distance}
        scanTarget={scanTarget}
      />

      {/* The main 3D canvas where the scene is rendered. */}
      <Canvas camera={{ fov: 75, position: [0, 0, 40], near: 0.1, far: 80 }}>
        <color
          attach="background"
          args={["#ffffff"]}
        />
        <fog
          attach="fog"
          args={["#ffffff", 40, 70]}
        />
        <ambientLight intensity={3.0} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.0}
        />

        {/* Suspense is a React feature that allows us to show a fallback while components are loading. */}
        <Suspense fallback={null}>
          <TheAnomaly hasReachedAnomaly={hasReachedAnomaly} />
          <CelestialDebrisField
            setScanTarget={setScanTarget}
            hasReachedAnomaly={hasReachedAnomaly}
          />
          <Starfield
            count={500}
            speed={-0.03}
            color="hsl(var(--foreground))"
            size={0.002}
            radius={200}
            opacity={0.15}
          />
          <CameraRig
            isThirdPerson={isThirdPerson}
            setDistance={setDistance}
            onReachAnomaly={handleReachAnomaly}
            hasReachedAnomaly={hasReachedAnomaly}
          />
        </Suspense>
      </Canvas>
    </>
  );
};

export default LightScene;
