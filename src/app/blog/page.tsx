import { Library } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogList } from "@/components/layout/BlogList";

export const metadata: Metadata = {
  // Bare title: the root layout's template appends "| Divij Ganjoo". Hardcoding the suffix
  // here as well rendered "Blog | Divij Ganjoo | Divij Ganjoo".
  title: "Blog",
  description: "Read articles, tutorials, and thoughts on development and design by Divij Ganjoo.",
};

export default function BlogPage() {
  return (
    /*
     * Not a `<main>` element. `MainWrapper` in the root layout already renders the page's single
     * `<main>`, and carries its id, aria-label and skip-link target. This was a second, nested
     * `<main>`, which is invalid HTML and splits the landmark.
     */
    <div className="container mx-auto max-w-3xl py-12 md:py-20">
      {/* --- WORLD-CLASS PAGE HEADER --- */}
      <header className="mb-12 flex flex-col items-start gap-y-4">
        <div className="flex items-center gap-x-3">
          <Library className="h-8 w-8 text-primary" />
          <h1 className="font-extrabold text-4xl tracking-tight">From the Blog</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Sharing insights, tutorials, and thoughts on development, design, and everything in
          between.
        </p>
      </header>

      {/* --- BLOG POSTS LIST --- */}
      <Suspense
        fallback={<div className="text-center text-muted-foreground">Loading posts...</div>}
      >
        <BlogList />
      </Suspense>
    </div>
  );
}
