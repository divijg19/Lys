"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useScroll } from "@/hooks/useScroll";
import { useTheme } from "@/hooks/useTheme";
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

  return (
    <header>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: scrolledDown ? -100 : 0 }}
        transition={{ type: "spring", bounce: 0.25, duration: 0.8 }}
        className={cn(
          // --- Core Layout Strategy for a Balanced, Compact Feel ---
          // 1. `w-auto`: The navbar shrinks to the width of its content.
          // 2. `justify-center`: All content blocks are centered within the navbar.
          // 3. `gap-x-4` & `md:gap-x-6`: Creates a healthy, responsive space BETWEEN the main groups.
          // 4. `px-4`: Provides the essential padding at the far ends, giving the corner elements breathing room.
          "-translate-x-1/2 fixed top-4 left-1/2 z-50 flex w-auto items-center justify-center gap-x-4 px-4",
          "rounded-full border border-border/20 bg-background/80 py-2 shadow-lg backdrop-blur-lg md:gap-x-6"
        )}
        aria-label="Main navigation"
      >
        {/* --- Left Group --- */}
        <div className="flex items-center gap-x-2">
          <ThemeCycleIcon />
          <Link
            href="/"
            className="bg-gradient-to-r from-primary to-accent bg-clip-text font-extrabold text-transparent text-xl transition-opacity hover:opacity-80"
            aria-label="Go to homepage"
          >
            Divij
          </Link>
        </div>

        {/* --- Center Group --- */}
        <div className="hidden items-center gap-x-4 md:flex">
          <div className="h-6 w-px bg-border/30" />
          <DesktopNav />
          <div className="h-6 w-px bg-border/30" />
        </div>

        {/* --- Right Group --- */}
        <div className="flex items-center justify-end gap-x-1">
          <ThemeToggle />
          <MobileNavToggle
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
          />
        </div>
      </motion.nav>
      <MobileMenu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
    </header>
  );
}

// --- Sub-component: Theme Cycle Icon ---
function ThemeCycleIcon() {
  const { cycleTheme, theme, isMounted } = useTheme();

  return (
    <motion.button
      key={isMounted ? theme.name : "placeholder"}
      type="button"
      onClick={cycleTheme}
      aria-label="Cycle to next theme"
      className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-muted-foreground transition-colors duration-500 hover:bg-primary/30"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", duration: 0.2 }}
    >
      <AnimatePresence
        mode="wait"
        initial={false}
      >
        <motion.div
          key={isMounted ? theme.name : "icon-placeholder"}
          initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 45, scale: 0.5 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0 }}
          className="absolute"
        >
          {isMounted ? <theme.icon className="h-5 w-5" /> : <div className="h-5 w-5" />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

// --- Sub-component: Desktop Navigation ---
function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav>
      <ul className="flex items-center gap-x-2">
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
    </nav>
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
          className="fixed inset-0 top-0 z-40 h-dvh bg-background/80 backdrop-blur-xl md:hidden"
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
