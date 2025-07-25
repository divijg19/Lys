"use client";

import { useEffect } from "react";

export function GlobalLayoutShiftFix() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // This observer watches for any style or class changes on the <html> element.
    const observer = new MutationObserver(() => {
      // Check the COMPUTED style. This is the most reliable source of truth.
      const isHtmlLocked = window.getComputedStyle(html).overflowY === "hidden";

      // Calculate the width of the scrollbar if it's present.
      const scrollbarWidth = window.innerWidth - html.clientWidth;

      if (isHtmlLocked && scrollbarWidth > 0) {
        // If the page is locked, our ONLY job is to compensate on the body.
        // We do not touch the Navbar, as its centering is already stable.
        body.style.paddingRight = `${scrollbarWidth}px`;
      } else {
        // When the lock is removed, reset the body padding.
        body.style.paddingRight = "";
      }
    });

    // Start observing the <html> element for any attribute changes.
    observer.observe(html, { attributes: true });

    // Cleanup function to stop observing when the component unmounts.
    return () => observer.disconnect();
  }, []); // The empty dependency array ensures this runs only once on mount.

  // This component renders nothing. Its only purpose is to run the effect.
  return null;
}
