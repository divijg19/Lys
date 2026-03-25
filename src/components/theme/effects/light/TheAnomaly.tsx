/**
 * @file: src/components/theme/effects/light/TheAnomaly.tsx
 * @description: Renders the central anomaly for the Light theme.
 * This component manages two states: the solid, pre-collapse dodecahedron,
 * and the spectacular, post-collapse supernova nebula effect.
 */

"use client";

import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

// --- 1. The Supernova Material (Shader) ---
// This shader creates the beautiful, reverse-colored nebula explosion.
const SupernovaMaterial = shaderMaterial(
  { uTime: 0, uColor1: new THREE.Color("#6a82fb"), uColor2: new THREE.Color("#fc5c7d") },
  // Vertex Shader
  `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying vec2 vUv;
    
    // --- DEFINITIVE FIX: The complete, correct, and robust Simplex Noise function ---
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) ); vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g; vec3 i1 = min( g.xyz, l.zxy ); vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857; vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy; vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y); vec4 b0 = vec4( x.xy, y.xy ); vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    float fbm(vec3 p) {
      float f = 0.0;
      f += 0.5000 * snoise(p); p = p * 2.02;
      f += 0.2500 * snoise(p); p = p * 2.03;
      f += 0.1250 * snoise(p);
      return f;
    }

    void main() {
      float t = uTime * 0.3;
      
      // Create the beautiful, complex nebula cloud texture using FBM
      float noise = fbm(vec3(vUv * 3.0, t));
      vec3 nebulaColor = mix(uColor1, uColor2, smoothstep(0.1, 0.7, noise));
      
      // Create the white-hot core of the explosion
      float d = length(vUv - vec2(0.5));
      vec3 coreColor = vec3(1.0) * smoothstep(0.1, 0.0, d);
      
      // Combine the core and the nebula
      vec3 finalColor = nebulaColor + coreColor;
      
      // Animate the lifecycle: expand, hold, then fade out gracefully
      float alpha = smoothstep(0.5, 0.0, d) * smoothstep(0.0, 0.5, uTime) * (1.0 - smoothstep(3.5, 5.0, uTime));
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);
extend({ SupernovaMaterial });

// --- 2. The Anomaly Component ---
export function TheAnomaly({ hasReachedAnomaly }: { hasReachedAnomaly: boolean }) {
  const solidRef = useRef<THREE.Mesh>(null);
  const explosionRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((_, delta) => {
    // Animate the solid dodecahedron before the collapse
    const solidMesh = solidRef.current;
    if (solidMesh) {
      solidMesh.rotation.y += 0.0005;
      solidMesh.rotation.x += 0.0002;
    }
    // Animate the supernova shader after the collapse
    const material = materialRef.current;
    if (hasReachedAnomaly && material) {
      material.uniforms.uTime.value += delta;
    }
  });

  return (
    <>
      {/* The solid, pre-collapse object */}
      <mesh
        ref={solidRef}
        scale={5}
        visible={!hasReachedAnomaly}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="hsl(var(--foreground))"
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* The supernova effect, rendered inside a sphere for an immersive feel */}
      <mesh
        ref={explosionRef}
        scale={30}
        visible={hasReachedAnomaly}
      >
        <sphereGeometry args={[1, 64, 64]} />
        {/* @ts-ignore */}
        <supernovaMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  );
}
