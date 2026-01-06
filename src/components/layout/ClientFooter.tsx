"use client";

import { ArrowUp, Github, Heart, Mail } from "lucide-react";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { bio } from "#velite";
import { Button } from "@/components/ui/Button";
import { useScroll } from "@/hooks/useScroll";
import { cn } from "@/lib/utils";

export function ClientFooter() {
  // Your deliberate scroll logic is preserved.
  const { scrolledUp } = useScroll();
  const year = new Date().getFullYear();

  const footerRef = useRef<HTMLElement>(null);
  const collapsedContentRef = useRef<HTMLDivElement>(null);
  const expandedContentRef = useRef<HTMLDivElement>(null);

  const [collapsedWidth, setCollapsedWidth] = useState<number | null>(null);
  const [expandedWidth, setExpandedWidth] = useState<number | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-4 z-50 flex justify-center",
        "transform-gpu transition-transform duration-700 ease-out",
        scrolledUp ? "translate-y-24" : "translate-y-0"
      )}
    >
      <footer
        ref={footerRef}
        className={cn(
          "group relative flex h-10.5 items-center justify-center overflow-hidden rounded-full border border-border/20",
          "bg-background/80 px-6 backdrop-blur-lg",
          "floating-footer w-fit max-w-[calc(100vw-2rem)]",
          "shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
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
            "opacity-100 group-hover:opacity-0 group-focus-within:opacity-0"
          )}
        >
          <div
            ref={collapsedContentRef}
            className="flex items-center gap-x-3 whitespace-nowrap"
          >
            <p className="font-medium text-muted-foreground text-sm">
              © {year} {bio.name}
            </p>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-x-2">
              <p className="text-muted-foreground text-sm">All rights reserved</p>
              <Heart className="h-4 w-4 shrink-0 fill-red-500 text-red-500" />
            </div>
          </div>
        </div>

        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "pointer-events-none invisible opacity-0 transition-opacity duration-200",
            "group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-hover:delay-75",
            "group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100 group-focus-within:delay-75"
          )}
        >
          <div
            ref={expandedContentRef}
            className="flex items-center gap-x-4 whitespace-nowrap"
          >
            <div className="flex items-center gap-x-3">
              <Link
                href="https://github.com/divijg19/portfolio"
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
                <Heart className="h-4 w-4 shrink-0 fill-red-500 text-red-500" />
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
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Link
                href="https://github.com/divijg19/portfolio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View source code on GitHub"
              >
                <Button
                  variant="ghost"
                  size="sm"
                >
                  <Github className="h-4 w-4" />
                </Button>
              </Link>
              <Link
                href={`mailto:${bio.email}`}
                aria-label="Email me"
              >
                <Button
                  variant="ghost"
                  size="sm"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
