"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type HorizonCinematicVariantId = "sunrise" | "sunset" | "night-city" | "day";

export interface HorizonCinematicCanvasProps {
  variantId: HorizonCinematicVariantId;
  /** When false, animation time stops (still renders). */
  active: boolean;
}

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Single-pass ambient compositor.
// Goal: retro 32-bit look via pixel snapping + ordered dithering + palette quantization.
const FRAG = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uRes;
  uniform int uVariant;
  uniform float uPixelSize;

  // --- Utilities ---
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    // Keep this intentionally cheap; we add variety elsewhere.
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.5;
    }
    return v;
  }

  vec3 skyGradient(float y, vec3 a, vec3 b, vec3 c) {
    float t1 = smoothstep(0.0, 0.65, y);
    float t2 = smoothstep(0.35, 1.0, y);
    vec3 mid = mix(a, b, t1);
    return mix(mid, c, t2);
  }

  float horizonGlow(float y, float center, float width) {
    return exp(-pow((y - center) / width, 2.0));
  }

  float circle(vec2 p, vec2 c, float r) {
    return smoothstep(r, r - 0.002, length(p - c));
  }

  float box(vec2 p, vec2 c, vec2 s) {
    vec2 d = abs(p - c) - s;
    float outside = length(max(d, 0.0));
    float inside = min(max(d.x, d.y), 0.0);
    return smoothstep(0.003, 0.0, outside + inside);
  }

  float triBeam(vec2 p, vec2 a, vec2 b, vec2 c) {
    // barycentric sign test (returns 1 inside)
    vec2 v0 = c - a;
    vec2 v1 = b - a;
    vec2 v2 = p - a;
    float den = v0.x * v1.y - v1.x * v0.y;
    float v = (v2.x * v1.y - v1.x * v2.y) / den;
    float w = (v0.x * v2.y - v2.x * v0.y) / den;
    float u = 1.0 - v - w;
    return step(0.0, u) * step(0.0, v) * step(0.0, w);
  }

  float bayer4(vec2 ip) {
    // 4x4 Bayer matrix values in [0, 1)
    float x = mod(ip.x, 4.0);
    float y = mod(ip.y, 4.0);
    float v = 0.0;
    if (y < 1.0) {
      v = (x < 1.0) ? 0.0 : (x < 2.0) ? 8.0 : (x < 3.0) ? 2.0 : 10.0;
    } else if (y < 2.0) {
      v = (x < 1.0) ? 12.0 : (x < 2.0) ? 4.0 : (x < 3.0) ? 14.0 : 6.0;
    } else if (y < 3.0) {
      v = (x < 1.0) ? 3.0 : (x < 2.0) ? 11.0 : (x < 3.0) ? 1.0 : 9.0;
    } else {
      v = (x < 1.0) ? 15.0 : (x < 2.0) ? 7.0 : (x < 3.0) ? 13.0 : 5.0;
    }
    return v / 16.0;
  }

  vec3 quantize(vec3 col, float levels, float d) {
    vec3 q = floor(col * levels + d) / levels;
    return clamp(q, 0.0, 1.0);
  }

  float variantLevels(int v) {
    // 32-bit-ish: higher levels for sunrise, fewer for night.
    if (v == 0) return 18.0; // sunrise
    if (v == 1) return 16.0; // sunset
    if (v == 2) return 14.0; // night-city
    return 15.0; // day
  }

  float variantDither(int v) {
    if (v == 2) return 0.95;
    if (v == 1) return 0.85;
    if (v == 0) return 0.75;
    return 0.80;
  }

  vec3 gradeVariant(vec3 col, int v) {
    // A tiny, cheap "look" per phase.
    col = clamp(col, 0.0, 1.0);
    if (v == 2) {
      // Night: deeper blacks, cooler highlights.
      col = pow(col, vec3(1.12));
      col.b += 0.03;
      col.r -= 0.01;
    } else if (v == 1) {
      // Sunset: warmer mids, richer reds.
      col = pow(col, vec3(0.96));
      col.r += 0.03;
      col.g += 0.01;
    } else if (v == 0) {
      // Sunrise: pastel lift.
      col = pow(col, vec3(0.92));
      col += vec3(0.015);
    } else {
      // Day cafe: slightly muted interior contrast.
      col = pow(col, vec3(1.02));
      col *= vec3(0.98, 0.98, 1.00);
    }
    return clamp(col, 0.0, 1.0);
  }

  float outlineBox(vec2 p, vec2 c, vec2 s, float w) {
    float a = box(p, c, s);
    float b = box(p, c, s + vec2(w));
    return clamp(b - a, 0.0, 1.0);
  }

  float outlineCircle(vec2 p, vec2 c, float r, float w) {
    float a = circle(p, c, r);
    float b = circle(p, c, r + w);
    return clamp(b - a, 0.0, 1.0);
  }

  vec2 rot(vec2 p, float a) {
    float s = sin(a);
    float c = cos(a);
    return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
  }

  float birdV(vec2 p, vec2 c, float size) {
    // Two tiny wings as rotated thin boxes.
    vec2 q = p - c;
    float wing = 0.0;
    wing += box(rot(q, 0.55), vec2(0.0), vec2(size, size * 0.18));
    wing += box(rot(q, -0.55), vec2(0.0), vec2(size, size * 0.18));
    return clamp(wing, 0.0, 1.0);
  }

  void main() {
    // Pixel snap
    vec2 uv = vUv;
    vec2 pix = floor(uv * uRes / max(1.0, uPixelSize));
    vec2 puv = pix * max(1.0, uPixelSize) / uRes;

    // Slight anamorphic stretch (subtle)
    puv.x = (puv.x - 0.5) * 1.05 + 0.5;

    float t = uTime;
    float aspect = uRes.x / max(1.0, uRes.y);
    float horizonY = 0.33;
    float px = max(1.0, uPixelSize) / max(1.0, min(uRes.x, uRes.y));

    // Palettes (hand-tuned, but compact)
    vec3 a;
    vec3 b;
    vec3 c;
    vec3 glow;

    // 0 sunrise, 1 sunset, 2 night-city, 3 day
    if (uVariant == 0) {
      a = vec3(0.96, 0.52, 0.22);
      b = vec3(0.98, 0.74, 0.42);
      c = vec3(0.78, 0.88, 0.96);
      glow = vec3(1.00, 0.86, 0.68);
    } else if (uVariant == 1) {
      a = vec3(0.74, 0.18, 0.18);
      b = vec3(0.98, 0.55, 0.28);
      c = vec3(0.22, 0.10, 0.24);
      glow = vec3(1.00, 0.70, 0.48);
    } else if (uVariant == 2) {
      a = vec3(0.05, 0.04, 0.08);
      b = vec3(0.10, 0.08, 0.18);
      c = vec3(0.26, 0.18, 0.36);
      glow = vec3(0.78, 0.86, 1.00);
    } else {
      a = vec3(0.92, 0.62, 0.30);
      b = vec3(0.52, 0.28, 0.60);
      c = vec3(0.03, 0.04, 0.08);
      glow = vec3(1.00, 0.92, 0.72);
    }

    // Very gentle ambient drift (non-interactive)
    vec2 drift = vec2(sin(t * 0.07) * 0.002, cos(t * 0.05) * 0.001);
    vec2 suv = puv + drift;

    vec3 col = skyGradient(suv.y, a, b, c);

    // Filmic curve (very gentle)
    col = col / (col + vec3(0.85));

    // Phase grade before we add silhouettes (keeps silhouettes crisp)
    col = gradeVariant(col, uVariant);

    // Atmospheric depth band
    float hg = horizonGlow(suv.y, horizonY + 0.05, 0.09);
    col += glow * hg * (uVariant == 2 ? 0.18 : 0.22);

    // Fog / haze: stronger near horizon
    float fogMask = smoothstep(0.15, 0.55, suv.y) * (1.0 - smoothstep(0.55, 0.85, suv.y));
    float fog = fbm(suv * vec2(2.0, 1.2) + vec2(t * 0.015, 0.0));
    col += (glow * 0.18) * fog * fogMask * (uVariant == 2 ? 0.75 : 0.6);

    // Horizon line (keeps the “looking into the horizon” read)
    float hz = smoothstep(horizonY + 0.005, horizonY - 0.002, suv.y) * smoothstep(horizonY - 0.04, horizonY + 0.005, suv.y);
    col += glow * hz * (uVariant == 2 ? 0.09 : 0.12);

    // Variant-specific "ground" layers below horizon (ocean/sand/interior) to strengthen composition.
    if (uVariant == 1) {
      // Sunset beach: ocean band + shoreline + sand foreground.
      float belowH = step(suv.y, horizonY);
      float shoreY = horizonY - 0.10 + 0.018 * sin(suv.x * 3.4 + t * 0.03);
      float sandMask = step(suv.y, shoreY);
      float oceanMask = belowH * (1.0 - sandMask);

      vec3 ocean = vec3(0.08, 0.06, 0.12);
      vec3 sand = vec3(0.20, 0.09, 0.07);
      col = mix(col, ocean, oceanMask * 0.45);
      col = mix(col, sand, sandMask * 0.55);

      // Shoreline foam (thin bright edge)
      float foam = smoothstep(shoreY + 0.010, shoreY - 0.002, suv.y) * smoothstep(shoreY - 0.030, shoreY + 0.010, suv.y);
      float foamWobble = 0.55 + 0.45 * sin((suv.x * 24.0 + t * 0.18) + fbm(suv * 4.0) * 2.0);
      col += vec3(1.0, 0.82, 0.62) * foam * foamWobble * 0.06;

      // Gentle wave lines in ocean
      float wave = sin(suv.x * 26.0 + t * 0.22 + fbm(suv * 3.8 + t * 0.03) * 2.0);
      float waveLine = smoothstep(0.94, 1.0, wave) * oceanMask;
      col += glow * waveLine * 0.035;
    }

    // Sun / Moon discs
    if (uVariant == 1) {
      // Sunset sun
      float sun = circle(suv, vec2(0.52, 0.40), 0.085);
      float halo = circle(suv, vec2(0.52, 0.40), 0.14);
      col = mix(col, vec3(1.0, 0.62, 0.28), sun * 0.8);
      col += vec3(1.0, 0.72, 0.38) * halo * 0.14;

      // Subtle sun rays (cheap, pixel-snapped)
      vec2 sc = vec2(0.52, 0.40);
      vec2 sp = suv - sc;
      float ang = atan(sp.y, sp.x);
      float rays = smoothstep(0.55, 0.95, sin(ang * 10.0 + t * 0.08) * 0.5 + 0.5);
      float rayMask = smoothstep(0.22, 0.02, length(sp));
      col += vec3(1.0, 0.60, 0.34) * rays * rayMask * 0.05;
    } else if (uVariant == 0) {
      // Sunrise sun (peeking)
      float sun = circle(suv, vec2(0.50, 0.39), 0.075);
      col += vec3(1.0, 0.78, 0.52) * sun * 0.22;

      // Dawn rays (softer than sunset)
      vec2 sc = vec2(0.50, 0.39);
      vec2 sp = suv - sc;
      float ang = atan(sp.y, sp.x);
      float rays = smoothstep(0.65, 0.97, sin(ang * 9.0 - t * 0.06) * 0.5 + 0.5);
      float rayMask = smoothstep(0.26, 0.03, length(sp));
      col += vec3(1.0, 0.78, 0.52) * rays * rayMask * 0.035;
    } else if (uVariant == 2) {
      // Full moon
      float moon = circle(suv, vec2(0.78, 0.74), 0.09);
      float halo = circle(suv, vec2(0.78, 0.74), 0.16);
      col = mix(col, vec3(0.88, 0.92, 1.0), moon * 0.55);
      col += vec3(0.78, 0.86, 1.0) * halo * 0.16;

      // Moonbeam
      float sway = sin(t * 0.15) * 0.01;
      float beam = triBeam(suv, vec2(0.72 + sway, 0.70), vec2(0.92 + sway, 0.72), vec2(0.66 + sway, 0.18));
      // Volumetric feel: couple beam to haze + add sparse sparkle
      float haze = fbm(suv * vec2(3.0, 1.6) + vec2(t * 0.025, 0.0));
      float beamMask = beam * smoothstep(0.78, 0.10, suv.y);
      float sparkle = step(0.995, hash(pix + vec2(13.0, 7.0))) * beamMask;
      col += vec3(0.78, 0.86, 1.0) * beamMask * (0.035 + 0.030 * haze);
      col += vec3(0.92, 0.95, 1.0) * sparkle * (0.12 + 0.08 * sin(t * 1.1));
    }

    // Stars (night only)
    if (uVariant == 2) {
      float s = 0.0;
      vec2 p = suv * vec2(520.0, 320.0);
      vec2 ip = floor(p);
      float r = hash(ip);
      float m = step(0.995, r);
      vec2 fp = fract(p) - 0.5;
      float d = length(fp);
      s += m * smoothstep(0.035, 0.0, d);
      // twinkle
      s *= 0.6 + 0.4 * sin(t * 0.9 + r * 12.0);
      col += vec3(0.9, 0.95, 1.0) * s * 0.8;
    }

    // Water reflection (sunset + night)
    if (uVariant == 1 || uVariant == 2) {
      float waterMask = smoothstep(horizonY + 0.12, 0.15, suv.y);
      float w = sin((suv.x * 8.0 + t * 0.22) + fbm(suv * 2.8 + t * 0.04) * 1.8);
      float streak = smoothstep(0.25, 0.95, w) * 0.5;

      // Extra glints near horizon for sunset
      float gl = step(0.992, hash(floor(suv * vec2(160.0, 80.0))));
      float glMask = smoothstep(horizonY + 0.10, horizonY + 0.02, suv.y);
      streak += gl * glMask * 0.75;

      col += glow * streak * waterMask * (uVariant == 2 ? 0.075 : 0.12);

      // Night: faint moonbeam reflection ribbon
      if (uVariant == 2) {
        float sway = sin(t * 0.15) * 0.01;
        float beam2 = triBeam(suv, vec2(0.72 + sway, 0.70), vec2(0.92 + sway, 0.72), vec2(0.66 + sway, 0.18));
        float ref = beam2 * waterMask * smoothstep(horizonY + 0.10, horizonY + 0.02, suv.y);
        col += vec3(0.78, 0.86, 1.0) * ref * 0.018;
      }
    }

    // Cityline silhouettes + windows (night only)
    if (uVariant == 2) {
      float x = suv.x;
      float cell = floor(x * 92.0);
      float h = 0.26 + 0.12 * hash(vec2(cell, 1.0));
      float y = suv.y;
      float inBuildings = step(y, h) * step(0.12, y);
      vec3 bcol = vec3(0.02, 0.02, 0.03);
      col = mix(col, bcol, inBuildings * 0.85);

      // Far skyline layer (softer, adds depth)
      float cellF = floor(x * 54.0);
      float hF = 0.20 + 0.06 * hash(vec2(cellF, 9.0));
      float inFar = step(y, hF) * step(0.12, y) * (1.0 - inBuildings);
      vec3 farCol = vec3(0.06, 0.06, 0.10);
      col = mix(col, farCol, inFar * 0.55);

      // City glow at horizon (subtle)
      float glowBand = smoothstep(horizonY + 0.06, horizonY - 0.02, y) * (1.0 - smoothstep(horizonY + 0.10, horizonY + 0.22, y));
      col += vec3(0.32, 0.44, 0.60) * glowBand * 0.025;

      float win = step(0.92, hash(vec2(cell, floor(y * 48.0))));
      vec3 wcol = vec3(1.0, 0.86, 0.55);
      col += wcol * win * inBuildings * 0.06;

      // Occasional neon sign blocks (adds 32-bit charm)
      float signRow = floor(y * 28.0);
      float sign = step(0.985, hash(vec2(cell, signRow + 11.0)));
      vec3 neon = mix(vec3(0.18, 0.85, 1.0), vec3(1.0, 0.25, 0.75), hash(vec2(cell, signRow)));
      col += neon * sign * inBuildings * (0.03 + 0.02 * sin(t * 0.6 + cell * 0.2));

      // Bridge / road ribbon near horizon
      float ribbon = smoothstep(horizonY - 0.010, horizonY - 0.040, y) * smoothstep(0.18, 0.06, y);
      col += vec3(1.0, 0.86, 0.55) * ribbon * 0.018;
    }

    // Mountain ridges (sunrise only)
    if (uVariant == 0) {
      float drift1 = sin(t * 0.04) * 0.008;
      float drift2 = cos(t * 0.03) * 0.010;
      float drift3 = sin(t * 0.02) * 0.012;
      float ridge1 = horizonY - 0.02 + 0.10 * fbm(vec2((suv.x + drift1) * 2.2, 0.0) + vec2(0.0, 10.0));
      float ridge2 = horizonY - 0.06 + 0.08 * fbm(vec2((suv.x + drift2) * 3.0, 0.0) + vec2(3.0, 8.0));
      float ridge3 = horizonY - 0.10 + 0.06 * fbm(vec2((suv.x + drift3) * 3.8, 0.0) + vec2(7.0, 5.0));
      float m1 = step(suv.y, ridge1);
      float m2 = step(suv.y, ridge2);
      float m3 = step(suv.y, ridge3);

      col = mix(col, vec3(0.12, 0.07, 0.06), m1 * 0.34);
      col = mix(col, vec3(0.09, 0.06, 0.06), m2 * 0.26);
      col = mix(col, vec3(0.07, 0.05, 0.05), m3 * 0.20);

      // Valley mist bands (very low contrast)
      float mist = fbm(vec2(suv.x * 5.0, suv.y * 1.5) + vec2(t * 0.02, 0.0));
      float mistMask = smoothstep(horizonY + 0.10, horizonY - 0.02, suv.y) * (1.0 - smoothstep(horizonY + 0.18, horizonY + 0.30, suv.y));
      col += glow * mist * mistMask * 0.05;

      // Thin cloud bands (adds scale, stays subtle)
      float band1 = smoothstep(horizonY + 0.26, horizonY + 0.24, suv.y) * (1.0 - smoothstep(horizonY + 0.30, horizonY + 0.34, suv.y));
      float band2 = smoothstep(horizonY + 0.34, horizonY + 0.32, suv.y) * (1.0 - smoothstep(horizonY + 0.40, horizonY + 0.44, suv.y));
      float bandNoise = 0.55 + 0.45 * fbm(vec2(suv.x * 6.0, suv.y * 1.2) + vec2(t * 0.012, 0.0));
      col += vec3(1.0, 0.90, 0.82) * (band1 * 0.05 + band2 * 0.035) * bandNoise;

      // Birds (very subtle, distant)
      vec2 bc = vec2(0.38 + 0.10 * sin(t * 0.04 + 0.6), 0.68);
      vec2 bc2 = vec2(0.72 + 0.08 * sin(t * 0.05 + 1.1), 0.72);
      float b1 = birdV(suv, bc, 0.016);
      float b2 = birdV(suv, bc2, 0.014);
      col = mix(col, vec3(0.20, 0.10, 0.08), (b1 + b2) * 0.15);
    }

    // Seaside cliff foreground (night only) – anchors the viewpoint to the horizon
    if (uVariant == 2) {
      float cliffMask = smoothstep(0.55, 0.05, suv.y);
      float cliffShape = horizonY - 0.11 + 0.10 * fbm(vec2(suv.x * (2.0 + 0.4 * aspect), 0.0) + vec2(0.0, 22.0));
      float cliff = step(suv.y, cliffShape) * smoothstep(0.55, 0.05, 1.0 - suv.x);
      col = mix(col, vec3(0.02, 0.02, 0.03), cliff * cliffMask * 0.92);

      // Cliff edge highlight (subtle rim)
      float rim = smoothstep(cliffShape + 0.012, cliffShape - 0.002, suv.y) * smoothstep(0.85, 0.35, suv.x);
      col += vec3(0.40, 0.44, 0.55) * rim * 0.025;

      // Guardrail + ledge framing (bottom-right corner)
      vec2 p = suv;
      float corner = smoothstep(0.70, 0.88, p.x) * smoothstep(0.22, 0.06, p.y);

      // Ledge top line
      float ledgeY = 0.185 + 0.010 * sin(t * 0.06);
      float ledge = box(p, vec2(0.86, ledgeY), vec2(0.18, 0.006));
      float ledgeEdge = outlineBox(p, vec2(0.86, ledgeY), vec2(0.18, 0.006), 2.0 * px);

      // Guardrail posts
      float post1 = box(p, vec2(0.78, 0.12), vec2(0.006, 0.045));
      float post2 = box(p, vec2(0.86, 0.12), vec2(0.006, 0.045));
      float post3 = box(p, vec2(0.94, 0.12), vec2(0.006, 0.045));
      float rail = box(p, vec2(0.86, 0.155), vec2(0.20, 0.006));

      vec3 railCol = vec3(0.05, 0.05, 0.07);
      col = mix(col, railCol, (rail + post1 + post2 + post3) * corner * 0.65);
      col += vec3(0.45, 0.52, 0.70) * ledgeEdge * corner * 0.03;
      col = mix(col, vec3(0.02, 0.02, 0.03), ledge * corner * 0.40);
    }

    // Foreground pixel props (simple silhouettes)
    // Night: Mini cooper (red + white stripes) in bottom-right
    if (uVariant == 2) {
      vec2 p = suv;
      vec2 carC = vec2(0.885, 0.135);
      float body = box(p, carC, vec2(0.110, 0.040));
      float roof = box(p, carC + vec2(-0.018, 0.040), vec2(0.060, 0.024));
      float hood = box(p, carC + vec2(0.036, 0.020), vec2(0.030, 0.020));
      float wheel1 = circle(p, carC + vec2(-0.055, -0.026), 0.016);
      float wheel2 = circle(p, carC + vec2(0.055, -0.026), 0.016);
      float stripe = box(p, carC + vec2(-0.010, 0.010), vec2(0.010, 0.070));
      float stripe2 = box(p, carC + vec2(0.006, 0.010), vec2(0.010, 0.070));
      float window = box(p, carC + vec2(-0.020, 0.050), vec2(0.032, 0.014));
      float head = circle(p, carC + vec2(0.085, 0.010), 0.010);

      float outline = 0.0;
      outline += outlineBox(p, carC, vec2(0.110, 0.040), 2.6 * px);
      outline += outlineBox(p, carC + vec2(-0.018, 0.040), vec2(0.060, 0.024), 2.6 * px);
      outline += outlineCircle(p, carC + vec2(-0.055, -0.026), 0.016, 2.6 * px);
      outline += outlineCircle(p, carC + vec2(0.055, -0.026), 0.016, 2.6 * px);
      outline = clamp(outline, 0.0, 1.0);

      vec3 carRed = vec3(0.74, 0.10, 0.12);
      vec3 stripeCol = vec3(0.92, 0.92, 0.95);
      vec3 dark = vec3(0.02, 0.02, 0.03);

      float car = max(max(body, roof), hood);
      col = mix(col, dark, outline * 0.70);
      col = mix(col, carRed, car * 0.92);
      col = mix(col, stripeCol, (stripe + stripe2) * car);
      col = mix(col, dark, (wheel1 + wheel2) * 0.92);
      col = mix(col, dark, window * 0.70);
      col = mix(col, vec3(0.98, 0.96, 0.80), head * 0.35);

      // Headlight beam
      float beam = triBeam(p, carC + vec2(0.085, 0.020), carC + vec2(0.220, 0.060), carC + vec2(0.220, -0.050));
      col += vec3(0.95, 0.92, 0.72) * beam * 0.06;
    }

    // Sunset: beach umbrellas + drinks silhouettes
    if (uVariant == 1) {
      vec2 p = suv;
      float umb = box(p, vec2(0.22, 0.205), vec2(0.070, 0.016));
      float pole = box(p, vec2(0.22, 0.145), vec2(0.005, 0.060));
      float umb2 = box(p, vec2(0.80, 0.205), vec2(0.075, 0.016));
      float pole2 = box(p, vec2(0.80, 0.145), vec2(0.005, 0.060));
      float umb3 = box(p, vec2(0.52, 0.215), vec2(0.060, 0.014));
      float pole3 = box(p, vec2(0.52, 0.150), vec2(0.005, 0.060));
      float table = box(p, vec2(0.34, 0.125), vec2(0.060, 0.010));
      float drink = box(p, vec2(0.32, 0.155), vec2(0.016, 0.028));
      float straw = box(p, vec2(0.330, 0.184), vec2(0.002, 0.014));
      float drink2 = box(p, vec2(0.40, 0.150), vec2(0.014, 0.024));
      float chair =
        box(p, vec2(0.55, 0.120), vec2(0.030, 0.012)) +
        box(p, vec2(0.55, 0.095), vec2(0.030, 0.008));
      float chairLeg =
        box(p, vec2(0.53, 0.070), vec2(0.004, 0.020)) +
        box(p, vec2(0.57, 0.070), vec2(0.004, 0.020));
      float umbrellaOutline = outlineBox(p, vec2(0.22, 0.205), vec2(0.070, 0.016), 2.0 * px) + outlineBox(p, vec2(0.80, 0.205), vec2(0.075, 0.016), 2.0 * px);

      vec3 dark = vec3(0.06, 0.03, 0.05);
      vec3 umbCol = vec3(0.20, 0.08, 0.12);
      col = mix(col, dark, clamp(umbrellaOutline, 0.0, 1.0) * 0.45);
      col = mix(col, umbCol, (umb + umb2 + umb3) * 0.70);
      col = mix(col, dark, (pole + pole2 + pole3) * 0.55);
      col = mix(col, dark, table * 0.55);
      col = mix(col, dark, chair * 0.45);
      col = mix(col, dark, chairLeg * 0.55);
      col = mix(col, vec3(0.92, 0.84, 0.62), (drink + drink2) * 0.28);
      col = mix(col, vec3(0.92, 0.92, 0.95), straw * 0.22);

      // Heat shimmer band near horizon
      float band = smoothstep(horizonY + 0.06, horizonY - 0.02, p.y) * (1.0 - smoothstep(horizonY + 0.16, horizonY + 0.30, p.y));
      float sh = sin(p.x * 28.0 + t * 0.35) * sin(p.y * 22.0 - t * 0.22);
      col += vec3(1.0, 0.62, 0.34) * band * (0.012 + 0.012 * sh);

      // A couple drifting birds near upper sky (ambient)
      vec2 bc = vec2(0.25 + 0.10 * sin(t * 0.05), 0.70 + 0.02 * sin(t * 0.07));
      vec2 bc2 = vec2(0.62 + 0.12 * sin(t * 0.045 + 1.7), 0.62 + 0.02 * sin(t * 0.06 + 2.2));
      float b1 = birdV(p, bc, 0.020);
      float b2 = birdV(p, bc2, 0.018);
      col = mix(col, vec3(0.12, 0.06, 0.10), (b1 + b2) * 0.22);
    }

    // Day: cafe POV table + cup
    if (uVariant == 3) {
      vec2 p = suv;
      float table = smoothstep(0.18, 0.10, p.y);
      col = mix(col, vec3(0.06, 0.05, 0.08), table * 0.22);

      // Table perspective lines (subtle), helps POV depth without extra geometry
      float vp = 0.52;
      float yy = max(0.001, p.y);
      float u = (p.x - vp) / yy;
      float g = abs(fract(u * 0.30) - 0.5);
      float lines = smoothstep(0.48, 0.44, g) * table;
      col = mix(col, vec3(0.10, 0.08, 0.10), lines * 0.06);

      float cup = box(p, vec2(0.58, 0.15), vec2(0.018, 0.020));
      float cupLip = box(p, vec2(0.58, 0.17), vec2(0.020, 0.004));
      float saucer = box(p, vec2(0.58, 0.12), vec2(0.030, 0.006));
      vec3 cupCol = vec3(0.92, 0.90, 0.88);
      col = mix(col, cupCol, cup * 0.28);
      col = mix(col, cupCol, cupLip * 0.22);
      col = mix(col, vec3(0.75, 0.72, 0.70), saucer * 0.20);

      // Awning stripe hint near top
      float aw = smoothstep(0.98, 0.76, p.y);
      float stripes = step(0.5, fract(p.x * 14.0));
      col = mix(col, vec3(0.02, 0.02, 0.03), aw * stripes * 0.05);

      // Window frame (keeps it "cafe POV" while preserving horizon read)
      float frameTop = box(p, vec2(0.50, 0.84), vec2(0.60, 0.035));
      float frameLeft = box(p, vec2(0.10, 0.52), vec2(0.030, 0.45));
      float frameRight = box(p, vec2(0.90, 0.52), vec2(0.030, 0.45));
      float mullion = box(p, vec2(0.52, 0.52), vec2(0.018, 0.40));
      vec3 wood = vec3(0.08, 0.06, 0.06);
      col = mix(col, wood, (frameTop + frameLeft + frameRight + mullion) * 0.55);

      // Soft interior bokeh dots
      vec2 bp = (p - vec2(0.60, 0.52)) * vec2(1.0, 0.9);
      float bd = length(bp);
      float bokeh = smoothstep(0.30, 0.0, bd) * step(0.85, hash(floor(p * vec2(30.0, 18.0))));
      col += vec3(1.0, 0.92, 0.72) * bokeh * 0.06;

      // Coffee steam (tiny pixel wisps)
      float steamMask = smoothstep(0.26, 0.16, p.y) * (1.0 - smoothstep(0.40, 0.58, p.y));
      float steam = noise(vec2(p.x * 22.0 + t * 0.18, p.y * 8.0 - t * 0.10));
      float steamCol = smoothstep(0.72, 0.95, steam);
      float steamX = smoothstep(0.070, 0.010, abs(p.x - 0.58));
      col += vec3(1.0, 0.96, 0.88) * steamCol * steamMask * steamX * 0.05;
    }

    // Subtle vignetting
    vec2 q = suv - 0.5;
    float vig = smoothstep(0.82, 0.2, dot(q, q));
    col *= mix(0.88, 1.0, vig);

    // Retro 32-bit pass: ordered dithering + palette quantization
    float d = (bayer4(pix) - 0.5) * variantDither(uVariant);
    col = quantize(col, variantLevels(uVariant), d);

    // Gentle scanline hint (very subtle, keeps it "retro" not CRT)
    float sl = step(0.5, fract(pix.y * 0.5));
    col *= mix(0.985, 1.0, sl);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function variantToInt(variantId: HorizonCinematicVariantId): number {
  switch (variantId) {
    case "sunrise":
      return 0;
    case "sunset":
      return 1;
    case "night-city":
      return 2;
    default:
      return 3;
  }
}

function pixelSizeForVariant(
  variantId: HorizonCinematicVariantId,
  width: number,
  height: number
): number {
  const minDim = Math.min(width, height);
  const base =
    variantId === "night-city"
      ? 3.6
      : variantId === "sunset"
        ? 3.2
        : variantId === "sunrise"
          ? 3.0
          : 3.1;

  if (minDim <= 520) return Math.max(2.6, base - 0.6);
  if (minDim >= 1200) return base + 0.4;
  return base;
}

function CinematicQuad({ variantId, active }: HorizonCinematicCanvasProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size, invalidate } = useThree();

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uVariant: { value: 0 },
      uPixelSize: { value: 3.0 },
    };
  }, []);

  useEffect(() => {
    uniforms.uVariant.value = variantToInt(variantId);
    uniforms.uRes.value.set(size.width, size.height);
    uniforms.uPixelSize.value = pixelSizeForVariant(variantId, size.width, size.height);
    invalidate();
  }, [uniforms, variantId, size.width, size.height, invalidate]);

  useFrame((_, delta) => {
    if (!active) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    uniforms.uTime.value += delta;
    invalidate();
  });

  return (
    <mesh
      ref={meshRef}
      frustumCulled={false}
    >
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
        transparent
      />
    </mesh>
  );
}

export default function HorizonCinematicCanvas({ variantId, active }: HorizonCinematicCanvasProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[0.6, 0.85]}
      gl={{
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 1], fov: 50, near: 0.1, far: 10 }}
      style={{ width: "100%", height: "100%", imageRendering: "pixelated" }}
    >
      <CinematicQuad
        variantId={variantId}
        active={active}
      />
    </Canvas>
  );
}
