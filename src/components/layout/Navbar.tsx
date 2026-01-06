"use client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useScroll } from "@/hooks/useScroll";
import { useTheme } from "@/hooks/useTheme";
import { NAV_LINKS, ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

// --- Main Navbar Component ---
export function Navbar() {
  const { scrolledDown } = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header>
      <nav
        className={cn(
          // --- Core Layout Strategy for a Balanced, Compact Feel ---
          // 1. `w-auto`: The navbar shrinks to the width of its content.
          // 2. `justify-center`: All content blocks are centered within the navbar.
          // 3. `gap-x-4` & `md:gap-x-6`: Creates a healthy, responsive space BETWEEN the main groups.
          // 4. `px-4`: Provides the essential padding at the far ends, giving the corner elements breathing room.
          "-translate-x-1/2 fixed top-4 left-1/2 z-50 flex w-auto items-center justify-center gap-x-4 px-4",
          "rounded-full border border-border/20 bg-background/80 py-2 shadow-lg backdrop-blur-lg md:gap-x-6",
          "transform-gpu transition-transform duration-700 ease-out",
          scrolledDown ? "-translate-y-28" : "translate-y-0"
        )}
        aria-label="Main navigation"
      >
        {/* --- Left Group --- */}
        <div className="flex items-center gap-x-2">
          <ThemeCycleIcon />
          <Link
            href={ROUTES.home}
            className="bg-linear-to-r from-primary to-accent bg-clip-text font-extrabold text-transparent text-xl transition-opacity hover:opacity-80"
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
      </nav>
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
    <button
      key={isMounted ? theme.name : "placeholder"}
      type="button"
      onClick={cycleTheme}
      aria-label="Cycle to next theme"
      className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-muted-foreground",
        "transition-colors duration-500 hover:bg-primary/30",
        "transition-transform duration-150 ease-out hover:scale-110 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      <span
        key={isMounted ? theme.name : "icon-placeholder"}
        className="absolute text-foreground animate-slot-in"
      >
        {isMounted ? (
          <theme.icon
            className="h-5 w-5 text-foreground"
            aria-hidden="true"
          />
        ) : (
          <div className="h-5 w-5" />
        )}
      </span>
    </button>
  );
}

// --- Sub-component: Desktop Navigation ---
function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav>
      <ul className="flex items-center gap-x-2">
        {NAV_LINKS.map((link) => (
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
                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 w-full bg-primary" />
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

  if (!isMenuOpen) return null;

  return (
    <div className="fixed inset-0 top-0 z-40 h-dvh bg-background/80 backdrop-blur-xl md:hidden animate-fade-in">
      <ul className="flex h-full flex-col items-center justify-center gap-10">
        {NAV_LINKS.map((link, index) => (
          <li
            key={link.href}
            className="animate-slot-in"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <Link
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="block text-center font-bold text-3xl text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
