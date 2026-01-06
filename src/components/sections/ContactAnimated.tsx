"use client";

import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

type ContactAnimatedProps = PropsWithChildren<{
  sectionId: string;
}>;

export function ContactAnimated({ sectionId, children }: ContactAnimatedProps) {
  return (
    <motion.section
      id={sectionId}
      className="mx-auto w-full max-w-7xl px-4 py-16"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      data-section="contact"
    >
      {children}
    </motion.section>
  );
}
