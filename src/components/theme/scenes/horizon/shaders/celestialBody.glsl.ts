import { pixelDitherUtils } from "./pixelDither.glsl";

export const celestialBodyVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const celestialBodyFragment = /* glsl */ `
  ${pixelDitherUtils}
  
  precision highp float;
  varying vec2 vUv;
  
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uPixelSize;
  uniform vec2 uPosition; // normalized position
  uniform float uRadius;
  uniform vec3 uBodyColor;
  uniform vec3 uGlowColor;
  uniform bool uIsMoon;
  uniform int uRayCount;
  
  float circle(vec2 p, vec2 c, float r) {
    return smoothstep(r + 0.01, r - 0.01, length(p - c));
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
  
  void main() {
    vec2 pix = floor(vUv * uResolution / max(1.0, uPixelSize));
    vec2 puv = (pix * max(1.0, uPixelSize)) / uResolution;
    
    // Body disc
    float body = circle(puv, uPosition, uRadius);
    
    vec3 color = uBodyColor * body;
    float alpha = body;
    
    // Volumetric glow
    float dist = length(puv - uPosition);
    float glow = exp(-dist * 3.0 / uRadius) * 0.3;
    color += uGlowColor * glow;
    alpha = max(alpha, glow * 0.5);
    
    // Rays for sun
    if (uRayCount > 0) {
      vec2 dir = puv - uPosition;
      float angle = atan(dir.y, dir.x);
      float rays = 0.0;
      for (int i = 0; i < 16; i++) {
        if (i >= uRayCount) break;
        float rayAngle = float(i) * 6.28318 / float(uRayCount) + uTime * 0.05;
        float rayDiff = abs(mod(angle - rayAngle + 3.14159, 6.28318) - 3.14159);
        float ray = exp(-rayDiff * 20.0) * smoothstep(uRadius * 3.0, uRadius, dist);
        rays += ray;
      }
      color += uGlowColor * rays * 0.2;
      alpha = max(alpha, rays * 0.15);
    }
    
    // Moon crater texture
    if (uIsMoon && body > 0.5) {
      float crater = noise(puv * 80.0);
      color *= mix(0.85, 1.0, crater);
    }
    
    // Pixel-art style
    color = applyPixelArt(color, pix, 16.0, 0.80);
    
    gl_FragColor = vec4(color, alpha);
  }
`;
