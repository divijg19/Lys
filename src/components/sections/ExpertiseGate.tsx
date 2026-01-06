"use client";

import dynamic from "next/dynamic";
import { useMotionReady } from "@/components/perf/LazyMotion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ExpertiseStatic } from "./ExpertiseStatic";

const ExpertiseAnimated = dynamic(() => import("./Expertise").then((m) => m.Expertise), {
  ssr: false,
});

export function ExpertiseGate() {
  const reduceMotion = usePrefersReducedMotion();
  const motionReady = useMotionReady();

  if (motionReady && !reduceMotion) {
    return <ExpertiseAnimated />;
  }

  return <ExpertiseStatic />;
}
