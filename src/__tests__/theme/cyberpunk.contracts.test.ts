/**
 * @file: src/__tests__/theme/cyberpunk.contracts.test.ts
 * @description: The contracts the cyberpunk scene's code has to keep.
 *
 * The scene is WebGL, and jsdom has no WebGL context, so none of this can be rendered in a
 * test. What can be asserted is the source itself -- the same approach the stylesheet contract
 * test takes, and the same reason: these are the mistakes that no unit test and no screenshot
 * would ever show.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SRC = path.resolve(process.cwd(), "src");

/**
 * The source of a file, with its comments removed.
 *
 * The comments in these files quote the patterns they replaced -- that is how the defects are
 * explained to the next reader -- so the assertions have to look at the code alone.
 */
const read = (relative: string): string =>
  readFileSync(path.join(SRC, relative), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

const CITY = read("components/theme/effects/cyberpunk/CitySilhouette.tsx");
const RAIN = read("hooks/useDataRain.ts");
const CAMERA_RIG = read("components/theme/effects/light/CameraRig.tsx");

describe("the cyberpunk neon", () => {
  it("modulates the authored intensity instead of replacing it", () => {
    // The defect: `pulse * (mat.emissiveIntensity ? 1 : 1)` is `pulse * 1`, so the authored
    // 2.0-2.5 was overwritten by a value between 0.7 and 1.3.
    expect(CITY).not.toMatch(/emissiveIntensity \? 1 : 1/);
    expect(CITY).toMatch(/neonRegistry\.apply\(pulse\)/);
  });

  it("keeps the signs in a registry that can forget them", () => {
    // A ref callback cannot: it is called with `null` on unmount, and `null` says nothing about
    // which sign left. So the sign hands the unregister back to whoever registered it.
    expect(CITY).toMatch(/return registerNeon\(material\)/);
    expect(CITY).not.toMatch(/neonMaterialsRef\.current\.push\(/);
  });
});

describe("the cyberpunk camera", () => {
  it("walks at the same speed on every display", () => {
    // A factor of 0.1 per frame covers the same ground in the same time at 60 Hz and at 144 Hz
    // only by accident.
    expect(CITY).toMatch(/frameRateIndependentFactor\(0\.1, delta\)/);
    expect(CITY).not.toMatch(
      /camera\.position\.z \+= \(clampedTargetZ - camera\.position\.z\) \* 0\.1/
    );
  });

  it("does the same in the light theme's camera rig", () => {
    expect(CAMERA_RIG).toMatch(/frameRateIndependentFactor\(0\.05, delta\)/);
  });
});

describe("the cyberpunk canvases", () => {
  it("does not ask for the software rasteriser", () => {
    // `willReadFrequently` tells the browser the canvas will be read back; Chrome answers by
    // moving it to the software rasteriser, which is slower for drawing.
    expect(RAIN).not.toMatch(/willReadFrequently/);
  });

  it("sizes the rain to its own box, not to the window", () => {
    // The rear layer is only visible in the top band of the screen. Sized to the window and
    // clipped, it allocates and clears a full viewport every frame.
    expect(RAIN).toMatch(/measureCanvas\(canvas/);
    expect(RAIN).not.toMatch(/cssWidth = window\.innerWidth/);
  });

  it("moves the lightning with the canvas when it is resized", () => {
    expect(CITY).toMatch(/rescalePoints\(bolt\.path/);
  });
});

describe("the cyberpunk scene", () => {
  it("asks for no shadows it cannot have", () => {
    // No light in the scene casts one, and the canvas does not enable shadow maps, so the flags
    // asked for a shadow that could never be drawn.
    expect(CITY).not.toMatch(/castShadow/);
    expect(CITY).not.toMatch(/receiveShadow/);
  });
});
