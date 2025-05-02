"use client";

import Link from "next/link";

const projects = [
  {
    title: "The Crowns Blade",
    description:
      "A tactical RPG game built in Lua featuring turn-based combat, dynamic storytelling, and squad customization. Designed with modular architecture and combat systems from scratch.",
    tags: ["Lua", "Game Dev", "OOP", "Custom Battle Engine"],
    link: "/projects/the-crowns-blade",
  },
  {
    title: "Skill-Sharing Platform",
    description:
      "A community-driven platform to connect users based on skills, enabling mentorship and collaboration. Built on AWS using a Node.js backend, React frontend, and DynamoDB.",
    tags: ["AWS", "Node.js", "React", "DynamoDB", "Lambda"],
    link: "/projects/skill-share",
  },
  {
    title: "Portfolio Website",
    description:
      "My personal developer portfolio built using Next.js 15, Tailwind CSS 4, and the App Router. Designed for speed, accessibility, and clean presentation of work and blogs.",
    tags: ["Next.js", "Tailwind", "TypeScript"],
    link: "/",
  },
  {
    title: "Upcoming Projects",
    description:
      "Projects in Python, R, Go, Rust, and Ruby on Rails are under active development &mdash; each focused on data, scalability, and performance.",
    tags: ["Python", "R", "Go", "Rust", "RoR"],
    link: "#", // Replace with an actual link if available
  },
];

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
      <div className="grid gap-8 sm:grid-cols-2">
        {projects.map((project) => (
          <div
            key={project.title}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {project.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-200 dark:bg-gray-700 text-sm text-gray-800 dark:text-white px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            {/* Link will be active only for valid URLs */}
            {project.link !== "#" ? (
              <Link
                href={project.link}
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
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
