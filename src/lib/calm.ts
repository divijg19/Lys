/**
 * @file: src/lib/calm.ts
 * @description: The single definition of calm mode, and the motion policy derived from it.
 *
 * Pure functions with no React and no DOM dependency beyond an optional element, so the
 * rules can be unit tested directly (jsdom has no WebGL, and these rules have to hold
 * regardless of that).
 *
 * ## Why this module exists
 *
 * Calm mode was previously defined in three places at once: a shared hook plus a private
 * `readIsCalm()` copy in each of `HorizonScene` and `MirageScene`, the latter two also
 * OR-ing in a raw `matchMedia` boolean that the derived attributes had not caught up with
 * yet. They could disagree, and did.
 *
 * More importantly, three scenes answered "calm" by returning `null` -- deleting the whole
 * theme. That is the opposite of the convention the rest of the codebase follows, where
 * calm means *freeze*, not *remove*, and it shipped as a production regression: Light, Dark
 * and Cyberpunk rendered nothing at all for visitors whose browser reported reduced motion
 * or a constrained connection.
 *
 * ## The rule this encodes
 *
 * `SceneMotionPolicy` has no "hidden" or "mounted" member. Calm can stop time and switch
 * effects off; it cannot delete a theme. A future change that wants to remove a scene
 * under calm has to add that capability here deliberately, where it will be reviewed,
 * rather than reintroducing an early `return null` in a scene file.
 */

/** Attributes that suppress decorative motion. Written only by `ClientAttrWrapper`. */
export const CALM_ATTRIBUTE = {
  reduceMotion: "data-reduce-motion",
  lowData: "data-low-data",
} as const;

export const CALM_ATTRIBUTES = [CALM_ATTRIBUTE.reduceMotion, CALM_ATTRIBUTE.lowData] as const;

/**
 * Attribute mirroring *why* calm is active.
 *
 * A scene that renders nothing is indistinguishable from a scene that failed to load, so
 * the reason is published on `<html>` for production diagnosis.
 */
export const CALM_REASON_ATTRIBUTE = "data-calm-reason";

/** Which input put the page into calm mode. */
export type CalmReason = "reduce-motion" | "low-data";

/**
 * Resolve a calm reason from the two contributing signals.
 *
 * `reduce-motion` wins when both apply, because it is an explicit, persistent user choice
 * whereas a connection type is transient.
 */
export function calmReasonFrom(flags: {
  reduceMotion: boolean;
  lowData: boolean;
}): CalmReason | null {
  if (flags.reduceMotion) return "reduce-motion";
  if (flags.lowData) return "low-data";
  return null;
}

/** Read the calm reason from an element, or `null` when not calm. */
export function readCalmReasonFromElement(element: Element | null | undefined): CalmReason | null {
  if (!element) return null;
  return calmReasonFrom({
    reduceMotion: element.hasAttribute(CALM_ATTRIBUTE.reduceMotion),
    lowData: element.hasAttribute(CALM_ATTRIBUTE.lowData),
  });
}

/**
 * Read calm mode synchronously.
 *
 * Attribute presence is the test, not the value: `ClientAttrWrapper` adds and removes
 * these attributes rather than writing a boolean string, but a literal `"false"` should
 * never be read as a request for motion either.
 */
export function readCalmMode(): boolean {
  if (typeof document === "undefined") return false;
  return readCalmReasonFromElement(document.documentElement) !== null;
}

/**
 * What a scene is allowed to do, given the calm state.
 *
 * Every field is a separate capability because effects live in different places: the R3F
 * frameloop, the renderer's own requestAnimationFrame loops, postprocessing composers, and
 * plain timers. Stopping only the frameloop leaves the others running, which is why the
 * Cyberpunk rain canvases and lightning scheduler need explicit flags rather than relying
 * on `frameloop`.
 */
export type SceneMotionPolicy = {
  /**
   * R3F render loop mode.
   *
   * `"demand"` is the calm value, **not** `"never"`. R3F's `invalidate()` early-returns when
   * `frameloop === "never"`, so `internal.frames` never leaves 0, the render loop's
   * `update()` -- the only caller of `gl.render` -- is never reached, and the canvas is
   * never painted at all. Not "blank but frozen": never drawn.
   *
   * v0.2.7 shipped `"never"` here on the belief that it renders one frame on mount. Measured
   * with instrumented `drawElements`, calm mode produced **zero** draw calls across every
   * WebGL theme. `"demand"` plus a single `invalidate()` from `FrozenFrame` renders exactly
   * one frame and then stops, which is what "freeze" is supposed to mean.
   */
  frameloop: "always" | "demand";
  /** Advance time-driven animation: orbits, flows, pulses. */
  animated: boolean;
  /** Move the camera along a scripted path or trigger scripted events. */
  cameraTravel: boolean;
  /** Run the data-rain canvases, which own their own rAF. */
  rain: boolean;
  /** Run the lightning scheduler, which owns rAF and a self-rescheduling timer. */
  lightning: boolean;
  /** Mount the postprocessing composer. */
  postFx: boolean;
  /** Emit autonomous, non-interactive effects. */
  ambient: boolean;
  /** Accept pointer/touch interaction. */
  interactive: boolean;
};

/**
 * Motion policy while calm.
 *
 * Requires `FrozenFrame` inside the Canvas to request the single frame; see the note on
 * `frameloop` above for why `"never"` cannot be used.
 */
export const CALM_SCENE_POLICY: SceneMotionPolicy = {
  frameloop: "demand",
  animated: false,
  cameraTravel: false,
  rain: false,
  lightning: false,
  postFx: false,
  ambient: false,
  interactive: false,
};

/** Motion policy while motion is allowed. */
export const MOTIVE_SCENE_POLICY: SceneMotionPolicy = {
  frameloop: "always",
  animated: true,
  cameraTravel: true,
  rain: true,
  lightning: true,
  postFx: true,
  ambient: true,
  interactive: true,
};

/**
 * Derive a scene's motion policy.
 *
 * Note what is deliberately absent: nothing here removes a scene. A calm scene still
 * renders; it just stops moving.
 */
export function sceneMotionPolicy(isCalm: boolean): SceneMotionPolicy {
  return isCalm ? CALM_SCENE_POLICY : MOTIVE_SCENE_POLICY;
}
