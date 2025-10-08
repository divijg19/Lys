// Home page now renders sections directly (production parity) without extra debug wrappers.

import dynamic from "next/dynamic";
import { About } from "@/components/sections/About";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";

const Expertise = dynamic(
  () => import("@/components/sections/Expertise").then((m) => m.Expertise),
  {
    ssr: true,
    loading: () => (
      <div className="py-24 text-center text-muted-foreground">Loading expertise…</div>
    ),
  }
);

import { Hero } from "@/components/sections/Hero";
import { ProjectsPreview } from "@/components/sections/ProjectsPreview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Expertise />
      <ProjectsPreview />
      <BlogPreview />
      <Contact />
    </>
  );
}
