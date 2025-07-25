import readingTime from "reading-time";
import { defineCollection, defineConfig, s } from "velite";

// --- Reusable Schemas ---

const basePostSchema = s.object({
  title: s.string().min(1),
  date: s.string().transform((str) => new Date(str)),
  tags: s.array(s.string()).min(1),
  description: s.string().optional(),
  cover: s.string().optional(),
  content: s.raw(),
  path: s.path(),
});

const experienceSchema = s.object({
  title: s.string(),
  company: s.string(),
  period: s.string(),
  description: s.string(),
  tags: s.array(s.string()).optional(),
  type: s.literal("work").default("work"),
});

const educationSchema = s.object({
  title: s.string(),
  institution: s.string(),
  period: s.string(),
  description: s.string(),
  type: s.literal("education").default("education"),
});

// --- Schema for Individual Skills ---
const skillSchema = s.object({
  name: s.string(),
  iconPath: s.string(),
  // Use an enum for consistent proficiency levels
  level: s.enum(["Proficient", "Experienced", "Familiar"]),
  // A list of 3 key competencies for the hover state
  keyCompetencies: s.array(s.string()).min(3).max(3),
  // In-depth details for the expanded (clicked) state
  details: s.string(),
  // Link to projects where this skill was used
  projectSlugs: s.array(s.string()).default([]),

  // --- NEW OPTIONAL FIELDS for the expanded view ---
  rationale: s.string().optional(),
  highlights: s.array(s.string()).optional(),
  ecosystem: s.array(s.string()).optional(),
});

// --- Content Collections ---

const projects = defineCollection({
  name: "Project",
  pattern: "projects/**/*.mdx",
  schema: basePostSchema
    .extend({
      repository: s.string().url().optional(),
      liveUrl: s.string().url().optional(),
    })
    .transform((data) => ({
      ...data,
      slug: data.path.replace(/^(projects|blogs)\//, "").replace(/\.mdx$/, ""),
      url: `/${data.path.replace(/\.mdx$/, "")}`,
      readingTime: readingTime(data.content).text,
    })),
});

const blogs = defineCollection({
  name: "Blog",
  pattern: "blogs/**/*.mdx",
  schema: basePostSchema.transform((data) => ({
    ...data,
    slug: data.path.replace(/^(projects|blogs)\//, "").replace(/\.mdx$/, ""),
    url: `/${data.path.replace(/\.mdx$/, "")}`,
    readingTime: readingTime(data.content).text,
  })),
});

// --- Singleton Collections ---

const bio = defineCollection({
  name: "Bio",
  pattern: "bio/index.yml",
  single: true,
  schema: s.object({
    name: s.string(),
    title: s.string(),
    tagline: s.string(),
    summary: s.string(),
    location: s.string(),
    email: s.string().email(),
    social: s.object({
      github: s.string().url(),
      linkedin: s.string().url(),
    }),
  }),
});

const resume = defineCollection({
  name: "Resume",
  pattern: "resume/index.yml",
  single: true,
  schema: s
    .object({
      history: s.array(s.union([experienceSchema, educationSchema])),
    })
    .transform((data) => {
      const getStartDate = (period: string) => {
        const year = period.match(/\b\d{4}\b/);
        const month = period.match(/^[a-zA-Z]+/);
        return year && month ? new Date(`${month[0]} 1, ${year[0]}`) : new Date(0);
      };
      const sortedHistory = [...data.history].sort((a, b) => {
        return getStartDate(b.period).getTime() - getStartDate(a.period).getTime();
      });
      return { ...data, history: sortedHistory };
    }),
});

// --- Expertise Collection ---
const expertise = defineCollection({
  name: "Expertise",
  pattern: "expertise/index.yml",
  single: true,
  schema: s.object({
    categories: s.array(
      s.object({
        name: s.string(),
        // A string to map to a Lucide icon component in the frontend
        icon: s.string(),
        skills: s.array(skillSchema),
      })
    ),
  }),
});

// --- Final Exported Configuration ---
export default defineConfig({
  root: "src/content",
  collections: {
    projects,
    blogs,
    bio,
    resume,
    expertise,
  },
});
