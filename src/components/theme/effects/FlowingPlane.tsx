/**
 * @file: src/components/theme/effects/FlowingPlane.tsx
 * @description: Renders the primary, non-interactive "Dream-Fabric" visual.
 * @update: This component is now purely visual. All interaction logic has been removed.
 */

"use client";

import { shaderMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const FlowingPlaneMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(0.8, 0.7, 0.9),
    uClickPosition: new THREE.Vector3(0, 0, 0),
    uClickStrength: 0.0,
  },
  `
    uniform float uTime;
    uniform vec3 uClickPosition;
    uniform float uClickStrength;
    varying float vDisplacement;
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
      float baseNoise = snoise(vec2(pos.x * 0.1, pos.y * 0.1) + uTime * 0.03) * 0.1;
      float detailNoise = snoise(vec2(pos.x * 0.5, pos.y * 0.5) + uTime * 0.1) * 0.05;
      float totalNoise = baseNoise + detailNoise;
      float dist = distance(pos.xz, uClickPosition.xz);
      float ripple = sin(dist * 2.0 - uTime * 2.0) * uClickStrength;
      ripple *= (1.0 - smoothstep(0.0, 2.0, dist));
      pos.z += totalNoise + ripple;
      vDisplacement = pos.z;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }`,
  `
    uniform float uTime;
    uniform vec3 uColor;
    varying float vDisplacement;
    varying vec2 vUv;
    void main() {
      float glow = smoothstep(-0.2, 0.5, vDisplacement) * 0.5 + 0.5;
      vec2 grid = abs(fract(vUv * 15.0 - 0.5));
      float line = 1.0 - smoothstep(0.01, 0.05, min(grid.x, grid.y));
      float edgeFade = smoothstep(0.0, 0.2, vUv.x) * (1.0 - smoothstep(0.8, 1.0, vUv.x)) *
                       smoothstep(0.0, 0.2, vUv.y) * (1.0 - smoothstep(0.8, 1.0, vUv.y));
      vec3 finalColor = uColor * glow;
      gl_FragColor = vec4(finalColor, line * 0.2 * edgeFade);
    }`
);

interface IFlowingPlaneMaterial extends THREE.ShaderMaterial {
  uniforms: {
    uTime: { value: number };
    uColor: { value: THREE.Color };
    uClickPosition: { value: THREE.Vector3 };
    uClickStrength: { value: number };
  };
}

type FlowingPlaneProps = {
  color: string;
  latestClickPosition: THREE.Vector3 | null;
};

export const FlowingPlane = ({ color, latestClickPosition }: FlowingPlaneProps) => {
  const ref = useRef<IFlowingPlaneMaterial>(null);
  const clickStrengthRef = useRef(0.0);

  const material = useMemo(() => {
    const mat = new FlowingPlaneMaterial();
    mat.uniforms.uColor.value = new THREE.Color(color);
    return mat;
  }, [color]);

  useEffect(() => {
    if (latestClickPosition && ref.current) {
      ref.current.uniforms.uClickPosition.value.copy(latestClickPosition);
      clickStrengthRef.current = 1.0;
      ref.current.uniforms.uClickStrength.value = 1.0;
    }
  }, [latestClickPosition]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.uniforms.uTime.value = clock.getElapsedTime();
    const cs = clickStrengthRef.current;
    if (cs > 0.0005) {
      const newStrength = cs * 0.95;
      clickStrengthRef.current = newStrength;
      ref.current.uniforms.uClickStrength.value = newStrength;
    } else if (cs !== 0) {
      clickStrengthRef.current = 0;
      ref.current.uniforms.uClickStrength.value = 0;
    }
  });

  return (
    <mesh
      rotation={[-Math.PI / 2.1, 0, 0]}
      position={[0, -3, 0]}
    >
      <planeGeometry args={[40, 40, 128, 128]} />
      <primitive
        ref={ref}
        object={material}
        attach="material"
        transparent
      />
    </mesh>
  );
};
