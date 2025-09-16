"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart,
  Cloud,
  Code,
  Database,
  Feather,
  GraduationCap,
  Link as LinkIcon,
  type LucideProps,
  Server,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useEffect, useId, useRef, useState } from "react";
// Assuming data is imported from a source like Velite
import { expertise, projects } from "#velite";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

// --- TYPE DEFINITIONS ---
type Skill = (typeof expertise.categories)[0]["skills"][0];

// --- ICON MAPPING ---
const iconMap: Record<string, React.FC<LucideProps>> = {
  Code,
  Feather,
  Server,
  Cloud,
  Database,
  BarChart,
  GraduationCap,
};

// Icons that need special theme-aware handling (invert for dark-background themes)
const ICONS_NEEDING_INVERSION = [
  'mojo.svg',
  'duckdb.svg',
  'vercel.svg',
  'YAML.svg'
];

// Helper function to get icon classes based on icon path and theme context
const getIconClasses = (iconPath: string, baseClasses: string = "") => {
  const iconName = iconPath.split('/').pop() || '';
  const needsInversion = ICONS_NEEDING_INVERSION.includes(iconName);

  return cn(
    baseClasses,
    needsInversion && "theme-aware-icon"
  );
};

// --- MAIN COMPONENT ---
export function Expertise() {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const expertiseId = useId();

  // Lock body scroll when the modal is open
  useEffect(() => {
    if (selectedSkill) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedSkill]);

  const FADE_UP_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 20 },
    },
  };

  return (
    <section
      id={expertiseId}
      className="relative mx-auto w-full max-w-screen-xl px-4 py-20"
    >
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={FADE_UP_VARIANTS}
        className="mb-16 text-center"
      >
        <h2 className="font-bold text-4xl tracking-tight sm:text-5xl">Tech Stack & Expertise</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          A showcase of my skills. Hover to see competencies, click for a detailed view.
        </p>
      </motion.div>

      <div className="space-y-12">
        {expertise.categories.map((category, index) => (
          <div key={category.name}>
            <CategoryTitleCard
              name={category.name}
              iconName={category.icon}
              isFirst={index === 0}
            />
            <div className="flex flex-wrap justify-start gap-4">
              {category.skills.map((skill) => (
                <SkillCard
                  key={skill.name}
                  skill={skill}
                  onSelect={() => setSelectedSkill(skill)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedSkill && (
          <ExpandedSkillModal
            skill={selectedSkill}
            onClose={() => setSelectedSkill(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

// --- SUB-COMPONENTS ---

function CategoryTitleCard({
  name,
  iconName,
  isFirst,
}: {
  name: string;
  iconName: string;
  isFirst: boolean;
}) {
  const Icon = iconMap[iconName];
  return (
    <div className={cn("mb-8 flex w-full items-center gap-4", isFirst ? "mt-0" : "mt-12")}>
      {Icon && <Icon className="h-9 w-9 text-primary" />}
      <h3 className="font-black text-3xl text-primary tracking-tight">{name}</h3>
    </div>
  );
}

function SkillCard({ skill, onSelect }: { skill: Skill; onSelect: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Calculate safe expansion direction
  const getExpansionOffset = () => {
    if (!cardRef.current) return 0;
    const rect = cardRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const expandedWidth = 280;
    const cardWidth = 160;

    // If expanding right would go off-screen, expand left instead
    if (rect.left + expandedWidth > viewportWidth - 20) {
      return -(expandedWidth - cardWidth);
    }
    return 0;
  };

  // Stable hover management with debouncing
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    // Shorter debounce for more responsive feel
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 50);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative"
      style={{ width: "160px", height: "160px" }}
    >
      {/* Base card - always stays in place */}
      <motion.div
        ref={cardRef}
        className="absolute inset-0 cursor-pointer overflow-hidden rounded-2xl border bg-card shadow-lg transition-shadow duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/80"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onSelect();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${skill.name}`}
        whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
      >
        <div className="absolute inset-0 p-4">
          {/* Default state content */}
          <motion.div
            className="relative h-full w-full"
            animate={{
              opacity: isHovered ? 0 : 1,
            }}
            transition={{
              duration: 0.15,
              ease: "easeOut"
            }}
          >
            {/* Icon positioned in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: isHovered ? 0.9 : 1,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut"
                }}
              >
                <Image
                  src={skill.iconPath}
                  alt={`${skill.name} icon`}
                  width={48}
                  height={48}
                  className={getIconClasses(skill.iconPath, "transition-all duration-200")}
                />
              </motion.div>
            </div>

            {/* Name consistently positioned at bottom */}
            <div className="absolute right-0 bottom-0 left-0 flex h-12 items-center justify-center px-2">
              <h4 className="text-center font-semibold text-base leading-tight">
                {skill.name}
              </h4>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Expanded overlay - appears on top without affecting layout */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute top-0 left-0 z-20 cursor-pointer overflow-hidden rounded-2xl border bg-card shadow-xl"
            style={{ width: "280px", height: "160px" }}
            initial={{ opacity: 0, scale: 0.95, x: getExpansionOffset() }}
            animate={{
              opacity: 1,
              scale: 1,
              x: getExpansionOffset(),
            }}
            exit={{ opacity: 0, scale: 0.95, x: getExpansionOffset() }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 35,
              mass: 0.8,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onSelect}
          >
            <div className="absolute inset-0 p-4">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 0.08,
                    duration: 0.15,
                    ease: "easeOut"
                  },
                }}
                className="flex h-full flex-col justify-between text-left"
              >
                {/* Header with icon, title, and level */}
                <div className="flex w-full items-start justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Image
                      src={skill.iconPath}
                      alt={`${skill.name} icon`}
                      width={24}
                      height={24}
                      className={getIconClasses(skill.iconPath, "flex-shrink-0")}
                    />
                    <h4 className="truncate font-semibold text-sm leading-tight">{skill.name}</h4>
                  </div>
                  <Badge
                    variant="secondary"
                    className="ml-2 flex-shrink-0 text-xs"
                  >
                    {skill.level}
                  </Badge>
                </div>

                {/* Competencies section */}
                <div className="mt-3 flex-1">
                  <h5 className="mb-2 font-semibold text-primary text-xs uppercase tracking-wider">
                    Key Skills
                  </h5>
                  <ul className="space-y-1 text-muted-foreground text-xs leading-tight">
                    {skill.keyCompetencies.slice(0, 4).map((competency) => (
                      <li
                        key={competency}
                        className="line-clamp-1"
                      >
                        • {competency}
                      </li>
                    ))}
                    {skill.keyCompetencies.length > 4 && (
                      <li className="font-medium text-primary">
                        +{skill.keyCompetencies.length - 4} more
                      </li>
                    )}
                  </ul>
                </div>

                {/* Click to expand hint */}
                <div className="mt-2 flex items-center justify-center">
                  <span className="text-muted-foreground/70 text-xs">Click for details</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExpandedSkillModal({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const relevantProjects = projects.filter((p) => skill.projectSlugs?.includes(p.slug));
  const cardTransition = { type: "spring" as const, stiffness: 400, damping: 35 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        layoutId={`card-${skill.name}`}
        transition={cardTransition}
        className="relative z-10 h-full max-h-[36rem] w-full max-w-4xl overflow-hidden rounded-2xl border bg-gradient-to-br from-card to-muted/20 shadow-2xl"
      >
        <div className="h-full w-full p-8">
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 rounded-full p-2 text-muted-foreground outline-none ring-primary/50 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2"
            aria-label="Close skill details"
          >
            <X size={24} />
          </motion.button>

          <div className="flex items-start gap-5">
            <Image
              src={skill.iconPath}
              alt={`${skill.name} icon`}
              width={60}
              height={60}
              className="flex-shrink-0"
            />
            <div className="text-left">
              <h3 className="font-bold text-2xl">{skill.name}</h3>
              <p className="text-md text-muted-foreground">{skill.level}</p>
            </div>
          </div>

          <div className="mt-8 h-[calc(100%-6rem)] w-full overflow-y-auto pr-4">
            <div className="grid h-full grid-cols-1 gap-x-16 gap-y-8 lg:grid-cols-3">
              {/* --- Main Content Column --- */}
              <div className="space-y-8 lg:col-span-2">
                {/* My Expertise Section */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg text-primary">My Expertise</h4>
                  <p className="text-base text-muted-foreground leading-relaxed">{skill.details}</p>
                </div>

                {/* Rationale Section */}
                {skill.rationale && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg text-primary">Rationale</h4>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {skill.rationale}
                    </p>
                  </div>
                )}

                {/* Implementation Highlights Section */}
                {skill.highlights && skill.highlights.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg text-primary">
                      Implementation Highlights
                    </h4>
                    <ul className="list-disc space-y-1 pl-5 text-base text-muted-foreground">
                      {skill.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* --- Right Column (Projects & Ecosystem) --- */}
              <div className="space-y-8">
                {/* Used In Projects Section */}
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

                {/* Related Ecosystem Section */}
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
