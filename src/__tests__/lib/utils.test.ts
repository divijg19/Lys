import { describe, expect, it } from "vitest";
import { cn, createPRNG, seedHash } from "@/lib/utils";

/**
 * `createPRNG` / `seedHash` are the basis of SSR/client parity for every procedural visual in the
 * repo: CitySilhouette's alley and skyline, CelestialDebrisField and Starfield all seed from
 * `createPRNG(seedHash(...))`. The whole point of these two functions is that the server and the
 * client compute byte-identical geometry from the same string -- if the algorithm drifts, the
 * server-rendered canvas drawing no longer matches what the client computes, and the visual
 * jumps. The golden values below pin the algorithm itself.
 */

describe("cn", () => {
  it("merges conflicting tailwind classes, last one wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("keeps non-conflicting classes", () => {
    expect(cn("px-2", "py-4")).toBe("px-2 py-4");
  });

  it("ignores falsy values", () => {
    expect(cn("a", null, undefined, false, "b")).toBe("a b");
  });
});

describe("seedHash", () => {
  it("is deterministic: the same string always hashes the same", () => {
    expect(seedHash("cyberpunk:alley:v1")).toBe(seedHash("cyberpunk:alley:v1"));
  });

  it("pins the algorithm with golden values", () => {
    // Changing these means changing what the server renders vs what the client computes.
    expect(seedHash("cyberpunk:alley:v1")).toBe(2486154412);
    expect(seedHash("starfield:100:500")).toBe(3046417915);
  });

  it("distinguishes different strings", () => {
    expect(seedHash("a")).not.toBe(seedHash("b"));
  });

  it("returns an unsigned 32-bit integer", () => {
    for (const s of ["", "x", "cyberpunk:skyline:v1", "debris:40"]) {
      const h = seedHash(s);
      expect(Number.isInteger(h)).toBe(true);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(2 ** 32);
    }
  });
});

describe("createPRNG", () => {
  it("produces the same sequence for the same seed (server/client parity)", () => {
    const a = createPRNG(12345);
    const b = createPRNG(12345);
    const seqA = Array.from({ length: 50 }, () => a());
    const seqB = Array.from({ length: 50 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("pins the first outputs of a real seed with golden values", () => {
    // The alley scene in CitySilhouette is drawn from exactly this sequence.
    const rng = createPRNG(seedHash("cyberpunk:alley:v1"));
    expect(Array.from({ length: 5 }, () => rng())).toEqual([
      0.24622371746227145, 0.19495427003130317, 0.849012644495815, 0.37427486712113023,
      0.667098450474441,
    ]);
  });

  it("always stays in [0, 1)", () => {
    // Every consumer multiplies these by pixel dimensions; an out-of-range value would throw
    // geometry off the canvas.
    for (const seed of [0, 1, 2486154412, 4294967295]) {
      const rng = createPRNG(seed);
      for (let i = 0; i < 200; i++) {
        const v = rng();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    }
  });

  it("produces different sequences for different seeds", () => {
    const a = createPRNG(1);
    const b = createPRNG(2);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });

  it("advances rather than repeating immediately", () => {
    const rng = createPRNG(7);
    const values = Array.from({ length: 10 }, () => rng());
    expect(new Set(values).size).toBeGreaterThan(1);
  });
});
