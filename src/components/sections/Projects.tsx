import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactElement } from "react";
import { projects } from "@/content/projects";
import type { Project } from "@/lib/types";

export default function ProjectsSection(): ReactElement {
  return (
    <section className="flex flex-col items-center gap-8 sm:items-start sm:text-left w-full">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.7 }}
        transition={{ duration: 0.6 }}
        className="text-2xl font-semibold text-gray-800 dark:text-white"
      >
        Featured Projects
      </motion.h2>
      <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
        {projects.slice(0, 4).map((project: Project, i: number) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="w-full sm:w-[300px] p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:border-accent transition-all"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {project.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags && project.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-gray-200 dark:bg-gray-700 text-sm text-gray-800 dark:text-white px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            {project.link !== "#" ? (
              <Link
                href={project.link}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 font-medium hover:underline"
                aria-label={`View details of ${project.title}`}
              >
                View Project
              </Link>
            ) : (
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Coming Soon
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
