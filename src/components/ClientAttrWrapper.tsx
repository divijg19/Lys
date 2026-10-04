"use client";

/**
 * @file: src/components/ClientAttrWrapper.tsx
 * @description: Applies runtime state attributes to `<html>`.
 *
 * This is the **only** writer of the calm attributes. Everything downstream -- `useCalmMode`,
 * every theme scene, and the CSS motion kill rules -- reads them from here, so there is one
 * place that decides what calm means and one place where it can be undone.
 */

import { useEffect, useState } from "react";
import { CALM_ATTRIBUTE, CALM_REASON_ATTRIBUTE, calmReasonFrom } from "@/lib/calm";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useReducedData } from "@/hooks/useReducedData";

/** Set an attribute when `on`, remove it when off. Avoids spurious mutation records. */
function setOrRemove(root: HTMLElement, name: string, on: boolean): void {
  if (on) root.setAttribute(name, "true");
  else root.removeAttribute(name);
}

export function ClientAttrWrapper({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const reducedData = useReducedData();

  const [themeName, setThemeName] = useState<string>("light");

  useEffect(() => {
    const root = document.documentElement;

    const readTheme = () => {
      setThemeName(root.getAttribute("data-theme") || "light");
    };

    readTheme();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
          readTheme();
          break;
        }
      }
    });

    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  /**
   * The `simple` theme forces calm presentation regardless of user preference: it is a
   * high-contrast, motion-free accessibility theme, so honouring a motion preference is
   * part of its contract rather than a concession.
   */
  const reduceMotion = prefersReducedMotion || themeName === "simple";
  const calmReason = calmReasonFrom({ reduceMotion, lowData: reducedData });

  // Single writer for both calm attributes and the diagnostic reason.
  //
  // Both directions matter. The previous implementation only ever added
  // `data-reduce-motion`, and `useReducedData` only ever added `data-low-data`, so a
  // visitor who recovered their connection stayed in calm mode until a full reload.
  useEffect(() => {
    const root = document.documentElement;
    setOrRemove(root, CALM_ATTRIBUTE.reduceMotion, reduceMotion);
    setOrRemove(root, CALM_ATTRIBUTE.lowData, reducedData);

    // The reason is a value, not a boolean, so it is written directly rather than through
    // setOrRemove. Its presence means "a scene may be frozen"; its value says why, which
    // is what makes a blank background diagnosable in production.
    if (calmReason) root.setAttribute(CALM_REASON_ATTRIBUTE, calmReason);
    else root.removeAttribute(CALM_REASON_ATTRIBUTE);
  }, [reduceMotion, reducedData, calmReason]);

  // Fallback: ensure a data-theme attribute exists very early if next-themes hasn't applied yet
  useEffect(() => {
    const root = document.documentElement;
    if (!root.getAttribute("data-theme")) {
      root.setAttribute("data-theme", "light");
    }
  }, []);

  return <>{children}</>;
}
