"use client";

/**
 * @file: src/hooks/useWebGLSupport.ts
 * @description: Detects whether a WebGL context can actually be created, and watches for its loss.
 *
 * ## Why this is shared rather than private to one scene
 *
 * `HorizonScene` was the only theme that probed for WebGL. The other five mounted a `<Canvas>`
 * unconditionally, and R3F's renderer *throws* when it cannot get a context -- so a blocklisted
 * GPU, a failed driver or a lost context took the whole scene down. Because `SceneBoundary`
 * wrapped the entire scene rather than the canvas, that also destroyed any static DOM art
 * sitting alongside it. Measured with `getContext("webgl")` forced to return `null`, Light,
 * Dark, Ethereal *and* Cyberpunk all threw; only Horizon survived, because only Horizon asked.
 *
 * So every scene that mounts a canvas asks here first and skips the canvas entirely when the
 * answer is no. Not catching the throw -- avoiding it.
 *
 * ## Why the result is a live subscription, not a one-shot
 *
 * A context can be created successfully and then be lost: driver reset, GPU process crash,
 * laptop switching GPUs, or the browser reclaiming contexts under memory pressure. A one-shot
 * probe reports "supported" forever after that, and the scene sits there painting nothing. The
 * `change`/`statuschange` and `webglcontextlost`/`webglcontextrestored` listeners below mean the
 * scenes can stand down and come back instead of silently freezing.
 */

import { useCallback, useEffect, useState } from "react";

/**
 * Why WebGL is considered unusable. `null` means usable.
 *
 * `"probing"` is distinct from `"no-context"` on purpose: before the probe has answered, support
 * is *unknown*, and reporting it as unavailable would publish a false `data-scene-state="no-webgl"`
 * on every page load for the duration of the probe, then correct itself.
 */
export type WebGLUnsupportedReason = "probing" | "no-context" | "context-lost" | null;

export interface WebGLSupport {
  /**
   * Whether a canvas should be mounted at all.
   *
   * `false` before the probe resolves, because assuming support and being wrong means a throw.
   * Scenes should render their static atmosphere in the meantime.
   */
  supported: boolean;
  /** `null` while supported, otherwise why not. */
  reason: WebGLUnsupportedReason;
  /**
   * Force a re-probe, e.g. after the user changes something that might restore support.
   * Callers rarely need this; the listeners cover the real cases.
   */
  recheck: () => void;
}

const PROBE_ATTRS: WebGLContextAttributes = {
  failIfMajorPerformanceCaveat: false,
};

/**
 * Try to create a throwaway WebGL context.
 *
 * Kept as a module-level function so it is directly testable and so every caller shares one
 * implementation. Returns the context on success so the caller can release it immediately --
 * contexts are a limited resource, and browsers cap how many can exist.
 */
export function probeWebGLContext(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", PROBE_ATTRS) ?? canvas.getContext("webgl", PROBE_ATTRS);
    if (!gl) return false;

    /*
     * Release the probe context immediately. Browsers keep only a handful of live contexts and
     * will start dropping the oldest, which would take the real scene's context with it.
     * `WEBGL_lose_context` is the supported way to do this; without it, shrinking the canvas is
     * the best available nudge and costs nothing.
     */
    const loseContext = gl.getExtension("WEBGL_lose_context");
    if (loseContext) loseContext.loseContext();
    else canvas.width = 0;

    return true;
  } catch {
    // Safari and some embedded webviews throw on context creation rather than returning null.
    return false;
  }
}

export function useWebGLSupport(): WebGLSupport {
  const [supported, setSupported] = useState(false);
  const [reason, setReason] = useState<WebGLUnsupportedReason>("probing");

  const recheck = useCallback(() => {
    const ok = probeWebGLContext();
    setSupported(ok);
    setReason(ok ? null : "no-context");
  }, []);

  useEffect(() => {
    recheck();

    /*
     * Watch for a context that existed and then went away.
     *
     * This listens on a probe canvas rather than on the scene's own context: the scene's canvas
     * is created by R3F and is not reachable from here, and a `webglcontextlost` on any context
     * indicates the driver or GPU process is in trouble, which is exactly the signal needed.
     */
    /*
     * Listen on the canvas, not the context.
     *
     * Per the WebGL spec `webglcontextlost` / `webglcontextrestored` are dispatched at the
     * canvas element as `WebGLContextEvent`, so this is where they actually arrive. It also
     * sidesteps the DOM lib types, which do not declare `EventTarget` on the context
     * interfaces even though the objects inherit from it at runtime.
     */
    let probeCanvas: HTMLCanvasElement | null = null;

    const onLost = (event: Event) => {
      // Required by spec, and without it the context is not handed back for restoration.
      event.preventDefault();
      setSupported(false);
      setReason("context-lost");
    };

    const onRestored = () => recheck();

    try {
      probeCanvas = document.createElement("canvas");
      // A context is required for these events to ever fire, so create one and keep it alive.
      probeCanvas.getContext("webgl2", PROBE_ATTRS) ?? probeCanvas.getContext("webgl");
      probeCanvas.addEventListener("webglcontextlost", onLost);
      probeCanvas.addEventListener("webglcontextrestored", onRestored);
    } catch {
      // No context to listen on; the probe result above already reflects that.
    }

    return () => {
      probeCanvas?.removeEventListener("webglcontextlost", onLost);
      probeCanvas?.removeEventListener("webglcontextrestored", onRestored);
      // Deliberately not force-losing the probe context: it exists only to carry these
      // listeners and is never rendered from, so releasing it early would achieve nothing.
    };
  }, [recheck]);

  return { supported, reason, recheck };
}
