"use client";

import HeroSection from "@/components/sections/Hero";
import AboutSection from "@/components/sections/About";
import TechStackSection from "@/components/sections/TechStack";
import ProjectsSection from "@/components/sections/Projects";
import ContactSection from "@/components/sections/Contact";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center bg-transparent text-gray-900 dark:text-white transition-colors duration-500 font-sans overflow-x-hidden">
      {/* Background animation layer for all theme-based effects */}
      <div
        id="background-animation"
        className="absolute inset-0 -z-10 pointer-events-none"
      />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-screen-xl px-5 sm:px-10 pt-24 sm:pt-32"
      >
        <HeroSection />
      </motion.section>

      {/* Main Sections */}
      <main className="w-full max-w-screen-xl px-5 sm:px-10 space-y-32 mt-28">
        <AboutSection />
        <TechStackSection />
        <ProjectsSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-10 mt-36 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 px-5">
        <div className="flex flex-wrap justify-center gap-6 mb-5">
          <a
            href="https://github.com/your-profile"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit GitHub profile"
            className="hover:underline hover:underline-offset-4"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/your-profile"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit LinkedIn profile"
            className="hover:underline hover:underline-offset-4"
          >
            LinkedIn
          </a>
          <Link
            href="/contact"
            className="hover:underline hover:underline-offset-4"
            aria-label="Contact me"
          >
            Contact
          </Link>
        </div>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} Divij. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
