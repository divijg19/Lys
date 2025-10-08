"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, FileText, Github, Instagram, Linkedin, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { bio } from "#velite";
import { SocialLink } from "@/components/layout/SocialLink";
import { useMotionReady } from "@/components/perf/LazyMotion";
import { Button } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useTheme } from "@/hooks/useTheme";
import { fadeUp, staggerContainer } from "@/lib/motionPresets";
import { cn } from "@/lib/utils";

// --- DATA & CONFIG ---
const TAGLINES = [
  "Software Developer",
  "Systems Thinker",
  "Community Builder",
  "Full-Stack Creator",
];

const SOCIALS = [
  {
    href: bio.social.github,
    name: "GitHub",
    icon: Github,
    colorClass: "hover:bg-[#181717] hover:text-white",
  },
  {
    href: `mailto:${bio.email}`,
    name: "Gmail",
    icon: Mail,
    colorClass: "hover:bg-[#EA4335] hover:text-white",
  },
  {
    href: bio.social.linkedin,
    name: "LinkedIn",
    icon: Linkedin,
    colorClass: "hover:bg-[#0A66C2] hover:text-white",
  },
  {
    href: bio.social.instagram,
    name: "Instagram",
    icon: Instagram,
    colorClass: "hover:bg-[#E4405F] hover:text-white",
  },
  {
    href: "/resume.pdf",
    name: "Resume",
    icon: FileText,
    colorClass: "hover:bg-[#1DB954] hover:text-white",
  },
];

// --- ACCESSIBILITY-FIRST NAME GRADIENTS (FINAL VERSION) ---
const NAME_GRADIENTS: Record<string, string> = {
  // UPDATED: Light and Dark now use a single color, implemented as a uniform gradient.
  light: "bg-gradient-to-r from-blue-600 to-blue-600",
  dark: "bg-gradient-to-r from-purple-500 to-purple-500",

  // RETAINED: All other themes keep their correct, refined gradients.
  mirage: "bg-gradient-to-r from-cyan-500 to-teal-400",
  horizon: "bg-gradient-to-r from-orange-500 via-rose-500 to-pink-600",
  simple: "bg-gradient-to-r from-green-700 to-green-800",
  ethereal: "text-gradient-ethereal-readable",
  cyberpunk: "text-gradient-theme",
};

// Local fade variants replaced by shared presets (fadeUp + staggerContainer)

import { useDayPhase } from "@/hooks/useDayPhase";

export function Hero() {
  const reduceMotion = usePrefersReducedMotion();
  const motionReady = useMotionReady();
  const Inner = (
    <div className="flex w-full max-w-screen-xl flex-col items-center gap-12 text-center lg:flex-row lg:items-start lg:justify-center lg:gap-20 lg:text-left">
      <HeroContent
        reduceMotion={reduceMotion}
        motionReady={motionReady && !reduceMotion}
      />
      <HeroImage
        reduceMotion={reduceMotion}
        motionReady={motionReady && !reduceMotion}
      />
    </div>
  );

  // Plain (non-animated) version until motion is ready (avoids any transient hidden state or variant injection after mount)
  if (!motionReady || reduceMotion) {
    return (
      <section
        data-section="hero"
        className="flex min-h-[90vh] items-center justify-center px-4 py-16"
        aria-label="Hero section"
      >
        {Inner}
      </section>
    );
  }

  // Animated version mounts only once when features loaded so initial/animate works predictably.
  return (
    <motion.section
      key="hero-animated"
      data-section="hero"
      initial="hidden"
      animate="show"
      viewport={{ once: true }}
      variants={staggerContainer(0.15)}
      className="flex min-h-[90vh] items-center justify-center px-4 py-16"
      aria-label="Hero section"
    >
      {Inner}
    </motion.section>
  );
}

const HeroContent = memo(
  ({ reduceMotion, motionReady }: { reduceMotion: boolean; motionReady: boolean }) => {
    const { theme, isMounted } = useTheme();
    const { greeting } = useDayPhase();
    const [taglineIndex, setTaglineIndex] = useState(0);

    useEffect(() => {
      // Skip animated tagline cycling when user prefers reduced motion (also active in test env)
      if (reduceMotion) return;
      const interval = setInterval(() => {
        setTaglineIndex((prevIndex) => (prevIndex + 1) % TAGLINES.length);
      }, 3000);
      return () => clearInterval(interval);
    }, [reduceMotion]);

    // Ensure text is still readable before theme mount (previously text-transparent made section look empty)
    const nameGradientClass = isMounted
      ? NAME_GRADIENTS[theme.name] || "text-foreground"
      : "text-foreground";

    return (
      <div className="flex flex-col items-center lg:items-start">
        <motion.div
          variants={reduceMotion || !motionReady ? undefined : fadeUp}
          className="flex flex-col items-center lg:items-start"
        >
          <span
            className="font-medium text-muted-foreground text-xl md:text-2xl"
            aria-live="polite"
          >
            {greeting}
          </span>

          <div className="flex flex-row items-center gap-x-1">
            <div className="flex translate-y-1 flex-col">
              <span className="font-medium text-muted-foreground text-xl leading-tight md:text-2xl">
                Hi!
              </span>
              <span className="font-medium text-muted-foreground text-xl leading-tight md:text-2xl">
                I'm
              </span>
            </div>
            <h1
              className={cn(
                "bg-clip-text font-extrabold text-5xl text-transparent md:text-7xl",
                "leading-snug transition-colors duration-500",
                nameGradientClass
              )}
            >
              {bio.name?.trim() ? bio.name : "Portfolio"}
            </h1>
          </div>
        </motion.div>

        <motion.div
          variants={reduceMotion || !motionReady ? undefined : fadeUp}
          className="mt-1 flex h-10 flex-row items-center gap-x-2"
        >
          <h2 className="font-semibold text-2xl text-primary md:text-3xl">A</h2>
          <AnimatePresence mode="wait">
            <motion.h2
              key={TAGLINES[taglineIndex]}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="font-semibold text-2xl text-primary md:text-3xl"
            >
              {TAGLINES[taglineIndex]}
            </motion.h2>
          </AnimatePresence>
        </motion.div>

        <motion.p
          variants={reduceMotion || !motionReady ? undefined : fadeUp}
          className="mt-4 max-w-xl text-lg text-muted-foreground leading-snug md:text-xl lg:text-left"
        >
          {bio.summary}
        </motion.p>

        <motion.div
          variants={reduceMotion || !motionReady ? undefined : fadeUp}
          className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start"
        >
          <Button
            asChild
            size="lg"
            aria-label="View Projects"
          >
            <Link href="/projects">
              View Projects <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            aria-label="Contact Me"
          >
            <Link href="/contact">Contact Me</Link>
          </Button>
        </motion.div>

        <motion.div
          variants={reduceMotion || !motionReady ? undefined : fadeUp}
          className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
        >
          {SOCIALS.map((social) => (
            <SocialLink
              key={social.name}
              {...social}
            />
          ))}
        </motion.div>
      </div>
    );
  }
);
HeroContent.displayName = "HeroContent";

const HeroImage = memo(({ reduceMotion }: { reduceMotion: boolean; motionReady: boolean }) => {
  return (
    <motion.div
      // This image subtly fades in only in animated phase; in plain phase parent not motion so it's static.
      variants={reduceMotion ? undefined : fadeUp}
      className="group -mt-4 relative h-64 w-64 flex-shrink-0 lg:mt-10 lg:h-80 lg:w-80"
    >
      <Image
        src="/assets/images/divij-ganjoo.jpg"
        alt="Divij Ganjoo profile photo"
        fill
        sizes="(max-width: 1023px) 256px, 320px"
        quality={95}
        fetchPriority="high"
        className={cn(
          "rounded-full border-4 border-accent object-cover transition-transform duration-300 ease-in-out group-hover:scale-105",
          reduceMotion ? "" : "animate-float"
        )}
        priority
      />
    </motion.div>
  );
});
HeroImage.displayName = "HeroImage";
