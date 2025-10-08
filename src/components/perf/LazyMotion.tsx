/**
 * LazyMotion wrapper: dynamically loads framer-motion only when motion components are actually rendered.
 * This reduces initial JS cost for users who bounce early or never trigger animations.
 */
"use client";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";

// We keep types broad; framer-motion's LazyMotion features prop accepts an internal feature bundle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Using 'any' here is acceptable because framer-motion's internal feature bundle types are not exported.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Minimal structural type for LazyMotion to avoid 'any'.
type LazyMotionLike = React.ComponentType<{ children: React.ReactNode; features: unknown }>;
type LazyState = { LazyMotion: LazyMotionLike; domAnimation: unknown } | null;
const MotionReadyCtx = createContext(false);
export const useMotionReady = () => useContext(MotionReadyCtx);

export function LazyMotionProvider({ children }: PropsWithChildren) {
  const [fm, setFm] = useState<LazyState>(null);
  useEffect(() => {
    let mounted = true;
    import("framer-motion").then((m) => {
      if (mounted)
        setFm({
          LazyMotion: m.LazyMotion as unknown as LazyMotionLike,
          domAnimation: m.domAnimation,
        });
    });
    return () => {
      mounted = false;
    };
  }, []);
  if (!fm) {
    return (
      <MotionReadyCtx.Provider value={false}>
        <div className="motion-fallback-visible">{children}</div>
      </MotionReadyCtx.Provider>
    );
  }
  const { LazyMotion, domAnimation } = fm;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return (
    <MotionReadyCtx.Provider value={true}>
      <LazyMotion features={domAnimation}>{children}</LazyMotion>
    </MotionReadyCtx.Provider>
  );
}
