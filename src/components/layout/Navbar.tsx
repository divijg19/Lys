"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useScroll } from "@/hooks/useScroll";
import { cn } from "@/lib/utils";

// --- Data: Navigation Links ---
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

// --- Main Navbar Component ---
export function Navbar() {
  const { scrolledDown } = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // The problematic useEffect has been removed, resolving the linter errors.
  // The logic is now correctly handled by an onClick in the MobileMenu.

  return (
    <header>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: scrolledDown ? -100 : 0 }}
        transition={{ type: "spring", bounce: 0.25, duration: 0.8 }}
        // --- THE DEFINITIVE CENTERING & POSITIONING FIX ---
        // 1. `fixed` is used to ensure the scroll-up animation works correctly.
        // 2. `left-1/2 -translate-x-1/2` centers the Navbar based on its own
        //    width, making it completely immune to scrollbar-induced layout shifts.
        // 3. `mx-auto` is no longer used for centering.
        className="-translate-x-1/2 fixed top-4 left-1/2 z-50 flex w-[90%] max-w-screen-md items-center justify-center gap-7 rounded-full border border-border/20 bg-background/80 px-4 py-2 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-lg md:w-full"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="bg-gradient-to-r from-primary to-accent bg-clip-text font-extrabold text-2xl text-transparent transition-opacity hover:opacity-80"
          aria-label="Go to homepage"
        >
          Divij
        </Link>
        <div className="hidden h-6 w-px bg-border/50 md:block" />
        <DesktopNav />
        <div className="hidden h-6 w-px bg-border/50 md:block" />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <MobileNavToggle isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        </div>
      </motion.nav>
      <MobileMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
    </header>
  );
}

// --- Sub-component: Desktop Navigation ---
function DesktopNav() {
  const pathname = usePathname();
  return (
    <ul className="hidden items-center gap-2 md:flex">
      {navLinks.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={cn(
              "relative rounded-full px-3 py-1 font-medium text-base text-muted-foreground transition-colors hover:text-foreground",
              pathname === link.href && "font-semibold text-primary"
            )}
            aria-current={pathname === link.href ? "page" : undefined}
          >
            {link.label}
            {pathname === link.href && (
              <motion.div
                className="absolute inset-x-0 bottom-[-2px] h-[2px] w-full bg-primary"
                layoutId="underline"
                transition={{ type: "spring", duration: 0.5 }}
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
      className="relative z-50 rounded-full p-2 text-foreground transition-colors hover:bg-secondary md:hidden"
      aria-label="Toggle menu"
      aria-expanded={isMenuOpen}
    >
      {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
  // This hook is still necessary to prevent body scrolling when the
  // full-screen mobile menu is open. Its dependency is correct.
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
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
          transition={{ duration: 0.2 }}
          className="fixed inset-x-0 z-40 bg-background/80 backdrop-blur-xl md:hidden"
        >
          <motion.ul
            initial="hidden"
            animate="show"
            variants={{
              hidden: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
              show: { transition: { staggerChildren: 0.1 } },
            }}
            className="flex h-full flex-col items-center justify-center gap-10"
          >
            {navLinks.map((link) => (
              <motion.li
                key={link.href}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              >
                <Link
                  href={link.href}
                  // This onClick is the correct way to close the menu, satisfying all linter rules.
                  onClick={() => setIsMenuOpen(false)}
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
