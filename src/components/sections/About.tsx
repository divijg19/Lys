"use client";
import dynamic from "next/dynamic";
import { useSectionMotion } from "@/hooks/useSectionMotion";
import { useTheme } from "@/hooks/useTheme";
import { AboutContent } from "./AboutContent";

// Local variants replaced with shared motion presets.

const headingGradients: Record<string, string> = {
  cyberpunk: "from-pink-500 via-yellow-300 to-cyan-400",
  ethereal: "from-pink-400 to-indigo-400",
  horizon: "from-orange-500 via-yellow-400 to-pink-500",
  mirage: "from-cyan-500 via-teal-400 to-purple-500",
  default: "from-primary to-accent",
};

const AboutAnimated = dynamic(() => import("./AboutAnimated").then((m) => m.AboutAnimated), {
  ssr: false,
});

export function About({ headingAs = "h1" }: { headingAs?: "h1" | "h2" }) {
  const { theme } = useTheme();
  const headingGradient = headingGradients[theme.name] || headingGradients.default;
  const sectionMotion = useSectionMotion();

  if (sectionMotion) {
    // headingAs has to be forwarded here too. This is the branch that renders in a normal browser
    // (vitest.setup forces reduced motion, so tests take the plain path below) -- missing it here
    // means the animated path silently kept `<h1>` and the home page still had two of them.
    return (
      <AboutAnimated
        headingGradient={headingGradient}
        headingAs={headingAs}
      />
    );
  }

  return (
    <section
      data-section="about"
      className="mx-auto w-full max-w-7xl px-4 py-16"
      aria-label="About section"
    >
      <AboutContent
        headingGradient={headingGradient}
        headingAs={headingAs}
      />
    </section>
  );
}
