"use client";
import { motion } from "framer-motion";
import { Award, Cpu, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { bio } from "#velite";
import { useMotionReady } from "@/components/perf/LazyMotion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

// Local variants replaced with shared motion presets.

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
  const reduceMotion = usePrefersReducedMotion();
  const motionReady = useMotionReady();
  const rootRef = useRef<HTMLElement | null>(null);
  // Use a simple mount-visible flag to avoid IO timing issues; rely on framer-motion viewport for micro transitions.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const Content = (
    <div className={cn("grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16")}>
      {/* --- LEFT COLUMN: IMAGE --- */}
      <div className="relative h-full w-full">
        <Image
          src="/assets/images/about-photo.jpg"
          alt="A photo of Divij Ganjoo"
          width={500}
          height={600}
          unoptimized
          className="rounded-xl border object-cover shadow-lg"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            if (!img.dataset.fallback) {
              img.dataset.fallback = "1";
              img.src = "/assets/images/placeholder.svg";
            }
          }}
        />
      </div>

      {/* --- RIGHT COLUMN: TEXT CONTENT --- */}
      <div className="flex flex-col items-start gap-y-6 text-left transition-all duration-700">
        <h2
          className={cn(
            "bg-clip-text font-bold text-4xl text-transparent",
            // Avoid sending a theme-specific gradient before mount to keep SSR/CSR HTML consistent
            mounted
              ? `bg-gradient-to-r ${headingGradient}`
              : "bg-gradient-to-r from-primary to-accent"
          )}
        >
          About Me
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {bio.summary} I’m a full-stack developer passionate about building scalable and meaningful
          tech. With experience in leadership roles, I bring a unique perspective to software: it’s
          not just about what you build, but who it empowers.
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
      </div>
    </div>
  );

  if (!motionReady || reduceMotion) {
    return (
      <section
        ref={rootRef as unknown as null}
        data-section="about"
        className="mx-auto w-full max-w-screen-xl px-4 py-16"
        aria-label="About section"
      >
        {Content}
      </section>
    );
  }

  return (
    <motion.section
      ref={rootRef}
      data-section="about"
      className="mx-auto w-full max-w-screen-xl px-4 py-16"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {Content}
    </motion.section>
  );
}
