"use client";

import { Award, Cpu, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { bio } from "#velite";
import { cn } from "@/lib/utils";

type AboutContentProps = {
  headingGradient: string;
};

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
] as const;

export function AboutContent({ headingGradient }: AboutContentProps) {
  const [aboutImageSrc, setAboutImageSrc] = useState("/assets/images/about-photo.jpg");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn("grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16")}>
      <div className="relative h-full w-full">
        <Image
          src={aboutImageSrc}
          alt="A photo of Divij Ganjoo"
          width={500}
          height={600}
          sizes="(max-width: 767px) 100vw, 500px"
          className="rounded-xl border object-cover shadow-lg"
          onError={() => {
            if (aboutImageSrc !== "/assets/images/placeholder.svg") {
              setAboutImageSrc("/assets/images/placeholder.svg");
            }
          }}
        />
      </div>

      <div className="flex flex-col items-start gap-y-6 text-left transition-all duration-700">
        {/*
         * The page's <h1>. `/about` was the only route with no level-1 heading: this was an
         * <h2>, so the document began at level 2 and screen-reader heading navigation had
         * nothing to land on.
         *
         * Visually identical -- the size, weight and gradient are explicit classes, so the
         * element type carries no styling of its own here. Tailwind's preflight resets both
         * `h1` and `h2` to `font-size: inherit`, so the only difference is semantics.
         */}
        <h1
          className={cn(
            "bg-clip-text font-bold text-4xl text-transparent",
            mounted ? `bg-linear-to-r ${headingGradient}` : "bg-linear-to-r from-primary to-accent"
          )}
        >
          About Me
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {bio.summary} I design and build backend systems, developer tools, and platforms, from UX
          to infrastructure. I’m a full-stack developer passionate about building scalable and
          meaningful tech. With experience in leadership roles, I bring a unique perspective to
          software: it’s not just about what you build, but who it empowers.
        </p>

        <div className="mt-4 w-full space-y-6">
          {keyStrengths.map((strength) => (
            <div
              key={strength.title}
              className="flex items-start gap-4"
            >
              <strength.icon className="mt-1 h-8 w-8 shrink-0 text-primary" />
              <div>
                {/*
                 * `<h2>`, not `<h3>`: these cards are the direct subordinates of the page's
                 * `<h1>` (there is no intermediate group heading), so `h3` made the sequence
                 * `h1 -> h3`, which axe flags as `heading-order`. They were previously `<h3>`
                 * to sit correctly under the old `<h2>` "About Me".
                 *
                 * Visually identical -- Tailwind's preflight resets `h1`-`h6` to
                 * `font-size: inherit; font-weight: inherit`, so the element type contributes
                 * no styling of its own and the explicit classes below are unchanged.
                 */}
                <h2 className="font-semibold text-lg">{strength.title}</h2>
                <p className="text-muted-foreground">{strength.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
