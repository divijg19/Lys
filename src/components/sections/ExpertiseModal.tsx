"use client";
import { motion } from "framer-motion";
import { Link as LinkIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { projects } from "#velite";
import { resolveIconFromPath } from "@/components/icons/registry";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

// Re-declare Skill type locally (cannot import from component due to circular concerns)
// This mirrors the structure from expertise collection
import type { Skill } from "@/types/expertise";

function InlineTechIcon({
  path,
  alt,
  className,
}: {
  path: string;
  alt: string;
  className?: string;
}) {
  const Icon = resolveIconFromPath(path);
  if (Icon) {
    return (
      <Icon
        className={cn("h-12 w-12", className)}
        title={alt}
      />
    );
  }
  return (
    <Image
      src={path}
      alt={alt}
      width={48}
      height={48}
      className={cn("h-12 w-12", className)}
    />
  );
}

export function ExpandedSkillModal({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const reduceMotion = usePrefersReducedMotion();
  const relevantProjects = projects.filter((p) => skill.projectSlugs?.includes(p.slug));
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const headingId = useId();
  const descId = useId();

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const selector =
      'a[href], button:not([disabled]):not([data-overlay]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(el.querySelectorAll<HTMLElement>(selector));
    (focusable[0] || el).focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && focusable.length) {
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
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
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
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-labelledby={headingId}
      aria-describedby={descId}
      aria-modal="true"
      role="dialog"
    >
      {/*
        The dismiss overlay.

        `motion.button` rather than `motion.div`, so dismissing the dialog is reachable by
        keyboard as well as by pointer. `data-overlay` keeps the focus trap from cycling onto it
        and `tabIndex={-1}` keeps it out of the page's tab order, so neither costs anything.

        It is a motion component because the backdrop has to fade in. Converting it to a plain
        `<button>` for the semantics above dropped the animation with it, and the black backdrop
        then snapped to full opacity on the first frame while the panel eased in over the
        following three -- visibly inconsistent. This restores the baseline fade while keeping
        the button.
      */}
      <motion.button
        // Same rule as the panel below: `animate` always carries the target, because an
        // undefined `animate` paired with `initial={false}` leaves framer on the initial values.
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : undefined}
        exit={reduceMotion ? undefined : { opacity: 0, transition: { duration: 0 } }}
        type="button"
        aria-label="Close dialog"
        data-overlay
        tabIndex={-1}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        // Reduced motion still gets the dialog; it simply arrives without the scale-up.
        //
        // `animate` is never undefined. Paired with `initial={false}`, an undefined `animate`
        // leaves framer holding the `initial` values, which rendered the dialog permanently at
        // `opacity: 0; scale(0.95)` for reduced-motion visitors: the backdrop was visible and
        // the panel behind it was not. Reduced motion skips the transition instead of the target.
        initial={reduceMotion ? false : { scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : undefined}
        exit={
          reduceMotion ? undefined : { scale: 0.95, opacity: 0, transition: { duration: 0.15 } }
        }
        ref={dialogRef}
        className="relative z-10 h-full max-h-144 w-full max-w-4xl overflow-hidden rounded-2xl border bg-linear-to-br from-card to-muted/20 shadow-2xl focus:outline-none"
      >
        <div className="h-full w-full p-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 rounded-full p-2 text-muted-foreground outline-none ring-primary/50 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2"
            aria-label="Close skill details"
          >
            <X size={24} />
          </button>
          <div className="flex items-start gap-5">
            <div className="flex h-15 w-15 shrink-0 items-center justify-center text-[hsl(var(--foreground))]">
              <InlineTechIcon
                path={skill.iconPath}
                alt={`${skill.name} icon`}
                className="h-12 w-12"
              />
            </div>
            <div className="text-left">
              <h3
                id={headingId}
                className="font-bold text-2xl"
              >
                {skill.name}
              </h3>
              <p className="text-md text-muted-foreground">{skill.level}</p>
            </div>
          </div>
          <div className="mt-8 h-[calc(100%-6rem)] w-full overflow-y-auto pr-4">
            <div className="grid h-full grid-cols-1 gap-x-16 gap-y-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg text-primary">My Expertise</h4>
                  <p
                    id={descId}
                    className="text-base text-muted-foreground leading-relaxed"
                  >
                    {skill.details}
                  </p>
                </div>
                {skill.rationale && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg text-primary">Rationale</h4>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {skill.rationale}
                    </p>
                  </div>
                )}
                {skill.highlights && skill.highlights.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg text-primary">
                      Implementation Highlights
                    </h4>
                    <ul className="list-disc space-y-1 pl-5 text-base text-muted-foreground">
                      {skill.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="space-y-8">
                {relevantProjects.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-primary">Used In Projects</h4>
                    <div className="flex flex-wrap gap-3">
                      {relevantProjects.map((project) => (
                        <Link
                          href={project.url}
                          key={project.slug}
                        >
                          <Badge
                            variant="outline"
                            className="cursor-pointer rounded-md border-primary/20 px-3 py-1.5 text-sm outline-none ring-primary/50 transition-all hover:border-primary hover:bg-primary/10 focus-visible:ring-2"
                          >
                            <LinkIcon className="mr-2 h-3.5 w-3.5" />
                            {project.title}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {skill.ecosystem && skill.ecosystem.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-primary">Related Ecosystem</h4>
                    <div className="flex flex-wrap gap-2">
                      {skill.ecosystem.map((tool) => (
                        <Badge
                          key={tool}
                          variant="secondary"
                        >
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ExpandedSkillModal;
