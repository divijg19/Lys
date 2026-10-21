/**
 * @file: src/components/theme/effects/FlowingPlane.tsx
 * @description: Renders the primary, non-interactive "Dream-Fabric" visual.
 * @update: This component is now purely visual. All interaction logic has been removed.
 */

"use client";

import { shaderMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, type Mesh, type ShaderMaterial, type Texture } from "three";
import { createNoiseTexture } from "@/lib/noiseTexture";

const FlowingPlaneMaterial = shaderMaterial(
  {
    uTime: 0,
    uPrimary: new Color(0.8, 0.7, 0.9),
    uSecondary: new Color(0.7, 0.85, 0.9),
    uAccent: new Color(0.95, 0.75, 0.9),
    uNoise: null,
  },
  `
    uniform float uTime;
    uniform sampler2D uNoise;
    varying float vDisplacement;
    varying vec2 vUv;

    /*
     * The displacement, from a noise texture rather than from noise in the shader.
     *
     * It used to evaluate two octaves of simplex noise per vertex, per frame: the whole of the
     * mesh ran a noise evaluation twice, and the plane then had to be coarse to afford it -- at
     * 64 by 64 the detail octave's wavelength was covered by seven quads, and the field came out
     * softer than it should.
     *
     * The texture holds the same field, in the same four channels, with the same frequencies and
     * the same drift; the vertex shader does two lookups. The coordinates are scaled so that the
     * feature sizes are unchanged:
     *
     *   the old field's features were one cell wide in the noise's own space, so a cell was
     *   1 / frequency across the plane. The texture holds eight cells across a tile, so the
     *   lookup is scaled by 1 / 8 and the features land in the same place.
     */
    float noiseAt(vec2 point, float frequency, float drift, float scale) {
      vec2 uv = (point * frequency + uTime * drift) * scale;
      return texture2D(uNoise, uv).r * 2.0 - 1.0;
    }

    void main() {
      vUv = uv;
      vec3 pos = position;
      float baseNoise = noiseAt(pos.xy, 0.08, 0.02, 0.125) * 0.22;
      float detailNoise = texture2D(uNoise, (pos.xy * 0.22 + uTime * 0.06) * 0.125).g * 2.0 - 1.0;
      detailNoise *= 0.08;
      float totalNoise = baseNoise + detailNoise;
      pos.z += totalNoise;
      vDisplacement = pos.z;

      /*
       * Where this fragment ends up on the screen.
       *
       * The plane is a floor seen almost edge-on, so its own coordinates say nothing about where
       * it appears: a point at the far end of the plane and a point at the near end are metres
       * apart in the scene and centimetres apart on the screen. The pointer is a position on the
       * screen, so the response to it has to be computed there too -- which is what the
       * normalised device coordinates of the fragment are.
       */
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
      float glint = smoothstep(0.8, 1.0, flow) * 0.06;

      vec3 finalColor = base * glow + uAccent * glint;

      /*
       * The alpha is deliberately low.
       *
       * The plane is a translucent quad seen at a grazing angle, where its noise-displaced
       * surface folds over itself in screen space, so the layers stack. A neutral colour stacks
       * into a faint wash; a chromatic one stacks into a saturated field, and the ethereal
       * background stopped being a near-white dreamscape and became a blue one.
       *
       * The CSS layers of this theme -- the radial washes that carry the pastel -- sit between
       * 0.12 and 0.22. This is the 3D half of the same field, and it has to land in the same
       * place: the stacking multiplies the per-fragment alpha several times over, so the value
       * here is a fraction of what the surface ends up showing.
       */
      float alpha = (0.05 + 0.08 * centerFade) * edgeFade;
      gl_FragColor = vec4(finalColor, alpha);
    }`
);

interface IFlowingPlaneMaterial extends ShaderMaterial {
  uniforms: {
    uTime: { value: number };
    uPrimary: { value: Color };
    uSecondary: { value: Color };
    uAccent: { value: Color };
    uNoise: { value: Texture | null };
  };
}

type FlowingPlaneProps = {
  primaryColor: Color;
  secondaryColor: Color;
  accentColor: Color;
};

export const FlowingPlane = ({ primaryColor, secondaryColor, accentColor }: FlowingPlaneProps) => {
  const ref = useRef<IFlowingPlaneMaterial>(null);
  const meshRef = useRef<Mesh>(null);

  /*
   * The noise texture is generated once, when the plane mounts.
   *
   * It is a texture rather than noise in the shader because the field is sampled at a coordinate
   * that drifts: the noise has to be periodic, and a periodic field is far cheaper to look up
   * than to evaluate.
   */
  const noiseTexture = useMemo(() => createNoiseTexture(), []);

  const material = useMemo(() => {
    const mat = new FlowingPlaneMaterial();
    mat.uniforms.uPrimary.value = new Color(primaryColor);
    mat.uniforms.uSecondary.value = new Color(secondaryColor);
    mat.uniforms.uAccent.value = new Color(accentColor);
    mat.uniforms.uNoise.value = noiseTexture;
    return mat;
  }, [primaryColor, secondaryColor, accentColor, noiseTexture]);

  /*
   * The material is built here rather than declaratively, so react-three-fiber does not own it and
   * will not dispose of it. Every theme change used to build a new one and leave the old shader
   * program on the GPU.
   */
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2.1, 0, 0]}
      position={[0, -3, 0]}
    >
      {/*
       * 128 by 128 segments.
       *
       * The detail octave's wavelength is about 4.5 units and the plane is 40 units wide, so a
       * segment has to be much shorter than a wavelength for the detail to be carried rather than
       * smoothed away. This is the density the theme had before the noise moved into a texture.
       *
       * The density is affordable because the noise is looked up rather than evaluated: the
       * per-vertex cost is two texture reads instead of two noise evaluations, and the shader
       * lost forty lines of noise in the process.
       */}
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
