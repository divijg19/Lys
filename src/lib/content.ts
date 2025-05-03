import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

// Accepted types of content (folders under /src/content/)
export type ContentType = "projects" | "blogs";

// Structure of frontmatter metadata in each markdown file
type Frontmatter = {
  title: string;
  date: string;
  tags: string[];
  description?: string;
};

// Structure of parsed markdown content returned
export type MarkdownContent = {
  slug: string;
  frontmatter: Frontmatter;
  contentHtml: string;
};

/**
 * Resolves the full path to a markdown file based on content type and slug.
 */
function resolveMarkdownPath(type: ContentType, slug: string): string {
  return path.join(process.cwd(), "src", "content", type, `${slug}.md`);
}

/**
 * Parses a markdown file, returns structured frontmatter and HTML content.
 */
export async function getMarkdownContent(
  type: ContentType,
  slug: string | undefined,
): Promise<MarkdownContent | null> {
  if (!slug || typeof slug !== "string") {
    console.error(`[content] Invalid slug provided: ${slug}`);
    return null;
  }

  const filePath = resolveMarkdownPath(type, slug);

  try {
    if (!fs.existsSync(filePath)) {
      console.error(`[content] Markdown file not found: ${filePath}`);
      return null;
    }

    const rawContent = await fs.promises.readFile(filePath, "utf-8");
    const { data, content } = matter(rawContent);

    const isValidFrontmatter =
      typeof data.title === "string" &&
      typeof data.date === "string" &&
      Array.isArray(data.tags);

    if (!isValidFrontmatter) {
      console.error(`[content] Invalid frontmatter in file: ${filePath}`);
      return null;
    }

    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString();

    return {
      slug,
      frontmatter: data as Frontmatter,
      contentHtml,
    };
  } catch (error) {
    console.error(`[content] Failed to process markdown for ${slug}:`, error);
    return null;
  }
}

/**
 * Returns all available slugs (markdown filenames without .md extension)
 * for the given content type.
 */
export function getAllSlugs(type: ContentType): { slug: string }[] {
  const contentDir = path.join(process.cwd(), "src", "content", type);

  try {
    if (!fs.existsSync(contentDir)) {
      console.error(`[content] Directory not found: ${contentDir}`);
      return [];
    }

    return fs
      .readdirSync(contentDir)
      .filter((file) => file.endsWith(".md"))
      .map((file) => ({
        slug: file.replace(/\.md$/, ""),
      }));
  } catch (error) {
    console.error(`[content] Failed to read slugs from ${contentDir}:`, error);
    return [];
  }
}
