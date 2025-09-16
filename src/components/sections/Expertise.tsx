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
import { useEffect, useId, useState } from "react";
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
  const cardTransition = { type: "spring" as const, stiffness: 400, damping: 30 };

  return (
    <motion.button
      layoutId={`card-${skill.name}`}
      transition={cardTransition}
      type="button"
      className="group relative h-40 w-full cursor-pointer overflow-hidden rounded-2xl border bg-card shadow-lg transition-shadow duration-200 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/80"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onSelect();
        }
      }}
      aria-label={`View details for ${skill.name}`}
    >
      {/* Fixed container to prevent layout shift */}
      <div className="absolute inset-0 p-4">
        {/* State 1: Default Content (Icon and Title) */}
        <AnimatePresence>
          {!isHovered && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex h-full flex-col items-center justify-center gap-3 text-center"
            >
              <Image
                src={skill.iconPath}
                alt={`${skill.name} icon`}
                width={48}
                height={48}
                className="transition-transform duration-200 group-hover:scale-110"
              />
              <h4 className="font-semibold text-base leading-tight">{skill.name}</h4>
            </motion.div>
          )}
        </AnimatePresence>

        {/* State 2: Hover Content (Details) */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.1 } }}
              className="flex h-full flex-col justify-between text-left"
            >
              <div className="flex w-full items-start justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Image
                    src={skill.iconPath}
                    alt={`${skill.name} icon`}
                    width={20}
                    height={20}
                    className="flex-shrink-0"
                  />
                  <h4 className="truncate font-semibold text-sm leading-tight">{skill.name}</h4>
                </div>
                <Badge
                  variant="secondary"
                  className="ml-1 flex-shrink-0 text-xs"
                >
                  {skill.level}
                </Badge>
              </div>
              <div className="mt-2">
                <h5 className="mb-1.5 font-semibold text-primary text-xs uppercase tracking-wider">
                  Competencies
                </h5>
                <ul className="space-y-0.5 text-muted-foreground text-xs leading-tight">
                  {skill.keyCompetencies.slice(0, 3).map((c) => (
                    <li
                      key={c}
                      className="line-clamp-1"
                    >
                      • {c}
                    </li>
                  ))}
                  {skill.keyCompetencies.length > 3 && (
                    <li className="font-medium text-primary">
                      +{skill.keyCompetencies.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
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
