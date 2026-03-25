/**
 * @file: src/components/theme/effects/light/CameraRig.tsx
 * @description: Manages all camera and shuttle logic for the Light theme.
 * This component handles the shuttle's forward motion, the cinematic transitions
 * between first-person and third-person views, and locks the camera for the
 * final "anomaly collapse" view.
 */

'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

// Define the props that this component accepts from the main scene.
interface CameraRigProps {
    isThirdPerson: boolean;
    setDistance: (d: number) => void;
    onReachAnomaly: () => void;
    hasReachedAnomaly: boolean;
}

export function CameraRig({ isThirdPerson, setDistance, onReachAnomaly, hasReachedAnomaly }: CameraRigProps) {
    const lookAtTarget = useRef<THREE.Vector3>(new THREE.Vector3());
    const shuttleRef = useRef<THREE.Mesh>(null);
    const playerPosition = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 40));

    useFrame((state, delta) => {
        let targetPos: THREE.Vector3;
        let lookAtPoint: THREE.Vector3;
        const anomalyPos = new THREE.Vector3(0, 0, 0);

        // --- DEFINITIVE REFINEMENT: Create a clean state machine for camera logic ---
        if (hasReachedAnomaly) {
            // Post-collapse: Lock to a dramatic, fixed observation point to watch the supernova.
            // All player movement and control is disabled.
            targetPos = new THREE.Vector3(0, 15, 25);
            lookAtPoint = anomalyPos;
        } else {
            // Pre-collapse: The shuttle is actively exploring.
            // 1. Update the player's conceptual position.
            playerPosition.current.z -= delta * 4; // Travel speed

            // 2. Check if the critical threshold has been reached.
            const criticalThreshold = 5;
            if (playerPosition.current.z < criticalThreshold) {
                onReachAnomaly();
            }

            // 3. Determine camera and look-at positions based on the view mode.
            if (isThirdPerson) {
                // Third-Person: Calculate a true equidistant point and pull back for a cinematic shot.
                const midPoint = new THREE.Vector3().lerpVectors(playerPosition.current, anomalyPos, 0.5);
                const offset = new THREE.Vector3(0, 15, 25);
                targetPos = midPoint.add(offset);
                lookAtPoint = midPoint;
            } else {
                // First-Person: The camera's position IS the player's position.
                targetPos = playerPosition.current;
                lookAtPoint = new THREE.Vector3(
                    state.pointer.x * 2,
                    -state.pointer.y * 2,
                    playerPosition.current.z - 15
                );
            }
        }

        // 4. Smoothly interpolate the camera and its focus target for a cinematic feel.
        state.camera.position.lerp(targetPos, 0.05);
        lookAtTarget.current.lerp(lookAtPoint, 0.05);
        state.camera.lookAt(lookAtTarget.current);

        // 5. Update the visible shuttle mesh's position and orientation.
        const shuttle = shuttleRef.current;
        if (shuttle) {
            // The shuttle is only visible in third-person view, before the collapse.
            shuttle.visible = isThirdPerson && !hasReachedAnomaly;
            shuttle.position.copy(playerPosition.current);
            shuttle.lookAt(lookAtTarget.current);
        }

        // 6. Update the distance readout in the HUD.
        setDistance(playerPosition.current.length());
    });

    // The shuttle mesh is part of this rig, as its state is entirely dependent on the camera's logic.
    return (
        <mesh ref={shuttleRef}>
            <coneGeometry args={[0.2, 1, 4]} />
            <meshStandardMaterial
                color="hsl(var(--foreground))"
                metalness={0.8}
                roughness={0.4}
            />
        </mesh>
    );
}