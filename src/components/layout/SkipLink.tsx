"use client";

import { useId } from "react";

interface SkipLinkProps {
  targetId: string;
}

export function SkipLink({ targetId }: SkipLinkProps) {
  const skipId = useId();

  return (
    <a
      href={`#${targetId}`}
      onClick={() => {
        // Focus after navigation jump
        setTimeout(() => {
          const target = document.getElementById(targetId);
          target?.focus();
        }, 0);
      }}
      className="absolute z-50 left-0 top-0 block -translate-x-full focus:translate-x-0 rounded-md bg-primary p-3 text-sm font-medium text-primary-foreground transition-transform"
      aria-describedby={skipId}
    >
      <span id={skipId}>Skip to Main Content</span>
    </a>
  );
}
