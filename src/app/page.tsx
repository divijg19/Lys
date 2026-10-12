import { About } from "@/components/sections/About";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Expertise } from "@/components/sections/Expertise";

import { Hero } from "@/components/sections/Hero";
import { ProjectsPreview } from "@/components/sections/ProjectsPreview";

export default function HomePage() {
  return (
    <>
      <Hero />
      {/*
        The home page already has its `<h1>` in the hero. Rendering About's heading as `<h1>`
        too gave the document two level-1 headings.
      */}
      <About headingAs="h2" />
      <Experience />
      <Expertise />
      <ProjectsPreview />
      <BlogPreview />
      <Contact />
    </>
  );
}
