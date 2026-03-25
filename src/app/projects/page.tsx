// src/app/projects/page.tsx
"use client";

import Link from "next/link";
import { projects } from "@/content/projects";

export default function ProjectsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Projects
      </h1>
      <p className="text-gray-700 dark:text-gray-300 mb-10 text-lg">
        A collection of software, platforms, and experiments I&apos;m currently
        working on or have built recently.
      </p>
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.title}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-900"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {project.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag: string) => (
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
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                aria-label={`View details of ${project.title}`}
              >
                View Project
              </Link>
            ) : (
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Coming Soon
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
