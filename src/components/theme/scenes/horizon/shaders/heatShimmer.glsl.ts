import { pixelDitherUtils } from "./pixelDither.glsl";

export const heatShimmerVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const heatShimmerFragment = /* glsl */ `
  ${pixelDitherUtils}
  
  precision highp float;
  varying vec2 vUv;
  
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uPixelSize;
  uniform float uIntensity;
  
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
  
  void main() {
    vec2 pix = floor(vUv * uResolution / max(1.0, uPixelSize));
    vec2 puv = (pix * max(1.0, uPixelSize)) / uResolution;
    
    // Heat distortion waves
    float wave1 = noise(puv * vec2(8.0, 3.0) + vec2(0.0, uTime * 1.5));
    float wave2 = noise(puv * vec2(12.0, 4.0) - vec2(0.0, uTime * 1.2));
    
    float distortion = (wave1 + wave2) * 0.5;
    
    // Mask to horizon region
    float mask = smoothstep(0.25, 0.4, puv.y) * (1.0 - smoothstep(0.45, 0.65, puv.y));
    
    float alpha = distortion * mask * uIntensity * 0.15;
    vec3 color = vec3(1.0, 0.9, 0.7);
    
    gl_FragColor = vec4(color, alpha);
  }
`;
