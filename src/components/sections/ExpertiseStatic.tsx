"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { type ComponentType, useCallback, useId, useRef, useState } from "react";
import { expertise } from "#velite";
import { resolveIconFromPath } from "@/components/icons/registry";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Skill } from "@/types/expertise";

const ExpandedSkillModalStatic = dynamic(
  () => import("./ExpertiseModalStatic").then((m) => m.ExpandedSkillModalStatic),
  { ssr: false }
);

function TechIcon({
  path,
  alt: _alt,
  size = 20,
  className,
}: {
  path: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  const Icon = resolveIconFromPath(path);
  const cls = cn("flex-shrink-0 text-primary", className);

  if (Icon) {
    const IconComponent = Icon as ComponentType<{
      className?: string;
      title?: string;
      size?: number;
      labelled?: boolean;
    }>;
    return (
      <IconComponent
        className={cls}
        labelled={false}
        size={size}
      />
    );
  }

  return (
    <Image
      src={path}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={cls}
      style={{ width: size, height: size }}
    />
  );
}

export function ExpertiseStatic() {
  const [skill, setSkill] = useState<Skill | null>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const sectionId = useId();

  const openSkill = useCallback((s: Skill) => {
    prevFocus.current = document.activeElement as HTMLElement | null;
    setSkill(s);
  }, []);

  const closeSkill = useCallback(() => {
    setSkill(null);
    prevFocus.current?.focus?.();
  }, []);

  return (
    <section
      id={sectionId}
      data-section="expertise"
      className="mx-auto w-full max-w-7xl px-4 py-16"
      aria-label="Tech Stack and Expertise"
    >
      <div className="mb-10">
        <h2 className="font-bold text-4xl tracking-tight">Tech Stack &amp; Expertise</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A quick overview of the tools and technologies I use. Animations are disabled when reduced
          motion or low-data is enabled.
        </p>
      </div>

      <div className="space-y-12">
        {expertise.categories.map((cat) => (
          <div key={cat.name}>
            <h3 className="mb-4 font-semibold text-xl">{cat.name}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cat.skills.map((s) => (
                <div
                  key={s.name}
                  data-skill-card
                  className="rounded-xl border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <TechIcon
                        path={s.iconPath}
                        alt={`${s.name} icon`}
                        size={22}
                      />
                      <div>
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-sm text-muted-foreground">{s.level}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      onClick={() => openSkill(s as Skill)}
                      aria-label={`View details for ${s.name}`}
                    >
                      View details
                    </button>
                  </div>

                  {s.keyCompetencies && s.keyCompetencies.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {s.keyCompetencies.slice(0, 4).map((k) => (
                        <Badge
                          key={k}
                          variant="secondary"
                        >
                          {k}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {skill && (
        <ExpandedSkillModalStatic
          skill={skill}
          onClose={closeSkill}
        />
      )}
    </section>
  );
}
