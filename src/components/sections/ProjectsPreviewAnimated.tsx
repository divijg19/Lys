"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { projects } from "#velite";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/routes";

export function ProjectsPreviewAnimated() {
  const featuredProjects = projects.slice(0, 3);

  return (
    <motion.section
      className="mx-auto w-full max-w-7xl px-4 py-16"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      data-section="projects-preview"
    >
      <div className="mb-12 text-center">
        <h2 className="font-bold text-4xl">Featured Projects</h2>
        <p className="mt-2 text-lg text-muted-foreground">
          A selection of my work. See what I've been building.
        </p>
      </div>

      <motion.div
        className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {featuredProjects.map((project) => (
          <ProjectCard
            key={project.title}
            url={project.url}
            title={project.title}
            description={project.description ?? ""}
            cover={project.cover}
            tags={project.tags}
            liveUrl={project.liveUrl}
            repository={project.repository}
          />
        ))}
      </motion.div>

      <motion.div
        className="mt-16 text-center"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Button
          asChild
          size="lg"
        >
          <Link href={ROUTES.projects}>View All Projects</Link>
        </Button>
      </motion.div>
    </motion.section>
  );
}

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
      aria-label={`View project ${title}`}
      className="group block h-full w-full transform rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
    >
      <div className="flex h-full flex-col">
        <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
          <Image
            src={cover || "/assets/images/placeholder.svg"}
            alt={`Cover image for ${title}`}
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.dataset.fallback) {
                target.dataset.fallback = "1";
                target.src = "/assets/images/placeholder.svg";
              }
            }}
          />
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="mb-2 font-semibold text-xl">{title}</h3>
          <p className="line-clamp-3 grow text-muted-foreground text-sm">{description}</p>

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

          <div className="mt-auto flex w-full items-center justify-between">
            <span className="flex items-center font-medium text-primary text-sm">
              Read Case Study <ArrowUpRight className="ml-1 h-4 w-4" />
            </span>
            <div className="flex items-center gap-2">
              {repository && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`View source code for ${title}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(repository, "_blank", "noopener,noreferrer");
                  }}
                >
                  <Github className="h-5 w-5" />
                </Button>
              )}
              {liveUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`View live site for ${title}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(liveUrl, "_blank", "noopener,noreferrer");
                  }}
                >
                  <ArrowUpRight className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
