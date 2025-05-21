"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect } from "react";
import bio from "../../content/bio";

export default function HeroSection() {
  const { theme } = useTheme();
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  // Theme-based accent for name
  const nameGradient =
    theme === "cyberpunk"
      ? "from-cyan-400 to-pink-500 neon-glow"
      : theme === "ethereal"
      ? "from-purple-400 to-pink-300"
      : theme === "horizon-blaze"
      ? "from-orange-400 to-pink-500"
      : theme === "neo-mirage"
      ? "from-cyan-500 to-teal-400"
      : "from-blue-600 to-purple-500";

  return (
    <section
      className="flex flex-col-reverse sm:flex-row items-center justify-center min-h-[60vh] gap-10 text-center sm:text-left w-full relative"
      aria-label="Hero section"
    >
      {/* Left: Text */}
      <motion.div
        className="flex-1 flex flex-col items-center sm:items-start gap-6"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight drop-shadow-lg">
          <span className="block text-lg font-medium text-gray-500 dark:text-gray-400 mb-2" aria-live="polite">
            {greeting}
          </span>
          <span
            className={`bg-gradient-to-r ${nameGradient} text-transparent bg-clip-text`}
            aria-label={bio.name}
          >
            {bio.name}
          </span>
        </h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-300">
          {bio.title}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl">
          {bio.tagline}
        </p>
        <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl">
          {bio.summary}
        </p>
        <div className="flex flex-wrap gap-4 mt-4">
          <Link
            href="/projects"
            className="px-6 py-2 rounded-xl bg-accent text-background font-medium shadow-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="View Projects"
          >
            View Projects
          </Link>
          <Link
            href="/contact"
            className="px-6 py-2 rounded-xl border border-accent text-accent font-medium hover:bg-accent hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Contact Me"
          >
            Contact Me
          </Link>
        </div>
      </motion.div>

      {/* Right: Avatar image only, no Lottie */}
      <motion.div
        className="flex-1 flex items-center justify-center"
        aria-hidden="true"
      >
        <Image
          src="/assets/images/your-photo.jpg"
          alt="Divij Ganjoo profile photo"
          width={220}
          height={220}
          className="rounded-full shadow-2xl border-4 border-accent object-cover animate-float"
          priority
        />
      </motion.div>
    </section>
  );
}
