/**
 * @file: src/__tests__/theme/ethereal.effects.test.ts
 * @description: Guards the ethereal scene's effect lifecycle.
 *
 * ## The defect this file is about
 *
 * The ethereal scene's ripples and wisps were spawned from DOM pointer events and aged against
 * `@react-three/fiber`'s clock inside `useFrame`. The two clocks have different origins -- a
 * `timeStamp` counts from the page's time origin, `clock.getElapsedTime()` counts from the moment
 * the canvas mounted -- and the canvas always mounts after the page does. The age therefore came
 * out *negative*, which meant:
 *
 * - the ripple's radius and the wisp's opacity were driven negative, so both were invisible;
 * - `onComplete` never fired, so neither was ever removed;
 * - every click added another mesh, material and draw call that stayed for the lifetime of the
 *   session.
 *
 * The effect is decorative and was therefore invisible in every screenshot, while the state leak
 * was invisible in every test.
 *
 * ## Why this is asserted at the source level
 *
 * jsdom has no WebGL context, so the scene itself cannot be rendered in a test. What *can* be
 * asserted is the contract that made the bug possible: the creation time and the age must come
 * from the same clock. That is a property of the source, so it is asserted against the source --
 * the same approach the stylesheet contract test uses.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { rippleUniforms } from "@/components/theme/effects/ethereal/Ripples";
import { wispOpacity } from "@/components/theme/effects/ethereal/Wisps";
import { effectProgress } from "@/lib/effectsLifetime";

const SRC = path.resolve(process.cwd(), "src");

/**
 * The source of a file, with its comments removed.
 *
 * The comments in these files name the very patterns the tests below forbid -- that is how the
 * defects are explained to the next reader -- so the assertions have to look at the code alone.
 */
const read = (relative: string): string =>
  readFileSync(path.join(SRC, relative), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

const ETHEREAL_SCENE = read("components/theme/scenes/EtherealScene.tsx");
const RIPPLES = read("components/theme/effects/ethereal/Ripples.tsx");
const WISPS = read("components/theme/effects/ethereal/Wisps.tsx");

describe("the effect uniforms", () => {
  it("draws a ripple that grows and fades", () => {
    // A ripple that starts invisible and reaches the edge of the plane.
    const start = rippleUniforms(0);
    const middle = rippleUniforms(0.5);
    const end = rippleUniforms(1);

    expect(start.uRadius).toBe(0);
    expect(middle.uRadius).toBeCloseTo(1, 5);
    expect(end.uRadius).toBeCloseTo(2, 5);

    // The ring has to read against a near-white field, so it is drawn more strongly than the
    // plane it sits in front of.
    expect(start.uOpacity).toBeCloseTo(0.4, 5);
    expect(middle.uOpacity).toBeCloseTo(0.2, 5);
    expect(end.uOpacity).toBeCloseTo(0, 5);
  });

  it("never draws a ripple with a negative radius or opacity", () => {
    // The symptom of the mismatched clocks: a negative progress gave the ring a negative radius
    // and a negative opacity, which is why the ripples were invisible.
    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      const { uRadius, uOpacity } = rippleUniforms(progress);
      expect(uRadius).toBeGreaterThanOrEqual(0);
      expect(uOpacity).toBeGreaterThanOrEqual(0);
    }
  });

  it("draws wisps that fade out over their life", () => {
    expect(wispOpacity(0)).toBeCloseTo(0.55, 5);
    expect(wispOpacity(0.5)).toBeCloseTo(0.55 * 0.75, 5);
    expect(wispOpacity(1)).toBeCloseTo(0, 5);
  });
});

describe("effectProgress", () => {
  it("reports a fresh effect as not yet complete", () => {
    expect(effectProgress(10, 10, 1.5)).toEqual({ complete: false, progress: 0 });
  });

  it("reports half a life as half progress", () => {
    const { complete, progress } = effectProgress(10.75, 10, 1.5);
    expect(complete).toBe(false);
    expect(progress).toBeCloseTo(0.5, 5);
  });

  it("completes an effect once its lifespan has passed", () => {
    expect(effectProgress(12, 10, 1.5)).toEqual({ complete: true, progress: 1 });
  });

  it("never reports a negative progress, whatever the age", () => {
    // A negative age is what the mismatched clocks produced. The progress must not go negative,
    // or the shader uniforms that are scaled by it (radius, opacity) invert.
    const { complete, progress } = effectProgress(4.2, 1000.5, 1.5);
    expect(progress).toBe(0);
    expect(complete).toBe(false);
  });
});

describe("ethereal scene: one clock for the whole effect lifecycle", () => {
  it("does not derive the creation time from a DOM event timestamp", () => {
    // `event.nativeEvent.timeStamp` is the origin mismatch. It is counted from the page's time
    // origin, not from the render clock that ages the effect.
    expect(ETHEREAL_SCENE).not.toMatch(/nativeEvent\.timeStamp/);
  });

  it("records the creation time from the render clock", () => {
    // Every creation time, not just the first: the scene spawns two kinds of effect, and one of
    // them being on a different clock is enough to break the lifecycle.
    const creationTimes = [...ETHEREAL_SCENE.matchAll(/creationTime:\s*([^,\n]+)/g)].map((match) =>
      match[1].trim()
    );

    expect(creationTimes.length).toBeGreaterThan(0);
    for (const value of creationTimes) {
      expect(value, "a creation time is not taken from the scene's clock").toBe(
        "clock.elapsedTime"
      );
    }
  });

  it("ages the effects against the same accumulator", () => {
    for (const source of [RIPPLES, WISPS]) {
      expect(source).toMatch(/clock\.elapsedTime/);
      // `getElapsedTime()` advances the clock as a side effect of reading it, which makes the
      // two ends of the comparison drift apart.
      expect(source).not.toMatch(/getElapsedTime\(\)/);
    }
  });

  it("gives every effect a unique id that does not depend on clock resolution", () => {
    // `performance.now()` has millisecond resolution: two clicks in the same millisecond produced
    // the same React key.
    expect(ETHEREAL_SCENE).not.toMatch(/id:\s*performance\.now\(\)/);
    expect(ETHEREAL_SCENE).toMatch(/nextId\.current\+\+/);
  });
});

describe("ethereal scene: the palette reaches the GPU", () => {
  it("does not hand a CSS-variable colour string to three.js", () => {
    /*
     * `color="hsl(var(--primary))"` is not a colour three.js can parse: it does not resolve CSS
     * variables. Nor is `hsl(250 82% 72%)` -- its HSL parser only reads the comma separated form.
     *
     * Only the `color` prop is checked. The scenes' inline `style` attributes use the same
     * `hsl(var(--token))` syntax, and there it is ordinary CSS that the browser resolves.
     *
     * The light theme still passes `hsl(var(--foreground))` to three.js. It is left as it is: the
     * parsed colour is a near-black, and rendering the starfield, the shuttle, the debris shards
     * and the supernova in it instead of white changes what the default theme looks like. That
     * is a design decision, not a fix, and it is recorded as such.
     */
    for (const source of [ETHEREAL_SCENE, RIPPLES, WISPS]) {
      expect(source).not.toMatch(/color="hsl\(/);
      expect(source).not.toMatch(/color=\{"hsl\(/);
    }
  });

  it("reads the theme colours through the shared converter", () => {
    expect(ETHEREAL_SCENE).toMatch(/cssVarToThreeColor\("--primary"\)/);
    expect(ETHEREAL_SCENE).toMatch(/cssVarToThreeColor\("--secondary"\)/);
    expect(ETHEREAL_SCENE).toMatch(/cssVarToThreeColor\("--accent"\)/);
  });
});

describe("ethereal scene: the effect lands under the pointer", () => {
  it("places the effect on the surface that faces the camera", () => {
    /*
     * The effect used to be placed on the scene's floor plane -- tens of units away, seen at a
     * grazing angle, where the ring came out as a thin pale ellipse in the lower part of the
     * screen. It was drawn, and invisible.
     */
    expect(ETHEREAL_SCENE).toMatch(/pointOnCameraSurface\(/);
    expect(ETHEREAL_SCENE).toMatch(/setRipples\(/);
  });

  it("keeps the floor for the wave that spreads away", () => {
    expect(ETHEREAL_SCENE).toMatch(/pointOnFloor\(/);
    expect(ETHEREAL_SCENE).toMatch(/setLastPlaneClick\(/);
  });
});

describe("ethereal scene: the interaction is reachable", () => {
  it("reads the pointer from the window, not from the canvas", () => {
    /*
     * The scene is a background layer at `-z-50`, behind the page content, so a pointer never
     * reaches the canvas: the canvas was the hit target at 0 of 544 sampled points across the
     * whole page. The effects were not merely broken, they were unreachable.
     */
    expect(ETHEREAL_SCENE).toMatch(/window\.addEventListener\("pointerdown"/);
    expect(ETHEREAL_SCENE).toMatch(/window\.addEventListener\("contextmenu"/);
  });

  it("does not take the pointer away from the page's own controls", () => {
    expect(ETHEREAL_SCENE).toMatch(/closest\("a, button, input, textarea, select/);
  });

  it("raises a ripple on a click and lifts wisps on a right click", () => {
    expect(ETHEREAL_SCENE).toMatch(/setRipples\(/);
    expect(ETHEREAL_SCENE).toMatch(/setWisps\(/);
  });

  it("leaves the browser's context menu alone", () => {
    // The old handler called `preventDefault()` on a canvas that could only be reached by
    // clicking the background. From the window that would take the menu away from the whole
    // page, so it no longer does.
    expect(ETHEREAL_SCENE).not.toMatch(/preventDefault/);
  });
});

describe("ethereal scene: GPU resources are released", () => {
  it("disposes the materials it builds itself", () => {
    // A material created with `new ShaderMaterial()` is not owned by react-three-fiber, so it is
    // not disposed when the component unmounts. Each ripple and each theme change used to leave
    // a shader program behind.
    expect(RIPPLES).toMatch(/material\.dispose\(\)/);
    expect(read("components/theme/effects/FlowingPlane.tsx")).toMatch(/material\.dispose\(\)/);
  });
});
