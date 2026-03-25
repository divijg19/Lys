import { pixelDitherUtils } from "./pixelDither.glsl";

export const citySilhouetteVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const citySilhouetteFragment = /* glsl */ `
  ${pixelDitherUtils}
  
  precision highp float;
  varying vec2 vUv;
  
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uPixelSize;
  uniform vec3 uBuildingColor;
  uniform vec3 uWindowColor;
  uniform vec3 uGlowColor;
  uniform float uDensity;
  
  float box(vec2 p, vec2 c, vec2 s) {
    vec2 d = abs(p - c) - s;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  }
  
  void main() {
    vec2 pix = floor(vUv * uResolution / max(1.0, uPixelSize));
    vec2 puv = (pix * max(1.0, uPixelSize)) / uResolution;
    
    vec3 color = vec3(0.0);
    float alpha = 0.0;
    
    // Procedural buildings
    for (float i = 0.0; i < 20.0; i++) {
      if (i >= uDensity * 20.0) break;
      
      float x = hash(vec2(i, 0.0));
      float w = hash(vec2(i, 1.0)) * 0.08 + 0.04;
      float h = hash(vec2(i, 2.0)) * 0.35 + 0.15;
      
      vec2 buildingPos = vec2(x, 0.33 - h * 0.5);
      vec2 buildingSize = vec2(w, h);
      
      float building = step(box(puv, buildingPos, buildingSize), 0.0);
      
      // Windows
      vec2 windowGrid = mod((puv - buildingPos + buildingSize) * vec2(40.0, 60.0), vec2(1.0));
      float window = step(0.3, windowGrid.x) * step(windowGrid.x, 0.7) *
                     step(0.3, windowGrid.y) * step(windowGrid.y, 0.7);
      float flicker = step(0.85, hash(vec2(i, floor(uTime * 0.5))));
      
      color += uBuildingColor * building;
      color += uWindowColor * window * building * flicker;
      alpha = max(alpha, building);
    }
    
    // City glow at base
    float glow = exp(-abs(puv.y - 0.33) * 15.0) * 0.2;
    color += uGlowColor * glow;
    alpha = max(alpha, glow);
    
    // Pixel-art style
    color = applyPixelArt(color, pix, 14.0, 0.90);
    
    gl_FragColor = vec4(color, alpha);
  }
`;
