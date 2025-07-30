"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { blogs } from "#velite";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// Using the same signature animation as the rest of the portfolio
const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, duration: 0.8 } },
};

export function BlogPreview() {
  const latestPosts = blogs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  if (latestPosts.length === 0) {
    return null; // Don't render if there are no posts
  }

  const [firstPost, ...otherPosts] = latestPosts;

  return (
    <section className="mx-auto w-full max-w-screen-xl px-4 py-16">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={FADE_UP_VARIANTS}
        className="mb-12 text-center"
      >
        <h2 className="font-bold text-4xl tracking-tight">From the Blog</h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Sharing insights, tutorials, and thoughts on development and design.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
        // --- THE INSPIRED LAYOUT GRID ---
        className="grid grid-cols-1 grid-rows-2 gap-8 lg:grid-cols-2"
      >
        <motion.div
          variants={FADE_UP_VARIANTS}
          className="lg:row-span-2"
        >
          <BlogPostCard
            post={firstPost}
            isFeatured
          />
        </motion.div>
        {otherPosts.map((post) => (
          <motion.div
            key={post.slug}
            variants={FADE_UP_VARIANTS}
          >
            <BlogPostCard post={post} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.8 }}
        variants={FADE_UP_VARIANTS}
        className="mt-16 text-center"
      >
        <Button
          asChild
          size="lg"
        >
          <Link href="/blog">View All Posts</Link>
        </Button>
      </motion.div>
    </section>
  );
}

// --- A FLEXIBLE SUB-COMPONENT for Blog Post Cards ---
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
      className="group hover:-translate-y-1 block h-full w-full transform rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg"
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
            src={post.cover || "/assets/images/placeholder.png"}
            alt={`Cover image for ${post.title}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
              "mt-3 flex-grow text-base text-muted-foreground",
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
