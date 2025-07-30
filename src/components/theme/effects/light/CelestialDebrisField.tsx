/**
 * @file: src/components/theme/effects/light/CelestialDebrisField.tsx
 * @description: Renders the interactive, animated field of crystalline shards.
 * This component now supports a "post-collapse" state where all animation
 * and interaction are frozen, creating a static vista.
 */

'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, } from 'react';
import * as THREE from 'three';

// --- 1. A strict TypeScript type for instance data. ---
type InstanceData = {
    id: number;
    position: THREE.Vector3;
    scale: THREE.Vector3;
    rotation: THREE.Euler;
    orbitAxis: THREE.Vector3;
    orbitSpeed: number;
};

// --- 2. Define a clear interface for the component's props. ---
interface CelestialDebrisFieldProps {
    setScanTarget: (id: string | null) => void;
    hasReachedAnomaly: boolean;
}

// --- 3. The Interactive Crystalline Shard Field ---
export function CelestialDebrisField({ setScanTarget, hasReachedAnomaly }: CelestialDebrisFieldProps) {
    const count = 750;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const scannerRef = useRef<THREE.Mesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // `useMemo` generates the stable "birth certificate" for each shard once.
    const instances = useMemo<InstanceData[]>(() => {
        const temp: InstanceData[] = [];
        for (let i = 0; i < count; i++) {
            const axis = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            if (axis.lengthSq() > 0) axis.normalize();

            temp.push({
                id: i,
                position: new THREE.Vector3((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80),
                scale: new THREE.Vector3(0.1 + Math.random() * 0.2, 0.1 + Math.random() * 0.8, 0.1 + Math.random() * 0.2),
                rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
                orbitAxis: axis,
                orbitSpeed: 0.0001 + Math.random() * 0.0005,
            });
        }
        return temp;
    }, []);

    useFrame((state) => {
        // --- DEFINITIVE FIX: The entire animation loop is now disabled post-collapse. ---
        // This freezes the shards in place, creating a static vista.
        if (hasReachedAnomaly) {
            // Hide the scanner post-collapse as well for a clean final scene.
            if (scannerRef.current) scannerRef.current.visible = false;
            return;
        }

        const mesh = meshRef.current;
        const scanner = scannerRef.current;

        if (mesh && scanner) {
            // Raycasting to find the hovered shard
            state.raycaster.setFromCamera(state.pointer, state.camera);
            const intersection = state.raycaster.intersectObject(mesh);
            const newHoveredId = intersection.length > 0 ? (intersection[0].instanceId ?? null) : null;

            setScanTarget(newHoveredId !== null ? `Shard-${newHoveredId}` : null);

            // Position the scanner highlight mesh
            scanner.visible = newHoveredId !== null;
            if (newHoveredId !== null) {
                const data = instances[newHoveredId];
                dummy.position.copy(data.position);
                dummy.rotation.copy(data.rotation);
                dummy.scale.copy(data.scale);
                dummy.updateMatrix();
                scanner.matrix.copy(dummy.matrix);
            }

            // Animate all instances
            instances.forEach((data, i) => {
                dummy.position.copy(data.position);
                dummy.rotation.copy(data.rotation);
                dummy.scale.copy(i === newHoveredId ? new THREE.Vector3(0, 0, 0) : data.scale);
                dummy.position.applyAxisAngle(data.orbitAxis, data.orbitSpeed);
                data.position.copy(dummy.position);
                data.rotation.y += 0.001;
                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
            });

            mesh.instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <group>
            {/* The main field of solid shards */}
            <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                    color="hsl(var(--foreground))"
                    roughness={0.5}
                    metalness={0.2}
                />
            </instancedMesh>

            {/* The single "highlighter" mesh for the scan effect */}
            <mesh ref={scannerRef} visible={false}>
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                    color="#5A4F8B"
                    emissive="#5A4F8B"
                    emissiveIntensity={2}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}