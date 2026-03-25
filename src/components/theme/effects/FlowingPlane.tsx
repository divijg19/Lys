/**
 * @file: src/components/theme/effects/ethereal/FlowingPlane.tsx
 * @description: Renders the primary flowing wireframe background mesh.
 */

"use client";

import { shaderMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// --- SHADER DEFINITION ---
const FlowingPlaneMaterial = shaderMaterial(
    { uTime: 0, uColor: new THREE.Color(0.8, 0.7, 0.9) }, // Default color
    // Vertex Shader
    ` uniform float uTime;
    varying vec2 vUv;
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5); vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g; g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }
    void main() {
      vUv = uv;
      vec3 pos = position;
      float noise = snoise(vec2(pos.x * 0.1 + uTime * 0.05, pos.y * 0.1 + uTime * 0.05));
      pos.z += noise * 0.2;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }`,
    // Fragment Shader
    ` uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      float sine = sin(vUv.y * 10.0 + uTime * 0.5) * 0.1 + 0.9;
      gl_FragColor = vec4(uColor * sine, 0.3);
    }`
);

// TYPE-SAFE FIX: Create an interface describing our specific ShaderMaterial instance.
interface IFlowingPlaneMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uTime: { value: number };
        uColor: { value: THREE.Color };
    };
}

// --- TYPE DEFINITION FOR PROPS ---
type FlowingPlaneProps = {
    color: string; // Add color prop
};

// --- COMPONENT ---
// UPDATE: Accept 'color' prop
export const FlowingPlane = ({ color }: FlowingPlaneProps) => {
    const ref = useRef<IFlowingPlaneMaterial>(null);

    // UPDATE: Material is now dependent on the 'color' prop
    const material = useMemo(() => {
        const mat = new FlowingPlaneMaterial();
        mat.uniforms.uColor.value = new THREE.Color(color);
        return mat;
    }, [color]); // Dependency array ensures material updates if color changes

    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <mesh rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -2, 0]}>
            <planeGeometry args={[25, 25, 128, 128]} />
            <primitive
                ref={ref}
                object={material}
                attach="material"
                wireframe
                transparent
            />
        </mesh>
    );
};