import { About } from "@/components/sections/About";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { ExpertiseGate } from "@/components/sections/ExpertiseGate";

import { Hero } from "@/components/sections/Hero";
import { ProjectsPreview } from "@/components/sections/ProjectsPreview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <ExpertiseGate />
      <ProjectsPreview />
      <BlogPreview />
      <Contact />
    </>
  );
}
