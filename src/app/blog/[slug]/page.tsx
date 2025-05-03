import { notFound } from "next/navigation"; // Handle 404s
import { getMarkdownContent, getAllSlugs } from "@/lib/content"; // Markdown utilities

type BlogPageProps = {
  params: {
    slug: string;
  };
};

// Server Component to render individual blog posts
const BlogPage = async ({ params }: BlogPageProps) => {
  const { slug } = params;

  try {
    const postData = await getMarkdownContent("blogs", slug);

    if (!postData) {
      return notFound(); // Exit if content is missing
    }

    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
          {postData.frontmatter.title}
        </h1>
        <p className="text-sm text-gray-500">{postData.frontmatter.date}</p>
        <div
          className="prose dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching blog post data:", error);
    return notFound(); // Gracefully fallback to 404 page
  }
};

// Generate static paths for all blog posts
export async function generateStaticParams() {
  try {
    const slugs = getAllSlugs("blogs");
    return slugs.map((slugObj: { slug: string }) => ({
      slug: slugObj.slug,
    }));
  } catch (error) {
    console.error("Error fetching static paths:", error);
    return [];
  }
}

export default BlogPage;
