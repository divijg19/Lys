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
    uPrimary: new THREE.Color(0.8, 0.7, 0.9),
    uSecondary: new THREE.Color(0.7, 0.85, 0.9),
    uAccent: new THREE.Color(0.95, 0.75, 0.9),
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
      float baseNoise = snoise(vec2(pos.x, pos.y) * 0.08 + uTime * 0.02) * 0.22;
      float detailNoise = snoise(vec2(pos.x, pos.y) * 0.22 + uTime * 0.06) * 0.08;
      float totalNoise = baseNoise + detailNoise;
      float dist = distance(pos.xy, uClickPosition.xy);
      float ripple = sin(dist * 2.2 - uTime * 2.2) * uClickStrength;
      ripple *= (1.0 - smoothstep(0.0, 2.2, dist));
      pos.z += totalNoise + ripple * 0.35;
      vDisplacement = pos.z;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }`,
  `
    uniform float uTime;
    uniform vec3 uPrimary;
    uniform vec3 uSecondary;
    uniform vec3 uAccent;
    varying float vDisplacement;
    varying vec2 vUv;
    void main() {
      float distToCenter = distance(vUv, vec2(0.5));
      float centerFade = smoothstep(0.85, 0.15, distToCenter);
      float edgeFade = smoothstep(0.0, 0.18, vUv.x) * (1.0 - smoothstep(0.82, 1.0, vUv.x)) *
                       smoothstep(0.0, 0.18, vUv.y) * (1.0 - smoothstep(0.82, 1.0, vUv.y));

      float flow = 0.5 + 0.5 * sin(uTime * 0.08 + vUv.x * 1.8 - vUv.y * 1.2 + vDisplacement * 5.0);
      vec3 base = mix(uPrimary, uSecondary, flow);
      float glow = smoothstep(-0.22, 0.28, vDisplacement) * 0.55 + 0.45;
      float glint = smoothstep(0.8, 1.0, flow) * 0.18;

      vec3 finalColor = base * glow + uAccent * glint;
      float alpha = (0.12 + 0.22 * centerFade) * edgeFade;
      gl_FragColor = vec4(finalColor, alpha);
    }`
);

interface IFlowingPlaneMaterial extends THREE.ShaderMaterial {
  uniforms: {
    uTime: { value: number };
    uPrimary: { value: THREE.Color };
    uSecondary: { value: THREE.Color };
    uAccent: { value: THREE.Color };
    uClickPosition: { value: THREE.Vector3 };
    uClickStrength: { value: number };
  };
}

type FlowingPlaneProps = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  latestClickPosition: THREE.Vector3 | null;
};

export const FlowingPlane = ({
  primaryColor,
  secondaryColor,
  accentColor,
  latestClickPosition,
}: FlowingPlaneProps) => {
  const ref = useRef<IFlowingPlaneMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const clickStrengthRef = useRef(0.0);

  const material = useMemo(() => {
    const mat = new FlowingPlaneMaterial();
    mat.uniforms.uPrimary.value = new THREE.Color(primaryColor);
    mat.uniforms.uSecondary.value = new THREE.Color(secondaryColor);
    mat.uniforms.uAccent.value = new THREE.Color(accentColor);
    return mat;
  }, [primaryColor, secondaryColor, accentColor]);

  useEffect(() => {
    if (latestClickPosition && ref.current && meshRef.current) {
      const local = latestClickPosition.clone();
      meshRef.current.worldToLocal(local);
      ref.current.uniforms.uClickPosition.value.copy(local);
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
      ref={meshRef}
      rotation={[-Math.PI / 2.1, 0, 0]}
      position={[0, -3, 0]}
    >
      <planeGeometry args={[40, 40, 96, 96]} />
      <primitive
        ref={ref}
        object={material}
        attach="material"
        transparent
      />
    </mesh>
  );
};
