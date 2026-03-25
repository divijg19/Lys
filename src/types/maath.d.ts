// src/types/maath.d.ts

/**
 * Declares the module for the 'maath/random' ESM import.
 * This provides TypeScript with type information for the functions
 * we use, ensuring type safety and autocompletion.
 */
declare module "maath/random/dist/maath-random.esm" {
  /**
   * Fills a Float32Array with random points inside a sphere.
   * @param array The array to fill.
   * @param options An options object with a radius property.
   * @returns The same Float32Array that was passed in.
   */
  export function inSphere(array: Float32Array, options: { radius: number }): Float32Array;
}
