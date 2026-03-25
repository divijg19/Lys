"use client";

/**
 * usePrefersReducedMotion
 * Lightweight hook to read the user's reduced motion preference.
 * Returns true if the user requests reduced motion.
 */
import { useEffect, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setPrefers(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefers;
}
