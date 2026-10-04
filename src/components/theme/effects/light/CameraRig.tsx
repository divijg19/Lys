/**
 * @file: src/components/theme/effects/light/CameraRig.tsx
 * @description: Manages all camera and shuttle logic for the Light theme.
 * This component handles the shuttle's forward motion, the cinematic transitions
 * between first-person and third-person views, and locks the camera for the
 * final "anomaly collapse" view.
 */

"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useThemeTokens } from "@/hooks/useThemeTokens";

// --- Scene constants ---
const TRAVEL_SPEED = 4;
const ANOMALY_TRIGGER_DISTANCE = 5;
const LERP_FACTOR = 0.05;
const CAMERA_OFFSET = new THREE.Vector3(0, 15, 25);
const ANOMALY_POS = new THREE.Vector3(0, 0, 0);
const START_POS = new THREE.Vector3(0, 0, 40);

/** Where the shuttle holds station when travel is suppressed. */
const HOLD_POSITION = new THREE.Vector3(0, 0, 40);
const HOLD_LOOK_AT = new THREE.Vector3(0, 0, 5);

/**
 * Scratch vectors reused every frame. The previous implementation allocated four
 * `THREE.Vector3` instances per frame, which is 240 objects/second of GC churn.
 */
const SCRATCH_MIDPOINT = new THREE.Vector3();
const SCRATCH_TARGET = new THREE.Vector3();
const SCRATCH_FIRST_PERSON_LOOK = new THREE.Vector3();

/**
 * The player travels at 4 units/second, so reporting distance on every change means a
 * ~60fps React re-render for a value the HUD displays to one decimal place. Report on
 * a 0.5-unit quantum instead: still ~8 updates/second, so the readout stays live, but
 * the render cost becomes negligible.
 */
const DISTANCE_REPORT_EPSILON = 0.5;

/** `--foreground` for the Light theme (`220 18% 18%`), used until the token resolves. */
const FOREGROUND_FALLBACK = "#262b36";

// Define the props that this component accepts from the main scene.
interface CameraRigProps {
  isThirdPerson: boolean;
  setDistance: (d: number) => void;
  onReachAnomaly: () => void;
  hasReachedAnomaly: boolean;
  /**
   * False while calm. Suppresses the forward journey *and* the scripted anomaly trigger,
   * so a still frame does not drift or fire a timed cinematic on its own.
   */
  travel?: boolean;
}

export function CameraRig({
  isThirdPerson,
  setDistance,
  onReachAnomaly,
  hasReachedAnomaly,
  travel = true,
}: CameraRigProps) {
  const lookAtTarget = useRef<THREE.Vector3>(new THREE.Vector3());
  const shuttleRef = useRef<THREE.Mesh>(null);
  const playerPosition = useRef<THREE.Vector3>(START_POS.clone());
  const lastReportedDistance = useRef(Number.NaN);
  const { foreground } = useThemeTokens(["foreground"]);

  useFrame((state, delta) => {
    let targetPos: THREE.Vector3;
    let lookAtPoint: THREE.Vector3;

    // --- DEFINITIVE REFINEMENT: Create a clean state machine for camera logic ---
    if (hasReachedAnomaly) {
      // Post-collapse: Lock to a dramatic, fixed observation point to watch the supernova.
      // All player movement and control is disabled.
      targetPos = CAMERA_OFFSET;
      lookAtPoint = ANOMALY_POS;
    } else if (!travel) {
      // Calm: the shuttle holds station and keeps looking down the corridor. Both targets
      // are constants, so the lerp below settles immediately and the frame is static.
      // No scripted anomaly trigger either -- a still frame should not fire a cinematic.
      targetPos = HOLD_POSITION;
      lookAtPoint = HOLD_LOOK_AT;
    } else {
      // Pre-collapse: The shuttle is actively exploring.
      // 1. Update the player's conceptual position.
      playerPosition.current.z -= delta * TRAVEL_SPEED;

      // 2. Check if the critical threshold has been reached.
      if (playerPosition.current.z < ANOMALY_TRIGGER_DISTANCE) {
        onReachAnomaly();
      }

      // 3. Determine camera and look-at positions based on the view mode.
      if (isThirdPerson) {
        // Third-Person: Calculate a true equidistant point and pull back for a cinematic shot.
        // These must stay two distinct vectors. `Vector3.add` mutates and returns its
        // receiver, so sharing one scratch vector would make the camera look at its own
        // position, leaving the shot aimed at nothing.
        SCRATCH_MIDPOINT.lerpVectors(playerPosition.current, ANOMALY_POS, 0.5);
        SCRATCH_TARGET.copy(SCRATCH_MIDPOINT).add(CAMERA_OFFSET);
        targetPos = SCRATCH_TARGET;
        lookAtPoint = SCRATCH_MIDPOINT;
      } else {
        // First-Person: The camera's position IS the player's position.
        targetPos = playerPosition.current;
        SCRATCH_FIRST_PERSON_LOOK.set(
          state.pointer.x * 2,
          -state.pointer.y * 2,
          playerPosition.current.z - 15
        );
        lookAtPoint = SCRATCH_FIRST_PERSON_LOOK;
      }
    }

    // 4. Smoothly interpolate the camera and its focus target for a cinematic feel.
    state.camera.position.lerp(targetPos, LERP_FACTOR);
    lookAtTarget.current.lerp(lookAtPoint, LERP_FACTOR);
    state.camera.lookAt(lookAtTarget.current);

    // 5. Update the visible shuttle mesh's position and orientation.
    const shuttle = shuttleRef.current;
    if (shuttle) {
      // The shuttle is only visible in third-person view, before the collapse.
      shuttle.visible = isThirdPerson && !hasReachedAnomaly;
      shuttle.position.copy(playerPosition.current);
      shuttle.lookAt(lookAtTarget.current);
    }

    // 6. Update the distance readout in the HUD, only when it changes enough to matter.
    const distance = playerPosition.current.length();
    if (
      Number.isNaN(lastReportedDistance.current) ||
      Math.abs(distance - lastReportedDistance.current) >= DISTANCE_REPORT_EPSILON
    ) {
      lastReportedDistance.current = distance;
      setDistance(distance);
    }
  });

  // The shuttle mesh is part of this rig, as its state is entirely dependent on the camera's logic.
  return (
    <mesh ref={shuttleRef}>
      <coneGeometry args={[0.2, 1, 4]} />
      <meshStandardMaterial
        color={foreground || FOREGROUND_FALLBACK}
        metalness={0.8}
        roughness={0.4}
      />
    </mesh>
  );
}
