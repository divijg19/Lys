"use client";

import { ArrowUp, Heart, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { SiGithub as Github } from "react-icons/si";
import { bio } from "#velite";
import { Button } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useScroll } from "@/hooks/useScroll";
import { cn } from "@/lib/utils";

export function ClientFooter() {
  // Your deliberate scroll logic is preserved.
  const { scrolledUp } = useScroll();
  const year = new Date().getFullYear();
  const reduceMotion = usePrefersReducedMotion();

  const footerRef = useRef<HTMLElement>(null);
  const collapsedContentRef = useRef<HTMLButtonElement>(null);
  const expandedContentRef = useRef<HTMLDivElement>(null);

  const [collapsedWidth, setCollapsedWidth] = useState<number | null>(null);
  const [expandedWidth, setExpandedWidth] = useState<number | null>(null);
  const linksId = useId();

  const [disclosed, setDisclosed] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const footer = footerRef.current;
      const collapsed = collapsedContentRef.current;
      const expanded = expandedContentRef.current;
      if (!footer || !collapsed || !expanded) return;

      const footerStyles = window.getComputedStyle(footer);
      const paddingX =
        parseFloat(footerStyles.paddingLeft || "0") + parseFloat(footerStyles.paddingRight || "0");

      const rootFontSize = parseFloat(
        window.getComputedStyle(document.documentElement).fontSize || "16"
      );
      const viewportCap = window.innerWidth - rootFontSize * 2; // calc(100vw - 2rem)

      const collapsedW = Math.ceil(collapsed.getBoundingClientRect().width);
      const expandedW = Math.ceil(expanded.getBoundingClientRect().width);

      const nextCollapsed = Math.min(collapsedW + paddingX, viewportCap);
      const nextExpanded = Math.min(expandedW + paddingX, viewportCap);

      setCollapsedWidth(nextCollapsed);
      setExpandedWidth(nextExpanded);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /**
   * Close the footer once focus has left it entirely.
   *
   * A `focusout` listener rather than a React `onBlur` on the container: that container is a plain
   * div, and biome rejects keyboard handlers on non-interactive elements. `focusout` is the
   * bubbling counterpart, so one listener on the footer covers every control inside it.
   */
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer || !disclosed) return;

    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      // Inside means focus merely moved onto one of the revealed controls, which must keep the
      // footer open -- collapsing mid-keystroke would hide the control being tabbed to.
      if (next && footer.contains(next)) return;
      setDisclosed(false);
    };

    footer.addEventListener("focusout", onFocusOut);
    return () => footer.removeEventListener("focusout", onFocusOut);
  }, [disclosed]);

  const scrollToTop = () => {
    // `smooth` is not free. For a user who has asked for reduced motion it is a vestibular trigger,
    // and this control scrolls the entire document.
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <div
      className={cn(
        /*
          z-30, not z-50.

          The mobile menu overlay is z-40 and the navbar is z-50. While this footer was z-50 its
          collapsed pill -- which is now a real, pointer-interactive button rather than a
          pointer-events-none div -- sat *above* the open menu and swallowed taps aimed at menu
          links near the bottom of the screen. It only needs to clear static page content.
        */
        "fixed inset-x-0 bottom-4 z-30 flex justify-center",
        "transform-gpu transition-transform duration-700 ease-out",
        // This footer hides itself while the user scrolls up (see useScroll). Since opening it also
        // moves focus into it, that slide has to be suspended while open -- otherwise the first Tab
        // stop is a control parked off-screen, i.e. focus the user cannot see at all.
        scrolledUp && !disclosed ? "translate-y-24" : "translate-y-0"
      )}
    >
      <footer
        ref={footerRef}
        className={cn(
          "group relative flex h-10.5 items-center justify-center overflow-hidden rounded-full border border-border/20",
          "bg-background/80 px-6 backdrop-blur-lg",
          "floating-footer w-fit max-w-[calc(100vw-2rem)]",
          "shadow-[0_4px_30px_rgba(0,0,0/0.1)]"
        )}
        style={
          collapsedWidth && expandedWidth
            ? {
                // Use CSS variables so hover/focus-within can animate width smoothly.
                ["--footer-collapsed-w" as never]: `${collapsedWidth}px`,
                ["--footer-expanded-w" as never]: `${expandedWidth}px`,
              }
            : undefined
        }
      >
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "transition-opacity duration-200",
            disclosed ? "pointer-events-none opacity-0" : "opacity-100",
            "group-hover:opacity-0"
          )}
        >
          {/*
            The keyboard entry point, and the reason this footer is usable at all.

            This used to be plain text, so nothing in the footer could take focus. The expanded
            content sat behind `invisible` (visibility: hidden), which removes a subtree from the
            tab order *and* the accessibility tree -- so the intended `group-focus-within` reveal
            could never fire, and the only route to scroll-to-top, GitHub and email was a mouse.

            Making the collapsed pill a real <button> gives keyboard users the same entry: Tab onto
            it and the footer opens, and the next Tab lands on the first link. Pointer behaviour is
            unchanged -- hovering the footer still opens it, via the CSS above.
          */}
          <button
            ref={collapsedContentRef}
            type="button"
            aria-expanded={disclosed}
            aria-controls={linksId}
            aria-label="Show footer links"
            onFocus={() => setDisclosed(true)}
            onClick={() => setDisclosed(true)}
            // Once open this is dropped from the tab order and hidden from assistive tech: it is
            // the way *in*, and staying a stop would put a transparent control between the user and
            // the links they just opened.
            tabIndex={disclosed ? -1 : 0}
            aria-hidden={disclosed}
            className={cn(
              "flex cursor-pointer items-center gap-x-3 whitespace-nowrap rounded-full",
              "text-muted-foreground outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            <p className="font-medium text-sm">
              © {year} {bio.name}
            </p>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-x-2">
              <p className="text-sm">All rights reserved</p>
              <Heart
                aria-hidden="true"
                focusable="false"
                className="h-4 w-4 shrink-0 fill-red-500 text-red-500"
              />
            </div>
          </button>
        </div>

        <div
          id={linksId}
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "transition-opacity duration-200",
            // `invisible` is what made this unreachable, so it is only ever applied while closed.
            // Appending a `visible` utility to fight it would rely on cascade order instead.
            disclosed
              ? "pointer-events-auto opacity-100 delay-75"
              : "pointer-events-none invisible opacity-0",
            "group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-hover:delay-75"
          )}
        >
          <div
            ref={expandedContentRef}
            className="flex items-center gap-x-4 whitespace-nowrap"
          >
            <div className="flex items-center gap-x-3">
              <Link
                href="https://github.com/divijg19"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View source code for Project Lys"
                className="whitespace-nowrap font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
              >
                Project Lys ⚜️
              </Link>
              <div className="h-4 w-px bg-border" />
              <div className="hidden items-center gap-x-1.5 sm:flex">
                <p className="whitespace-nowrap text-muted-foreground text-sm">Crafted with</p>
                <Heart
                  aria-hidden="true"
                  focusable="false"
                  className="h-4 w-4 shrink-0 fill-red-500 text-red-500"
                />
                <p className="text-muted-foreground text-sm">, Next.js, React & Tailwind</p>
              </div>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                aria-label="Scroll to top"
              >
                <ArrowUp
                  aria-hidden="true"
                  focusable="false"
                  className="h-4 w-4"
                />
              </Button>
              {/*
                `asChild` puts the Link on the Button instead of nesting a button inside a link.
                Nesting is invalid -- a link's content model forbids interactive descendants -- and
                it left the inner button with no accessible name of its own, which axe flags as
                button-name.
              */}
              <Button
                asChild
                variant="ghost"
                size="sm"
              >
                <Link
                  href="https://github.com/divijg19"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View source code on GitHub"
                >
                  <Github
                    aria-hidden="true"
                    focusable="false"
                    className="h-4 w-4"
                  />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
              >
                <Link
                  href={`mailto:${bio.email}`}
                  aria-label="Email me"
                >
                  <Mail
                    aria-hidden="true"
                    focusable="false"
                    className="h-4 w-4"
                  />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
