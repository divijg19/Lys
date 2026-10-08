"use client";

import { useMounted } from "@/hooks/useMounted";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useReducedData } from "@/hooks/useReducedData";

/**
 * Whether framer-motion entrance animation should be used for a section.
 *
 * The static server-renderable branch is the default; the animated branch is
 * mounted only once the user is known to allow motion, have not requested
 * reduced motion, and not be on a constrained connection. This mirrors the
 * previous LazyMotion `motionReady && !reduceMotion && !reducedData` gate,
 * expressed without the deferred dynamic import (framer-motion is already part
 * of the eager bundle).
 */
export function useSectionMotion(): boolean {
  const mounted = useMounted();
  const reduceMotion = usePrefersReducedMotion();
  const { reducedData } = useReducedData();
  return mounted && !reduceMotion && !reducedData;
}
