"use client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useIsDesktopViewport } from "@/hooks/useIsDesktopViewport";
import { useScroll } from "@/hooks/useScroll";
import { acquireScrollLock } from "@/lib/scrollLock";
import { useTheme } from "@/hooks/useTheme";
import { NAV_LINKS, ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

// --- Main Navbar Component ---
export function Navbar() {
  const { scrolledDown } = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Focus returns here when the menu closes. Without it, dismissing the menu dropped focus on
  // <body>, so a keyboard user lost their place in the header entirely.
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const isDesktop = useIsDesktopViewport();
  const pathname = usePathname();

  // Dismiss the mobile menu on the way up to desktop. The overlay is `md:hidden`, so past this
  // width it is invisible while still mounted -- and while mounted it holds the scroll lock, marks
  // every sibling `inert` and `aria-hidden`, and traps focus. Rotating a phone or resizing a
  // window past the breakpoint used to leave the page unreachable with no visible way out.
  useEffect(() => {
    if (isDesktop) setIsMenuOpen(false);
  }, [isDesktop]);

  // Close on navigation. The menu links deliberately have no click handler: closing there
  // unmounted the anchor in the same tick as the click, so Next's router never acted on it and
  // the tap did nothing. Watching the pathname closes the menu once the route has actually
  // committed, which is also what desktop nav links already did via their own `onClick`.
  useEffect(() => {
    // `pathname` is read here only to mark this effect as route-driven; the value itself is not
    // needed. Without the reference the lint rule flags it as an unnecessary dependency, but the
    // effect genuinely must re-run when the route changes.
    if (pathname) setIsMenuOpen(false);
  }, [pathname]);

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
            Lys
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
            toggleRef={toggleRef}
          />
        </div>
      </nav>
      <MobileMenu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        toggleRef={toggleRef}
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
  toggleRef,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={toggleRef}
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
  toggleRef,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    // Held for as long as the menu is open, and released on close or unmount. Reference
    // counted, so a dialog that opens on top of the menu keeps the page locked when the menu
    // closes -- without this, this component's own release would have unlocked the page
    // behind the dialog.
    if (!isMenuOpen) return;
    const release = acquireScrollLock();
    return release;
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const el = menuRef.current;
    if (!el) return;

    const selector = "a[href], button:not([disabled])";
    // Move focus into the menu on open. Previously focus stayed on the toggle button while a
    // full-screen overlay covered the page, so a keyboard or screen-reader user was left with
    // nothing focused inside the thing they had just opened.
    (Array.from(el.querySelectorAll<HTMLElement>(selector))[0] || el).focus();

    const onKey = (e: KeyboardEvent) => {
      // Escape closes the menu. Without this the only ways out were the toggle button and picking
      // a link, so a keyboard user who opened the menu had no keyboard route back -- and because
      // the open menu holds a scroll lock, the page stayed locked with no way to release it.
      if (e.key === "Escape") {
        e.preventDefault();
        setIsMenuOpen(false);
        return;
      }
      if (e.key === "Tab") {
        // Recomputed per keypress rather than captured once at mount, matching the expertise
        // dialog: a snapshot taken at mount would miss focusables that appear later and let Tab
        // walk straight out of the overlay into the page behind it.
        const focusable = Array.from(el.querySelectorAll<HTMLElement>(selector));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMenuOpen, setIsMenuOpen]);

  // Return focus to the toggle on close, and take the page behind the overlay out of reach.
  //
  // Both are done in cleanup rather than on close, so they are correct no matter which path closed
  // the menu -- Escape, the toggle, or following a link. Restoring focus before the overlay has
  // finished unmounting is not an issue here: the menu has no exit animation, so the element is
  // gone by the time this runs.
  useEffect(() => {
    if (!isMenuOpen) return;
    const overlay = menuRef.current;
    if (!overlay) return;
    // Portalled to document.body, so the overlay's siblings are exactly the page behind it.
    // The same reasoning as the expertise dialog: rendered inline inside <header>, the guard would
    // never hold and the page behind would stay reachable.
    const parent = overlay.parentElement;
    if (parent !== document.body) return;
    const siblings = Array.from(document.body.children).filter((el) => el !== overlay);
    siblings.forEach((el) => {
      el.setAttribute("aria-hidden", "true");
      // @ts-expect-error inert polyfill
      el.inert = true;
    });
    return () => {
      siblings.forEach((el) => {
        el.removeAttribute("aria-hidden");
        // @ts-expect-error
        el.inert = false;
      });
      // Only if the toggle is still on the page: the user may have navigated away.
      const toggle = toggleRef.current;
      if (toggle?.isConnected) toggle.focus();
    };
  }, [isMenuOpen, toggleRef]);

  if (!isMenuOpen) return null;

  const menu = (
    <div
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 top-0 z-40 h-dvh bg-background/80 backdrop-blur-xl md:hidden animate-fade-in"
    >
      <h2
        id={titleId}
        className="sr-only"
      >
        Site navigation
      </h2>
      <ul className="flex h-full flex-col items-center justify-center gap-10">
        {NAV_LINKS.map((link, index) => (
          <li
            key={link.href}
            className="animate-slot-in"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            {/*
              No onClick that closes the menu.

              Closing here unmounts this anchor in the same tick as the click, so Next's router
              never gets to act on it and the tap does nothing at all. Since the menu is portalled
              to `document.body`, the unmount is immediate and the navigation is reliably lost.
              The menu closes on the pathname changing instead -- see the effect above -- which
              happens after the route has actually committed.
            */}
            <Link
              href={link.href}
              className="block text-center font-bold text-3xl text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return createPortal(menu, document.body);
}
