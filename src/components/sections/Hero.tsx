"use client";

import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { bio } from "#velite";
import { SocialLink } from "@/components/layout/SocialLink";
import { useMotionReady } from "@/components/perf/LazyMotion";
import { Button } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useTheme } from "@/hooks/useTheme";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { HERO_SOCIALS, HERO_STACK_RIBBONS, HERO_TAGLINES } from "./Hero.data";

const HeroAnimated = dynamic(() => import("./HeroAnimated").then((m) => m.HeroAnimated), {
  ssr: false,
});

// --- ACCESSIBILITY-FIRST NAME GRADIENTS (FINAL VERSION) ---
const NAME_GRADIENTS: Record<string, string> = {
  // UPDATED: Light and Dark now use a single color, implemented as a uniform gradient.
  light: "bg-gradient-to-r from-blue-600 to-blue-600",
  dark: "bg-gradient-to-r from-purple-500 to-purple-500",

  // RETAINED: All other themes keep their correct, refined gradients.
  mirage: "bg-gradient-to-r from-cyan-500 to-teal-400",
  horizon: "bg-gradient-to-r from-orange-500 via-rose-500 to-pink-600",
  simple: "bg-gradient-to-r from-foreground to-foreground",
  ethereal: "bg-gradient-to-r from-pink-400 to-indigo-400",
  cyberpunk: "text-gradient-theme",
};

// Local fade variants replaced by shared presets (fadeUp + staggerContainer)

import { useDayPhase } from "@/hooks/useDayPhase";

export function Hero() {
  const reduceMotion = usePrefersReducedMotion();
  const motionReady = useMotionReady();
  const { theme, isMounted } = useTheme();
  const { greeting } = useDayPhase();
  const taglines = HERO_TAGLINES as readonly string[];
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [typedTagline, setTypedTagline] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const currentTaglineLabel = taglines[taglineIndex] ?? bio.tagline ?? "";

  useEffect(() => {
    const fullText = taglines[taglineIndex] ?? "";
    // Simple, smooth loop: type -> hold -> delete -> brief gap -> next
    const initialDelayMs = typedTagline.length === 0 && !isDeleting ? 520 : 0;
    const typeSpeedMs = 56;
    const deleteSpeedMs = 40;
    const holdFullMs = 2200;
    const holdEmptyMs = 520;

    let timeout: number | undefined;

    const atFull = typedTagline === fullText;
    const atEmpty = typedTagline.length === 0;

    if (!isDeleting && atFull) {
      timeout = window.setTimeout(() => setIsDeleting(true), holdFullMs);
    } else if (isDeleting && atEmpty) {
      timeout = window.setTimeout(() => {
        setIsDeleting(false);
        setTaglineIndex((prev) => (prev + 1) % taglines.length);
      }, holdEmptyMs);
    } else {
      const nextLen = typedTagline.length + (isDeleting ? -1 : 1);
      const nextText = fullText.slice(0, Math.max(0, nextLen));
      timeout = window.setTimeout(
        () => setTypedTagline(nextText),
        initialDelayMs || (isDeleting ? deleteSpeedMs : typeSpeedMs)
      );
    }

    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [taglines, taglineIndex, typedTagline, isDeleting]);

  const nameGradientClass = isMounted
    ? NAME_GRADIENTS[theme.name] || "text-foreground"
    : "text-foreground";

  if (motionReady && !reduceMotion) {
    return (
      <HeroAnimated
        greeting={greeting}
        nameGradientClass={nameGradientClass}
        tagline={typedTagline}
        taglineLabel={currentTaglineLabel}
        stackRibbons={[...HERO_STACK_RIBBONS]}
        reduceMotion={reduceMotion}
      />
    );
  }

  return (
    <section
      data-section="hero"
      className="flex min-h-[90vh] items-center justify-center px-4 py-16"
      aria-label="Hero section"
    >
      <div className="flex w-full max-w-7xl flex-col items-center gap-6 text-center lg:flex-row lg:items-start lg:justify-center lg:gap-14 lg:text-left">
        <HeroContent
          greeting={greeting}
          nameGradientClass={nameGradientClass}
          tagline={typedTagline}
          taglineLabel={currentTaglineLabel}
          showCaret
        />
        <HeroImage reduceMotion={reduceMotion} />
      </div>
    </section>
  );
}

const HeroContent = memo(
  ({
    greeting,
    nameGradientClass,
    tagline,
    taglineLabel,
    showCaret,
  }: {
    greeting: string;
    nameGradientClass: string;
    tagline: string;
    taglineLabel: string;
    showCaret?: boolean;
  }) => {
    const ariaLabel = taglineLabel || bio.tagline || "Tagline";
    return (
      <div className="flex flex-col items-center lg:items-start">
        <div className="flex flex-col items-center lg:items-start">
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
        </div>

        <div className="mt-1 flex h-10 flex-row items-center">
          <h2
            className="font-semibold text-2xl text-primary md:text-3xl"
            aria-label={ariaLabel}
          >
            {tagline}
            {tagline.length === 0 ? <span className="sr-only">{ariaLabel}</span> : null}
            {showCaret ? (
              <span
                className="terminal-cursor ml-0.5 inline-block h-[1.15em] w-0"
                aria-hidden
              />
            ) : null}
          </h2>
        </div>

        <ul
          className="mt-3 flex list-none flex-wrap justify-center gap-2 p-0 lg:justify-start"
          aria-label="Core focus areas"
        >
          {HERO_STACK_RIBBONS.map((label) => (
            <li
              key={label}
              className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 font-medium text-muted-foreground text-xs"
            >
              {label}
            </li>
          ))}
        </ul>

        <p className="mt-4 max-w-xl text-lg text-muted-foreground leading-snug md:text-xl lg:text-left">
          {bio.summary}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
          <Button
            asChild
            size="lg"
            aria-label="View Projects"
          >
            <Link href={ROUTES.projects}>
              View Projects <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            aria-label="Contact Me"
          >
            <Link href={ROUTES.contact}>Contact Me</Link>
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
          {HERO_SOCIALS.map((social) => (
            <SocialLink
              key={social.name}
              {...social}
            />
          ))}
        </div>
      </div>
    );
  }
);
HeroContent.displayName = "HeroContent";

const HeroImage = memo(({ reduceMotion }: { reduceMotion: boolean }) => {
  return (
    <div className="group -mt-4 relative h-64 w-64 shrink-0 lg:mt-6 lg:h-80 lg:w-80">
      <Image
        src="/assets/images/divij-ganjoo.jpg"
        alt="Divij Ganjoo profile photo"
        fill
        sizes="(max-width: 1023px) 256px, 320px"
        quality={95}
        className={cn(
          "rounded-full border-4 border-accent object-cover transition-transform duration-300 ease-in-out group-hover:scale-105",
          reduceMotion ? "" : "animate-float"
        )}
        priority
      />
    </div>
  );
});
HeroImage.displayName = "HeroImage";
