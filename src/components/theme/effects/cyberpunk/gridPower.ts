/**
 * @file: src/components/theme/effects/cyberpunk/gridPower.ts
 * @description: Shared "grid power" level for the Cyberpunk scene.
 *
 * A lightning strike should not just draw a bolt on a canvas: the whole street should
 * brown out with it. Signage, the lighting rig and the colour grade all need to read the
 * same value in the same frame, and they live in three separate places (the alley's React
 * tree, the postprocessing pass, and the 2D lightning scheduler).
 *
 * A module-level signal with subscribers keeps them in sync without threading a prop
 * through every layer. It is deliberately not React state: it changes inside animation
 * callbacks at frame rate and must never trigger a render.
 */

/** Multiplier applied to emissive intensity, light intensity and exposure. 1 = stable. */
let powerLevel = 1;

type Listener = (level: number) => void;

const listeners = new Set<Listener>();

/** Current grid power, in the range (0, 1]. */
export function getGridPower(): number {
  return powerLevel;
}

function publish(next: number): void {
  const clamped = Math.min(1, Math.max(0.05, next));
  if (Math.abs(clamped - powerLevel) < 1e-4) return;
  powerLevel = clamped;
  for (const listener of listeners) listener(powerLevel);
}

/**
 * Subscribe to grid power changes.
 *
 * The listener is invoked immediately with the current value, so consumers never have to
 * special-case their first frame.
 *
 * @returns An unsubscribe function.
 */
export function subscribeGridPower(listener: Listener): () => void {
  listeners.add(listener);
  listener(powerLevel);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Pending timers for the current dip sequence.
 *
 * Held as a list rather than a single handle: the sequence is four chained steps, and
 * assigning each to one variable meant only the last was ever cancellable, so three timers
 * survived `resetGridPower()` and kept publishing after the scene was gone.
 */
let dipTimers: Array<ReturnType<typeof setTimeout>> = [];

/**
 * Brown out the street, then bring it back with a stutter.
 *
 * @param depth How far the lights dip, 0..1. Lower is darker.
 */
export function triggerPowerDip(depth = 0.28): void {
  publish(depth);

  clearDipTimers();

  // Two quick stutters before settling, which is what sells it as a failing grid rather
  // than a scripted fade.
  const steps: Array<[delay: number, level: number]> = [
    [90, 0.75],
    [190, depth * 0.8],
    [300, 0.92],
    [620, 1],
  ];
  for (const [delay, level] of steps) {
    dipTimers.push(setTimeout(() => publish(level), delay));
  }
}

function clearDipTimers(): void {
  for (const timer of dipTimers) clearTimeout(timer);
  dipTimers = [];
}

/** Restore stable power. Used when the scene unmounts. */
export function resetGridPower(): void {
  clearDipTimers();
  publish(1);
}
