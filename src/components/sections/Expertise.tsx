"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { BarChart, Cloud, Code, Database, Feather, GraduationCap, Server, X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { type ComponentType, memo, useCallback, useEffect, useId, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { expertise } from "#velite";
import { resolveIconFromPath } from "@/components/icons/registry";
import { Badge } from "@/components/ui/Badge";
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
  alt,
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
    }>;
    return (
      <IconComponent
        className={cls}
        title={alt}
        size={size}
      />
    );
  }
  return (
    <Image
      src={path}
      alt={alt}
      width={size}
      height={size}
      className={cls}
      style={{ width: size, height: size }}
    />
  );
}

export function Expertise() {
  const [skill, setSkill] = useState<Skill | null>(null); // modal state (third state)
  const [previewSkill, setPreviewSkill] = useState<string | null>(null); // expanded preview (second state)
  const [expandedCardRow, setExpandedCardRow] = useState<number | null>(null); // Track which row the expanded card is in
  const [expandedCardIsRightEdge, setExpandedCardIsRightEdge] = useState<boolean>(false); // Track if card is at right edge
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
    setExpandedCardRow(null);
    setExpandedCardIsRightEdge(false);
  }, 180);

  // Calculate which row a card is in and if it's at the right edge when expanded
  useEffect(() => {
    if (!previewSkill) {
      setExpandedCardRow(null);
      setExpandedCardIsRightEdge(false);
      return;
    }

    const cardEl = document.querySelector<HTMLElement>(
      `[data-skill-card][data-skill='${CSS.escape(previewSkill)}']`
    );
    if (!cardEl) return;

    const grid = cardEl.closest("[data-skill-grid]") as HTMLElement | null;
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-skill-card]"));
    const tops = cards.map((c) => c.getBoundingClientRect().top);
    const minTop = Math.min(...tops);
    const cardTop = cardEl.getBoundingClientRect().top;

    // Determine if card is in first row (row 1) or second row (row 2)
    const row = cardTop <= minTop + 2 ? 1 : 2;
    setExpandedCardRow(row);

    // Determine if card is at the right edge of its row
    const rowCards = cards.filter((c) => {
      const cTop = c.getBoundingClientRect().top;
      return row === 1 ? cTop <= minTop + 2 : cTop > minTop + 2;
    });

    // Sort by left position to find rightmost
    rowCards.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    const isRightmost = rowCards.length > 0 && rowCards[rowCards.length - 1] === cardEl;
    setExpandedCardIsRightEdge(isRightmost);
  }, [previewSkill]);

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
      className="relative mx-auto w-full max-w-screen-xl px-4 py-20"
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
            <div className="overflow-x-hidden overflow-visible">
              <LayoutGroup id={`cat-${cat.name}`}>
                {/* Grid constrained to 2 rows: All cards maintain position, expanded cards overlay */}
                <ul
                  className="grid gap-4 pb-2 justify-center relative"
                  style={{
                    gridTemplateColumns: "repeat(auto-fill, 9.5rem)",
                    gridTemplateRows: "9.5rem 9.5rem", // Exactly 2 rows
                    gridAutoFlow: "row", // Sequential flow, no dense reordering
                  }}
                  data-skill-grid
                  onMouseLeave={(e) => {
                    // Collapse when pointer leaves entire grid
                    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
                      debouncedPreview.cancel();
                      debouncedCollapse();
                    }
                  }}
                >
                  {cat.skills.map((s) => (
                    <li
                      key={s.name}
                      className="relative"
                      style={{ height: "9.5rem", width: "9.5rem" }}
                    >
                      <SkillCard
                        skill={s}
                        expanded={previewSkill === s.name}
                        expandedRow={previewSkill === s.name ? expandedCardRow : null}
                        isRightEdge={previewSkill === s.name ? expandedCardIsRightEdge : false}
                        onSelect={() => setSkill(s)}
                        onPreview={() => {
                          debouncedCollapse.cancel();
                          debouncedPreview(s.name);
                        }}
                        onCollapse={() => {
                          debouncedPreview.cancel();
                          debouncedCollapse();
                        }}
                        previewActive={!!previewSkill}
                      />
                    </li>
                  ))}
                </ul>
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
      {Icon && <Icon className="h-9 w-9 text-primary" />}
      <h3 className="text-3xl font-black tracking-tight text-primary">{name}</h3>
    </div>
  );
}

interface SkillCardProps {
  skill: Skill;
  onSelect: () => void;
  expanded: boolean;
  expandedRow: number | null; // 1 for first row, 2 for second row
  isRightEdge: boolean; // Whether card is at the rightmost position in its row
  onPreview: () => void;
  onCollapse: () => void;
  previewActive?: boolean;
}

const SkillCard = memo(function SkillCard({
  skill,
  onSelect,
  expanded,
  expandedRow,
  isRightEdge,
  onPreview,
  onCollapse,
  previewActive,
}: SkillCardProps) {
  const reduceMotion = usePrefersReducedMotion();
  const competencies = skill.keyCompetencies || [];
  const visibleCompetencies = competencies; // collapsed state no preview list anymore
  // Per-card pointer tracking only (timing handled at parent via debounced callbacks)

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
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
      const cards = Array.from(grid.querySelectorAll<HTMLDivElement>("[data-skill-card]"));
      if (!cards.length) return;
      const currentIndex = cards.indexOf(e.currentTarget);
      const total = cards.length;
      // Determine columns by measuring first row top
      const tops = cards.map((c) => c.getBoundingClientRect().top);
      const firstTop = tops[0];
      const columns =
        tops.findIndex((t) => t > firstTop + 2) === -1
          ? total
          : tops.findIndex((t) => t > firstTop + 2);
      const row = Math.floor(currentIndex / columns);
      const col = currentIndex % columns;
      let nextIndex = currentIndex;
      switch (e.key) {
        case "ArrowRight": {
          if (col < columns - 1 && currentIndex + 1 < total) nextIndex = currentIndex + 1;
          else {
            // move to start of next row if exists
            const candidate = (row + 1) * columns;
            if (candidate < total) nextIndex = candidate;
            else nextIndex = 0; // wrap
          }
          break;
        }
        case "ArrowLeft": {
          if (col > 0) nextIndex = currentIndex - 1;
          else {
            // go to end of previous row or wrap to last item
            const prevRowStart = (row - 1) * columns;
            if (row > 0) {
              const lastInPrevRow = Math.min(prevRowStart + columns - 1, total - 1);
              nextIndex = lastInPrevRow;
            } else {
              nextIndex = total - 1;
            }
          }
          break;
        }
        case "ArrowDown": {
          const candidate = currentIndex + columns;
          if (candidate < total) nextIndex = candidate;
          else {
            // stay or wrap? choose stay
            nextIndex = currentIndex;
          }
          break;
        }
        case "ArrowUp": {
          const candidate = currentIndex - columns;
          if (candidate >= 0) nextIndex = candidate;
          else nextIndex = currentIndex; // stay
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
    <motion.div
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      layout
      transition={{
        layout: {
          type: "spring",
          stiffness: 380,
          damping: 32,
          mass: 0.9,
        },
      }}
      whileHover={reduceMotion ? undefined : { scale: expanded ? 1 : 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: expanded ? 0.995 : 0.98 }}
      onMouseEnter={() => {
        if (!expanded) onPreview();
      }}
      onMouseLeave={() => {
        // Grid-level leave handles collapse; allow quick move between cards
      }}
      onFocus={onPreview}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        // avoid triggering when clicking collapse button
        if ((e.target as HTMLElement).closest("[data-collapse-btn]")) return;
        onSelect();
      }}
      style={
        !expanded
          ? { height: "9.5rem", width: "9.5rem" } // Default: 1×1 square
          : undefined // Expanded state uses absolute positioning via className
      }
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm outline-none ring-primary/40 transition-all duration-300 focus-visible:ring-2",
        expanded ? "shadow-xl p-4" : "hover:shadow-md",
        expanded && !reduceMotion && "[animation-duration:400ms]",
        !expanded && "items-center justify-center relative", // Default state: center all content
        !expanded && previewActive && "opacity-90 scale-[0.98]", // subtle de-emphasis with scale
        // Expanded state: absolute positioning to overlay without grid layout shift
        expanded && "absolute z-50",
        expanded && expandedRow === 1 && !isRightEdge && "left-0 top-0", // Row 1 normal: expand right & down from top-left
        expanded && expandedRow === 1 && isRightEdge && "right-0 top-0", // Row 1 right edge: expand left & down from top-right
        expanded && expandedRow === 2 && !isRightEdge && "left-0 bottom-0", // Row 2 normal: expand right & up from bottom-left
        expanded && expandedRow === 2 && isRightEdge && "right-0 bottom-0", // Row 2 right edge: expand left & up from bottom-right
        expanded && "h-[calc(2*9.5rem+1rem)] w-[calc(2*9.5rem+1rem)]" // Expanded: 2×2 square (20rem)
      )}
      data-skill-card
      data-skill={skill.name}
    >
      {/* HEADER (shared structure for both states) */}
      <div
        className={cn(
          "relative flex w-full flex-col items-center text-center transition-opacity duration-150",
          expanded ? "gap-2.5" : "gap-2.5" // Consistent spacing
        )}
      >
        {/* Icon container - ensures consistent centering */}
        <div className="flex items-center justify-center h-9">
          <TechIcon
            path={skill.iconPath}
            alt={skill.name}
            size={36} // Consistent 36px size for both states
            className="text-primary transition-colors duration-200 flex-shrink-0"
          />
        </div>

        {/* Name and badge container */}
        <div className="w-full text-center">
          <h4 className="font-semibold tracking-tight text-card-foreground text-sm truncate px-2 h-5 flex items-center justify-center">
            {skill.name}
          </h4>
          {expanded && (
            <Badge
              variant="secondary"
              className="mt-1.5 px-2 py-0.5 text-[10px]"
            >
              {skill.level}
            </Badge>
          )}
        </div>
        {expanded && (
          <button
            type="button"
            data-collapse-btn
            onClick={(e) => {
              e.stopPropagation();
              onCollapse();
            }}
            aria-label="Collapse preview"
            className="absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/70 bg-background/70 text-muted-foreground transition-colors hover:text-foreground hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 z-40"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* EXPANDED STATE - description content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 28,
                mass: 0.7,
              },
            }}
            exit={{
              opacity: 0,
              y: 4,
              transition: { duration: 0.15, ease: [0.4, 0, 1, 1] },
            }}
            className="mt-3 flex h-full w-full flex-col overflow-hidden"
          >
            {competencies.length > 0 && (
              <motion.div
                className="flex-1 overflow-y-auto pr-1 [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.6),rgba(0,0,0,1)_10%,rgba(0,0,0,1)_90%,rgba(0,0,0,0.6))]"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { delay: 0.05, duration: 0.2 },
                }}
              >
                <ul className="space-y-1.5 text-[11px] leading-snug text-muted-foreground">
                  {visibleCompetencies.map((c, i) => (
                    <motion.li
                      key={c}
                      className="line-clamp-1"
                      initial={{ opacity: 0, x: -4 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: {
                          delay: 0.08 + i * 0.02,
                          duration: 0.2,
                        },
                      }}
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
                initial={{ opacity: 0, y: 4 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.1, duration: 0.2 },
                }}
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
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 0.15, duration: 0.2 },
              }}
            >
              Click for full details
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="pointer-events-none absolute inset-0 rounded-lg ring-0 transition-all group-focus-visible:ring-2 group-focus-visible:ring-primary/40" />
    </motion.div>
  );
});

export default Expertise;
