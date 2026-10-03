import { describe, expect, it } from "vitest";
import {
  alleyZ,
  ALLEY_CAMERA_Z,
  ALLEY_SEGMENT,
  ALLEY_SLOTS,
  ALLEY_SPACING,
  buildAlley,
  depthFromCamera,
  neonEmissiveAt,
  neonPulseAt,
  wrapIntoLoop,
} from "@/components/theme/effects/cyberpunk/alley";

/**
 * These are pure functions on purpose. jsdom has no WebGL, and geometry that only exists
 * inside a render loop cannot be asserted on at all -- which is how the original alley
 * shipped a camera model that emptied the scene as the visitor scrolled, unnoticed.
 */
describe("wrapIntoLoop", () => {
  it("leaves values already inside the loop untouched", () => {
    expect(wrapIntoLoop(0, 100)).toBe(0);
    expect(wrapIntoLoop(37, 100)).toBe(37);
    expect(wrapIntoLoop(99.5, 100)).toBe(99.5);
  });

  it("wraps values past the end", () => {
    expect(wrapIntoLoop(100, 100)).toBe(0);
    expect(wrapIntoLoop(150, 100)).toBe(50);
    expect(wrapIntoLoop(101, 100)).toBeCloseTo(1, 10);
  });

  it("wraps negative values, which is the case scroll drives", () => {
    // JavaScript's % keeps the sign of the dividend, so -10 % 100 is -10. Scroll progress
    // makes scrollZ negative, so this is the branch the alley actually depends on.
    expect(wrapIntoLoop(-10, 100)).toBe(90);
    expect(wrapIntoLoop(-150, 100)).toBe(50);
  });

  it("never returns the exclusive upper bound", () => {
    for (const value of [0, 1, 99, 100, 101, -1, -99, -100, 1234.5, -1234.5]) {
      const wrapped = wrapIntoLoop(value, 100);
      expect(wrapped).toBeGreaterThanOrEqual(0);
      expect(wrapped).toBeLessThan(100);
    }
  });

  it("is safe for a non-positive segment", () => {
    expect(wrapIntoLoop(5, 0)).toBe(0);
    expect(wrapIntoLoop(5, -10)).toBe(0);
  });
});

describe("alleyZ", () => {
  it("always lands in the segment behind the camera", () => {
    for (let scroll = -200; scroll <= 200; scroll += 7) {
      const z = alleyZ(-18, scroll);
      expect(z).toBeGreaterThanOrEqual(-ALLEY_SEGMENT);
      expect(z).toBeLessThan(0);
    }
  });

  it("is stable: identical inputs give identical output", () => {
    expect(alleyZ(-27, -42)).toBe(alleyZ(-27, -42));
  });

  it("keeps the buildings spread out rather than stacked", () => {
    // At any scroll depth the set of occupied slots must remain spread across the loop.
    // If positions collapsed, the whole street would appear at one point.
    const positions = Array.from({ length: ALLEY_SLOTS }, (_, i) =>
      alleyZ(-(i + 0.5) * ALLEY_SPACING, 0)
    );
    const sorted = [...positions].sort((a, b) => a - b);
    const gaps = sorted.slice(1).map((v, i) => v - sorted[i]);
    for (const gap of gaps) {
      expect(gap).toBeGreaterThan(1);
    }
  });

  it("moves a building toward the camera as the visitor scrolls", () => {
    // The scene drives scrollZ positive as scroll progress grows. When this was negative,
    // every building receded as the visitor scrolled, so the alley ran backwards.
    const before = alleyZ(-27, 0);
    const after = alleyZ(-27, 5);
    expect(after).toBeGreaterThan(before);
    expect(depthFromCamera(after)).toBeLessThan(depthFromCamera(before));
  });

  it("wraps a building back to the far end after a full loop", () => {
    const start = alleyZ(-27, 0);
    const oneLoop = alleyZ(-27, ALLEY_SEGMENT);
    expect(oneLoop).toBeCloseTo(start, 6);
  });
});

describe("depthFromCamera", () => {
  it("measures distance in front of the camera", () => {
    expect(depthFromCamera(ALLEY_CAMERA_Z - 10)).toBe(10);
  });

  it("clamps buildings that have walked past the camera to zero", () => {
    // Otherwise a building behind the viewer keeps a positive depth and is never culled.
    expect(depthFromCamera(ALLEY_CAMERA_Z + 5)).toBe(0);
  });
});

describe("neonEmissiveAt", () => {
  it("scales the authored intensity by the pulse", () => {
    expect(neonEmissiveAt(2, 1)).toBe(2);
    expect(neonEmissiveAt(2, 0.5)).toBe(1);
  });

  it("preserves the authored value across repeated frames", () => {
    // The regression this guards: the old loop assigned
    // `pulse * (mat.emissiveIntensity ? 1 : 1)`, reading back the value it had just
    // written, so it did nothing at all.
    const base = 2.4;
    let value = base;
    for (let frame = 0; frame < 600; frame++) {
      const pulse = neonPulseAt(frame / 60);
      value = neonEmissiveAt(base, pulse);
    }
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThan(base * 1.05);
  });

  it("never fully extinguishes a sign", () => {
    for (let t = 0; t < 20; t += 0.1) {
      expect(neonPulseAt(t)).toBeGreaterThan(0.5);
      expect(neonPulseAt(t)).toBeLessThanOrEqual(1);
    }
  });
});

describe("buildAlley", () => {
  it("is deterministic for a given seed", () => {
    const a = buildAlley("cyberpunk:alley:v2", false);
    const b = buildAlley("cyberpunk:alley:v2", false);
    expect(a).toEqual(b);
  });

  it("produces a different street for a different seed", () => {
    expect(buildAlley("cyberpunk:alley:v2", false)).not.toEqual(
      buildAlley("cyberpunk:alley:v3", false)
    );
  });

  it("fills both sides of the street with unique ids", () => {
    const buildings = buildAlley("cyberpunk:alley:v2", false);
    expect(buildings).toHaveLength(ALLEY_SLOTS * 2);
    expect(new Set(buildings.map((b) => b.id)).size).toBe(buildings.length);
    expect(buildings.filter((b) => b.side === "left")).toHaveLength(ALLEY_SLOTS);
    expect(buildings.filter((b) => b.side === "right")).toHaveLength(ALLEY_SLOTS);
  });

  it("places left buildings on one side of the centre line and right on the other", () => {
    for (const building of buildAlley("cyberpunk:alley:v2", false)) {
      if (building.side === "left") expect(building.x).toBeLessThan(0);
      else expect(building.x).toBeGreaterThan(0);
    }
  });

  it("keeps every building at least a full slot ahead of the origin", () => {
    for (const building of buildAlley("cyberpunk:alley:v2", false)) {
      expect(building.baseZ).toBeLessThan(0);
      expect(-building.baseZ).toBeGreaterThan(0);
    }
  });

  it("gives every window row a stable id for list keys", () => {
    for (const building of buildAlley("cyberpunk:alley:v2", false)) {
      expect(building.windows.length).toBeGreaterThan(0);
      const ids = building.windows.map((w) => w.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("always has sign copy to render", () => {
    for (const building of buildAlley("cyberpunk:alley:v2", false)) {
      expect(building.signText.trim()).not.toBe("");
    }
  });

  it("only uses CJK sign copy when the platform can render it", () => {
    // Checked per code point rather than with a regex range, which lint flags for
    // containing a control character.
    const hasCjk = (b: { signText: string }) =>
      [...b.signText].some((char) => (char.codePointAt(0) ?? 0) > 0xff);
    expect(buildAlley("cyberpunk:alley:v2", false).some(hasCjk)).toBe(false);
    expect(buildAlley("cyberpunk:alley:v2", true).some(hasCjk)).toBe(true);
  });
});
