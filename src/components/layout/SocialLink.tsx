"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the props for our reusable component
interface SocialLinkProps {
  href: string;
  name: string;
  icon: LucideIcon;
  colorClass: string;
}

function hoverClassesToFocusVisible(className: string) {
  // Enables keyboard parity for styles authored as hover:*.
  return className.replaceAll("hover:", "focus-visible:");
}

export function SocialLink({ href, name, icon: Icon, colorClass }: SocialLinkProps) {
  const focusColorClass = hoverClassesToFocusVisible(colorClass);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit my ${name}`}
      className={cn(
        "group flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border bg-card p-3 text-foreground",
        "transition-[width,colors] duration-300 ease-out",
        "hover:w-40 focus-visible:w-40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        colorClass,
        focusColorClass
      )}
    >
      <Icon className="h-6 w-6 shrink-0" />
      <span
        className={cn(
          "ml-0 max-w-0 overflow-hidden whitespace-nowrap font-semibold text-sm",
          "opacity-0 -translate-x-2 transition-all duration-200 ease-out",
          "group-hover:ml-3 group-hover:max-w-40 group-hover:opacity-100 group-hover:translate-x-0",
          "group-focus-within:ml-3 group-focus-within:max-w-40 group-focus-within:opacity-100 group-focus-within:translate-x-0"
        )}
      >
        {name}
      </span>
    </a>
  );
}
