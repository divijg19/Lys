"use client";

/**
 * @file: src/hooks/useCalmMode.ts
 * @description: Reactive access to calm mode for React consumers.
 *
 * All of the rules live in `@/lib/calm`, which is pure and unit tested. This file is only
 * the subscription: it reads the `<html>` attributes that `ClientAttrWrapper` derives, and
 * re-reads them when they change.
 *
 * Reading the derived attributes rather than querying `matchMedia` directly is deliberate.
 * It means one place decides what calm means, every consumer agrees, and the answer stays
 * correct when the active theme also forces calm (the `simple` theme).
 */

import { useEffect, useState } from "react";
import {
  CALM_ATTRIBUTES,
  type CalmReason,
  readCalmMode,
  readCalmReasonFromElement,
} from "@/lib/calm";

export { CALM_ATTRIBUTES, readCalmMode, sceneMotionPolicy } from "@/lib/calm";
export type { CalmReason, SceneMotionPolicy } from "@/lib/calm";

/**
 * Reactive calm-mode flag.
 *
 * @returns `true` when the visitor prefers reduced motion, the device reports a
 *   data-constrained connection, or the active theme forces calm presentation.
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

/**
 * Reactive calm mode with the reason attached.
 *
 * Use this where the distinction matters, such as diagnostics or choosing a cheaper
 * fallback for a transient network constraint.
 */
export function useCalmReason(): CalmReason | null {
  const [reason, setReason] = useState<CalmReason | null>(null);

  useEffect(() => {
    const update = () => setReason(readCalmReasonFromElement(document.documentElement));

    update();

    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [...CALM_ATTRIBUTES],
    });
    return () => observer.disconnect();
  }, []);

  return reason;
}
