import { pixelDitherUtils } from "./pixelDither.glsl";

export const fogLayerVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fogLayerFragment = /* glsl */ `
  ${pixelDitherUtils}
  
  precision highp float;
  varying vec2 vUv;
  
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uPixelSize;
  uniform vec3 uFogColor;
  uniform float uDensity;
  uniform float uDriftSpeed;
  
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
      p *= 2.2;
      a *= 0.5;
    }
    return v;
  }
  
  void main() {
    vec2 pix = floor(vUv * uResolution / max(1.0, uPixelSize));
    vec2 puv = (pix * max(1.0, uPixelSize)) / uResolution;
    
    // Drifting fog
    vec2 drift = vec2(uTime * uDriftSpeed, uTime * uDriftSpeed * 0.5);
    float fog = fbm((puv + drift) * vec2(2.0, 1.5));
    
    // Mask to middle region
    float mask = smoothstep(0.2, 0.5, puv.y) * (1.0 - smoothstep(0.6, 0.9, puv.y));
    
    float alpha = fog * mask * uDensity;
    vec3 color = uFogColor;
    
    gl_FragColor = vec4(color, alpha);
  }
`;
