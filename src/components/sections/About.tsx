"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import bio from "../../content/bio";

export default function AboutSection() {
  const { theme } = useTheme();

  const isEthereal = theme === "ethereal";
  const isHorizon = theme === "horizon-blaze";
  const isNeoMirage = theme === "neo-mirage";

  const headingGradient = isEthereal
    ? "from-pink-400 to-indigo-400"
    : isHorizon
    ? "from-orange-500 via-yellow-400 to-pink-500"
    : isNeoMirage
    ? "from-cyan-500 via-teal-400 to-purple-500"
    : "from-blue-600 to-purple-500";

  return (
    <section className="w-full max-w-4xl mx-auto mt-24 px-4 text-center sm:text-left">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.7 }}
        transition={{ duration: 0.6 }}
        className={`text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r ${headingGradient} text-transparent bg-clip-text`}
      >
        About Me
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.7 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
      >
        {bio.summary}
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.7 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
      >
        I’m a full-stack developer and systems thinker passionate about building scalable, meaningful, and community-driven tech solutions. I blend code with strategy, focusing on MERN, AWS, and DevOps to craft reliable infrastructure and intuitive user experiences.
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.7 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
      >
        With experience across leadership roles in TEDx, GDSC, and AIESEC, I bring a unique perspective to software: it’s not just about what you build, but who it empowers. Currently, I’m working on a skill-sharing platform and a game called <span className="italic">The Crowns Blade</span>.
      </motion.p>
    </section>
  );
}
