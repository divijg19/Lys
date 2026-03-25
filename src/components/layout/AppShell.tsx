"use client";

import ThemeBackground from "@/components/theme/BackgroundEffects";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeBackground />
      <main className="min-h-screen w-full flex flex-col items-center justify-start">
        {children}
      </main>
    </>
  );
}
