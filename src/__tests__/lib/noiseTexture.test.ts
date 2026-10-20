/**
 * @file: src/__tests__/lib/noiseTexture.test.ts
 * @description: The tileable noise the ethereal plane is displaced by.
 *
 * The texture is sampled at a coordinate that drifts with time, so it has to repeat. A texture
 * whose edges did not match would show a seam drifting across the background, and the drift is
 * slow enough that it would take a minute of watching to notice -- and then never stop.
 */

import { type DataTexture, RepeatWrapping } from "three";
import { describe, expect, it } from "vitest";
import {
  createNoiseTexture,
  NOISE_CELLS_PER_TILE,
  NOISE_TEXTURE_SIZE,
  periodicGradientNoise,
} from "@/lib/noiseTexture";

/** The permutation the field is built from, for the tests that need one. */
const permutation = (() => {
  const cells = NOISE_CELLS_PER_TILE;
  const base = Array.from({ length: cells }, (_, i) => i);
  for (let i = cells - 1; i > 0; i--) {
    const j = Math.floor((i * 7919) % (i + 1));
    const swap = base[i];
    base[i] = base[j];
    base[j] = swap;
  }
  const table = new Uint8Array(256);
  for (let i = 0; i < 256; i++) table[i] = base[i % cells];
  return table;
})();

describe("periodicGradientNoise", () => {
  it("repeats exactly at the period of the lattice", () => {
    for (const [x, y] of [
      [1.5, 2.25],
      [0.3, 7.9],
      [5.5, 0.1],
    ]) {
      const value = periodicGradientNoise(x, y, NOISE_CELLS_PER_TILE, permutation);
      const shifted = periodicGradientNoise(
        x + NOISE_CELLS_PER_TILE,
        y + NOISE_CELLS_PER_TILE,
        NOISE_CELLS_PER_TILE,
        permutation
      );

      expect(shifted).toBeCloseTo(value, 10);
    }
  });

  it("repeats along each axis on its own", () => {
    const value = periodicGradientNoise(2.5, 3.5, NOISE_CELLS_PER_TILE, permutation);
    const shifted = periodicGradientNoise(
      2.5 + NOISE_CELLS_PER_TILE,
      3.5,
      NOISE_CELLS_PER_TILE,
      permutation
    );

    expect(shifted).toBeCloseTo(value, 10);
  });

  it("stays in the range the shader expects", () => {
    let lowest = Number.POSITIVE_INFINITY;
    let highest = Number.NEGATIVE_INFINITY;

    for (let x = 0; x < 24; x++) {
      for (let y = 0; y < 24; y++) {
        const value = periodicGradientNoise(x * 0.37, y * 0.41, NOISE_CELLS_PER_TILE, permutation);
        lowest = Math.min(lowest, value);
        highest = Math.max(highest, value);
      }
    }

    expect(lowest).toBeGreaterThanOrEqual(-1.05);
    expect(highest).toBeLessThanOrEqual(1.05);
  });

  it("is not a constant", () => {
    const values = new Set<number>();
    for (let x = 0; x < 8; x++) {
      values.add(periodicGradientNoise(x * 0.5, 1.25, NOISE_CELLS_PER_TILE, permutation));
    }

    expect(values.size).toBeGreaterThan(5);
  });
});

describe("createNoiseTexture", () => {
  it("has continuous edges, so the tile can repeat without a seam", () => {
    const texture = createNoiseTexture(64, NOISE_CELLS_PER_TILE);
    const data = (texture as DataTexture).image.data as Uint8Array;
    const size = 64;

    for (let channel = 0; channel < 4; channel++) {
      /*
       * The step across the wrap has to be no larger than the field's own step between
       * neighbouring texels. A seam would be a step where there is no gradient; a small
       * difference is just the field's slope over one texel, and the bilinear filter
       * interpolates across it.
       */
      let adjacent = 0;
      let adjacentCount = 0;
      for (let y = 0; y < size; y++) {
        for (let x = 1; x < size; x++) {
          const here = (y * size + x) * 4 + channel;
          const before = (y * size + x - 1) * 4 + channel;
          adjacent += Math.abs(data[here] - data[before]);
          adjacentCount++;
        }
      }
      const typicalStep = adjacent / adjacentCount;

      for (let y = 0; y < size; y++) {
        const last = (y * size + size - 1) * 4 + channel;
        const first = y * size * 4 + channel;
        expect(Math.abs(data[last] - data[first])).toBeLessThanOrEqual(typicalStep * 3 + 1);
      }
    }
  });

  it("carries four different fields", () => {
    const texture = createNoiseTexture(64, NOISE_CELLS_PER_TILE);
    const data = (texture as DataTexture).image.data as Uint8Array;

    // The channels must not be copies of one another.
    let different = 0;
    for (let i = 0; i < 64 * 64; i++) {
      const offset = i * 4;
      if (data[offset] !== data[offset + 1]) different++;
    }

    expect(different).toBeGreaterThan(64 * 64 * 0.8);
  });

  it("wraps, so the drifting sample coordinate never runs off the edge", () => {
    const texture = createNoiseTexture();

    expect(texture.wrapS).toBe(RepeatWrapping);
    expect(texture.wrapT).toBe(RepeatWrapping);
    expect((texture as DataTexture).image.width).toBe(NOISE_TEXTURE_SIZE);
  });
});
