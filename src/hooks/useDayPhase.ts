"use client";

/**
 * @file useDayPhase.ts
 * @description Provides a unified source of truth for the current time-of-day
 * phase and its associated greeting. This allows UI (Hero) and theming
 * backgrounds (e.g., HorizonScene) to stay visually and semantically in sync.
 */
import { useEffect, useState } from "react";

export type DayPhase = "late-night" | "morning" | "afternoon" | "evening";

export interface DayPhaseInfo {
  phase: DayPhase;
  greeting: string;
  hour: number;
}

// Derive the day phase from the current hour.
function deriveDayPhase(hour: number): DayPhase {
  if (hour < 6) return "late-night"; // 0-5
  if (hour < 12) return "morning"; // 6-11
  if (hour < 18) return "afternoon"; // 12-17
  return "evening"; // 18-23
}

// Map phases to greetings (mirrors prior Hero logic but centralized).
function greetingForPhase(phase: DayPhase): string {
  switch (phase) {
    case "late-night":
      return "Haven't you slept yet? It's late!";
    case "morning":
      return "Good morning, let's get started!";
    case "afternoon":
      return "Good afternoon, hope you're doing well!";
    case "evening":
      return "Good evening, winding down for the day?";
  }
}

/**
 * useDayPhase
 * Provides reactive time-of-day information. Hour is refreshed every minute
 * to keep the phase accurate without excessive re-renders.
 */
export function useDayPhase(): DayPhaseInfo {
  const [info, setInfo] = useState<DayPhaseInfo>(() => {
    const hour = new Date().getHours();
    const phase = deriveDayPhase(hour);
    return { phase, greeting: greetingForPhase(phase), hour };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      const phase = deriveDayPhase(hour);
      setInfo((prev) =>
        prev.hour === hour
          ? prev
          : {
              phase,
              greeting: greetingForPhase(phase),
              hour,
            }
      );
    }, 60_000); // update every minute
    return () => clearInterval(interval);
  }, []);

  return info;
}
