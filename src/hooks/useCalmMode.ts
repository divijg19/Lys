"use client";

/**
 * @file: src/hooks/useCalmMode.ts
 * @description: Single source of truth for "should this theme render motion?".
 *
 * Three separate scenes each carried a private `readIsCalm()` copy that checked the
 * same two root attributes, and two scenes checked neither. This hook is the single
 * implementation, so every scene agrees on what counts as calm and stays reactive to
 * preference changes that happen after mount.
 *
 * The source of truth is the `data-reduce-motion` / `data-low-data` attributes on
 * `<html>`, which `ClientAttrWrapper` already derives from `prefers-reduced-motion`
 * and the Network Information API.
 */

import { useEffect, useState } from "react";

/** Attributes that suppress decorative motion, set by `ClientAttrWrapper`. */
export const CALM_ATTRIBUTES = ["data-reduce-motion", "data-low-data"] as const;

/**
 * Read the current calm state synchronously.
 *
 * Exported so animation loops (which cannot depend on React state) can branch on the
 * same definition the hook uses.
 */
export function readCalmMode(): boolean {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return CALM_ATTRIBUTES.some((attribute) => root.hasAttribute(attribute));
}

/**
 * Reactive calm-mode flag for theme scenes.
 *
 * @returns `true` when the user prefers reduced motion, the device reports a
 * data-constrained connection, or the active theme forces calm presentation.
 */
export function useCalmMode(): boolean {
  const [isCalm, setIsCalm] = useState(false);

  useEffect(() => {
    const update = () => setIsCalm(readCalmMode());

    update();

    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [...CALM_ATTRIBUTES],
    });
    return () => observer.disconnect();
  }, []);

  return isCalm;
}
