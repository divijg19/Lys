/**
 * @file: src/components/theme/effects/ethereal/Ripples.tsx
 * @description: Manages and renders the on-click ripple effects.
 * @update: Reverted to its original state but with rotation hardcoded to match the scene.
 */

"use client";

import { shaderMaterial } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, type Mesh, type ShaderMaterial, type Vector3 } from "three";
import { effectProgress } from "@/lib/effectsLifetime";

/*
 * How long a ripple lives, in seconds.
 */
const RIPPLE_LIFESPAN_SECONDS = 1.5;

/*
 * The size of the quad the ring is drawn on, in world units.
 *
 * The ring is drawn on a surface that faces the camera, eight units from it, where the view is
 * about 12.3 units tall. A quad of this size is therefore roughly a sixth of the screen, and the
 * ring -- which grows outwards from the centre as it fades -- reaches about a twelfth of the
 * screen before it is clipped by the quad.
 *
 * The size used to be five units on a plane lying flat on the floor, seen at a grazing angle from
 * far away: the same ring came out about a hundred pixels wide and twenty tall, in the lower
 * part of the screen, and could not be seen.
 */
const RIPPLE_QUAD_SIZE = 2.2;

/**
 * The shader uniforms a ripple is drawn with, from its progress through its life.
 *
 * The radius grows from nothing to the edge of the plane while the opacity fades out. Both used
 * to be computed from an age that could be negative -- which made the ring invisible -- so the
 * arithmetic lives in a function that can be tested on its own.
 */
export const rippleUniforms = (progress: number) => ({
  uRadius: progress * 2.0,
  uOpacity: 0.4 * (1 - progress),
});

const RippleMaterial = shaderMaterial(
  { uColor: new Color(0.9, 0.8, 1.0), uRadius: 0.0, uOpacity: 0.0 },
  `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  `uniform vec3 uColor; uniform float uRadius; uniform float uOpacity; varying vec2 vUv;
   void main() {
     vec2 center = vec2(0.5);
     float dist = distance(vUv, center);

     /*
      * A thin ring with a soft inner edge.
      *
      * The halo used to be four times the width of the ring and carried a third of the strength,
      * which made the effect read as a filled disc -- a purple smudge behind the text rather than
      * a ripple. It is now a band with a soft falloff on both sides and a quiet glow inside it,
      * which reads as an echo rather than a mark.
      */
     /*
      * One soft band, centred on the ring's radius.
      *
      * A second term for the inside of the ring filled the whole disc: the effect read as a pale
      * patch rather than a ripple. A single band, wide enough to be soft, is an echo.
      */
     float strength = (1.0 - smoothstep(0.0, 0.08, abs(dist - uRadius))) * 0.8;
     gl_FragColor = vec4(uColor, strength * uOpacity);
   }`
);

interface IRippleMaterial extends ShaderMaterial {
  uniforms: {
    uColor: { value: Color };
    uRadius: { value: number };
    uOpacity: { value: number };
  };
}

type RippleProps = {
  id: number;
  position: Vector3;
  scale: number;
  creationTime: number;
  onComplete: (id: number) => void;
  color: Color;
};

export type RippleData = {
  id: number;
  position: Vector3;
  /** The factor that keeps the ring the same size on the screen. */
  scale: number;
  creationTime: number;
};
export type RipplesProps = {
  ripples: RippleData[];
  onComplete: (id: number) => void;
  color: Color;
};

const Ripple = ({ id, position, scale, creationTime, onComplete, color }: RippleProps) => {
  const ref = useRef<IRippleMaterial>(null);
  const meshRef = useRef<Mesh>(null);
  const camera = useThree((state) => state.camera);
  const hasCompleted = useRef(false);
  const material = useMemo(() => {
    const mat = new RippleMaterial();
    mat.uniforms.uColor.value = new Color(color);
    return mat;
  }, [color]);

  /*
   * The material is built here rather than declaratively, so react-three-fiber does not own it and
   * will not dispose of it. Without this, every ripple that was ever spawned left a shader
   * program on the GPU.
   */
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    /*
     * `clock.elapsedTime` rather than `clock.getElapsedTime()`: the latter advances the clock as
     * a side effect of reading it, and the creation time recorded by the scene is read from the
     * same accumulator. Reading the property keeps both ends of the comparison on one clock.
     */
    const { complete, progress } = effectProgress(
      clock.elapsedTime,
      creationTime,
      RIPPLE_LIFESPAN_SECONDS
    );

    if (complete) {
      if (!hasCompleted.current) {
        onComplete(id);
        hasCompleted.current = true;
      }
      return;
    }

    const { uRadius, uOpacity } = rippleUniforms(progress);
    ref.current.uniforms.uRadius.value = uRadius;
    ref.current.uniforms.uOpacity.value = uOpacity;
  });

  return (
    /*
     * The ring faces the camera. The scene's camera is fixed, so a plane with no rotation already
     * faces it -- but saying so explicitly means the ring keeps facing the camera if the camera
     * is ever moved.
     */
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onUpdate={(self) => self.lookAt(camera.position)}
    >
      <planeGeometry args={[RIPPLE_QUAD_SIZE, RIPPLE_QUAD_SIZE]} />
      {/*
       * `depthWrite: false` is not optional here. The material is transparent, but it still wrote
       * depth, so the ring's whole quad -- not just the ring -- cut a hole in the field behind it
       * and the page showed through as a pale square.
       */}
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
        {...ripple}
        onComplete={onComplete}
        color={color}
      />
    ))}
  </group>
);
