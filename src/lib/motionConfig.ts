import type { Variants } from "framer-motion";

// Helpers to minimize repetitive reduced-motion ternaries in components.

export function inViewMotion(reduce: boolean, variants?: Variants, amount = 0.3, once = true) {
  if (reduce) return { viewport: { once, amount } };
  return {
    initial: "hidden" as const,
    whileInView: "show" as const,
    viewport: { once, amount },
    variants: variants ?? { hidden: {}, show: {} },
  };
}
