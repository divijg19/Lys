"use client";

import { motion } from "framer-motion";
import { Award, Cpu, Users } from "lucide-react";
import Image from "next/image";
import { bio } from "#velite";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

// --- REUSABLE VARIANTS FOR CONSISTENT ANIMATION ---
const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, duration: 0.8 } },
};

const headingGradients: Record<string, string> = {
  cyberpunk: "from-pink-500 via-yellow-300 to-cyan-400",
  ethereal: "from-pink-400 to-indigo-400",
  horizon: "from-orange-500 via-yellow-400 to-pink-500",
  mirage: "from-cyan-500 via-teal-400 to-purple-500",
  default: "from-primary to-accent",
};

// --- DATA FOR KEY STRENGTHS ---
const keyStrengths = [
  {
    icon: Cpu,
    title: "Systems Thinker",
    description:
      "Blending code with strategy to craft reliable infrastructure and intuitive user experiences.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Focused on building meaningful and scalable tech solutions that empower people.",
  },
  {
    icon: Award,
    title: "Proven Leadership",
    description: "Bringing a unique perspective from leadership roles in TEDx, GDSC, and AIESEC.",
  },
];

export function About() {
  const { theme } = useTheme();
  const headingGradient = headingGradients[theme.name] || headingGradients.default;

  return (
    <section className="mx-auto w-full max-w-screen-xl px-4 py-16">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.2 } },
        }}
        // --- WORLD-CLASS LAYOUT: TWO-COLUMN GRID ---
        className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16"
      >
        {/* --- LEFT COLUMN: IMAGE --- */}
        <motion.div
          variants={FADE_UP_VARIANTS}
          className="relative h-full w-full"
        >
          <Image
            src="/assets/images/about-photo.jpg" // A different, more candid photo
            alt="A photo of Divij Ganjoo"
            width={500}
            height={600}
            className="rounded-xl border object-cover shadow-lg"
          />
        </motion.div>

        {/* --- RIGHT COLUMN: TEXT CONTENT --- */}
        <motion.div
          variants={FADE_UP_VARIANTS}
          className="flex flex-col items-start gap-y-6 text-left"
        >
          <h2
            className={cn(
              "bg-gradient-to-r bg-clip-text font-bold text-4xl text-transparent",
              headingGradient
            )}
          >
            About Me
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {bio.summary} I’m a full-stack developer passionate about building scalable and
            meaningful tech. With experience in leadership roles, I bring a unique perspective to
            software: it’s not just about what you build, but who it empowers.
          </p>

          {/* --- SCANNABLE KEY STRENGTHS --- */}
          <div className="mt-4 w-full space-y-6">
            {keyStrengths.map((strength) => (
              <div
                key={strength.title}
                className="flex items-start gap-4"
              >
                <strength.icon className="mt-1 h-8 w-8 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">{strength.title}</h3>
                  <p className="text-muted-foreground">{strength.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
