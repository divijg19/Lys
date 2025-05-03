"use client";

import HeroSection from "@/components/sections/Hero";
import AboutSection from "@/components/sections/About";
import TechStackSection from "@/components/sections/TechStack";
import ProjectsSection from "@/components/sections/Projects";
import ContactSection from "@/components/sections/Contact";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const themes = ["light", "dark", "cyberpunk", "ethereal"];

export default function Home() {
  const [themeIndex, setThemeIndex] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themes[themeIndex]);
  }, [themeIndex]);

  const toggleTheme = () => {
    setThemeIndex((prev) => (prev + 1) % themes.length);
  };

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] items-center justify-items-center p-6 sm:p-20 gap-16 transition-all duration-500 font-[family-name:var(--font-geist-sans)]">
      {/* Floating Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-700 transition"
      >
        Theme: {themes[themeIndex]}
      </button>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full"
      >
        <HeroSection />
      </motion.div>

      <AboutSection />
      <TechStackSection />
      <ProjectsSection />

      {/* Featured Project */}
      <section className="w-full max-w-5xl flex flex-col gap-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center sm:text-left">
          Featured Project
        </h2>
        <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-full sm:w-[300px] p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Project 1: Nargis
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              A web app for managing tasks and goals. Built with MERN stack and
              AWS.
            </p>
            <Link
              href="/projects/nargis"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 mt-2 inline-block"
            >
              View Project
            </Link>
          </motion.div>
        </div>
      </section>

      <ContactSection />

      {/* Footer */}
      <footer className="w-full text-center flex flex-col gap-4 py-8 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex flex-wrap justify-center gap-6">
          <a
            href="https://github.com/your-profile"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:underline-offset-4"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/your-profile"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:underline-offset-4"
          >
            LinkedIn
          </a>
          <Link
            href="/contact"
            className="hover:underline hover:underline-offset-4"
          >
            Contact
          </Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Your Name. All rights reserved.</p>
      </footer>
    </div>
  );
}
