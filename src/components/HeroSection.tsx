"use client";

import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="flex flex-col sm:flex-row items-center justify-between gap-8 w-full max-w-5xl">
      {/* Left content */}
      <div className="text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
          Hey, I&apos;m Divij
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-700 dark:text-gray-300">
          Developer, writer, and systems thinker on a mission to build integrated digital solutions and communities.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 justify-center sm:justify-start">
          <a
            href="/projects"
            className="px-6 py-2 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-black font-medium hover:scale-105 transition-transform"
          >
            View Projects
          </a>
          <a
            href="/contact"
            className="px-6 py-2 rounded-xl border border-gray-700 dark:border-white font-medium text-gray-900 dark:text-white hover:scale-105 transition-transform"
          >
            Contact Me
          </a>
        </div>
      </div>

      {/* Profile image */}
      <div className="shrink-0">
        <Image
          src="/your-photo.jpg"
          alt="Divij&apos;s profile photo"
          width={220}
          height={220}
          className="rounded-full shadow-lg"
          priority
        />
      </div>
    </section>
  );
}