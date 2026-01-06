import { pixelDitherUtils } from "./pixelDither.glsl";

export const moonbeamVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const moonbeamFragment = /* glsl */ `
  ${pixelDitherUtils}
  
  precision highp float;
  varying vec2 vUv;
  
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uPixelSize;
  uniform vec2 uMoonPos;
  uniform vec3 uBeamColor;
  
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
    
    // Volumetric beam from moon
    vec2 toMoon = uMoonPos - puv;
    float angle = atan(toMoon.y, toMoon.x);
    float dist = length(toMoon);
    
    // Beam cone
    float cone = exp(-abs(angle - 1.57) * 8.0) * smoothstep(1.2, 0.2, dist);
    
    // Volumetric haze
    float haze = fbm(puv * vec2(3.0, 1.6) + vec2(uTime * 0.025, 0.0));
    cone *= mix(0.6, 1.0, haze);
    
    // Sparkle specks
    float sparkle = step(0.995, hash(pix + vec2(13.0, 7.0)));
    cone += sparkle * 0.3;
    
    vec3 color = uBeamColor * cone;
    float alpha = cone * 0.4;
    
    gl_FragColor = vec4(color, alpha);
  }
`;
