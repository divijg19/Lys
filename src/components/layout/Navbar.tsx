"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Cross, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useScroll } from "@/hooks/useScroll";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const { scrolledDown } = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const _pathname = usePathname();

  // --- THE AUTO-CLOSE FIX ---
  // This effect now correctly listens for changes in the `pathname`.
  // When the user navigates to a new page, the mobile menu will close automatically.
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen]);

  return (
    <header>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: scrolledDown ? -100 : 0 }}
        transition={{ type: "spring", bounce: 0.25, duration: 0.8 }}
        className="fixed inset-x-0 top-4 z-50 mx-auto flex w-[95%] max-w-screen-md items-center justify-between rounded-full border border-border/20 bg-background/80 p-3 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-lg"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text font-extrabold text-2xl text-transparent transition-opacity hover:opacity-80"
          aria-label="Go to homepage"
        >
          Divij
        </Link>
        <DesktopNav />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileNavToggle isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        </div>
      </motion.nav>
      <MobileMenu isMenuOpen={isMenuOpen} />
    </header>
  );
}

// --- WORLD-CLASS SUB-COMPONENT: Desktop Navigation ---
function DesktopNav() {
  const pathname = usePathname();
  return (
    <ul className="hidden items-center gap-8 md:flex">
      {navLinks.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={cn(
              "relative font-medium text-base text-muted-foreground transition-colors hover:text-foreground",
              pathname === link.href && "font-semibold text-primary"
            )}
            aria-current={pathname === link.href ? "page" : undefined}
          >
            {link.label}
            {pathname === link.href && (
              <motion.div
                className="absolute bottom-[-6px] left-0 h-[2px] w-full bg-primary"
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

// --- WORLD-CLASS SUB-COMPONENT: Mobile Navigation Toggle ---
// The prop types are now correct and clean.
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
      className="rounded-full p-2 text-foreground transition-colors hover:bg-secondary md:hidden"
      aria-label="Toggle menu"
      aria-expanded={isMenuOpen}
    >
      {isMenuOpen ? <Cross size={20} /> : <Menu size={20} />}
    </button>
  );
}

// --- WORLD-CLASS SUB-COMPONENT: Mobile Menu ---
// The prop types are now correct and clean.
function MobileMenu({ isMenuOpen }: { isMenuOpen: boolean }) {
  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xl md:hidden"
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
                {/* The onClick handler is removed from the Link as the useEffect now handles closing */}
                <Link
                  href={link.href}
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
