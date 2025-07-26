/**
 * @file: src/components/layout/Navbar.tsx
 * @description: The main navigation header for the application.
 *
 * This component features a responsive design that includes:
 * - A desktop navigation with an animated active link indicator.
 * - A full-screen, animated mobile navigation overlay.
 * - An animation that hides the navbar when scrolling down and reveals it
 *   when scrolling up.
 * - Robust centering to prevent layout shifts from scrollbar presence.
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// --- CORE COMPONENTS & HOOKS ---
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useScroll } from "@/hooks/useScroll";
import { cn } from "@/lib/utils";

// --- DATA ---
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

// --- MAIN NAVBAR COMPONENT ---
export function Navbar() {
  const { scrolledDown } = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close the mobile menu when the screen is resized to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // md breakpoint
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header>
      {/* This motion.nav handles the "hide on scroll" animation */}
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: scrolledDown ? -100 : 0 }}
        transition={{ type: "spring", bounce: 0.25, duration: 0.8 }}
        // This combination of classes is the definitive fix for centering
        // a fixed element while avoiding layout shift when the scrollbar appears.
        className="-translate-x-1/2 fixed top-4 left-1/2 z-50 flex w-[90%] max-w-screen-md items-center justify-between rounded-full border border-border/20 bg-background/80 px-4 py-2 shadow-black/5 shadow-lg backdrop-blur-lg"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="bg-gradient-to-r from-primary to-accent bg-clip-text font-extrabold text-2xl text-transparent transition-opacity hover:opacity-80"
          aria-label="Go to homepage"
        >
          Divij
        </Link>

        {/* Desktop Navigation in the center */}
        <DesktopNav />

        {/* Right-aligned items */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <MobileNavToggle isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        </div>
      </motion.nav>

      {/* The mobile menu is separate so its state doesn't affect the nav's animation. */}
      <MobileMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
    </header>
  );
}

// --- Sub-component: Desktop Navigation ---
function DesktopNav() {
  const pathname = usePathname();
  return (
    // Centered navigation for desktop, hidden on mobile
    <ul className="hidden items-center gap-2 md:flex">
      {navLinks.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={cn(
              "relative rounded-full px-3 py-1 font-medium text-base text-muted-foreground transition-colors hover:text-foreground",
              pathname === link.href && "text-primary"
            )}
            aria-current={pathname === link.href ? "page" : undefined}
          >
            {link.label}
            {/* The animated underline for the active link */}
            {pathname === link.href && (
              <motion.div
                className="absolute inset-x-0 bottom-[-2px] h-[2px] w-full bg-primary"
                layoutId="underline"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// --- Sub-component: Mobile Navigation Toggle Button ---
function MobileNavToggle({
  isMenuOpen,
  setIsMenuOpen,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      className="relative z-50 flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary md:hidden"
      aria-label="Toggle menu"
      aria-expanded={isMenuOpen}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={isMenuOpen ? "close" : "open"}
          initial={{ rotate: -45, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 45, opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}

// --- Sub-component: Mobile Menu Overlay ---
function MobileMenu({
  isMenuOpen,
  setIsMenuOpen,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}) {
  // This effect correctly prevents body scrolling when the full-screen menu is open.
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup function restores scrolling when the component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          // A fixed container with a high z-index to overlay all other content
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xl md:hidden"
        >
          <motion.ul
            initial="hidden"
            animate="show"
            variants={{
              hidden: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
              show: { transition: { staggerChildren: 0.1 } },
            }}
            className="flex h-dvh flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link) => (
              <motion.li
                key={link.href}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)} // Close menu on link click
                  className="block text-center font-bold text-3xl text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
