"use client";

/**
 * @file: src/hooks/useDocumentVisibility.ts
 * @description: Reactive `document.visibilityState`, for pausing work in background tabs.
 *
 * Extracted from a private copy inside `DarkScene`. Browsers throttle requestAnimationFrame
 * in hidden tabs, but that is a heuristic that varies by engine and battery state, and it
 * does nothing for timers or for the scene's own canvas loops. Scenes that care should ask
 * here instead.
 */

import { useEffect, useState } from "react";

export function useDocumentVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const update = () => setIsVisible(document.visibilityState === "visible");
    update();

    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return isVisible;
}

/**
 * Convenience inverse of {@link useDocumentVisibility}, which is how callers usually want
 * it: "should I stop working?"
 */
export function useDocumentHidden(): boolean {
  return !useDocumentVisibility();
}
