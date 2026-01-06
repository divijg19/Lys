"use client";

import { Briefcase, GraduationCap } from "lucide-react";
import dynamic from "next/dynamic";
import { resume } from "#velite";
import { useMotionReady } from "@/components/perf/LazyMotion";
import { Badge } from "@/components/ui/Badge";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

// Using shared fadeUp variant + reduced motion gating.

const ExperienceAnimated = dynamic(
  () => import("./ExperienceAnimated").then((m) => m.ExperienceAnimated),
  {
    ssr: false,
  }
);

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
  const reduceMotion = usePrefersReducedMotion();
  const motionReady = useMotionReady();

  if (motionReady && !reduceMotion) {
    return <ExperienceAnimated />;
  }

  return (
    <section
      className="mx-auto w-full max-w-5xl px-4 py-16"
      data-section="experience"
    >
      <div
        className="mb-16 text-center"
        data-section="experience-heading-static"
      >
        <h2 className="font-bold text-4xl tracking-tight">Experience</h2>
        <p className="mt-3 text-lg text-muted-foreground">
          A timeline of recent professional and academic experiences.
        </p>
      </div>

      <div className="relative flex flex-col items-center">
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-border/40"
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
