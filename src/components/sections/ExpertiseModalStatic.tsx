"use client";

import { Link as LinkIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { projects } from "#velite";
import { resolveIconFromPath } from "@/components/icons/registry";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
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

export function ExpandedSkillModalStatic({
  skill,
  onClose,
}: {
  skill: Skill;
  onClose: () => void;
}) {
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
        // @ts-expect-error inert polyfill
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
      <button
        type="button"
        aria-label="Close dialog"
        data-overlay
        tabIndex={-1}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
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
                          passHref
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
      </div>
    </div>
  );
}
