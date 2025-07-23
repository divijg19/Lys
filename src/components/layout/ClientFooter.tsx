"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Github, Heart, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { bio } from "#velite";
import { Button } from "@/components/ui/Button";
import { useScroll } from "@/hooks/useScroll";

export function ClientFooter() {
  // Your deliberate scroll logic is preserved.
  const { scrolledUp } = useScroll();
  const [isHovered, setIsHovered] = useState(false);
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.div
      className="fixed inset-x-0 bottom-4 z-50 flex justify-center"
      // Hides on scroll up, shows on scroll down/at top, as you specified.
      animate={{ y: scrolledUp ? 100 : 0 }}
      transition={{ type: "spring", bounce: 0.25, duration: 0.8 }}
    >
      <motion.footer
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="flex h-[42px] items-center justify-center overflow-hidden rounded-full border border-border/20 bg-background/80 px-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-lg"
        // The footer itself animates its width to create a seamless transition
        animate={{ width: isHovered ? "auto" : "auto" }}
        transition={{ type: "spring", duration: 0.6, bounce: 0.1 }}
      >
        <AnimatePresence mode="wait">
          {/* --- DEFAULT (MINIMAL) VIEW --- */}
          {!isHovered && (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-x-3"
            >
              <p className="whitespace-nowrap font-medium text-muted-foreground text-sm">
                © {year} {bio.name}
              </p>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-x-2">
                <p className="whitespace-nowrap text-muted-foreground text-sm">
                  All rights reserved
                </p>
                <Heart className="h-4 w-4 flex-shrink-0 fill-red-500 text-red-500" />
              </div>
            </motion.div>
          )}

          {/* --- EXPANDED (HOVER) VIEW --- */}
          {isHovered && (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }} // Delay ensures default text fades out first
              className="flex items-center gap-x-4"
            >
              <div className="flex items-center gap-x-3">
                <Link
                  href="https://github.com/divijg19/portfolio"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View source code for Project Lys"
                  className="whitespace-nowrap font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
                >
                  Project Lys
                </Link>
                <div className="h-4 w-px bg-border" />
                <div className="hidden items-center gap-x-1.5 sm:flex">
                  <p className="whitespace-nowrap text-muted-foreground text-sm">Crafted with</p>
                  <Heart className="h-4 w-4 flex-shrink-0 fill-red-500 text-red-500" />
                  <p className="whitespace-nowrap text-muted-foreground text-sm">
                    , Next.js, React & Tailwind
                  </p>
                </div>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={scrollToTop} aria-label="Scroll to top">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Link
                  href="https://github.com/divijg19/portfolio"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View source code on GitHub"
                >
                  <Button variant="ghost" size="sm">
                    <Github className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`mailto:${bio.email}`} aria-label="Email me">
                  <Button variant="ghost" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.footer>
    </motion.div>
  );
}
