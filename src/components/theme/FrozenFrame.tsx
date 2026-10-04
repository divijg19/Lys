/**
 * @file: src/components/theme/FrozenFrame.tsx
 * @description: Renders exactly one frame of a calm scene, then stops.
 *
 * ## Why this component exists
 *
 * A calm scene still has to be *painted once*. The policy sets `frameloop: "demand"`, which
 * parks R3F's loop: it calls `update()` (and therefore `gl.render`) only when the internal
 * frame counter is above zero, and only `invalidate()` raises that counter.
 *
 * The obvious alternative, `frameloop: "never"`, does not work and cannot be made to work.
 * R3F's `invalidate()` early-returns when the frameloop is `"never"`, so the counter never
 * rises and `gl.render` is never called. That is what v0.2.7 shipped, and instrumenting
 * `drawElements` showed **zero** draw calls in calm mode for every WebGL theme -- the scenes
 * were blank, not frozen. Worse, the failure hides during development: toggling calm on an
 * already-rendering scene keeps the previous frame, because the drawing buffer is never
 * cleared. It only manifests on a cold mount, which is exactly what a reduced-motion visitor
 * gets.
 *
 * ## Why a component, and why it watches the snapshot
 *
 * Because "paint one frame" is not the same as "paint on mount". A scene's contents can
 * arrive *after* that frame: `Suspense` boundaries, `dynamic()` layers and texture loads all
 * resolve later. A single `invalidate()` in an effect would capture an empty scene and never
 * repaint, leaving a correctly configured but permanently blank canvas -- a subtler version
 * of the same bug.
 *
 * So each commit compares R3F's own hydration counter and requests a frame whenever it
 * moved. That converges: a commit that made something new renderable causes one more frame,
 * and a commit that changed nothing renderable does not schedule another.
 */

"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useDocumentHidden } from "@/hooks/useDocumentVisibility";

/**
 * Requests a single frame for a parked (`frameloop: "demand"`) canvas, and another whenever
 * more of the scene becomes renderable.
 *
 * Must be rendered inside a Canvas. Costs nothing when the frameloop is `"always"`, because
 * R3F is already rendering continuously.
 *
 * @param deps Extra values that should force a repaint when they change -- typically
 *   something that resolves asynchronously, such as a texture handle or a loaded flag.
 */
export function FrozenFrame({ deps = [] }: { deps?: readonly unknown[] }): null {
  const invalidate = useThree((state) => state.invalidate);

  /*
   * A *passive* effect, and that detail is load-bearing.
   *
   * `invalidate()` returns early unless `state.internal.active` is true, and R3F sets that
   * in `Provider`'s own layout effect -- whose comment is "nothing has yet rendered". React
   * runs child layout effects before parent layout effects, so calling this from a layout
   * effect (or relying on R3F's own `invalidateInstance`, which fires during commit) hits an
   * inactive store and is silently discarded. The result is a canvas that is mounted,
   * correctly configured, and never drawn: exactly the blank-canvas bug this component
   * exists to prevent.
   *
   * Passive effects run after every layout effect, so by then the store is active and the
   * invalidate lands. The cost is that the canvas may present unpainted for one frame; in calm
   * mode that frame shows the static CSS atmosphere underneath, which is also what shows if
   * WebGL is unavailable, so nothing is lost.
   *
   * Redundant with R3F's own `invalidateInstance` once the store is active, and deliberately
   * so -- an idempotent invalidate costs nothing. `invalidate()` does not commit, so this
   * cannot loop.
   */
  useEffect(() => {
    invalidate();
  }, [invalidate, ...deps]);

  return null;
}

/**
 * Repaints a parked frameloop when the tab becomes visible again.
 *
 * Browsers throttle `requestAnimationFrame` in background tabs, and R3F's `demand` loop also
 * refuses to render without an `invalidate()`. A scene whose loop was parked while the tab was
 * hidden can therefore be left holding a stale frame -- or, if it never painted, none at all.
 * This requests one frame on return.
 *
 * Must be rendered inside a Canvas.
 */
export function RepaintOnVisible(): null {
  const invalidate = useThree((state) => state.invalidate);
  const isHidden = useDocumentHidden();

  useEffect(() => {
    // Only on the hidden -> visible edge; the initial mount is FrozenFrame's business.
    if (isHidden) invalidate();
  }, [isHidden, invalidate]);

  return null;
}

export default FrozenFrame;
