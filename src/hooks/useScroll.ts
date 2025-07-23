"use client";

import { useEffect, useState } from "react";

export function useScroll() {
  const [scrolledDown, setScrolledDown] = useState(false);
  const [scrolledUp, setScrolledUp] = useState(false);
  const [lastYPos, setLastYPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentYPos = window.scrollY;
      const isScrollingDown = currentYPos > lastYPos;
      const isScrollingUp = currentYPos < lastYPos;

      // Update scrolledDown if direction changes
      if (isScrollingDown !== scrolledDown) {
        setScrolledDown(isScrollingDown);
      }
      // Update scrolledUp if direction changes
      if (isScrollingUp !== scrolledUp) {
        setScrolledUp(isScrollingUp);
      }

      setLastYPos(currentYPos);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastYPos, scrolledDown, scrolledUp]);

  return { scrolledDown, scrolledUp };
}
