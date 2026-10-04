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
  /**
   * Whether the real local time has been read yet.
   *
   * `false` on the server and on the first client render, `true` from the mount effect onward.
   * See {@link useDayPhase} for why the clock cannot be read during render.
   */
  hydrated: boolean;
}

/**
 * Derive the day phase from a 24-hour hour.
 *
 * Exported for direct testing: the boundaries are the whole behaviour, and asserting them through
 * the hook would only be able to observe whatever hour the test machine happens to be in.
 */
export function deriveDayPhase(hour: number): DayPhase {
  if (hour < 6) return "late-night"; // 0-5
  if (hour < 12) return "morning"; // 6-11
  if (hour < 18) return "afternoon"; // 12-17
  return "evening"; // 18-23
}

/** Map a phase to its greeting. Exported for the same reason as {@link deriveDayPhase}. */
export function greetingForPhase(phase: DayPhase): string {
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
 * Deterministic state used before the clock has been read.
 *
 * Fixed rather than computed, because anything derived from the current time differs between a
 * server in one timezone and a visitor in another. `morning` is the neutral default; it is on
 * screen for at most one commit.
 */
const BEFORE_HYDRATION: DayPhaseInfo = {
  phase: "morning",
  greeting: greetingForPhase("morning"),
  hour: -1,
  hydrated: false,
};

/**
 * useDayPhase
 *
 * Provides reactive time-of-day information, refreshed every minute.
 *
 * ## Why the clock is not read during render
 *
 * This used to compute `new Date().getHours()` in a `useState` initialiser, which runs on the
 * server during SSR and again on the client during hydration. The two can legitimately
 * disagree: the server is in UTC (or whatever the host is configured for) and the visitor is
 * wherever they are. When they straddled a phase boundary the greeting rendered as different
 * *text*, so React could not reconcile the tree and raised error #418 on every page load of
 * every theme, discarding the server HTML and re-rendering the client.
 *
 * It stayed hidden for a long time because an earlier mismatch sat earlier in the tree and React
 * only ever reported the first one.
 *
 * So the clock is read in an effect instead: deterministic on both sides during hydration, then
 * corrected immediately on mount. Consumers that render the greeting as visible text should gate
 * on `hydrated` rather than assuming the value is real.
 */
export function useDayPhase(): DayPhaseInfo {
  const [info, setInfo] = useState<DayPhaseInfo>(BEFORE_HYDRATION);

  useEffect(() => {
    const read = () => {
      const hour = new Date().getHours();
      setInfo((prev) =>
        prev.hour === hour
          ? prev
          : {
              phase: deriveDayPhase(hour),
              greeting: greetingForPhase(deriveDayPhase(hour)),
              hour,
              hydrated: true,
            }
      );
    };

    // Correct on mount, not after the first interval tick: up to a minute of a stale greeting
    // is a visible bug for any visitor whose timezone differs from the server's.
    read();

    const interval = setInterval(read, 60_000);
    return () => clearInterval(interval);
  }, []);

  return info;
}
