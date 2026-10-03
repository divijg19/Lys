/**
 * @file: src/components/theme/effects/FlowingPlane.tsx
 * @description: The liquid surface at the centre of the Ethereal theme.
 *
 * Displacement is driven by an array of ripple *sources* rather than a single click
 * position. The previous version tracked only `latestClickPosition`, so a second
 * interaction overwrote the first and there was no interference between waves at all.
 * Summing every live source produces genuine superposition, which is what makes
 * multi-touch feel physical rather than like several independent animations.
 */

"use client";

import { shaderMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { type RippleSource, MAX_RIPPLE_SOURCES } from "@/hooks/useRippleField";

/** Maximum number of sources the shader can sum. Must match MAX_RIPPLE_SOURCES. */
const MAX_SOURCES = MAX_RIPPLE_SOURCES;

/** Seconds a source keeps displacing the surface after it is released. */
const SOURCE_FADE_SECONDS = 0.45;

const FlowingPlaneMaterial = shaderMaterial(
  {
    uTime: 0,
    uPrimary: new THREE.Color(0.8, 0.7, 0.9),
    uSecondary: new THREE.Color(0.7, 0.85, 0.9),
    uAccent: new THREE.Color(0.95, 0.75, 0.9),
    // Fixed-size arrays so the uniform block layout is stable for the whole session.
    uSources: Array.from({ length: MAX_SOURCES }, () => new THREE.Vector2()),
    uStrengths: new Array<number>(MAX_SOURCES).fill(0),
  },
  `
    uniform float uTime;
    uniform vec2 uSources[${MAX_SOURCES}];
    uniform float uStrengths[${MAX_SOURCES}];
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

      // Two octaves of slow ambient flow, so the surface is never perfectly still.
      float baseNoise = snoise(vec2(pos.x, pos.y) * 0.08 + uTime * 0.02) * 0.22;
      float detailNoise = snoise(vec2(pos.x, pos.y) * 0.22 + uTime * 0.06) * 0.08;

      // Sum every live source. Waves superpose, so two fingers produce an interference
      // pattern rather than one animation replacing the other.
      //
      // The loop runs the full fixed bound and gates on amplitude rather than on a
      // source count with a conditional break. Conditional breaks are outside the loop
      // forms GLSL ES 1.00 guarantees, and drivers reject the whole program with a
      // misleading syntax error pointing at unrelated code further down.
      float ripple = 0.0;
      for (int i = 0; i < ${MAX_SOURCES}; i++) {
        float amplitude = uStrengths[i];
        if (amplitude > 0.0) {
          float dist = distance(pos.xy, uSources[i]);
          // Travelling wave, attenuated with distance from its origin.
          ripple += sin(dist * 2.2 - uTime * 3.4) * amplitude * (1.0 - smoothstep(0.0, 2.6, dist));
        }
      }

      pos.z += baseNoise + detailNoise + ripple * 0.28;
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
      // Displaced crests catch more light, which is what sells the surface as liquid.
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
    uSources: { value: THREE.Vector2[] };
    uStrengths: { value: number[] };
  };
}

type FlowingPlaneProps = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  /** Live ripple sources, read every frame. */
  sourcesRef: React.RefObject<RippleSource[]>;
  /** When false the surface holds a still frame: no ambient flow, no displacement. */
  enabled?: boolean;
};

export const FlowingPlane = forwardRef<THREE.Mesh, FlowingPlaneProps>(function FlowingPlane(
  { primaryColor, secondaryColor, accentColor, sourcesRef, enabled = true },
  ref
) {
  const materialRef = useRef<IFlowingPlaneMaterial>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const material = useMemo(() => {
    const mat = new FlowingPlaneMaterial();
    if (primaryColor) mat.uniforms.uPrimary.value = new THREE.Color(primaryColor);
    if (secondaryColor) mat.uniforms.uSecondary.value = new THREE.Color(secondaryColor);
    if (accentColor) mat.uniforms.uAccent.value = new THREE.Color(accentColor);
    return mat;
  }, [primaryColor, secondaryColor, accentColor]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame(({ clock }) => {
    const uniforms = materialRef.current?.uniforms;
    if (!uniforms) return;

    const time = clock.getElapsedTime();
    uniforms.uTime.value = time;

    if (!enabledRef.current) {
      uniforms.uStrengths.value.fill(0);
      return;
    }

    /*
     * Copy the live sources into the fixed-size uniform arrays.
     *
     * Each source decays over SOURCE_FADE_SECONDS after release, which is what makes a
     * released pointer fade out of the surface instead of snapping off. Held pointers
     * are re-stamped by the hook on every event, so they hold at full strength.
     */
    const sources = sourcesRef.current;
    const now = time;
    let count = 0;
    for (let i = 0; i < sources.length && count < MAX_SOURCES; i++) {
      const source = sources[i];
      if (!source) continue;
      const age = now - source.bornAt;
      if (source.pointerId === null && age > SOURCE_FADE_SECONDS) continue;

      const decay = source.pointerId === null ? Math.max(0, 1 - age / SOURCE_FADE_SECONDS) : 1;

      uniforms.uSources.value[count].copy(source.local);
      uniforms.uStrengths.value[count] = decay;
      count++;
    }

    /*
     * Zero every slot past the live count.
     *
     * The uniform array is fixed size and persists between frames, so a slot left holding
     * the strength of a source that has since expired would keep displacing the surface
     * forever. The shader gates on amplitude rather than on a count precisely so this
     * single fill is enough to clear them all.
     */
    for (let i = count; i < MAX_SOURCES; i++) {
      uniforms.uStrengths.value[i] = 0;
    }
  });

  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2.1, 0, 0]}
      position={[0, -3, 0]}
    >
      <planeGeometry args={[40, 40, 96, 96]} />
      <primitive
        ref={materialRef}
        object={material}
        attach="material"
        transparent
      />
    </mesh>
  );
});
