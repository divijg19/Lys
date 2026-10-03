"use client";

/**
 * @file: src/components/theme/effects/ethereal/Ripples.tsx
 * @description: Manages and renders the expanding ripple rings.
 *
 * `createdAt` is a timestamp on the shared scene clock (see `useRippleField`), not on the
 * DOM event clock. The previous version mixed the two: creation used
 * `event.nativeEvent.timeStamp / 1000` while progress used the renderer's
 * `clock.getElapsedTime()`. Because those are different epochs, `elapsed` was permanently
 * negative, so the radius went negative and no ripple was ever visible, and completion
 * never fired.
 */

"use client";

import { shaderMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/** Seconds a ripple takes to expand and fade. */
const RIPPLE_LIFESPAN = 1.9;

/**
 * Saturation and lightness for the drawn ring.
 *
 * Ethereal is a light theme built from pastels, so a ring drawn in the token colour at
 * the token's own lightness is almost invisible on a near-white background -- the measured
 * change across a full-strength click was a few hundred pixels out of 90,000. Pushing the
 * same hue to a saturated, mid-lightness value keeps the palette's identity while making
 * the ring read as colour rather than as a barely-perceptible brightening.
 */
export const RIPPLE_RING_SATURATION = 0.72;
export const RIPPLE_RING_LIGHTNESS = 0.44;

/**
 * Rewrite a theme colour at a given saturation and lightness, preserving its hue.
 *
 * @param css Any colour the renderer understands, e.g. an hsl() token value.
 * @returns An `hsl()` string, or the input unchanged if it cannot be parsed.
 */
export function saturateColor(
  css: string,
  saturation = RIPPLE_RING_SATURATION,
  lightness = RIPPLE_RING_LIGHTNESS
): string {
  if (!css) return css;

  const s = Math.round(saturation * 100);
  const l = Math.round(lightness * 100);

  /*
   * Parse the triplet directly rather than round-tripping through THREE.Color.
   *
   * `Color.getHSL` converts out of the renderer's working colour space, and passing an
   * explicit space on top of that double-converts: hues came back as 0 for every input,
   * so every ring rendered red regardless of the theme. The tokens are always bare
   * `H S% L%` triplets, so reading them directly is both exact and independent of the
   * renderer's colour-management configuration.
   */
  const triplet = /hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/.exec(css);
  if (triplet) {
    return `hsl(${Math.round(Number(triplet[1]) % 360)} ${s}% ${l}%)`;
  }

  // Not an hsl() triplet (a hex or rgb value, say): fall back to THREE for the hue.
  const color = new THREE.Color(css);
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  return `hsl(${Math.round(hsl.h * 360)} ${s}% ${l}%)`;
}

/**
 * Largest radius the ring reaches, in the quad's own UV units.
 *
 * The shader measures distance from the quad centre, whose UV space runs 0..1, so the
 * furthest reachable distance is 0.5. The previous value of 2.6 was over five times the
 * geometry: the ring left the quad almost immediately and the rest of the animation
 * rendered nothing.
 */
const RIPPLE_MAX_RADIUS = 0.5;

/** Side length of the ripple quad, in world units. */
const RIPPLE_WORLD_SIZE = 14;

const RippleMaterial = shaderMaterial(
  { uColor: new THREE.Color(0.9, 0.8, 1.0), uRadius: 0.0, uOpacity: 0.0, uStrength: 1.0 },
  `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  `uniform vec3 uColor; uniform float uRadius; uniform float uOpacity; uniform float uStrength;
   varying vec2 vUv;

   // A band centred on the given radius, of the given half-width.
   float band(float radius, float width, float dist) {
     return smoothstep(radius - width, radius, dist) - smoothstep(radius, radius + width, dist);
   }

   void main() {
     float dist = distance(vUv, vec2(0.5));

     // Leading crest, the bright edge of the wavefront.
     float lead = band(uRadius, 0.028, dist);
     // Trailing ring, set back from the crest, which reads as depth.
     float trail = band(uRadius - 0.11, 0.07, dist) * 0.45;
     // Disturbed water inside the crest.
     float fill = 1.0 - smoothstep(0.0, max(uRadius, 0.0001), dist);
     fill *= fill;

     float a = (lead + trail + fill * 0.2) * uOpacity * uStrength;
     gl_FragColor = vec4(uColor, a);
   }`
);

interface IRippleMaterial extends THREE.ShaderMaterial {
  uniforms: {
    uColor: { value: THREE.Color };
    uRadius: { value: number };
    uOpacity: { value: number };
    uStrength: { value: number };
  };
}

type RippleProps = {
  id: number;
  position: THREE.Vector3;
  /** Seconds on the shared scene clock. */
  createdAt: number;
  /** Faint for a hover trail, full for a deliberate tap. */
  strength: number;
  onComplete: (id: number) => void;
  color: string;
};

export type RippleEvent = {
  id: number;
  position: THREE.Vector3;
  createdAt: number;
  strength: number;
};

export type RipplesProps = {
  ripples: RippleEvent[];
  onComplete: (id: number) => void;
  color: string;
};

const Ripple = ({ id, position, createdAt, strength, onComplete, color }: RippleProps) => {
  const ref = useRef<IRippleMaterial>(null);
  const hasCompleted = useRef(false);

  const material = useMemo(() => {
    const mat = new RippleMaterial();
    if (color) mat.uniforms.uColor.value = new THREE.Color(color);
    return mat;
  }, [color]);

  // Release the GPU texture/material rather than dropping the reference and hoping the
  // renderer's next sweep reclaims it.
  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const elapsed = clock.getElapsedTime() - createdAt;
    if (elapsed < 0) return;

    if (elapsed > RIPPLE_LIFESPAN) {
      if (!hasCompleted.current) {
        hasCompleted.current = true;
        onComplete(id);
      }
      return;
    }

    const progress = elapsed / RIPPLE_LIFESPAN;
    // Ease-out, so the wavefront races out and then settles, rather than creeping.
    ref.current.uniforms.uRadius.value = RIPPLE_MAX_RADIUS * (1 - (1 - progress) ** 2.2);
    // Snap on quickly, hold, then fade. The previous peak of 0.55 was tuned against a
    // darker background than this theme actually has.
    ref.current.uniforms.uOpacity.value = 0.75 * Math.min(1, progress * 8) * (1 - progress) ** 1.3;
    ref.current.uniforms.uStrength.value = strength;
  });

  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2.1, 0, 0]}
    >
      {/* Wide enough that a fully expanded ring still lands inside the quad. */}
      <planeGeometry args={[RIPPLE_WORLD_SIZE, RIPPLE_WORLD_SIZE]} />
      <primitive
        ref={ref}
        object={material}
        attach="material"
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};

export const Ripples = ({ ripples, onComplete, color }: RipplesProps) => (
  <group>
    {ripples.map((ripple) => (
      <Ripple
        key={ripple.id}
        id={ripple.id}
        position={ripple.position}
        createdAt={ripple.createdAt}
        strength={ripple.strength}
        onComplete={onComplete}
        color={color}
      />
    ))}
  </group>
);
