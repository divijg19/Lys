import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { HeroSkeleton } from "@/components/sections/HeroSkeleton";

const SectionSkeleton = () => <section className="py-16 md:py-20" />;

const DynamicHero = dynamic(() => import("@/components/sections/Hero").then((mod) => mod.Hero), {
  loading: () => <HeroSkeleton />,
});
const DynamicAbout = dynamic(() => import("@/components/sections/About").then((mod) => mod.About), {
  loading: () => <SectionSkeleton />,
});
const DynamicExperience = dynamic(
  () => import("@/components/sections/Experience").then((mod) => mod.Experience),
  { loading: () => <SectionSkeleton /> }
);
const DynamicExpertise = dynamic(
  () => import("@/components/sections/Expertise").then((mod) => mod.Expertise),
  { loading: () => <SectionSkeleton /> }
);
const DynamicProjectsPreview = dynamic(
  () => import("@/components/sections/ProjectsPreview").then((mod) => mod.ProjectsPreview),
  { loading: () => <SectionSkeleton /> }
);
const DynamicBlogPreview = dynamic(
  () => import("@/components/sections/BlogPreview").then((mod) => mod.BlogPreview),
  { loading: () => <SectionSkeleton /> }
);
const DynamicContact = dynamic(
  () => import("@/components/sections/Contact").then((mod) => mod.Contact),
  { loading: () => <SectionSkeleton /> }
);

// This is the definitive narrative order for your homepage.
const sections: { name: string; Component: ComponentType }[] = [
  { name: "Hero", Component: DynamicHero },
  { name: "About", Component: DynamicAbout },
  { name: "Experience", Component: DynamicExperience },
  { name: "Expertise", Component: DynamicExpertise },
  { name: "Projects", Component: DynamicProjectsPreview },
  { name: "Blog", Component: DynamicBlogPreview },
  { name: "Contact", Component: DynamicContact },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {sections.map(({ name, Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
