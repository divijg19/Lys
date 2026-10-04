// Vitest + Testing Library DOM matchers auto-registration
// For Vitest, importing this side-effect module wires up extended matchers (toBeInTheDocument, etc.)
import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

// Mock IntersectionObserver for Framer Motion
class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(globalThis, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

/**
 * Query-aware, reactive `matchMedia` stub.
 *
 * The previous stub answered `matches: true` to every query and registered no-op listeners.
 * That had two consequences worth recording:
 *
 * 1. It reported reduced motion as active in tests that were not about reduced motion, so
 *    every calm branch was live everywhere and the animated path was never exercised. The
 *    entire motion-gated scene code had zero coverage, which is how `LightScene`,
 *    `DarkScene` and `CyberpunkScene` could ship with `if (isCalm) return null` unnoticed.
 * 2. Because listeners were no-ops, a hook that subscribed to `change` still worked in the
 *    browser but could never be driven in a test.
 *
 * Queries that explicitly ask for reduced motion (`prefers-reduced-motion: reduce`) match;
 * everything else, including `no-preference`, does not. That makes the default test
 * environment an ordinary, animated one -- closer to the majority of real visitors -- and
 * tests opt into calm deliberately.
 */
if (typeof window !== "undefined") {
  const REDUCED_MOTION_QUERIES = [
    "prefers-reduced-motion",
    "prefers-reduced-transparency",
    "prefers-contrast",
  ] as const;

  const mediaQueryLists = new Map<string, Set<(event: MediaQueryListEvent) => void>>();

  /*
   * Mutable so a test can flip the preference in both directions. A stub that can only ever
   * report `true` cannot prove that a hook cleans up after itself when motion is re-enabled.
   */
  let reduceMotion = false;

  const emitsReducedMotion = (query: string): boolean =>
    reduceMotion && REDUCED_MOTION_QUERIES.some((feature) => query.includes(feature));

  const notify = (query: string): void => {
    const listeners = mediaQueryLists.get(query);
    if (!listeners) return;
    const event = { matches: emitsReducedMotion(query), media: query } as MediaQueryListEvent;
    for (const listener of listeners) listener(event);
  };

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => {
      const matches = emitsReducedMotion(query);

      return {
        matches,
        media: query,
        onchange: null,
        // Legacy MediaQueryList methods: kept for Safari-era callers.
        addListener: (listener: (event: MediaQueryListEvent) => void) => {
          const set = mediaQueryLists.get(query) ?? new Set();
          set.add(listener);
          mediaQueryLists.set(query, set);
        },
        removeListener: (listener: (event: MediaQueryListEvent) => void) => {
          mediaQueryLists.get(query)?.delete(listener);
        },
        addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
          const set = mediaQueryLists.get(query) ?? new Set();
          set.add(listener);
          mediaQueryLists.set(query, set);
        },
        removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
          mediaQueryLists.get(query)?.delete(listener);
        },
        dispatchEvent: () => false,
      };
    },
  });

  /**
   * Drive a media query change from a test.
   *
   * Flips the stub to "this query now matches" and notifies its subscribers, which is what a
   * browser does when the user flips the OS motion setting mid-session. Use it to prove that
   * a hook resubscribes rather than reading once.
   *
   * @example setReducedMotion(true); expect(document.documentElement).toHaveAttribute("data-reduce-motion")
   */
  Object.assign(globalThis, {
    __setReducedMotion: (value: boolean) => {
      reduceMotion = value;
      for (const feature of REDUCED_MOTION_QUERIES) notify(`(${feature}: reduce)`);
    },
  });
}

// Lightweight framer-motion mock to eliminate animation delays during tests
// Only patch if not already provided (avoid interfering with other test utilities)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fm = require("framer-motion");
  if (fm && !fm.__patchedForTests) {
    type GenericProps = Record<string, unknown>;
    // Minimal motion-like record; value is any React component accepting arbitrary props
    type MotionComponent = React.ComponentType<Record<string, unknown>>;
    type MotionLike = Record<string | symbol, MotionComponent>;
    const NoMotion =
      <P extends GenericProps>(Component: React.ComponentType<P>) =>
      (props: P) =>
        React.createElement(Component, { ...props });
    const instantTransition = { transition: { duration: 0 } } as const;
    const motionProxy: MotionLike = new Proxy((fm.motion || {}) as MotionLike, {
      // Return a passthrough component for any motion.* tag
      get(target, key: string | symbol) {
        const Tag: MotionComponent | string = (target as MotionLike)[key] || (key as string);
        return (props: GenericProps) => React.createElement(Tag as MotionComponent, { ...props });
      },
    });
    Object.assign(fm, {
      motion: motionProxy,
      AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
        React.createElement(React.Fragment, null, children),
      __patchedForTests: true,
    });
    // Provide a helper to strip animation props (optional usage)
    (global as unknown as Record<string, unknown>).__NO_MOTION__ = NoMotion;
    (global as unknown as Record<string, unknown>).__INSTANT_TRANSITION__ = instantTransition;
  }
} catch {
  // ignore if framer-motion not resolvable in a subset of tests
}

// Mock next/image to a plain img to bypass Next.js loader logic during tests (ESM-safe)
vi.mock("next/image", () => {
  return {
    __esModule: true,
    default: (
      props: React.ImgHTMLAttributes<HTMLImageElement> & {
        fill?: boolean;
        priority?: boolean;
        quality?: number;
        placeholder?: string;
        blurDataURL?: string;
        loader?: unknown;
        unoptimized?: boolean;
        fetchPriority?: string;
      }
    ) => {
      const {
        fill: _fill,
        priority: _priority,
        quality: _quality,
        placeholder: _placeholder,
        blurDataURL: _blurDataURL,
        loader: _loader,
        unoptimized: _unoptimized,
        fetchPriority: _fetchPriority,
        ...imgProps
      } = props;
      return React.createElement("img", { ...imgProps });
    },
  };
});
