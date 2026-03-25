"use client";

import { motion } from "framer-motion";
import { AboutContent } from "./AboutContent";

type AboutAnimatedProps = {
  headingGradient: string;
};
export function AboutAnimated({ headingGradient }: AboutAnimatedProps) {
  return (
    <motion.section
      data-section="about"
      className="mx-auto w-full max-w-7xl px-4 py-16"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      aria-label="About section"
    >
      <AboutContent headingGradient={headingGradient} />
    </motion.section>
  );
}
