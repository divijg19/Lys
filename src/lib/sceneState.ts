/**
 * @file: src/lib/sceneState.ts
 * @description: The single vocabulary for "what is the background doing right now".
 *
 * ## Why this is published on `<html>`
 *
 * Two background failures are indistinguishable from the outside. A scene that chose not to
 * render, and a scene that failed to render, both produce an empty layer -- and v0.2.7 shipped
 * exactly that ambiguity, which is why three blank themes went uninvestigated for six releases.
 * The only runtime evidence was a single `console.error` line, which nobody sees in production.
 *
 * So the state is mirrored onto `<html>` as `data-scene-state`, next to the existing
 * `data-calm-reason`. That makes the question "is the background working?" answerable from a
 * production page with `curl` or the devtools console, and it is what
 * `scripts/verify-backgrounds.mjs` asserts against.
 */

/**
 * What the active theme's background is doing.
 *
 * - `probing`     -- WebGL support is not known yet. Scenes show their static atmosphere.
 * - `ok`          -- the canvas mounted and painted.
 * - `frozen`      -- calm mode; the canvas painted one frame and is holding it. Still a success.
 * - `no-webgl`    -- no context could be created, so no canvas was mounted. Success, not failure.
 * - `context-lost`-- a context existed and was lost. The canvas is stood down until it returns.
 * - `error`       -- the scene threw and was replaced by the fallback gradient.
 */
export type SceneState = "probing" | "ok" | "frozen" | "no-webgl" | "context-lost" | "error";

export const SCENE_STATE_ATTRIBUTE = "data-scene-state";

/** Mirror the scene state onto `<html>` so it is observable without a browser session. */
export function writeSceneState(state: SceneState): void {
  if (typeof document === "undefined") return;
  if (state === "ok" || state === "probing")
    document.documentElement.removeAttribute(SCENE_STATE_ATTRIBUTE);
  else document.documentElement.setAttribute(SCENE_STATE_ATTRIBUTE, state);
}
