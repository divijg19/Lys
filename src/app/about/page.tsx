import type { Metadata } from "next";
// Import the world-class sections you've already built
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { ExpertiseGate } from "@/components/sections/ExpertiseGate";

export const metadata: Metadata = {
  title: "About Me", // The layout will add "| Divij Ganjoo"
  description: "Learn more about Divij Ganjoo's professional journey, skills, and work philosophy.",
};

export default function AboutPage() {
  return (
    /*
     * Not a `<main>` element. `MainWrapper` in the root layout already renders the page's single
     * `<main>`, and carries its id, aria-label and skip-link target. This was a second, nested
     * `<main>`, which is invalid HTML and splits the landmark.
     */
    <div className="container mx-auto max-w-5xl py-12 md:py-20">
      {/* This page reuses your existing components to create a new, compelling narrative */}
      <div className="flex flex-col gap-y-24">
        <About />
        <Experience />
        <ExpertiseGate />
      </div>
    </div>
  );
}
