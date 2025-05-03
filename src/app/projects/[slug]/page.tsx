import { getAllSlugs, getMarkdownContent } from "@/lib/content";
import { notFound } from "next/navigation";

type ProjectPageProps = {
  params: { slug: string };
};

// Generate static paths for all project slugs
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getAllSlugs("projects");
  return slugs.map(({ slug }) => ({ slug }));
}

// Project page component
export default async function ProjectPage({ params }: ProjectPageProps) {
  const projectData = await getMarkdownContent("projects", params.slug);

  if (!projectData) notFound();

  const { title, date, tags } = projectData.frontmatter;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {title}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{date}</p>

      <div
        className="prose dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: projectData.contentHtml }}
      />

      {tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {tags.map((tag: string) => (
            <span
              key={tag}
              className="bg-gray-200 dark:bg-gray-700 text-sm text-gray-800 dark:text-white px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
