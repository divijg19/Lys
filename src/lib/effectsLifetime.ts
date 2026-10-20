/**
 * @file: src/lib/effectsLifetime.ts
 * @description: One place to decide how far through its life a timed effect is.
 *
 * The timed effects (the ethereal ripples and wisps) are spawned from pointer events and aged
 * inside `useFrame`. Both ends of that comparison have to come from the same clock, and this
 * helper is where the arithmetic lives, so that the arithmetic can be tested on its own and the
 * clock contract can be asserted separately.
 */

/** How far through its life an effect is. `complete` means it is finished and should be removed. */
export type EffectProgress = { complete: boolean; progress: number };

/**
 * Age an effect against the clock it was spawned on.
 *
 * `elapsedTime` and `creationTime` must come from the same clock. If they do not -- for example
 * when a creation time is taken from a DOM event timestamp and the age is read from a render
 * clock -- the age is negative, the effect never completes, and it stays in the scene forever.
 *
 * The progress is clamped at zero, so a negative age can never drive a shader uniform negative
 * (which is what made the old ripples and wisps invisible).
 */
export function effectProgress(
  elapsedTime: number,
  creationTime: number,
  lifespanSeconds: number
): EffectProgress {
  const age = elapsedTime - creationTime;

  if (age >= lifespanSeconds) return { complete: true, progress: 1 };

  return { complete: false, progress: Math.max(0, age / lifespanSeconds) };
}
