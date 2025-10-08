import type { Metadata } from "next";
// Import the world-class sections you've already built
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Expertise } from "@/components/sections/Expertise";

export const metadata: Metadata = {
  title: "About Me", // The layout will add "| Divij Ganjoo"
  description: "Learn more about Divij Ganjoo's professional journey, skills, and work philosophy.",
};

export default function AboutPage() {
  return (
    <main className="container mx-auto max-w-5xl py-12 md:py-20">
      {/* This page reuses your existing components to create a new, compelling narrative */}
      <div className="flex flex-col gap-y-24">
        <About />
        <Experience />
        <Expertise />
      </div>
    </main>
  );
}
