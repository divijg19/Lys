"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
// Prefer `three/addons` over `three/examples` for package compatibility.
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import type { SkyVariant } from "../layers/SkyGradientPlane";

type ShaderDefinition = {
  uniforms: Record<string, { value: unknown }>;
  vertexShader: string;
  fragmentShader: string;
};

type PostFXPreset = {
  bloom: {
    strength: number;
    radius: number;
    threshold: number;
  };
  grade: {
    aberration: number;
    vignette: number;
    grain: number;
    weave: number;
    jitter: number;
  };
};

const PRESETS: Record<SkyVariant, PostFXPreset> = {
  "night-city": {
    bloom: { strength: 0.38, radius: 0.7, threshold: 0.18 },
    grade: { aberration: 1.05, vignette: 0.72, grain: 0.075, weave: 0.26, jitter: 0.18 },
  },
  sunset: {
    bloom: { strength: 0.32, radius: 0.6, threshold: 0.24 },
    grade: { aberration: 0.9, vignette: 0.62, grain: 0.06, weave: 0.18, jitter: 0.13 },
  },
  sunrise: {
    bloom: { strength: 0.24, radius: 0.5, threshold: 0.28 },
    grade: { aberration: 0.75, vignette: 0.52, grain: 0.055, weave: 0.12, jitter: 0.1 },
  },
  day: {
    bloom: { strength: 0.18, radius: 0.4, threshold: 0.35 },
    grade: { aberration: 0.45, vignette: 0.42, grain: 0.04, weave: 0.08, jitter: 0.08 },
  },
};

const ChromaticVignetteGrainShader: ShaderDefinition = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uAberration: { value: 0.85 },
    uVignette: { value: 0.65 },
    uGrain: { value: 0.06 },
    uWeave: { value: 0.16 },
    uJitter: { value: 0.12 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;

    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uAberration;
    uniform float uVignette;
    uniform float uGrain;
    uniform float uWeave;
    uniform float uJitter;

    varying vec2 vUv;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 345.45));
      p += dot(p, p + 34.345);
      return fract(p.x * p.y);
    }

    void main() {
      vec2 uv = vUv;
      vec2 centered = uv * 2.0 - 1.0;
      float r = length(centered);

      vec2 px = 1.0 / max(uResolution, vec2(1.0));

      // Film gate weave (slow, subpixel)
      float wx = (sin(uTime * 0.63) + sin(uTime * 0.17 + 3.1)) * 0.5;
      float wy = (sin(uTime * 0.49 + 1.7) + sin(uTime * 0.11)) * 0.5;
      uv += vec2(wx, wy) * (uWeave * 2.0) * px;

      // Per-frame jitter (tiny, quantized-ish)
      float jf = floor(uTime * 24.0);
      float j = hash(vec2(jf, jf + 17.0));
      float j2 = hash(vec2(jf + 29.0, jf));
      vec2 jv = (vec2(j, j2) - 0.5) * 2.0;
      uv += jv * (uJitter * 2.0) * px;

      // Chromatic aberration (subtle, radial)
      vec2 dir = centered / max(1e-5, r);
      float amt = uAberration * r * r;
      vec2 off = dir * amt * 2.0 * px;

      vec3 col;
      col.r = texture2D(tDiffuse, uv + off).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - off).b;

      // Vignette (multiply)
      float vig = smoothstep(1.15, 0.35, r);
      col *= mix(1.0, vig, uVignette);

      // Grain (additive)
      float g = hash(floor(uv * uResolution) + vec2(uTime * 60.0, uTime * 37.0));
      g = (g - 0.5) * 2.0;
      col += g * uGrain;

      // Gentle contrast lift for surreal punch
      col = pow(max(col, 0.0), vec3(0.92));

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `,
};

export function HorizonPostFX({ enabled, variant }: { enabled: boolean; variant: SkyVariant }) {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);
  const timeRef = useRef(0);

  const presetTargetRef = useRef<PostFXPreset>(PRESETS[variant]);
  const presetCurrentRef = useRef<PostFXPreset>(PRESETS[variant]);

  const passes = useMemo(() => {
    const renderPass = new RenderPass(scene, camera);

    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.24, 0.6, 0.25);

    const grade = new ShaderPass(ChromaticVignetteGrainShader);

    return { renderPass, bloom, grade };
  }, [scene, camera]);

  useEffect(() => {
    presetTargetRef.current = PRESETS[variant];
  }, [variant]);

  useEffect(() => {
    if (!enabled) return;

    const composer = new EffectComposer(gl);
    composer.addPass(passes.renderPass);
    composer.addPass(passes.bloom);
    composer.addPass(passes.grade);

    composer.setSize(size.width, size.height);

    // Keep output crisp; avoid forcing extra antialiasing
    composerRef.current = composer;

    return () => {
      composerRef.current = null;
      composer.dispose();
    };
  }, [enabled, gl, passes, size.width, size.height]);

  useEffect(() => {
    if (!enabled) return;
    composerRef.current?.setSize(size.width, size.height);

    const gradePass = passes.grade;
    gradePass.uniforms.uResolution.value.set(size.width, size.height);
  }, [enabled, passes.grade, size.width, size.height]);

  useFrame((_, delta) => {
    if (!enabled) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

    const composer = composerRef.current;
    if (!composer) return;

    timeRef.current += delta;
    passes.grade.uniforms.uTime.value = timeRef.current;

    // Smoothly retarget preset values (prevents popping on phase changes)
    const target = presetTargetRef.current;
    const current = presetCurrentRef.current;

    current.bloom.strength = THREE.MathUtils.damp(
      current.bloom.strength,
      target.bloom.strength,
      6,
      delta
    );
    current.bloom.radius = THREE.MathUtils.damp(
      current.bloom.radius,
      target.bloom.radius,
      6,
      delta
    );
    current.bloom.threshold = THREE.MathUtils.damp(
      current.bloom.threshold,
      target.bloom.threshold,
      6,
      delta
    );

    current.grade.aberration = THREE.MathUtils.damp(
      current.grade.aberration,
      target.grade.aberration,
      6,
      delta
    );
    current.grade.vignette = THREE.MathUtils.damp(
      current.grade.vignette,
      target.grade.vignette,
      6,
      delta
    );
    current.grade.grain = THREE.MathUtils.damp(current.grade.grain, target.grade.grain, 6, delta);
    current.grade.weave = THREE.MathUtils.damp(current.grade.weave, target.grade.weave, 6, delta);
    current.grade.jitter = THREE.MathUtils.damp(
      current.grade.jitter,
      target.grade.jitter,
      6,
      delta
    );

    // Apply bloom tuning
    passes.bloom.strength = current.bloom.strength;
    passes.bloom.radius = current.bloom.radius;
    passes.bloom.threshold = current.bloom.threshold;

    // Apply grade tuning
    passes.grade.uniforms.uAberration.value = current.grade.aberration;
    passes.grade.uniforms.uVignette.value = current.grade.vignette;
    passes.grade.uniforms.uGrain.value = current.grade.grain;
    passes.grade.uniforms.uWeave.value = current.grade.weave;
    passes.grade.uniforms.uJitter.value = current.grade.jitter;

    // Render with post FX after the scene
    composer.render();
  }, 1);

  return null;
}
