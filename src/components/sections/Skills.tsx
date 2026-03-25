"use client";

import { useTheme } from "@/hooks/useTheme";
import type { Skill } from "@/lib/types";

const skills: Skill[] = [
  { name: "React", level: 90, category: "frontend" },
  { name: "Next.js", level: 85, category: "frontend" },
  { name: "TypeScript", level: 80, category: "frontend" },
  { name: "Node.js", level: 75, category: "backend" },
  { name: "CSS/SCSS", level: 85, category: "frontend" },
  { name: "UI/UX Design", level: 70, category: "design" },
  { name: "GraphQL", level: 65, category: "backend" },
  { name: "AWS", level: 60, category: "backend" },
];

export default function Skills() {
  const { theme } = useTheme();

  function getHeadingClass() {
    switch (theme) {
      case "cyberpunk":
        return "cyberpunk-neon";
      case "ethereal":
        return "ethereal-text-glow";
      case "horizon-blaze":
        return "blaze-text-glow";
      default:
        return "text-primary";
    }
  }

  return (
    <section className="flex flex-col items-center gap-8 sm:items-start sm:text-left w-full">
      <h2 className={`text-2xl font-semibold mb-6 ${getHeadingClass()}`}>Skills</h2>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 w-full">
        {skills.map((skill) => (
          <div key={skill.name} className="flex flex-col gap-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-lg text-primary">{skill.name}</span>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full"
                style={{ width: `${skill.level}%` }}
                aria-label={`${skill.name} proficiency: ${skill.level}%`}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
