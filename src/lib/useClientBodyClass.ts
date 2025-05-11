"use client";

import { useEffect } from "react";

/**
 * Hook to safely apply one or more classes to the document <body> on the client only.
 * Automatically cleans up on unmount or class change.
 *
 * @param bodyClasses - A single class or array of classes to apply to <body>.
 */
export function useClientBodyClass(bodyClasses: string | string[]) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const classList = Array.isArray(bodyClasses) ? bodyClasses : [bodyClasses];

    classList.forEach((cls) => document.body.classList.add(cls));

    return () => {
      classList.forEach((cls) => document.body.classList.remove(cls));
    };
  }, [bodyClasses]);
}
