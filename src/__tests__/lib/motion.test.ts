/**
 * @file: src/__tests__/lib/motion.test.ts
 * @description: Easing that does not depend on the display's refresh rate.
 *
 * A lerp of `0.05` per frame covers half the distance in fourteen frames: 230 ms at 60 Hz, 97 ms
 * at 144 Hz. The same code, the same seconds, a different result -- and the visitor on the
 * faster display gets a different experience from the one on the slower.
 *
 * The property that was missing: after one second, the position is the same however many frames
 * that second was divided into.
 */

import { describe, expect, it } from "vitest";
import { frameRateIndependentFactor } from "@/lib/motion";

/** Run a lerp for `seconds`, in frames of `fps`, and return how far it got. */
const travel = (base: number, seconds: number, fps: number): number => {
  const delta = 1 / fps;
  // An exact step count: accumulating a float until it passes the end would run one step short
  // or long on some frame rates, which is the kind of off-by-one this test exists to catch.
  const steps = Math.round(seconds * fps);
  let position = 0;
  for (let step = 0; step < steps; step++) {
    position += (1 - position) * frameRateIndependentFactor(base, delta);
  }
  return position;
};

describe("frameRateIndependentFactor", () => {
  it("covers the same distance in the same time at any frame rate", () => {
    for (const base of [0.05, 0.1, 0.2]) {
      const at60 = travel(base, 1, 60);
      const at120 = travel(base, 1, 120);
      const at144 = travel(base, 1, 144);

      expect(at120).toBeCloseTo(at60, 4);
      expect(at144).toBeCloseTo(at60, 4);
    }
  });

  it("matches the plain per-frame factor at 60 Hz", () => {
    // The tuning constants are written against 60 Hz, so that is where the factor must be the
    // number they say it is.
    expect(frameRateIndependentFactor(0.1, 1 / 60)).toBeCloseTo(0.1, 6);
    expect(frameRateIndependentFactor(0.05, 1 / 60)).toBeCloseTo(0.05, 6);
  });

  it("moves further on a long frame than on a short one", () => {
    const short = frameRateIndependentFactor(0.1, 1 / 240);
    const long = frameRateIndependentFactor(0.1, 1 / 30);

    expect(long).toBeGreaterThan(short);
  });

  it("does not move at all on a frame that took no time", () => {
    expect(frameRateIndependentFactor(0.1, 0)).toBe(0);
    expect(frameRateIndependentFactor(0.1, Number.NaN)).toBe(0);
  });

  it("never overshoots", () => {
    for (const delta of [1 / 240, 1 / 60, 1 / 30, 1]) {
      const factor = frameRateIndependentFactor(0.1, delta);
      expect(factor).toBeGreaterThan(0);
      expect(factor).toBeLessThanOrEqual(1);
    }
  });
});
