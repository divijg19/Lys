"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";

export default function HeroSection() {
  const { theme } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    // Detect reduced motion preference
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReduceMotion(mq.matches);
    handleChange();
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  const themeButtonClass = {
    cyberpunk:
      "neon-glow bg-[var(--color-accent)] text-[var(--color-background)]",
    default:
      "bg-[var(--color-accent)] text-[var(--color-background)] hover:brightness-110",
  };

  const headingGradient = {
    ethereal: "from-pink-400 to-indigo-400",
    horizon: "from-orange-500 via-yellow-400 to-pink-500",
    mirage: "from-cyan-500 via-teal-400 to-purple-500",
    default: "from-blue-600 to-purple-500",
  };

  const resolvedGradient =
    headingGradient[theme as keyof typeof headingGradient] ??
    headingGradient.default;

  return (
    <section
      className="relative flex flex-col sm:flex-row items-center justify-between gap-10 sm:gap-16 w-full max-w-6xl px-4 py-16 sm:py-24 mx-auto"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 -z-10 pointer-events-none" />

      {/* Text Content */}
      <div className="text-center sm:text-left max-w-2xl">
        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: reduceMotion ? 0 : -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight bg-gradient-to-r ${resolvedGradient} text-transparent bg-clip-text drop-shadow-md`}
        >
          {greeting}, I&apos;m Divij
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-4 text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-xl"
        >
          Developer, writer, and systems thinker on a mission to build
          integrated digital solutions and communities.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-6 flex flex-wrap gap-4 justify-center sm:justify-start"
        >
          <Link
            href="/projects"
            className={`px-6 py-2 rounded-xl font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 ${
              theme === "cyberpunk"
                ? themeButtonClass.cyberpunk
                : themeButtonClass.default
            }`}
            aria-label="View Divij's Projects"
          >
            View Projects
          </Link>

          <Link
            href="/contact"
            className="px-6 py-2 rounded-xl border border-[var(--color-foreground)] text-[var(--color-foreground)] font-medium transition-all hover:bg-[var(--color-hover)] hover:text-[var(--color-background)] focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label="Contact Divij"
          >
            Contact Me
          </Link>
        </motion.div>
      </div>

      {/* Image Section */}
      <motion.figure
        initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="shrink-0"
      >
        <Image
          src="/assets/images/your-photo.jpg"
          alt="Portrait of Divij"
          width={240}
          height={240}
          className="rounded-full shadow-2xl ring-4 ring-[var(--color-accent)] transition-all duration-300 blur-sm hover:blur-0 hover:scale-105"
        />
        <figcaption className="sr-only">
          Divij&apos;s profile picture
        </figcaption>
      </motion.figure>
    </section>
  );
}
