import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogs } from "#velite";
import { MdxContent } from "@/components/layout/MdxContent";
import { Badge } from "@/components/ui/Badge";

interface BlogPageProps {
  params: {
    slug: string;
  };
}

// --- WORLD-CLASS METADATA for SEO & Social Sharing ---
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const blog = blogs.find((blog) => blog.slug === params.slug);
  if (!blog) {
    return {};
  }

  const siteUrl = "https://divijganjoo.me"; // IMPORTANT: Replace with your actual domain
  const ogImage = blog.cover ? `${siteUrl}${blog.cover}` : `${siteUrl}/og-image.png`;

  return {
    title: blog.title,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description || "",
      type: "article",
      url: `${siteUrl}${blog.url}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.description || "",
      images: [ogImage],
    },
  };
}

export async function generateStaticParams() {
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export default function BlogPage({ params }: BlogPageProps) {
  const blog = blogs.find((b) => b.slug === params.slug);

  if (!blog) {
    return notFound();
  }

  return (
    <main className="container mx-auto max-w-3xl py-12 md:py-20">
      <article>
        {/* --- Back Link for a Clear User Journey --- */}
        <Link
          href="/blog"
          className="mb-8 flex items-center gap-2 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* --- Rich, Engaging Article Header --- */}
        <header className="mb-8">
          {blog.cover && (
            <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl border">
              <Image
                src={blog.cover}
                alt={`${blog.title} cover image`}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {blog.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="mt-4 font-extrabold text-4xl tracking-tight lg:text-5xl">{blog.title}</h1>
          <div className="mt-4 flex items-center gap-x-4 text-muted-foreground text-sm">
            <time dateTime={new Date(blog.date).toISOString()}>
              {new Date(blog.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span>•</span>
            <span>{blog.readingTime}</span>
          </div>
        </header>

        <div className="prose prose-lg dark:prose-invert w-full max-w-none">
          <MdxContent code={blog.content} />
        </div>
      </article>
    </main>
  );
}
