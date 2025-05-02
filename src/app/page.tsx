import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import TechStackSection from "../components/TechStackSection";
import ProjectsSection from "../components/ProjectsSection";
import ContactSection from "../components/ContactSection";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Hero Section */}
      <HeroSection />

      {/* About Section */}
      <AboutSection />

      {/* Tech Stack Section */}
      <TechStackSection />

      {/* Projects Section */}
      <ProjectsSection />

      {/* Contact Section */}
      <ContactSection />

      {/* Project Highlight Section */}
      <section className="flex flex-col items-center gap-8 sm:items-start sm:text-left">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Featured Projects
        </h2>
        <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
          {/* Example project */}
          <div className="w-full sm:w-[300px] p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Project 1: Nargis
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              A web app for managing tasks and goals. Built with MERN stack and
              AWS.
            </p>
            <Link
              href="/projects/nargis"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
            >
              View Project
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="flex gap-[24px] flex-wrap items-center justify-center py-8">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/your-profile"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://linkedin.com/in/your-profile"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        {/* Replace with actual contact page */}
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/contact"
        >
          Contact
        </Link>
      </footer>
    </div>
  );
}
