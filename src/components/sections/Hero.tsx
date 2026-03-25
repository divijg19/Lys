"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, FileText, Github, Instagram, Linkedin, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { bio } from "#velite";
import { SocialLink } from "@/components/layout/SocialLink"; // 1. Import the new shared component
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

// --- DATA & CONFIG ---
const taglines = [
  "Software Developer",
  "Systems Thinker",
  "Community Builder",
  "Full-Stack Creator",
];

const socials: {
  href: string;
  name: string;
  icon: LucideIcon;
  colorClass: string;
}[] = [
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
    href: "https://instagram.com/divij.ganjoo",
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

const nameGradients: Record<string, string> = {
  cyberpunk: "from-cyan-400 to-pink-500",
  ethereal: "from-purple-400 to-pink-300",
  horizon: "from-orange-400 to-pink-500",
  mirage: "from-cyan-500 to-teal-400",
  simple: "from-gray-400 to-gray-500",
  default: "from-primary to-accent",
};

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring" as const } },
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
      className="flex min-h-[90vh] items-center justify-center"
      aria-label="Hero section"
    >
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 items-center gap-12 px-4 md:grid-cols-5 md:gap-16">
        <HeroContent />
        <HeroImage />
      </div>
    </motion.section>
  );
}

function HeroContent() {
  const { theme } = useTheme();
  const [greeting, setGreeting] = useState("Hello");
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 6) setGreeting("Haven't you slept yet? It's late!");
    else if (hour < 12) setGreeting("Good morning, let's get started!");
    else if (hour < 18) setGreeting("Good afternoon, hope you're doing well!");
    else setGreeting("Good evening, winding down for the day?");
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prevIndex) => (prevIndex + 1) % taglines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const nameGradient = nameGradients[theme.name] || nameGradients.default;

  return (
    <div className="flex flex-col items-center gap-y-8 text-center md:col-span-3 md:items-start md:text-left">
      <motion.div
        variants={FADE_UP_ANIMATION_VARIANTS}
        className="flex flex-col items-center font-extrabold md:items-start"
      >
        <span
          className="mb-2 font-medium text-muted-foreground text-xl lg:text-2xl"
          aria-live="polite"
        >
          {greeting}
        </span>
        <div className="flex items-center gap-x-3">
          <span className="relative bottom-2.5 font-medium text-muted-foreground text-xl lg:text-2xl">
            I'm
          </span>
          <h1
            className={cn(
              "bg-gradient-to-r bg-clip-text text-5xl text-transparent lg:text-7xl",
              "leading-snug",
              nameGradient
            )}
          >
            {bio.name}
          </h1>
        </div>
      </motion.div>

      <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="h-10">
        <AnimatePresence mode="wait">
          <motion.h2
            key={taglines[taglineIndex]}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="font-semibold text-2xl text-primary"
          >
            {taglines[taglineIndex]}
          </motion.h2>
        </AnimatePresence>
      </motion.div>

      <motion.p
        variants={FADE_UP_ANIMATION_VARIANTS}
        className="max-w-xl text-lg text-muted-foreground"
      >
        {bio.summary}
      </motion.p>

      <motion.div
        variants={FADE_UP_ANIMATION_VARIANTS}
        className="flex flex-wrap justify-center gap-4"
      >
        <Button asChild size="lg" aria-label="View Projects">
          <Link href="/projects">
            View Projects <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" aria-label="Contact Me">
          <Link href="/contact">Contact Me</Link>
        </Button>
      </motion.div>

      <motion.div
        variants={FADE_UP_ANIMATION_VARIANTS}
        className="mt-4 flex flex-wrap justify-center gap-3"
      >
        {socials.map((social) => (
          <SocialLink key={social.name} {...social} />
        ))}
      </motion.div>
    </div>
  );
}

function HeroImage() {
  return (
    <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="group relative md:col-span-2">
      <Image
        src="/assets/images/your-photo.jpg"
        alt="Divij Ganjoo profile photo"
        width={280}
        height={280}
        quality={100}
        className="animate-float rounded-full border-4 border-accent object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        priority
      />
    </motion.div>
  );
}
