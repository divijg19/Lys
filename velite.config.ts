import readingTime from "reading-time";
import { defineCollection, defineConfig, s } from "velite";

// --- Reusable Schemas for RAW Data ---
const basePostSchema = s.object({
  title: s.string().min(1),
  date: s.string().transform((str) => new Date(str)),
  tags: s.array(s.string()).min(1),
  description: s.string().optional(),
  cover: s.string().optional(),
  content: s.raw(),
  path: s.path(),
});

// --- UNIFIED SCHEMAS FOR THE EXPERIENCE TIMELINE ---

const experienceSchema = s.object({
  // `title` is the primary heading
  title: s.string(),
  company: s.string(),
  period: s.string(),
  description: s.string(),
  tags: s.array(s.string()).optional(),
  type: s.literal("work").default("work"),
});

const educationSchema = s.object({
  // --- THE FIX: Unify the primary heading under a single `title` property. ---
  // We can add `degree` back as an optional, secondary field if needed.
  title: s.string(),
  institution: s.string(),
  period: s.string(),
  description: s.string(),
  type: s.literal("education").default("education"),
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

// --- Singleton Collections for Site-Wide Data ---
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

// --- Final Exported Configuration ---
export default defineConfig({
  root: "src/content",
  collections: {
    projects,
    blogs,
    bio,
    resume,
  },
});
