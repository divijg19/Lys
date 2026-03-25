// Shared pixel-art utilities: Bayer dithering, palette quantization, scanlines
export const pixelDitherUtils = /* glsl */ `
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }

  float bayer4(vec2 ip) {
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

  vec3 quantize(vec3 col, float levels, float dither) {
    vec3 q = floor(col * levels + dither) / levels;
    return clamp(q, 0.0, 1.0);
  }

  vec3 applyPixelArt(vec3 color, vec2 pixelCoord, float levels, float ditherStrength) {
    float d = (bayer4(pixelCoord) - 0.5) * ditherStrength;
    color = quantize(color, levels, d);
    
    // Subtle scanlines
    float sl = step(0.5, fract(pixelCoord.y * 0.5));
    color *= mix(0.985, 1.0, sl);
    
    return color;
  }
`;
