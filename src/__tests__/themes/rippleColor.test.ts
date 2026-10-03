import { describe, expect, it } from "vitest";
import {
  RIPPLE_RING_LIGHTNESS,
  RIPPLE_RING_SATURATION,
  saturateColor,
} from "@/components/theme/effects/ethereal/Ripples";

/**
 * Ethereal's palette is deliberately pastel, which is exactly why a ripple drawn in the
 * token's own colour was invisible on a near-white background. saturateColor() holds the
 * hue and moves saturation and lightness, so the ring reads as colour without
 * abandoning the theme's identity.
 */
describe("saturateColor", () => {
  it("keeps the hue and replaces saturation and lightness", () => {
    // Ethereal --primary is hsl(250 82% 72%).
    expect(saturateColor("hsl(250 82% 72%)")).toBe("hsl(250 72% 44%)");
  });

  it("preserves hue across a range of inputs", () => {
    for (const hue of [0, 45, 120, 190, 250, 325]) {
      const out = saturateColor(`hsl(${hue} 60% 70%)`);
      const parsed = /hsl\((\d+)/.exec(out);
      expect(parsed, `hue ${hue}`).not.toBeNull();
      // Hues round to whole degrees, so allow a degree of slack.
      expect(Math.abs(Number(parsed?.[1]) - hue)).toBeLessThanOrEqual(1);
    }
  });

  it("honours explicit overrides", () => {
    expect(saturateColor("hsl(250 82% 72%)", 0.5, 0.3)).toBe("hsl(250 50% 30%)");
  });

  it("produces a genuinely darker, more saturated result than the pastel input", () => {
    const out = saturateColor("hsl(250 82% 72%)");
    // Anchor on the third component: a bare /(\d+)%/ would capture the saturation instead.
    const saturation = Number(/hsl\(\d+ (\d+)%/.exec(out)?.[1]) / 100;
    const lightness = Number(/hsl\(\d+ \d+% (\d+)%/.exec(out)?.[1]) / 100;
    expect(saturation).toBeCloseTo(RIPPLE_RING_SATURATION, 6);
    expect(lightness).toBeCloseTo(RIPPLE_RING_LIGHTNESS, 6);
    expect(lightness).toBeLessThan(0.72);
  });

  it("passes empty input straight through", () => {
    // Tokens resolve to an empty string before the first effect tick; feeding that to the
    // renderer should be a no-op rather than a crash.
    expect(saturateColor("")).toBe("");
  });

  it("handles an unparseable value without throwing", () => {
    expect(() => saturateColor("not-a-colour")).not.toThrow();
  });
});
