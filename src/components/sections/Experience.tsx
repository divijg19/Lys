"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Briefcase, GraduationCap } from "lucide-react";
import { useRef } from "react";
import { resume } from "#velite";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

// Reusable animation variants with a refined spring transition
const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { stiffness: 100, damping: 20 } },
};

export function Experience() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 0.9], ["0%", "100%"]);

  return (
    <section
      ref={targetRef}
      className="mx-auto w-full max-w-screen-lg px-4 py-16"
    >
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={FADE_UP_VARIANTS}
        className="mb-16 text-center"
      >
        <h2 className="font-bold text-4xl tracking-tight">Experience</h2>
        <p className="mt-3 text-lg text-muted-foreground">
          A timeline of recent professional and academic experiences.
        </p>
      </motion.div>

      <div className="relative flex flex-col items-center">
        <motion.div
          style={{ height: lineHeight }}
          className="absolute top-0 left-1/2 hidden w-0.5 origin-top bg-border md:block"
        />
        {/* --- SPACING FIX: Increased vertical gap between timeline items --- */}
        <div className="flex w-full flex-col gap-y-16">
          {resume.history.map((item, index) => (
            <TimelineItem
              key={`${item.type}-${index}`}
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

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      variants={FADE_UP_VARIANTS}
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
