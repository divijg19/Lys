"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { BarChart, Cloud, Code, Database, Feather, GraduationCap, Server, X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  type ComponentType,
  type Dispatch,
  memo,
  type SetStateAction,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDebouncedCallback } from "use-debounce";
import { expertise } from "#velite";
import { resolveIconFromPath } from "@/components/icons/registry";
import { Badge } from "@/components/ui/Badge";
import { useGridColumns } from "@/hooks/useGridColumns";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";
import type { Skill } from "@/types/expertise";

const ExpandedSkillModal = dynamic<{
  skill: Skill;
  onClose: () => void;
}>(() => import("./ExpertiseModal").then((m) => m.ExpandedSkillModal), { ssr: false });

const iconMap = { Code, Feather, Server, Cloud, Database, BarChart, GraduationCap } as const;

function TechIcon({
  path,
  alt: _alt,
  size = 20,
  className,
}: {
  path: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  const Icon = resolveIconFromPath(path);
  const cls = cn("flex-shrink-0 text-primary", className);

  if (Icon) {
    // Ensure Icon has the expected props (className, title, size) and type it accordingly
    const IconComponent = Icon as ComponentType<{
      className?: string;
      title?: string;
      size?: number;
      labelled?: boolean;
    }>;
    return (
      <IconComponent
        className={cls}
        labelled={false}
        size={size}
      />
    );
  }
  return (
    <Image
      src={path}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={cls}
      style={{ width: size, height: size }}
    />
  );
}

export function Expertise() {
  const [skill, setSkill] = useState<Skill | null>(null); // modal state (third state)
  const [previewSkill, setPreviewSkill] = useState<string | null>(null); // expanded preview key (second state)
  const prevFocus = useRef<HTMLElement | null>(null);
  const id = useId();

  // Debounced hover intent (enter) & collapse (leave) handlers
  const debouncedPreview = useDebouncedCallback(
    (name: string | null) => {
      setPreviewSkill((prev) => (prev === name ? prev : name));
    },
    250,
    { leading: false, trailing: true }
  );

  const debouncedCollapse = useDebouncedCallback(() => {
    setPreviewSkill(null);
  }, 180);

  const collapsePreviewNow = useCallback(() => {
    debouncedPreview.cancel();
    debouncedCollapse.cancel();
    setPreviewSkill(null);
  }, [debouncedCollapse, debouncedPreview]);

  useEffect(() => {
    if (skill) {
      prevFocus.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.removeProperty("overflow");
      prevFocus.current?.focus();
    }
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [skill]);

  // ESC to collapse preview
  useEffect(() => {
    if (!previewSkill) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewSkill(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewSkill]);

  return (
    <section
      id={id}
      data-section="expertise"
      aria-label="Tech Stack and Expertise"
      className="relative mx-auto w-full max-w-7xl px-4 py-20"
    >
      <header className="mb-16 animate-fade-in text-center opacity-0">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Tech Stack &amp; Expertise
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          A showcase of my skills. Hover to see competencies, click for a detailed view.
        </p>
      </header>
      <div className="space-y-14">
        {expertise.categories.map((cat, i) => (
          <div key={cat.name}>
            <CategoryHeading
              name={cat.name}
              iconName={cat.icon}
              first={i === 0}
            />
            <div className="overflow-x-auto overflow-y-visible overscroll-x-contain">
              <LayoutGroup id={`cat-${cat.name}`}>
                <SkillGrid
                  catName={cat.name}
                  skills={cat.skills}
                  previewSkill={previewSkill}
                  setPreviewSkill={setPreviewSkill}
                  onSelectSkill={setSkill}
                  onQueueCollapse={() => {
                    debouncedPreview.cancel();
                    debouncedCollapse();
                  }}
                  onCollapseNow={collapsePreviewNow}
                  onQueuePreview={(key) => {
                    debouncedCollapse.cancel();
                    debouncedPreview(key);
                  }}
                />
              </LayoutGroup>
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {skill && (
          <ExpandedSkillModal
            skill={skill}
            onClose={() => setSkill(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function SkillGrid({
  catName,
  skills,
  previewSkill,
  setPreviewSkill,
  onSelectSkill,
  onQueueCollapse,
  onCollapseNow,
  onQueuePreview,
}: {
  catName: string;
  skills: Skill[];
  previewSkill: string | null;
  setPreviewSkill: Dispatch<SetStateAction<string | null>>;
  onSelectSkill: (s: Skill) => void;
  onQueueCollapse: () => void;
  onCollapseNow: () => void;
  onQueuePreview: (key: string) => void;
}) {
  const gridRef = useRef<HTMLUListElement | null>(null);
  const columns = useGridColumns(gridRef);

  const allowPreview = columns >= 2;
  const rows = 2;
  const totalCols = Math.ceil(skills.length / rows);
  const fitsInViewport = columns > 0 && totalCols <= columns;

  // Keep the visual order row-first (top row fills left-to-right, then bottom row),
  // while still using a 2-row, column-flow grid for stable sizing and expansion.
  const orderedSkills = useMemo(() => {
    const cols = Math.ceil(skills.length / rows);
    const ordered: Skill[] = [];
    for (let c = 0; c < cols; c++) {
      if (skills[c]) ordered.push(skills[c]);
      const secondRowIndex = c + cols;
      if (skills[secondRowIndex]) ordered.push(skills[secondRowIndex]);
    }
    return ordered;
  }, [skills]);

  return (
    <ul
      ref={gridRef}
      className="grid w-full gap-4 px-1 pb-2"
      style={{
        // Always keep the tile layout within two rows.
        // Extra skills overflow horizontally so expansion never creates a third row.
        gridTemplateRows: "repeat(2, 9.5rem)",
        gridAutoColumns: "9.5rem",
        gridAutoFlow: "column",
        justifyContent: fitsInViewport ? "center" : "start",
      }}
      data-skill-grid
      onMouseLeave={(e) => {
        /*
         * Collapse when the pointer leaves the entire grid.
         *
         * `relatedTarget` is not reliably a `Node`: when the pointer leaves the document the
         * browser reports `window`, and `Node.contains(window)` throws
         * "parameter 1 is not of type 'Node'". Type-checking before the call makes a null or
         * non-element target count as "outside the grid", which is what it means.
         */
        const related = e.relatedTarget;
        const stillInside = related instanceof Node && e.currentTarget.contains(related);
        if (!stillInside) onQueueCollapse();
      }}
    >
      {orderedSkills.map((s) => {
        const key = `${catName}::${s.name}`;
        return (
          <SkillCard
            key={key}
            skill={s}
            expanded={previewSkill === key}
            allowPreview={allowPreview}
            onSelect={() => onSelectSkill(s)}
            onPreview={() => {
              if (!allowPreview) return;
              onQueuePreview(key);
            }}
            onCollapse={() => {
              onCollapseNow();
              setPreviewSkill(null);
            }}
            previewActive={!!previewSkill}
          />
        );
      })}
    </ul>
  );
}

function CategoryHeading({
  name,
  iconName,
  first,
}: {
  name: string;
  iconName: string;
  first: boolean;
}) {
  const Icon = iconMap[iconName as keyof typeof iconMap];
  return (
    <div className={cn("mb-8 flex items-center gap-4", first ? "mt-0" : "mt-12")}>
      <h3 className="text-3xl font-black tracking-tight text-primary">{name}</h3>
      {Icon && <Icon className="h-9 w-9 text-primary" />}
    </div>
  );
}

interface SkillCardProps {
  skill: Skill;
  onSelect: () => void;
  expanded: boolean;
  allowPreview: boolean;
  onPreview: () => void;
  onCollapse: () => void;
  previewActive?: boolean;
}

const SkillCard = memo(function SkillCard({
  skill,
  onSelect,
  expanded,
  allowPreview,
  onPreview,
  onCollapse,
  previewActive,
}: SkillCardProps) {
  const reduceMotion = usePrefersReducedMotion();
  const effectiveExpanded = expanded && allowPreview;
  const competencies = skill.keyCompetencies || [];
  const panelId = useId();
  // Per-card pointer tracking only (timing handled at parent via debounced callbacks)

  /*
   * Keyboard collapse.
   *
   * Hover intent alone could not dismiss the preview for keyboard users: the grid-level
   * `onMouseLeave` never fires without a pointer, and Escape is only a section-level escape
   * hatch. Tabbing away therefore left a card stuck open with the pointer far away.
   *
   * `relatedTarget` is null when focus leaves the document entirely (blur to the browser
   * chrome), which counts as leaving the card. Tabbing to the collapse button stays inside
   * the card and must not collapse it.
   */
  const onBlur = useCallback(
    (e: React.FocusEvent<HTMLButtonElement>) => {
      if (!effectiveExpanded) return;
      // `relatedTarget` may be `null` (focus left the document) or a non-Node target such as
      // `window`, so it is type-checked before `contains` sees it.
      const next = e.relatedTarget;
      if (next instanceof Node && e.currentTarget.closest("[data-skill-card]")?.contains(next)) {
        return;
      }
      onCollapse();
    },
    [effectiveExpanded, onCollapse]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "Enter", " "];
      if (!keys.includes(e.key)) return;
      const grid = e.currentTarget.closest("[data-skill-grid]") as HTMLElement | null;
      if (!grid) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect();
        return;
      }
      e.preventDefault();
      const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-skill-trigger]"));
      if (!cards.length) return;
      const currentIndex = cards.indexOf(e.currentTarget);
      const total = cards.length;

      // Grid uses two fixed rows with column auto-flow:
      // index = col * rows + row
      const rows = 2;
      const row = currentIndex % rows;
      const totalCols = Math.ceil(total / rows);

      let nextIndex = currentIndex;
      switch (e.key) {
        case "ArrowRight": {
          // move one column right (same row)
          const candidate = currentIndex + rows;
          if (candidate < total) nextIndex = candidate;
          else {
            // wrap to first column, same row if it exists, else 0
            const wrap = row;
            nextIndex = wrap < total ? wrap : 0;
          }
          break;
        }
        case "ArrowLeft": {
          // move one column left (same row)
          const candidate = currentIndex - rows;
          if (candidate >= 0) nextIndex = candidate;
          else {
            // wrap to last column that has this row
            const lastCol = totalCols - 1;
            const wrap = lastCol * rows + row;
            nextIndex = wrap < total ? wrap : total - 1;
          }
          break;
        }
        case "ArrowDown": {
          // move within the column
          if (row < rows - 1) {
            const candidate = currentIndex + 1;
            if (candidate < total) nextIndex = candidate;
          }
          break;
        }
        case "ArrowUp": {
          if (row > 0) nextIndex = currentIndex - 1;
          break;
        }
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = total - 1;
          break;
      }
      cards[nextIndex]?.focus();
    },
    [onSelect]
  );

  return (
    <motion.li
      layout={!reduceMotion}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              layout: {
                type: "tween",
                duration: 0.4,
                delay: 0.02,
                ease: [0.22, 1, 0.36, 1],
              },
            }
      }
      className={cn(effectiveExpanded ? "col-span-2 row-span-2" : undefined)}
    >
      {/*
        Card container.

        A `motion.div` again so the hover affordance is framer's spring rather than a flat CSS
        transition -- that spring is what the card had at v0.1.19 through v0.1.23, and it is what
        makes the hover feel right.

        It carries no `role` and no `tabIndex`. The earlier `role="button"` was the actual
        accessibility defect: it made the card a focusable control that contained another
        focusable control (the collapse button), which axe reports as `nested-interactive`.
        Using `motion.div` is unrelated to that fault, and `whileHover` on a child of a
        `layout`-animated parent is exactly the arrangement the baseline used, so the two do not
        fight each other.

        `onClick` lives here, as in the baseline, so any click on the card opens the details --
        header, badges or competency list. The keyboard control below deliberately has no
        `onClick`: its clicks bubble to this handler, so there is exactly one click path.
      */}
      <motion.div
        whileHover={reduceMotion ? undefined : { scale: 1.01 }}
        whileTap={reduceMotion ? undefined : { scale: 0.995 }}
        /*
         * Hover intent lives here, on the card, and must not be moved onto the trigger button.
         *
         * The trigger is scoped to the header so the expanded panel below it stays clickable and
         * scrollable, which means it is only as tall as the header: 66px of a 152px tile. While
         * the hover handler lived there, the bottom 86px of every card was inert and aiming at a
         * card often did nothing at all -- exactly the disconnect this placement removes. A handler
         * on the container covers the whole subtree, so the full tile is the hover target without
         * the trigger ever having to sit above the panel again.
         */
        onMouseEnter={() => {
          if (!effectiveExpanded) onPreview();
        }}
        onClick={(e) => {
          // The collapse control is a sibling and not an ancestor, so this guard is what keeps
          // "collapse" from also opening the dialog.
          if ((e.target as HTMLElement).closest("[data-collapse-btn]")) return;
          onSelect();
        }}
        className={cn(
          "group relative flex h-full w-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm ring-primary/40 transition-shadow",
          effectiveExpanded ? "p-4 shadow-xl" : "hover:shadow-md",
          !effectiveExpanded && "items-center justify-center", // Default state: center all content
          !effectiveExpanded && previewActive && "opacity-90", // subtle de-emphasis (avoid scale jank)
          effectiveExpanded && "items-start justify-start"
        )}
        data-skill-card
        data-skill={skill.name}
      >
        {/*
          Header (shared structure for both states).

          `relative` because the keyboard control below is absolutely positioned to cover it,
          which keeps the control exactly as tall as the header without hard-coding a height
          that would drift whenever the level badge appears or disappears.
        */}
        <div
          className={cn(
            "relative flex w-full flex-col items-center text-center transition-opacity duration-150",
            "gap-2.5"
          )}
        >
          {/*
            Keyboard and assistive-tech control for the card.

            Scoped to the header on purpose. A full-bleed overlay would sit above the expanded
            panel and make the competency list unclickable and unscrollable; instead the card
            container handles the pointer, and this button carries focus, the accessible name and
            the expanded/controls relationship. It has no `onClick` and no `onMouseEnter`: both
            bubble to the container, so there is one click path and one hover target, and the
            hover target is the whole tile rather than just the header.
          */}
          <button
            type="button"
            data-skill-trigger
            aria-label={`View details for ${skill.name}`}
            aria-expanded={effectiveExpanded}
            aria-controls={effectiveExpanded ? panelId : undefined}
            onFocus={() => {
              if (!allowPreview) return;
              onPreview();
            }}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className="absolute inset-0 z-10 cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
          {/* Icon container - ensures consistent centering */}
          <div className="flex items-center justify-center h-9">
            <TechIcon
              path={skill.iconPath}
              alt={skill.name}
              size={36} // Consistent 36px size for both states
              className="text-primary transition-colors duration-200 shrink-0"
            />
          </div>

          {/* Name and badge container */}
          <div className="w-full text-center">
            <h4 className="font-semibold tracking-tight text-card-foreground text-sm truncate px-2 h-5 flex items-center justify-center">
              {skill.name}
            </h4>
            {effectiveExpanded && (
              <Badge
                variant="secondary"
                className="mt-1.5 px-2 py-0.5 text-[10px]"
              >
                {skill.level}
              </Badge>
            )}
          </div>
        </div>

        {/* Collapse control: a sibling of the overlay button, never a descendant of it. */}
        {effectiveExpanded && (
          <button
            type="button"
            data-collapse-btn
            onClick={onCollapse}
            aria-label="Collapse preview"
            className="absolute top-2 right-2 z-30 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/70 bg-background/70 text-muted-foreground transition-colors hover:text-foreground hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* EXPANDED STATE - description content */}
        <AnimatePresence>
          {effectiveExpanded && (
            <motion.div
              key="expanded-content"
              // `animate` is never undefined. Paired with `initial={false}` an undefined
              // `animate` leaves framer holding the `initial` values, which renders the panel at
              // its pre-animation opacity and size. Reduced motion skips the transition instead.
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      type: "tween",
                      duration: 0.26,
                      delay: 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }
              }
              exit={
                reduceMotion
                  ? undefined
                  : {
                      opacity: 0,
                      y: 3,
                      transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
                    }
              }
              id={panelId}
              className="mt-3 flex h-full w-full flex-col overflow-hidden"
            >
              {competencies.length > 0 && (
                <motion.div
                  className="flex-1 overflow-y-auto pr-1 [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.6),rgba(0,0,0,1)_10%,rgba(0,0,0,1)_90%,rgba(0,0,0,0.6))]"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={reduceMotion ? { duration: 0 } : { delay: 0.05, duration: 0.2 }}
                >
                  <ul className="space-y-1.5 text-[11px] leading-snug text-muted-foreground">
                    {competencies.map((c, i) => (
                      <motion.li
                        key={c}
                        className="line-clamp-1"
                        initial={reduceMotion ? false : { opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={
                          reduceMotion ? { duration: 0 } : { delay: 0.08 + i * 0.02, duration: 0.2 }
                        }
                      >
                        • {c}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
              {skill.ecosystem && skill.ecosystem.length > 0 && (
                <motion.div
                  className="mt-2 flex flex-wrap gap-1.5"
                  initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { delay: 0.1, duration: 0.2 }}
                >
                  {skill.ecosystem.slice(0, 8).map((tool) => (
                    <Badge
                      key={tool}
                      variant="outline"
                      className="px-1.5 py-0 text-[10px]"
                    >
                      {tool}
                    </Badge>
                  ))}
                </motion.div>
              )}
              <motion.div
                className="pt-2 text-[9px] font-medium uppercase tracking-wide text-primary/80"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={reduceMotion ? { duration: 0 } : { delay: 0.15, duration: 0.2 }}
              >
                Click for full details
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 rounded-lg ring-0 group-focus-visible:ring-2 group-focus-visible:ring-primary/40" />
      </motion.div>
    </motion.li>
  );
});

export default Expertise;
