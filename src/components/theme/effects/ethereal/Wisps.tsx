/**
 * @file: src/components/theme/effects/ethereal/Wisps.tsx
 * @description: Manages and renders the on-demand particle wisps.
 */

"use client";

import { PointMaterial, Points } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// REFINEMENT: Configuration constants are now clearly defined and easy to tweak.
const WISP_LIFESPAN_SECONDS = 3.0;
const PARTICLE_COUNT = 50;
const WISP_MAX_OPACITY = 0.8;
const PARTICLE_BASE_SIZE = 0.1;

// --- TYPE DEFINITIONS ---
type WispProps = {
    id: number;
    position: THREE.Vector3;
    creationTime: number;
    onComplete: (id: number) => void;
    color: string;
};

type Particle = {
    t: number;
    factor: number;
    speed: number;
    xFactor: number;
    yFactor: number;
    zFactor: number;
};

export type WispData = { id: number; position: THREE.Vector3; creationTime: number };

export type WispsProps = {
    wisps: WispData[];
    onComplete: (id: number) => void;
    color: string;
};

// --- COMPONENTS ---
const Wisp = ({ id, position, creationTime, onComplete, color }: WispProps) => {
    const ref = useRef<THREE.Points>(null);
    const hasCompleted = useRef(false);

    const particles = useMemo(() => {
        const temp: Particle[] = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            temp.push({
                t: Math.random() * 100,
                factor: 20 + Math.random() * 100,
                speed: 0.01 + Math.random() / 200,
                xFactor: -50 + Math.random() * 100,
                yFactor: -50 + Math.random() * 100,
                zFactor: -50 + Math.random() * 100,
            });
        }
        return temp;
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(({ clock }) => {
        if (!ref.current || !ref.current.geometry) return;

        const elapsedTime = clock.getElapsedTime() - creationTime;
        const progress = elapsedTime / WISP_LIFESPAN_SECONDS;

        if (progress >= 1) {
            if (!hasCompleted.current) { onComplete(id); hasCompleted.current = true; }
            return;
        }

        if (!ref.current) return;

        particles.forEach((particle, i) => {
            const { t, xFactor, yFactor, zFactor } = particle;
            particle.t += particle.speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.max(1.5, Math.cos(t) * 5);

            dummy.position.set(
                position.x + (xFactor + a * b) * (progress / 10),
                position.y + (yFactor + Math.sin(t * 5.0) * 1.5) * progress,
                position.z + (zFactor + b) * (progress / 10)
            );
            dummy.scale.set(s, s, s);
            dummy.updateMatrix();

            const positions = ref.current?.geometry?.attributes.position as THREE.BufferAttribute;
            if (positions) {
                positions.setXYZ(i, dummy.position.x, dummy.position.y, dummy.position.z);
            }
        });

        if (ref.current?.geometry && ref.current?.material) {
            (ref.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
            (ref.current.material as THREE.PointsMaterial).opacity = (1.0 - progress) * WISP_MAX_OPACITY;
        }
    });

    return (
        <Points ref={ref}>
            <PointMaterial
                transparent
                color={color}
                size={PARTICLE_BASE_SIZE}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
};

export const Wisps = ({ wisps, onComplete, color }: WispsProps) => {
    return (
        <>
            {wisps.map((wisp) => (
                <Wisp key={wisp.id} {...wisp} onComplete={onComplete} color={color} />
            ))}
        </>
    );
};