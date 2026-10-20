/**
 * @file: src/lib/motion.ts
 * @description: Frame-rate independent easing.
 *
 * A per-frame factor is a per-*frame* amount, so the motion it produces depends on how many
 * frames a second the display runs at: a lerp of `0.05` per frame covers half the distance in
 * fourteen frames, which is 230 ms at 60 Hz and 97 ms at 144 Hz. The same code, the same
 * seconds, a different result.
 *
 * The factor has to be expressed per second instead. `frameRateIndependentFactor` converts a
 * "fraction of the way there per 60 Hz frame" into the equivalent fraction for the frame that
 * actually just happened, so the motion covers the same distance in the same time on every
 * display.
 */

/** The frame rate the tuning constants are expressed against. */
export const REFERENCE_FPS = 60;

/**
 * The factor to use for a lerp this frame, given the frame's duration in seconds.
 *
 * `base` is the fraction the animation would have covered in one 60 Hz frame -- 0.1 meaning
 * "a tenth of the way there per frame". `delta` is how long the frame actually took.
 */
export function frameRateIndependentFactor(
  base: number,
  delta: number,
  fps: number = REFERENCE_FPS
): number {
  // A frame that took no time must not move anything, and a factor of 1 would.
  if (!Number.isFinite(delta) || delta <= 0) return 0;

  // Guard against a base of 1 (an instant jump) and of 0 (no movement): the power form is
  // undefined for the first and collapses for the second.
  const clamped = Math.min(0.999999, Math.max(0, base));

  return 1 - (1 - clamped) ** (delta * fps);
}
