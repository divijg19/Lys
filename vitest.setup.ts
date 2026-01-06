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

// Mock window.matchMedia for usePrefersReducedMotion
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: true, // force reduced motion true for deterministic animations
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
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
