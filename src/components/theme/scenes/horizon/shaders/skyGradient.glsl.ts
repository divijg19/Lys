import { pixelDitherUtils } from "./pixelDither.glsl";

export const skyGradientVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const skyGradientFragment = /* glsl */ `
  ${pixelDitherUtils}
  
  precision highp float;
  varying vec2 vUv;
  
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uPixelSize;
  uniform int uVariant; // 0: sunrise, 1: sunset, 2: night, 3: day
  
  vec3 skyGradient(float y, vec3 a, vec3 b, vec3 c) {
    float t1 = smoothstep(0.0, 0.65, y);
    float t2 = smoothstep(0.35, 1.0, y);
    vec3 mid = mix(a, b, t1);
    return mix(mid, c, t2);
  }
  
  void main() {
    vec2 pix = floor(vUv * uResolution / max(1.0, uPixelSize));
    vec2 puv = (pix * max(1.0, uPixelSize)) / uResolution;
    
    vec3 a, b, c;
    float levels, ditherStr;
    
    if (uVariant == 0) {
      // Sunrise
      a = vec3(0.96, 0.52, 0.22);
      b = vec3(0.98, 0.74, 0.42);
      c = vec3(0.78, 0.88, 0.96);
      levels = 18.0;
      ditherStr = 0.75;
    } else if (uVariant == 1) {
      // Sunset
      a = vec3(0.74, 0.18, 0.18);
      b = vec3(0.98, 0.55, 0.28);
      c = vec3(0.22, 0.10, 0.24);
      levels = 16.0;
      ditherStr = 0.85;
    } else if (uVariant == 2) {
      // Night
      a = vec3(0.05, 0.04, 0.08);
      b = vec3(0.10, 0.08, 0.18);
      c = vec3(0.26, 0.18, 0.36);
      levels = 14.0;
      ditherStr = 0.95;
    } else {
      // Day
      a = vec3(0.92, 0.62, 0.30);
      b = vec3(0.52, 0.28, 0.60);
      c = vec3(0.03, 0.04, 0.08);
      levels = 15.0;
      ditherStr = 0.80;
    }
    
    vec3 color = skyGradient(puv.y, a, b, c);
    color = color / (color + vec3(0.85)); // Filmic tone
    
    // Apply pixel-art style
    color = applyPixelArt(color, pix, levels, ditherStr);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
