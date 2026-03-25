import { pixelDitherUtils } from "./pixelDither.glsl";

export const oceanWavesVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const oceanWavesFragment = /* glsl */ `
  ${pixelDitherUtils}
  
  precision highp float;
  varying vec2 vUv;
  
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uPixelSize;
  uniform vec3 uWaterColor;
  uniform vec3 uGlowColor;
  uniform float uWaveSpeed;
  
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
    
    // Animated waves
    float wave1 = sin(puv.x * 8.0 + uTime * uWaveSpeed);
    float wave2 = sin(puv.x * 12.0 - uTime * uWaveSpeed * 0.7);
    float waves = (wave1 + wave2) * 0.5;
    
    // Foam crests
    float foam = smoothstep(0.85, 1.0, waves);
    float streak = smoothstep(0.7, 0.95, waves);
    
    // Distance fade
    float distanceMask = smoothstep(0.2, 0.8, puv.y);
    
    vec3 color = uWaterColor;
    color += uGlowColor * streak * 0.15 * distanceMask;
    color += vec3(1.0, 0.9, 0.8) * foam * 0.3;
    
    // Pixel-art style
    color = applyPixelArt(color, pix, 16.0, 0.85);
    
    // Vertical gradient overlay
    color *= mix(0.7, 1.0, puv.y);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
