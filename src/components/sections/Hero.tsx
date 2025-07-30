"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, FileText, Github, Instagram, Linkedin, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo, useEffect, useMemo, useState } from "react";
import { bio } from "#velite";
import { SocialLink } from "@/components/layout/SocialLink";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
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
    href: "https://instagram.com/one_excellent_hope",
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

const NAME_GRADIENTS: Record<string, string> = {
  cyberpunk: "from-cyan-400 to-pink-500",
  ethereal: "from-purple-400 to-pink-300",
  horizon: "from-orange-400 to-pink-500",
  mirage: "from-cyan-500 to-teal-400",
  simple: "from-gray-400 to-gray-500",
  default: "from-primary to-accent",
};

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring" as "spring" } },
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return "Haven't you slept yet? It's late!";
  if (hour < 12) return "Good morning, let's get started!";
  if (hour < 18) return "Good afternoon, hope you're doing well!";
  return "Good evening, winding down for the day?";
};

export function Hero() {
  return (
    <motion.section
      initial="hidden"
      animate="show"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.15 } },
      }}
      className="flex min-h-[90vh] items-center justify-center px-4 py-16"
      aria-label="Hero section"
    >
      <div className="flex w-full max-w-screen-xl flex-col items-center gap-12 text-center lg:flex-row lg:items-start lg:justify-center lg:gap-20 lg:text-left">
        <HeroContent />
        <HeroImage />
      </div>
    </motion.section>
  );
}

const HeroContent = memo(() => {
  const { theme } = useTheme();
  const [taglineIndex, setTaglineIndex] = useState(0);

  const greeting = useMemo(() => getGreeting(), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prevIndex) => (prevIndex + 1) % TAGLINES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const nameGradient = NAME_GRADIENTS[theme.name] || NAME_GRADIENTS.default;

  return (
    <div className="flex flex-col items-center lg:items-start">
      <motion.div
        variants={FADE_UP_ANIMATION_VARIANTS}
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
              "bg-gradient-to-r bg-clip-text font-extrabold text-5xl text-transparent md:text-7xl",
              "leading-snug",
              nameGradient
            )}
          >
            {bio.name}
          </h1>
        </div>
      </motion.div>

      {/* --- TAGLINE WITH STATIC "A" --- */}
      <motion.div
        variants={FADE_UP_ANIMATION_VARIANTS}
        // THE FIX: Changed mt-4 to mt-1 to reduce the gap
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
        variants={FADE_UP_ANIMATION_VARIANTS}
        // THE FIX: Changed mt-6 to mt-4 to bring the paragraph closer
        className="mt-4 max-w-xl text-lg text-muted-foreground leading-snug md:text-xl lg:text-left"
      >
        {bio.summary}
      </motion.p>

      <motion.div
        variants={FADE_UP_ANIMATION_VARIANTS}
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
        variants={FADE_UP_ANIMATION_VARIANTS}
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
});
HeroContent.displayName = "HeroContent";

const HeroImage = memo(() => {
  return (
    <motion.div
      variants={FADE_UP_ANIMATION_VARIANTS}
      className="group -mt-4 relative h-64 w-64 flex-shrink-0 lg:mt-10 lg:h-80 lg:w-80"
    >
      <Image
        src="/assets/images/your-photo.jpg"
        alt="Divij Ganjoo profile photo"
        fill
        sizes="(max-width: 1023px) 65vw, 30vw"
        quality={100}
        className="animate-float rounded-full border-4 border-accent object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        priority
      />
    </motion.div>
  );
});
HeroImage.displayName = "HeroImage";
