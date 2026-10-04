"use client";

/**
 * @file: src/components/theme/SceneSupport.tsx
 * @description: Shares one WebGL capability probe across a scene tree, and publishes the result.
 *
 * Probing per scene would mean creating and destroying a WebGL context per theme per mount.
 * Browsers cap how many live contexts exist and start dropping the oldest, so repeated probes
 * are not merely wasteful -- they can evict the real scene's context. One probe, one provider.
 *
 * Scenes read this through {@link useSceneSupport} and skip mounting a `<Canvas>` when
 * `supported` is false. That is the point: a scene that never mounts the canvas cannot throw
 * for lack of one, and its static atmosphere survives. `SceneBoundary` remains as the backstop
 * for throws that are not about WebGL at all.
 */

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { type WebGLUnsupportedReason, useWebGLSupport } from "@/hooks/useWebGLSupport";
import { useCalmMode } from "@/hooks/useCalmMode";
import { writeSceneState } from "@/lib/sceneState";

export interface SceneSupport {
  /**
   * Whether a canvas should be mounted. `false` until the probe resolves, so the default is
   * "assume nothing" rather than "assume a GPU" -- assuming a GPU and being wrong is a throw.
   */
  supported: boolean;
  reason: WebGLUnsupportedReason;
}

const SceneSupportContext = createContext<SceneSupport | null>(null);

/**
 * Read the shared WebGL capability.
 *
 * Outside a provider -- Storybook stories, isolated tests -- this optimistically reports
 * support. Those harnesses mount a scene deliberately and have no `ThemeBackground`, and a
 * default of `false` would render every one of them empty for no reason.
 */
export function useSceneSupport(): SceneSupport {
  const value = useContext(SceneSupportContext);
  return value ?? { supported: true, reason: null };
}

export function SceneSupportProvider({ children }: { children: ReactNode }) {
  const { supported, reason } = useWebGLSupport();
  const isCalm = useCalmMode();

  /*
   * Publish the composite state.
   *
   * `frozen` is a success state, not a degraded one: calm mode is working as designed and the
   * canvas holds a painted frame. It is published separately from `ok` so that "calm is on" can
   * be told apart from "the scene is animating" without also inspecting `data-calm-reason`.
   */
  useEffect(() => {
    // Unknown is not unavailable: while the probe is outstanding, publish nothing rather than
    // claiming WebGL is missing.
    if (reason === "probing") {
      writeSceneState("probing");
      return;
    }
    if (!supported) {
      writeSceneState(reason === "context-lost" ? "context-lost" : "no-webgl");
      return;
    }
    writeSceneState(isCalm ? "frozen" : "ok");
  }, [supported, reason, isCalm]);

  return (
    <SceneSupportContext.Provider value={{ supported, reason }}>
      {children}
    </SceneSupportContext.Provider>
  );
}
