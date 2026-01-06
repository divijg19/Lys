import type { LucideIcon } from "lucide-react";
import { FileText, Github, Instagram, Linkedin, Mail } from "lucide-react";
import { bio } from "#velite";

export const HERO_TAGLINES = [
  "Systems Engineer & Toolmaker",
  "Building backend systems & infrastructure",
  "Designing developer tools & platforms",
  "Exploring runtimes and language design",
  "End-to-end systems, from UX to infrastructure",
  "Open-source systems builder",
] as const;

export const HERO_STACK_RIBBONS = [
  "Go · Python · TypeScript · Rust",
  "Backend · Tooling · Platforms · Runtimes",
  "Product-minded  · U/DX-focused · Systems-first",
] as const;

export type HeroSocialLink = {
  href: string;
  name: string;
  icon: LucideIcon;
  colorClass: string;
};

export const HERO_SOCIALS: HeroSocialLink[] = [
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
    href: bio.social.instagram,
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
