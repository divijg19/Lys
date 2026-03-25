import { pixelDitherUtils } from "./pixelDither.glsl";

export const cliffSilhouetteVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const cliffSilhouetteFragment = /* glsl */ `
  ${pixelDitherUtils}
  
  precision highp float;
  varying vec2 vUv;
  
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uPixelSize;
  uniform vec3 uCliffColor;
  uniform vec3 uRimColor;
  
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
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }
  
  void main() {
    vec2 pix = floor(vUv * uResolution / max(1.0, uPixelSize));
    vec2 puv = (pix * max(1.0, uPixelSize)) / uResolution;
    
    // Cliff edge profile (left and right edges)
    float leftEdge = smoothstep(0.08, 0.18, puv.x);
    float rightEdge = smoothstep(0.92, 0.82, puv.x);
    float cliffMask = leftEdge * rightEdge;
    
    // Rocky texture
    float rock = fbm(puv * 12.0);
    float cliff = step(puv.y, 0.5 + rock * 0.15) * cliffMask;
    
    // Rim lighting on top edge
    float rim = smoothstep(0.5 + rock * 0.15 + 0.02, 0.5 + rock * 0.15 - 0.01, puv.y) *
                smoothstep(0.5 + rock * 0.15 - 0.05, 0.5 + rock * 0.15 + 0.02, puv.y) *
                cliffMask;
    
    vec3 color = uCliffColor * cliff;
    color += uRimColor * rim * 0.5;
    
    // Pixel-art style
    color = applyPixelArt(color, pix, 16.0, 0.85);
    
    float alpha = cliff;
    gl_FragColor = vec4(color, alpha);
  }
`;
