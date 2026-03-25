"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { blogs } from "#velite";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function BlogPreviewAnimated() {
  const latestPosts = blogs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  if (latestPosts.length === 0) {
    return null;
  }

  const [firstPost, ...otherPosts] = latestPosts;

  return (
    <motion.section
      className="mx-auto w-full max-w-7xl px-4 py-16"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      data-section="blog-preview"
    >
      <div className="mb-12 text-center">
        <h2 className="font-bold text-4xl tracking-tight">From the Blog</h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Sharing insights, tutorials, and thoughts on development and design.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 grid-rows-2 gap-8 lg:grid-cols-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="lg:row-span-2">
          <BlogPostCard
            post={firstPost}
            isFeatured
          />
        </div>
        {otherPosts.map((post) => (
          <div key={post.slug}>
            <BlogPostCard post={post} />
          </div>
        ))}
      </motion.div>

      <motion.div
        className="mt-16 text-center"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Button
          asChild
          size="lg"
        >
          <Link href={ROUTES.blog}>View All Posts</Link>
        </Button>
      </motion.div>
    </motion.section>
  );
}

function BlogPostCard({
  post,
  isFeatured = false,
}: {
  post: (typeof blogs)[number];
  isFeatured?: boolean;
}) {
  return (
    <Link
      href={post.url}
      aria-label={`Read blog post ${post.title}`}
      className="group block h-full w-full transform rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
    >
      <article
        className={cn("flex h-full", isFeatured ? "flex-col" : "flex-col sm:flex-row lg:flex-col")}
      >
        <div
          className={cn(
            "relative w-full overflow-hidden",
            isFeatured
              ? "h-64 rounded-t-xl"
              : "h-40 rounded-t-xl sm:h-auto sm:w-2/5 sm:rounded-t-none sm:rounded-l-xl lg:h-40 lg:w-full lg:rounded-t-xl"
          )}
        >
          <Image
            src={post.cover || "/assets/images/placeholder.svg"}
            alt={`Cover image for ${post.title}`}
            fill
            loading="lazy"
            sizes={
              isFeatured
                ? "(max-width: 1024px) 100vw, 50vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.dataset.fallback) {
                target.dataset.fallback = "1";
                target.src = "/assets/images/placeholder.svg";
              }
            }}
          />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3
            className={cn(
              "font-bold tracking-tight transition-colors group-hover:text-primary",
              isFeatured ? "text-2xl" : "text-xl"
            )}
          >
            {post.title}
          </h3>
          <time
            dateTime={new Date(post.date).toISOString()}
            className="mt-2 text-muted-foreground text-sm"
          >
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <p
            className={cn(
              "mt-3 grow text-base text-muted-foreground",
              isFeatured ? "line-clamp-3" : "line-clamp-2"
            )}
          >
            {post.description}
          </p>
          <span className="mt-4 flex items-center font-semibold text-primary text-sm">
            Read More <ArrowUpRight className="ml-1 h-4 w-4" />
          </span>
        </div>
      </article>
    </Link>
  );
}
