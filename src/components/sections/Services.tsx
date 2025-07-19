"use client";

import { useTheme } from "@/hooks/useTheme";
import { services } from "@/content/services";
import { themeIconMap } from "@/lib/icons";
import type { Service } from "@/lib/types";

export default function Services() {
  const { themeClasses } = useTheme();

  return (
    <section className={`w-full flex flex-col items-center justify-center min-h-[40vh] text-center gap-8 py-12 rounded-xl shadow-lg animate-fade-in-down ${themeClasses.card}`}>
      <h2 className="text-3xl font-bold mb-8 drop-shadow-lg text-primary">Services</h2>
      <div className="grid gap-8 w-full md:grid-cols-2 lg:grid-cols-3">
        {services.map((service: Service) => {
          const Icon = themeIconMap[service.icon as keyof typeof themeIconMap];
          return (
            <div
              key={service.id}
              className={`flex flex-col items-center gap-2 p-6 shadow-lg border hover:shadow-xl transition-all ${themeClasses.card}`}
            >
              <span className="text-accent mb-2">{Icon && <Icon size={24} />}</span>
              <span className="font-semibold text-lg text-primary">{service.title}</span>
              <span className="text-gray-600 dark:text-gray-300">{service.description}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
