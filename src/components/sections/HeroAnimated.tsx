"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { bio } from "#velite";
import { SocialLink } from "@/components/layout/SocialLink";
import { Button } from "@/components/ui/Button";
import { fadeUp, staggerContainer } from "@/lib/motionPresets";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { HERO_SOCIALS } from "./Hero.data";

type HeroAnimatedProps = {
  greeting: string;
  nameGradientClass: string;
  tagline: string;
  taglineLabel: string;
  stackRibbons: string[];
  reduceMotion: boolean;
};

export function HeroAnimated({
  greeting,
  nameGradientClass,
  tagline,
  taglineLabel,
  stackRibbons,
  reduceMotion,
}: HeroAnimatedProps) {
  const Inner = (
    <div className="flex w-full max-w-7xl flex-col items-center gap-6 text-center lg:flex-row lg:items-start lg:justify-center lg:gap-14 lg:text-left">
      <HeroContentAnimated
        greeting={greeting}
        nameGradientClass={nameGradientClass}
        tagline={tagline}
        taglineLabel={taglineLabel}
        stackRibbons={stackRibbons}
        reduceMotion={reduceMotion}
      />
      <HeroImageAnimated reduceMotion={reduceMotion} />
    </div>
  );

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

const HeroContentAnimated = memo(
  ({
    greeting,
    nameGradientClass,
    tagline,
    taglineLabel,
    stackRibbons,
    reduceMotion,
  }: {
    greeting: string;
    nameGradientClass: string;
    tagline: string;
    taglineLabel: string;
    stackRibbons: string[];
    reduceMotion: boolean;
  }) => {
    const ariaLabel = taglineLabel || bio.tagline || "Tagline";
    return (
      <div className="flex flex-col items-center lg:items-start">
        <motion.div
          variants={reduceMotion ? undefined : fadeUp}
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
                I&apos;m
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
          variants={reduceMotion ? undefined : fadeUp}
          className="mt-1 flex h-10 flex-row items-center"
        >
          <h2
            className="font-semibold text-2xl text-primary md:text-3xl"
            aria-label={ariaLabel}
          >
            {tagline}
            {tagline.length === 0 ? <span className="sr-only">{ariaLabel}</span> : null}
            {!reduceMotion ? (
              <span
                className="terminal-cursor ml-0.5 inline-block h-[1.15em] w-0"
                aria-hidden
              />
            ) : null}
          </h2>
        </motion.div>

        <motion.ul
          variants={reduceMotion ? undefined : fadeUp}
          className="mt-3 flex list-none flex-wrap justify-center gap-2 p-0 lg:justify-start"
          aria-label="Core focus areas"
        >
          {stackRibbons.map((label) => (
            <li
              key={label}
              className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 font-medium text-muted-foreground text-xs"
            >
              {label}
            </li>
          ))}
        </motion.ul>

        <motion.p
          variants={reduceMotion ? undefined : fadeUp}
          className="mt-4 max-w-xl text-lg text-muted-foreground leading-snug md:text-xl lg:text-left"
        >
          {bio.summary}
        </motion.p>

        <motion.div
          variants={reduceMotion ? undefined : fadeUp}
          className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start"
        >
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
        </motion.div>

        <motion.div
          variants={reduceMotion ? undefined : fadeUp}
          className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
        >
          {HERO_SOCIALS.map((social) => (
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
HeroContentAnimated.displayName = "HeroContentAnimated";

const HeroImageAnimated = memo(({ reduceMotion }: { reduceMotion: boolean }) => {
  return (
    <motion.div
      variants={reduceMotion ? undefined : fadeUp}
      className="group -mt-4 relative h-64 w-64 shrink-0 lg:mt-6 lg:h-80 lg:w-80"
    >
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
    </motion.div>
  );
});
HeroImageAnimated.displayName = "HeroImageAnimated";
