"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { blogs } from "#velite";

const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, duration: 0.8 } },
};

export function BlogList() {
  const sortedPosts = blogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedPosts.length === 0) {
    return (
      <p className="mt-8 text-center text-muted-foreground">No posts published yet. Stay tuned!</p>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.15 } },
      }}
      className="flex flex-col gap-y-12"
    >
      {sortedPosts.map((post) => (
        <motion.div key={post.slug} variants={FADE_UP_VARIANTS}>
          <BlogPostCard {...post} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function BlogPostCard(post: (typeof blogs)[number]) {
  return (
    <Link
      href={post.url}
      className="group hover:-translate-y-1 block w-full transform rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg"
    >
      <article className="flex h-full flex-col sm:flex-row">
        {post.cover && (
          <div className="relative h-48 w-full sm:h-auto sm:w-1/3">
            <Image
              src={post.cover}
              alt={`Cover image for ${post.title}`}
              fill
              className="rounded-t-xl object-cover transition-transform duration-300 group-hover:scale-105 sm:rounded-t-none sm:rounded-l-xl"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col p-6">
          <h3 className="mb-2 font-semibold text-xl transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <time
            dateTime={new Date(post.date).toISOString()}
            className="mb-3 text-muted-foreground text-sm"
          >
            {new Date(post.date).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <p className="line-clamp-2 flex-grow text-base text-muted-foreground">
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
