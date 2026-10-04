"use client";

/**
 * @file: src/components/theme/effects/cyberpunk/CyberpunkPostFX.tsx
 * @description: Bloom and chromatic aberration for the Cyberpunk alley.
 *
 * Without a bloom pass the neon was merely bright: emissive materials clip to flat colour
 * and the scene reads as a normal dark street with saturated paint on it. Bloom is what
 * turns that into light.
 *
 * Scanlines, vignette and grain are deliberately *not* applied here. `AtmosphereGrade`
 * already renders them in CSS over the whole stack, including the UI, so grading them a
 * second time in the shader would double them up and cost a full-screen pass for nothing.
 * Only the chromatic aberration, which CSS cannot do, lives in the shader.
 */

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
// Prefer `three/addons` over `three/examples` for package compatibility.
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { subscribeGridPower } from "./gridPower";

/**
 * Radial chromatic aberration.
 *
 * Splits the channels outward from the frame centre, which is what gives cheap 3D the
 * "shot through cheap lens" quality the genre is built on. Strength scales with the grid
 * power so the whole image smears slightly during a brown-out.
 */
const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uAmount: { value: 0.0016 },
    uPower: { value: 1 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uAmount;
    uniform float uPower;
    varying vec2 vUv;

    void main() {
      // Offset scales with distance from centre, so the frame edges fringe and the
      // middle stays clean.
      vec2 centered = vUv - 0.5;
      float radius = length(centered);
      vec2 offset = centered * radius * uAmount * uPower;

      float r = texture2D(tDiffuse, vUv + offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - offset).b;

      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
};

const BLOOM = { strength: 0.82, radius: 0.72, threshold: 0.55 } as const;

/**
 * @param enabled Mount guard. Follows `HorizonPostFX`, which takes the same prop for the
 *   same reason: a composer holds render targets, so under calm mode it should not be
 *   mounted at all rather than merely skipped per frame.
 */
export function CyberpunkPostFX({ enabled = true }: { enabled?: boolean }) {
  const { scene, camera, size, gl } = useThree();
  const power = useMemo(() => ({ current: 1 }), []);

  const { composer, gradePass } = useMemo(() => {
    const nextComposer = new EffectComposer(gl);
    nextComposer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      BLOOM.strength,
      BLOOM.radius,
      BLOOM.threshold
    );
    nextComposer.addPass(bloom);

    const grade = new ShaderPass(ChromaticAberrationShader);
    nextComposer.addPass(grade);

    return { composer: nextComposer, gradePass: grade };
  }, [gl, scene, camera, size.width, size.height]);

  useEffect(
    () =>
      subscribeGridPower((level) => {
        power.current = level;
      }),
    [power]
  );

  // Keep the composer sized to the canvas.
  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size.width, size.height]);

  // Dispose on unmount so switching themes does not leak render targets.
  useEffect(() => {
    return () => {
      composer.dispose();
    };
  }, [composer]);

  useFrame((_, delta) => {
    if (!enabled) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

    // The aberration shader only uses uPower, so drive it straight from the signal.
    gradePass.uniforms.uPower.value = power.current;
    // A brown-out dims the image, so fold it into exposure rather than the shader.
    gl.toneMappingExposure = power.current;
    composer.render(delta);
  }, 1);

  return null;
}
