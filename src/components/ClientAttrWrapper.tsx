"use client";
import { useEffect } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useReducedData } from "@/hooks/useReducedData";

/**
 * ClientAttrWrapper
 * Applies runtime data attributes to <html> for motion & data preferences.
 */
export function ClientAttrWrapper({ children }: { children: React.ReactNode }) {
  const reduceMotion = usePrefersReducedMotion();
  useReducedData();
  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion) root.setAttribute("data-reduce-motion", "true");
    else root.removeAttribute("data-reduce-motion");
  }, [reduceMotion]);
  // Fallback: ensure a data-theme attribute exists very early if next-themes hasn't applied yet
  useEffect(() => {
    const root = document.documentElement;
    if (!root.getAttribute("data-theme")) {
      root.setAttribute("data-theme", "light");
    }
  }, []);
  return <>{children}</>;
}
