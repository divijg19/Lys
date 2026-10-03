"use client";

/**
 * @file: src/components/theme/effects/ethereal/RippleCue.tsx
 * @description: Discoverability for the ripple field: a pointer-following ring and a
 * one-time hint.
 *
 * The field responds to interaction now, but nothing on screen says so. A visitor has no
 * way to know the background is interactive, and a scene that only rewards someone who
 * guesses is indistinguishable from one that is simply broken.
 *
 * Both elements are decorative and `aria-hidden`: the field is a background effect with
 * no keyboard equivalent, and announcing a cursor ring to a screen reader would be noise.
 */

import { useEffect, useRef, useState } from "react";
import { useCalmMode } from "@/hooks/useCalmMode";

/** How long the hint stays up before fading itself out, in milliseconds. */
const HINT_DURATION_MS = 7000;

/** Pointer types that produce a hover ring. Touch has no hover phase to visualise. */
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

export function RippleCue() {
  const isCalm = useCalmMode();
  const ringRef = useRef<HTMLDivElement>(null);
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);

  // Only show the ring for devices that actually have a hovering cursor.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia(FINE_POINTER_QUERY);
    setHasFinePointer(query.matches);
    const onChange = (event: MediaQueryListEvent) => setHasFinePointer(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Retire the hint on a timer. A first interaction dismisses it sooner via the
  // `animate-ripple-hint` animation being one-shot and the element being unmounted
  // below; the timer guarantees it never lingers for someone who never interacts.
  useEffect(() => {
    if (isCalm) return;
    const timer = setTimeout(() => setHintVisible(false), HINT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [isCalm]);

  /*
   * Track the pointer by writing CSS custom properties straight to the element.
   *
   * Going through React state would re-render on every pointermove -- up to 120 times a
   * second -- for an effect that only needs to move a ring. The properties are consumed
   * by the transform below, so the browser handles the rest off the main thread.
   */
  useEffect(() => {
    if (isCalm || !hasFinePointer) return;
    const element = ringRef.current;
    if (!element) return;

    const onMove = (event: PointerEvent) => {
      element.style.setProperty("--cue-x", `${event.clientX}px`);
      element.style.setProperty("--cue-y", `${event.clientY}px`);
      if (element.dataset.active !== "true") element.dataset.active = "true";
    };
    const onLeave = () => {
      if (element.dataset.active === "true") element.dataset.active = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [isCalm, hasFinePointer]);

  if (isCalm) return null;

  return (
    <>
      {hasFinePointer && (
        <div
          ref={ringRef}
          aria-hidden
          data-active="false"
          className="pointer-events-none absolute size-9 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-300 data-[active=true]:opacity-100"
          style={{
            left: "var(--cue-x, -100px)",
            top: "var(--cue-y, -100px)",
            border: "1px solid hsl(var(--primary) / 0.5)",
            boxShadow: "0 0 12px -2px hsl(var(--primary) / 0.55)",
            mixBlendMode: "multiply",
          }}
        />
      )}

      {hintVisible && (
        <p
          aria-hidden
          className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 animate-ripple-hint text-[hsl(var(--foreground)/0.45)] text-xs uppercase tracking-[0.25em] whitespace-nowrap"
        >
          Tap or click to ripple
        </p>
      )}
    </>
  );
}
