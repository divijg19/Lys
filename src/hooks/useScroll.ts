/**
 * @file: src/hooks/useScroll.ts
 * @description: A highly performant hook to track scroll direction.
 *
 * This hook provides two booleans, `scrolledDown` and `scrolledUp`, which are
 * true when the user is scrolling in the respective direction past a small
 * threshold. It is optimized to prevent unnecessary re-renders.
 */

"use client";

import { useEffect, useRef, useState } from "react";

// A small threshold in pixels to prevent scroll jitter from firing events.
const SCROLL_THRESHOLD = 10;

export function useScroll() {
  const [scrolledDown, setScrolledDown] = useState(false);
  const [scrolledUp, setScrolledUp] = useState(false);

  // --- THE CRITICAL FIX ---
  // We use `useRef` to store the last scroll position.
  // A ref persists across renders but does NOT trigger a re-render when it's
  // updated. This is the key to preventing the effect from re-running on
  // every scroll.
  const lastYPos = useRef(0);

  useEffect(() => {
    // Initialize the ref with the current scroll position when the component mounts.
    // This correctly handles cases where the page is reloaded while scrolled down.
    lastYPos.current = window.scrollY;

    const handleScroll = () => {
      const currentYPos = window.scrollY;

      // 1. Prevent updates if the scroll amount is below the threshold.
      if (Math.abs(currentYPos - lastYPos.current) < SCROLL_THRESHOLD) {
        return;
      }

      // 2. Determine scroll direction.
      const isScrollingDown = currentYPos > lastYPos.current;
      const isScrollingUp = currentYPos < lastYPos.current;

      // 3. Update state only if the direction has changed.
      // React is smart enough to bail out of a re-render if the state is the same,
      // so calling these setters is cheap.
      setScrolledDown(isScrollingDown);
      setScrolledUp(isScrollingUp);

      // 4. Update the ref for the next scroll event.
      lastYPos.current = currentYPos;
    };

    // Add the event listener with the { passive: true } flag for better performance.
    window.addEventListener("scroll", handleScroll, { passive: true });

    // The cleanup function removes the listener when the component unmounts.
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // <-- The empty dependency array is crucial. It ensures this effect runs only ONCE.

  return { scrolledDown, scrolledUp };
}
