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
      <About />
      <Experience />
      <Expertise />
      <ProjectsPreview />
      <BlogPreview />
      <Contact />
    </>
  );
}
