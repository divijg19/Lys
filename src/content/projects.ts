// src/content/projects.ts

import type { Project } from "@/lib/types";

export const projects: Project[] = [
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
    title: "Nargis",
    description:
      "A web app for managing tasks and goals. Built with the MERN stack and AWS cloud integration.",
    tags: ["MERN", "AWS", "Task Management"],
    link: "/projects/nargis",
  },
  {
    title: "Upcoming Projects",
    description:
      "Projects in Python, R, Go, Rust, and Ruby on Rails are under active development — each focused on data, scalability, and performance.",
    tags: ["Python", "R", "Go", "Rust", "RoR"],
    link: "#",
  },
];
