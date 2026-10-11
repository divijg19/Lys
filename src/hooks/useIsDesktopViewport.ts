"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether the viewport is at or above Tailwind's `md` breakpoint (768px).
 *
 * The number is kept in sync with the `md:` variant rather than hard-coded twice, because the
 * mobile menu's visibility depends on the same breakpoint: the overlay and the toggle are both
 * `md:hidden`.
 */
const MD_BREAKPOINT_PX = 768;

/**
 * Whether the viewport is at least `md` wide, where the desktop nav replaces the mobile menu.
 *
 * Used to dismiss the mobile menu on the way up. Without it, rotating a phone or resizing a
 * window past 768px while the menu was open left the overlay `display: none` but still mounted:
 * it kept the scroll lock, kept every sibling `inert` and `aria-hidden`, and kept the focus trap
 * -- with no visible control left to dismiss it. A touch-only user had no way out at all.
 */
export function useIsDesktopViewport(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const query = window.matchMedia(`(min-width: ${MD_BREAKPOINT_PX}px)`);
    setIsDesktop(query.matches);

    const onChange = (e: MediaQueryList | MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };

    // Safari below 14 only has the deprecated add/removeListener pair.
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    }
    query.addListener(onChange);
    return () => query.removeListener(onChange);
  }, []);

  return isDesktop;
}
