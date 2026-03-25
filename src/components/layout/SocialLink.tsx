"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Define the props for our reusable component
interface SocialLinkProps {
  href: string;
  name: string;
  icon: LucideIcon;
  colorClass: string;
}

export function SocialLink({ href, name, icon: Icon, colorClass }: SocialLinkProps) {
  const [isFocusedOrHovered, setIsFocusedOrHovered] = useState(false);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit my ${name}`}
      className={cn(
        "flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border bg-card p-3 transition-colors duration-300",
        isFocusedOrHovered && colorClass
      )}
      // --- WORLD-CLASS ACCESSIBILITY ---
      // We now trigger the animation on both hover and focus for full keyboard support.
      onHoverStart={() => setIsFocusedOrHovered(true)}
      onHoverEnd={() => setIsFocusedOrHovered(false)}
      onFocus={() => setIsFocusedOrHovered(true)}
      onBlur={() => setIsFocusedOrHovered(false)}
      animate={{ width: isFocusedOrHovered ? "9.5rem" : "3rem" }}
      transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
    >
      <Icon className="h-6 w-6 flex-shrink-0" />
      <AnimatePresence>
        {isFocusedOrHovered && (
          <motion.span
            className="ml-3 whitespace-nowrap font-semibold text-sm"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
          >
            {name}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.a>
  );
}
