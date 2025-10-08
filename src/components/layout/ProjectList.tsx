"use client"; // This is the key. This component is interactive.

import { motion } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { projects } from "#velite";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, duration: 0.8 } },
};

export function ProjectList() {
  const sortedProjects = projects.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <motion.div
      initial="hidden"
      animate="show"
      viewport={{ once: true }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
      className="grid grid-cols-1 gap-8 sm:grid-cols-2"
    >
      {sortedProjects.map((project) => (
        <motion.div
          key={project.slug}
          variants={FADE_UP_VARIANTS}
        >
          <ProjectCard {...project} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function ProjectCard(project: (typeof projects)[number]) {
  return (
    <Link
      href={project.url}
      className="group hover:-translate-y-1 block h-full w-full transform rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg"
    >
      <article className="flex h-full flex-col">
        <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
          <Image
            src={project.cover || "/assets/images/placeholder.png"}
            alt={`Cover image for ${project.title}`}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="mb-2 font-semibold text-xl transition-colors group-hover:text-primary">
            {project.title}
          </h3>
          <p className="line-clamp-3 flex-grow text-base text-muted-foreground">
            {project.description}
          </p>
          <div className="my-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="mt-auto flex w-full items-center justify-between">
            <span className="flex items-center font-semibold text-primary text-sm">
              View Case Study <ArrowUpRight className="ml-1 h-4 w-4" />
            </span>
            <div className="flex items-center gap-2">
              {project.repository && (
                <Link
                  href={project.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`View source code for ${project.title}`}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                  >
                    <Github className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              {project.liveUrl && (
                <Link
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`View live site for ${project.title}`}
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
      </article>
    </Link>
  );
}
