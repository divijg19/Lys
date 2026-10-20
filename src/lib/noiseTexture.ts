/**
 * @file: src/lib/noiseTexture.ts
 * @description: A tileable noise texture for the ethereal plane.
 *
 * ## Why this exists
 *
 * The ethereal background's plane was displaced by two octaves of simplex noise, evaluated in the
 * vertex shader. That is the expensive way to do it: every vertex of the mesh ran a full noise
 * evaluation, twice, on every frame -- and the plane needed enough vertices for the detail
 * octave to be sampled properly. At 64 by 64 the detail octave's wavelength was covered by seven
 * quads, which is why the field looked softer than it should.
 *
 * The noise is now a texture: a periodic gradient field, generated once on the CPU, sampled with
 * two scrolling lookups in the vertex shader. The frequencies, the feature sizes and the drift
 * are the same; the cost per vertex is a texture fetch rather than a noise evaluation, so the
 * geometry can be dense enough to carry the detail again.
 *
 * ## The periodicity
 *
 * The field is sampled at a coordinate that drifts with time, so the texture has to repeat: a
 * texture that did not would show a seam drifting across the background once every few minutes.
 *
 * Gradient noise is periodic by construction -- the lattice values wrap at the period, and the
 * interpolation is local -- so the wrap is exact rather than approximately right. The seam is
 * tested.
 *
 * The field is *gradient* noise rather than simplex: both are smooth and featureless at this
 * scale, and the gradient form has the property this needs and the simplex form does not.
 */

import { DataTexture, LinearFilter, RepeatWrapping, type Texture } from "three";

/** The size of the texture, in texels. */
export const NOISE_TEXTURE_SIZE = 256;

/**
 * How many lattice cells the field has across one tile.
 *
 * The cell is the period of the lattice, so it has to divide the permutation's length for the
 * wrap to be exact.
 */
export const NOISE_CELLS_PER_TILE = 8;

/** The gradient set: eight directions, evenly spread. */
const GRADIENTS = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

/** The quintic fade: zero first *and* second derivative at the ends, so the field is smooth. */
const fade = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);

/** A small deterministic generator, so the texture is the same on every load. */
function makeRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    // xorshift32
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  };
}

/**
 * A permutation of the gradient indices that repeats with a period of `cells`.
 *
 * The hash of a lattice point is taken from this table, so the table's period is the field's
 * period.
 */
function makePermutation(cells: number, random: () => number): Uint8Array {
  const base = new Uint8Array(cells);
  for (let i = 0; i < cells; i++) base[i] = i;

  for (let i = cells - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const swap = base[i];
    base[i] = base[j];
    base[j] = swap;
  }

  const table = new Uint8Array(256);
  for (let i = 0; i < 256; i++) table[i] = base[i % cells];
  return table;
}

/**
 * Periodic two-dimensional gradient noise, in the range [-1, 1].
 *
 * The lattice wraps at `cells`, and the permutation repeats with the same period, so the field is
 * exactly periodic: `noise(x + cells, y) === noise(x, y)`.
 */
export function periodicGradientNoise(
  x: number,
  y: number,
  cells: number,
  permutation: Uint8Array
): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;

  const u = fade(fx);
  const v = fade(fy);

  const wrap = (value: number): number => ((value % cells) + cells) % cells;

  const gradient = (cellX: number, cellY: number): readonly [number, number] => {
    const hash = permutation[(wrap(cellX) + wrap(cellY) * 3) & 255];
    return GRADIENTS[hash % GRADIENTS.length];
  };

  const dot = (cellX: number, cellY: number, offsetX: number, offsetY: number): number => {
    const g = gradient(cellX, cellY);
    return g[0] * (offsetX - cellX) + g[1] * (offsetY - cellY);
  };

  const bottom = dot(i, j, x, y) + u * (dot(i + 1, j, x, y) - dot(i, j, x, y));
  const top = dot(i, j + 1, x, y) + u * (dot(i + 1, j + 1, x, y) - dot(i, j + 1, x, y));

  return (bottom + v * (top - bottom)) * 1.4;
}

/**
 * A texture of four independent, tileable noise fields, one per channel.
 *
 * The channels are independent so that two octaves of the same texture do not look like two
 * magnifications of one field.
 */
export function createNoiseTexture(
  size: number = NOISE_TEXTURE_SIZE,
  cells: number = NOISE_CELLS_PER_TILE,
  seed = 0x5eed
): Texture {
  const random = makeRandom(seed);
  const permutations = Array.from({ length: 4 }, () => makePermutation(cells, random));

  const data = new Uint8Array(size * size * 4);
  const scale = cells / size;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const offset = (y * size + x) * 4;
      for (let channel = 0; channel < 4; channel++) {
        const value = periodicGradientNoise(x * scale, y * scale, cells, permutations[channel]);
        // The field is in [-1, 1]; the texture stores [0, 1] and the shader scales it back.
        data[offset + channel] = Math.round(Math.min(1, Math.max(0, (value + 1) / 2)) * 255);
      }
    }
  }

  const texture = new DataTexture(data, size, size);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  return texture;
}
