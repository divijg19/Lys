import { pixelDitherUtils } from "./pixelDither.glsl";

export const mountainLayerVertex = /* glsl */ `
  varying vec2 vUv;
  uniform float uParallax;
  uniform float uTime;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.x += sin(uTime * 0.05) * uParallax * 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const mountainLayerFragment = /* glsl */ `
  ${pixelDitherUtils}
  
  precision highp float;
  varying vec2 vUv;
  
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uPixelSize;
  uniform vec3 uMountainColor;
  uniform vec3 uRimColor;
  uniform float uRoughness;
  
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
    
    // Mountain profile
    float profile = 0.5 + uRoughness * fbm(vec2(puv.x * 3.0, 0.0));
    float mountain = step(puv.y, profile);
    
    // Rim lighting on top edge
    float rim = smoothstep(profile + 0.02, profile - 0.005, puv.y) * 
                smoothstep(profile - 0.04, profile + 0.02, puv.y);
    
    vec3 color = uMountainColor * mountain;
    color += uRimColor * rim * 0.4;
    
    // Pixel-art style
    color = applyPixelArt(color, pix, 16.0, 0.80);
    
    float alpha = mountain;
    gl_FragColor = vec4(color, alpha);
  }
`;
