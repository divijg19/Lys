/**
 * @file: src/components/theme/effects/ethereal/Ripples.tsx
 * @description: Manages and renders the on-click ripple effects.
 */

"use client";

import { shaderMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// REFINEMENT: Configuration constants are now clearly defined and easy to tweak.
const RIPPLE_LIFESPAN_SECONDS = 1.5;
const RIPPLE_MAX_RADIUS = 2.0;
const RIPPLE_PLANE_SIZE = 5;
const RIPPLE_INITIAL_OPACITY = 0.5;

// --- SHADER DEFINITION ---
const RippleMaterial = shaderMaterial(
    { uColor: new THREE.Color(0.9, 0.8, 1.0), uRadius: 0.0, uOpacity: 0.0 },
    `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    `uniform vec3 uColor; uniform float uRadius; uniform float uOpacity; varying vec2 vUv;
   void main() {
     vec2 center = vec2(0.5);
     float dist = distance(vUv, center);
     float strength = smoothstep(uRadius - 0.1, uRadius, dist) - smoothstep(uRadius, uRadius + 0.05, dist);
     gl_FragColor = vec4(uColor, strength * uOpacity);
   }`
);

// --- TYPE DEFINITIONS ---
interface IRippleMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uColor: { value: THREE.Color };
        uRadius: { value: number };
        uOpacity: { value: number };
    };
}

type RippleProps = {
    id: number;
    position: THREE.Vector3;
    creationTime: number;
    onComplete: (id: number) => void;
    color: string;
};

export type RippleData = { id: number; position: THREE.Vector3; creationTime: number };

export type RipplesProps = {
    ripples: RippleData[];
    onComplete: (id: number) => void;
    color: string;
};

// --- COMPONENTS ---
const Ripple = ({ id, position, creationTime, onComplete, color }: RippleProps) => {
    const ref = useRef<IRippleMaterial>(null);
    const hasCompleted = useRef(false);

    const material = useMemo(() => {
        const mat = new RippleMaterial();
        mat.uniforms.uColor.value = new THREE.Color(color);
        return mat;
    }, [color]);

    useFrame(({ clock }) => {
        if (!ref.current) return;
        const elapsedTime = clock.getElapsedTime() - creationTime;

        if (elapsedTime > RIPPLE_LIFESPAN_SECONDS) {
            if (!hasCompleted.current) { onComplete(id); hasCompleted.current = true; }
            return;
        }
        const progress = elapsedTime / RIPPLE_LIFESPAN_SECONDS;

        ref.current.uniforms.uRadius.value = progress * RIPPLE_MAX_RADIUS;
        ref.current.uniforms.uOpacity.value = RIPPLE_INITIAL_OPACITY * (1.0 - progress);
    });

    return (
        <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[RIPPLE_PLANE_SIZE, RIPPLE_PLANE_SIZE]} />
            <primitive ref={ref} object={material} attach="material" transparent />
        </mesh>
    );
};

export const Ripples = ({ ripples, onComplete, color }: RipplesProps) => (
    <>
        {ripples.map((ripple) => (
            <Ripple key={ripple.id} {...ripple} onComplete={onComplete} color={color} />
        ))}
    </>
);