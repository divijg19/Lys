"use client";

import dynamic from "next/dynamic";
import { useSectionMotion } from "@/hooks/useSectionMotion";
import { ExpertiseStatic } from "./ExpertiseStatic";

const ExpertiseAnimated = dynamic(() => import("./Expertise").then((m) => m.Expertise), {
  ssr: false,
});

export function ExpertiseGate() {
  const sectionMotion = useSectionMotion();

  if (sectionMotion) {
    return <ExpertiseAnimated />;
  }

  return <ExpertiseStatic />;
}
