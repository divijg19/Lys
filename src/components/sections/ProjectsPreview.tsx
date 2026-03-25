"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { projects } from "#velite";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// --- REUSABLE VARIANTS FOR CONSISTENT ANIMATION ---
const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, duration: 0.8 } },
};

export function ProjectsPreview() {
  const featuredProjects = projects.slice(0, 3);

  return (
    <section className="mx-auto w-full max-w-screen-xl px-4 py-16">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={FADE_UP_VARIANTS}
        className="mb-12 text-center"
      >
        <h2 className="font-bold text-4xl">Featured Projects</h2>
        <p className="mt-2 text-lg text-muted-foreground">
          A selection of my work. See what I've been building.
        </p>
      </motion.div>

      {/* --- PROJECTS GRID --- */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.15 } },
        }}
        className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
      >
        {featuredProjects.map((project) => (
          <motion.div
            key={project.title}
            variants={FADE_UP_VARIANTS}
          >
            <ProjectCard
              url={project.url}
              title={project.title}
              description={project.description ?? ""}
              cover={project.cover}
              tags={project.tags}
              liveUrl={project.liveUrl}
              repository={project.repository}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* --- VIEW ALL PROJECTS BUTTON --- */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.8 }}
        variants={FADE_UP_VARIANTS}
        className="mt-16 text-center"
      >
        <Button
          asChild
          size="lg"
        >
          <Link href="/projects">View All Projects</Link>
        </Button>
      </motion.div>
    </section>
  );
}

// --- WORLD-CLASS SUB-COMPONENT for Project Cards ---
// This makes the main component cleaner and the card logic reusable.
interface ProjectCardProps {
  url: string;
  title: string;
  description: string;
  cover?: string;
  tags?: string[];
  liveUrl?: string;
  repository?: string;
}

function ProjectCard({
  url,
  title,
  description,
  cover,
  tags,
  liveUrl,
  repository,
}: ProjectCardProps) {
  return (
    <Link
      href={url}
      className="group hover:-translate-y-1 block h-full w-full transform rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg"
    >
      <div className="flex h-full flex-col">
        {/* --- COVER IMAGE --- */}
        <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
          <Image
            src={cover || "/assets/images/placeholder.png"} // Fallback image
            alt={`Cover image for ${title}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="mb-2 font-semibold text-xl">{title}</h3>
          <p className="line-clamp-3 flex-grow text-muted-foreground text-sm">{description}</p>

          {/* --- TAGS --- */}
          <div className="my-4 flex flex-wrap gap-2">
            {tags?.map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* --- ACTION LINKS --- */}
          <div className="mt-auto flex w-full items-center justify-between">
            <span className="flex items-center font-medium text-primary text-sm">
              Read Case Study <ArrowUpRight className="ml-1 h-4 w-4" />
            </span>
            <div className="flex items-center gap-2">
              {repository && (
                <Link
                  href={repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()} // Prevents navigating the main card link
                  aria-label={`View source code for ${title}`}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                  >
                    <Github className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              {liveUrl && (
                <Link
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`View live site for ${title}`}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
