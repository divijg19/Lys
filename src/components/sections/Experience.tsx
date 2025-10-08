"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Briefcase, GraduationCap } from "lucide-react";
import { useRef } from "react";
import { resume } from "#velite";
import { useMotionReady } from "@/components/perf/LazyMotion";
import { Badge } from "@/components/ui/Badge";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { inViewMotion } from "@/lib/motionConfig";
import { fadeUp } from "@/lib/motionPresets";
import { cn } from "@/lib/utils";

// Using shared fadeUp variant + reduced motion gating.

function StaticTimelineItem({
  item,
  index,
}: {
  item: (typeof resume.history)[number];
  index: number;
}) {
  const isLeft = index % 2 === 0;
  const Icon = item.type === "work" ? Briefcase : GraduationCap;
  return (
    <div
      className="relative grid w-full grid-cols-1 items-start md:grid-cols-2 md:gap-x-16"
      data-timeline-item-static
    >
      <div className="-translate-x-1/2 absolute top-6 left-1/2 hidden h-4 w-4 rounded-full bg-primary md:block" />
      <div
        className={cn(
          "w-full rounded-xl border bg-card p-8 shadow-sm",
          isLeft ? "md:col-start-1 md:text-right" : "md:col-start-2 md:text-left"
        )}
      >
        <div className={cn("flex items-center justify-between", isLeft && "md:flex-row-reverse")}>
          <p className="font-semibold text-primary">{item.period}</p>
          <Icon className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <div className={cn("mt-3 space-y-1", isLeft && "md:text-right")}>
          <h3 className="font-bold text-2xl tracking-tight">{item.title}</h3>
          <p className="font-medium text-base text-muted-foreground">
            {item.type === "work" ? item.company : item.institution}
          </p>
        </div>
        <p className="mt-4 text-base text-card-foreground leading-relaxed">{item.description}</p>
        {"tags" in item && item.tags && (
          <div className={cn("mt-4 flex flex-wrap gap-2", isLeft && "md:justify-end")}>
            {item.tags.map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Experience() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 0.9], ["0%", "100%"]);
  const reduceMotion = usePrefersReducedMotion();
  const motionReady = useMotionReady();

  const StaticHeading = (
    <div
      className="mb-16 text-center"
      data-section="experience-heading-static"
    >
      <h2 className="font-bold text-4xl tracking-tight">Experience</h2>
      <p className="mt-3 text-lg text-muted-foreground">
        A timeline of recent professional and academic experiences.
      </p>
    </div>
  );

  const AnimatedHeading = (
    <motion.div
      key="experience-heading-animated"
      {...inViewMotion(reduceMotion, fadeUp, 0.3)}
      className="mb-16 text-center"
      data-section="experience-heading-animated"
    >
      <h2 className="font-bold text-4xl tracking-tight">Experience</h2>
      <p className="mt-3 text-lg text-muted-foreground">
        A timeline of recent professional and academic experiences.
      </p>
    </motion.div>
  );

  if (!motionReady || reduceMotion) {
    return (
      <section
        ref={targetRef}
        className="mx-auto w-full max-w-screen-lg px-4 py-16"
        data-section="experience"
      >
        {StaticHeading}
        <div className="relative flex flex-col items-center">
          {/* Base line (full height) */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-border/40"
          />
          {/* Scroll progress line */}
          <div
            style={{ height: lineHeight.get() }}
            className="absolute top-0 left-1/2 w-px -translate-x-1/2 origin-top bg-primary transition-[height]"
            aria-hidden="true"
          />
          <div className="flex w-full flex-col gap-y-16">
            {resume.history.map((item, index) => (
              <StaticTimelineItem
                key={`${item.type}-static-${index}`}
                item={item}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={targetRef}
      className="mx-auto w-full max-w-screen-lg px-4 py-16"
      data-section="experience"
    >
      {AnimatedHeading}
      <div className="relative flex flex-col items-center">
        {/* Base line (full height) */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-border/40"
        />
        {/* Animated scroll progress line */}
        <motion.div
          style={{ height: lineHeight }}
          className="absolute top-0 left-1/2 w-px -translate-x-1/2 origin-top bg-primary"
          aria-hidden="true"
        />
        <div className="flex w-full flex-col gap-y-16">
          {resume.history.map((item, index) => (
            <TimelineItem
              key={`${item.type}-anim-${index}`}
              item={item}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// --- WORLD-CLASS SUB-COMPONENT: Timeline Item ---
function TimelineItem({ item, index }: { item: (typeof resume.history)[number]; index: number }) {
  const isLeft = index % 2 === 0;
  const Icon = item.type === "work" ? Briefcase : GraduationCap;
  const reduceMotion = usePrefersReducedMotion();

  return (
    <motion.div
      {...inViewMotion(reduceMotion, fadeUp, 0.5)}
      // --- SPACING FIX: Significantly increased the grid gap for more negative space ---
      className="relative grid w-full grid-cols-1 items-start md:grid-cols-2 md:gap-x-16"
    >
      <div className="-translate-x-1/2 absolute top-6 left-1/2 hidden h-4 w-4 rounded-full bg-primary md:block" />

      <div
        className={cn(
          // --- SPACING FIX: Increased internal padding for a more premium feel ---
          "w-full rounded-xl border bg-card p-8 shadow-sm",
          isLeft ? "md:col-start-1 md:text-right" : "md:col-start-2 md:text-left"
        )}
      >
        <div className={cn("flex items-center justify-between", isLeft && "md:flex-row-reverse")}>
          <p className="font-semibold text-primary">{item.period}</p>
          <Icon className="h-6 w-6 text-muted-foreground/50" />
        </div>

        <div className={cn("mt-3 space-y-1", isLeft && "md:text-right")}>
          {/* --- TYPOGRAPHY FIX: Enhanced title size for better hierarchy --- */}
          <h3 className="font-bold text-2xl tracking-tight">{item.title}</h3>
          <p className="font-medium text-base text-muted-foreground">
            {item.type === "work" ? item.company : item.institution}
          </p>
        </div>

        {/* --- TYPOGRAPHY FIX: Added leading-relaxed for improved readability --- */}
        <p className="mt-4 text-base text-card-foreground leading-relaxed">{item.description}</p>

        {"tags" in item && item.tags && (
          <div className={cn("mt-4 flex flex-wrap gap-2", isLeft && "md:justify-end")}>
            {item.tags.map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
