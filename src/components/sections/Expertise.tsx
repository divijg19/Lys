"use client";

import { motion } from "framer-motion";
// ICONS: Added TerminalSquare for the new category
import { Database, Feather, Link as LinkIcon, Server, TerminalSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { projects } from "#velite"; // Import projects for linking
import { Badge } from "@/components/ui/Badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";

// --- THE COMPLETE, UNIFIED DATA STRUCTURE ---
// This is the single source of truth for your entire skillset.
const expertiseData = {
  Frontend: {
    icon: Feather,
    skills: [
      {
        name: "React",
        iconPath: "/assets/icons/react.svg",
        level: "Proficient",
        competencies: ["Component Architecture", "Hooks & State", "Performance Optimization"],
        projectSlugs: ["lys"],
      },
      {
        name: "Next.js",
        iconPath: "/assets/icons/nextjs.svg",
        level: "Experienced",
        competencies: ["App Router", "Server Components", "API Routes"],
        projectSlugs: ["lys"],
      },
      {
        name: "TypeScript",
        iconPath: "/assets/icons/typescript.svg",
        level: "Proficient",
        competencies: ["Advanced Type Safety", "Generics & Interfaces", "Inference"],
        projectSlugs: ["lys"],
      },
      {
        name: "JavaScript",
        iconPath: "/assets/icons/javascript.svg",
        level: "Proficient",
        competencies: ["ES6+", "DOM Manipulation", "Async/Await"],
        projectSlugs: ["lys"],
      },
      {
        name: "HTML5 & CSS3",
        iconPath: "/assets/icons/html-css.svg",
        level: "Proficient",
        competencies: ["Semantic HTML", "Flexbox & Grid", "Responsive Design"],
        projectSlugs: ["lys"],
      },
    ],
  },
  Backend: {
    icon: Server,
    skills: [
      {
        name: "Node.js",
        iconPath: "/assets/icons/nodejs.svg",
        level: "Experienced",
        competencies: ["RESTful APIs", "Middleware Patterns", "Async Operations"],
        projectSlugs: ["skill-sharing-platform"],
      },
      {
        name: "Express",
        iconPath: "/assets/icons/express.svg",
        level: "Experienced",
        competencies: ["Routing & Controllers", "Error Handling", "Security Best Practices"],
        projectSlugs: ["skill-sharing-platform"],
      },
      {
        name: "Python",
        iconPath: "/assets/icons/python.svg",
        level: "Experienced",
        competencies: ["Django", "FastAPI", "Data Analysis (Pandas)"],
        projectSlugs: [],
      },
      {
        name: "GoLang",
        iconPath: "/assets/icons/golang.svg",
        level: "Familiar",
        competencies: ["Goroutines & Channels", "Standard Library", "CLI Tools"],
        projectSlugs: [],
      },
    ],
  },
  "Databases & DevOps": {
    icon: Database,
    skills: [
      {
        name: "MongoDB",
        iconPath: "/assets/icons/mongodb.svg",
        level: "Experienced",
        competencies: ["Schema Design", "Aggregation Pipelines", "Mongoose ODM"],
        projectSlugs: ["skill-sharing-platform"],
      },
      {
        name: "SQL",
        iconPath: "/assets/icons/sql.svg",
        level: "Familiar",
        competencies: ["Relational Modeling", "Joins & Queries", "PostgreSQL"],
        projectSlugs: [],
      },
      {
        name: "AWS",
        iconPath: "/assets/icons/aws.svg",
        level: "Familiar",
        competencies: ["EC2", "S3 Storage", "IAM Roles", "Basic Lambda"],
        projectSlugs: ["lys"],
      },
      {
        name: "Docker",
        iconPath: "/assets/icons/docker.svg",
        level: "Familiar",
        competencies: ["Containerization", "Dockerfile", "Docker Compose"],
        projectSlugs: [],
      },
      {
        name: "Git",
        iconPath: "/assets/icons/git.svg",
        level: "Proficient",
        competencies: ["Version Control", "Branching (Git Flow)", "Merge/Rebase"],
        projectSlugs: ["lys"],
      },
    ],
  },
  "Scripting & More": {
    icon: TerminalSquare,
    skills: [
      {
        name: "Lua",
        iconPath: "/assets/icons/lua.svg",
        level: "Familiar",
        competencies: ["Game Scripting", "Embeddable Logic", "Coroutines"],
        projectSlugs: [],
      },
      {
        name: "C++",
        iconPath: "/assets/icons/c++.svg",
        level: "Familiar",
        competencies: ["Object-Oriented Programming", "Memory Management", "Performance"],
        projectSlugs: [],
      },
      {
        name: "R",
        iconPath: "/assets/icons/r.svg",
        level: "Familiar",
        competencies: ["Statistical Analysis", "Data Visualization", "Tidyverse"],
        projectSlugs: [],
      },
    ],
  },
};

type Skill = {
  name: string;
  iconPath: string;
  level: string;
  competencies: string[];
  projectSlugs: string[];
};

const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } }, // Removed 'type' property
};

export function Expertise() {
  return (
    <section className="mx-auto w-full max-w-screen-xl px-4 py-16">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={FADE_UP_VARIANTS}
        className="mb-16 text-center"
      >
        <h2 className="font-bold text-4xl tracking-tight">My Expertise</h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Connecting technologies with experience. Hover over a skill to learn more.
        </p>
      </motion.div>

      <TooltipProvider>
        <div className="space-y-16">
          {Object.entries(expertiseData).map(([category, { icon: Icon, skills }]) => (
            <motion.div
              key={category}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={FADE_UP_VARIANTS}
            >
              <div className="mb-8 flex items-center gap-4">
                <Icon className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-3xl tracking-tight">{category}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {skills.map((skill) => (
                  <motion.div key={skill.name} variants={FADE_UP_VARIANTS}>
                    <ExpertiseCard {...skill} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </TooltipProvider>
    </section>
  );
}

function ExpertiseCard({ name, iconPath, level, competencies, projectSlugs }: Skill) {
  const relevantProjects = projects.filter((p) => projectSlugs.includes(p.slug));

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="hover:-translate-y-1.5 flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg">
          <Image src={iconPath} alt={`${name} icon`} width={48} height={48} />
          <span className="text-center font-semibold text-card-foreground">{name}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs p-4 text-left" side="top">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-lg">{name}</h4>
            <Badge variant="default">{level}</Badge>
          </div>
          <div>
            <h5 className="mb-2 font-semibold text-sm">Key Competencies:</h5>
            <ul className="list-disc space-y-1.5 pl-4 text-muted-foreground text-sm">
              {competencies.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          {relevantProjects.length > 0 && (
            <div>
              <h5 className="mb-2 font-semibold text-sm">Used In:</h5>
              <div className="flex flex-wrap gap-2">
                {relevantProjects.map((project) => (
                  <Link href={project.url} key={project.slug}>
                    <Badge variant="outline" className="transition-colors hover:bg-accent">
                      <LinkIcon className="mr-1.5 h-4 w-4" />
                      {project.title}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
