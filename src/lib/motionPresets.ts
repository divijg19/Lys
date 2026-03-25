// Shared Framer Motion variant presets for consistency across sections.
// Includes reduced-motion friendly patterns (callers must gate initial/animate when user prefers reduced motion).

import type { Variants } from "framer-motion";

// Simple fade + slight upward motion
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", duration: 0.8 },
  },
};

// Stagger container factory so we can vary delay per section
export const staggerContainer = (stagger = 0.15, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

// Subtle scale in (e.g., for hero image / feature cards)
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", duration: 0.7 },
  },
};

// Helper to conditionally provide motion props respecting reduced motion at call site.
export const motionProps = (reduce: boolean, variants?: Variants) =>
  reduce
    ? { variants: undefined, initial: undefined, animate: undefined, whileInView: undefined }
    : { variants };
