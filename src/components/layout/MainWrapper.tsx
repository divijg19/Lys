"use client";

import { useRef } from "react";

interface MainWrapperProps {
  targetId: string;
  children: React.ReactNode;
  className?: string;
}

export function MainWrapper({ targetId, children, className }: MainWrapperProps) {
  const mainRef = useRef<HTMLElement | null>(null);

  return (
    <main
      ref={mainRef}
      tabIndex={-1}
      className={className}
      aria-label="Main content"
      id={targetId}
    >
      {children}
    </main>
  );
}
