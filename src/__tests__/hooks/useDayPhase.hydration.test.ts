/**
 * @file: src/__tests__/hooks/useDayPhase.hydration.test.ts
 * @description: Guards the hydration contract of `useDayPhase`.
 *
 * The bug this pins: `useDayPhase` computed `new Date().getHours()` inside a `useState`
 * initialiser. That runs on the server during SSR and again on the client during hydration, and
 * the two can legitimately disagree -- the host is in UTC (or whatever it is configured for) and
 * the visitor is wherever they are. Across a phase boundary the greeting rendered as different
 * *text*, so React could not reconcile the tree and raised a hydration error on every page load of
 * every theme, discarding the server HTML and re-rendering the whole client tree.
 *
 * jsdom cannot observe server/client divergence directly, so the boundary is asserted two ways:
 * the clock must not be read during render (a source contract), and the value must be correct once
 * effects have run (behaviour).
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deriveDayPhase, type DayPhase, greetingForPhase, useDayPhase } from "@/hooks/useDayPhase";

const source = readFileSync(path.resolve(process.cwd(), "src/hooks/useDayPhase.ts"), "utf8");

describe("deriveDayPhase", () => {
  it.each([
    [0, "late-night"],
    [5, "late-night"],
    [6, "morning"],
    [11, "morning"],
    [12, "afternoon"],
    [17, "afternoon"],
    [18, "evening"],
    [23, "evening"],
  ] as const)("maps hour %i to %s", (hour, expected) => {
    expect(deriveDayPhase(hour)).toBe(expected);
  });

  it("gives every phase a distinct, non-empty greeting", () => {
    const phases: DayPhase[] = ["late-night", "morning", "afternoon", "evening"];
    for (const phase of phases) {
      expect(greetingForPhase(phase).length).toBeGreaterThan(0);
    }
    // Distinct, so the hero text actually reflects the phase.
    expect(new Set(phases.map(greetingForPhase)).size).toBe(phases.length);
  });
});

describe("useDayPhase source contract", () => {
  it("does not read the clock during render", () => {
    /*
     * The core invariant. Any `useState` initialiser that consults `Date` -- directly or through
     * a helper -- reintroduces the divergence, because initialisers run during hydration.
     */
    const initialiserBlocks = [
      ...source.matchAll(
        /useState(?:<[^>]*>)?\(\s*(?:function|\(\s*\))?\s*(?:=>)?\s*\{([\s\S]*?)\n {2}\}\)/g
      ),
    ].map((m) => m[1]);

    for (const block of initialiserBlocks) {
      expect(block, `useState initialiser must not read the clock:\n${block}`).not.toMatch(
        /\bnew Date\b|\bDate\.now\b/
      );
    }
  });

  it("declares a deterministic pre-hydration state", () => {
    // Something to render with on both sides before the effect runs. If this were computed
    // instead, the whole guarantee would be gone.
    expect(source).toMatch(/const BEFORE_HYDRATION: DayPhaseInfo/);
    expect(source).toMatch(/hydrated: false/);
  });

  it("reads the clock in an effect and corrects on mount", () => {
    // Not merely "eventually": waiting for the first interval tick would leave a stale greeting
    // for up to a minute, which for a visitor in a different timezone is a visible bug.
    expect(source).toMatch(/useEffect\(\(\) => \{[\s\S]*?read\(\);[\s\S]*?setInterval/);
  });
});

describe("useDayPhase behaviour", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    [2, "late-night"],
    [9, "morning"],
    [13, "afternoon"],
    [20, "evening"],
  ] as const)("reports %s for hour %i", (hour, expected) => {
    vi.setSystemTime(new Date(2024, 0, 1, hour, 0, 0));
    const { result } = renderHook(() => useDayPhase());
    expect(result.current.phase).toBe(expected);
  });

  it("marks itself hydrated once the clock has been read", () => {
    vi.setSystemTime(new Date(2024, 0, 1, 9, 0, 0));
    const { result } = renderHook(() => useDayPhase());
    // `renderHook` flushes effects, so by the time the hook is observed the mount effect has run.
    expect(result.current.hydrated).toBe(true);
    expect(result.current.hour).toBe(9);
  });

  it("agrees with the greeting for its phase", () => {
    vi.setSystemTime(new Date(2024, 0, 1, 13, 0, 0));
    const { result } = renderHook(() => useDayPhase());
    expect(result.current.greeting).toBe(greetingForPhase(result.current.phase));
  });
});
