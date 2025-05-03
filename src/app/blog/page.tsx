import Link from "next/link";
import {
  getAllSlugs,
  getMarkdownContent,
  MarkdownContent,
} from "@/lib/content";

export default async function BlogPage() {
  try {
    const slugs = getAllSlugs("blogs");

    // Fetch post data for each slug asynchronously
    const posts = await Promise.all(
      slugs.map(({ slug }) => getMarkdownContent("blogs", slug)),
    );

    // Filter out any null posts
    const validPosts = posts.filter(
      (post): post is MarkdownContent => post !== null,
    );

    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
          Blog
        </h1>

        {validPosts.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            No blog posts yet — stay tuned!
          </p>
        ) : (
          <div className="space-y-8">
            {validPosts.map((post) => (
              <div key={post.slug}>
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    {post.frontmatter.title}
                  </h2>
                </Link>
                <p className="text-sm text-gray-500">{post.frontmatter.date}</p>
                <p className="text-gray-700 dark:text-gray-300">
                  {post.frontmatter.description || "No description available."}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return <div>Error loading blog posts.</div>;
  }
}
