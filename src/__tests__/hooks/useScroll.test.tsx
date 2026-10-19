import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScroll } from "@/hooks/useScroll";

/**
 * `useScroll` drives the navbar's scrolled state and was at **0% branch coverage**: every
 * conditional -- the jitter threshold, the direction split, the mount-time initialisation -- was
 * untested. The threshold and the mount initialisation are each the kind of logic that fails
 * silently (a navbar flickering on micro-scrolls, or a reloaded mid-page session reporting a
 * wrong initial direction), so each branch gets its own test.
 */

const setScrollY = (y: number) => {
  Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: y });
};

const dispatchScroll = () => {
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
};

beforeEach(() => {
  setScrollY(0);
});

afterEach(() => {
  vi.restoreAllMocks();
  setScrollY(0);
});

describe("useScroll", () => {
  it("ignores jitter below the 10px threshold", () => {
    const { result } = renderHook(() => useScroll());

    setScrollY(9);
    dispatchScroll();

    // Below SCROLL_THRESHOLD nothing may change: without the guard, trackpad noise would flip
    // the navbar state on every micro-scroll.
    expect(result.current.scrolledDown).toBe(false);
    expect(result.current.scrolledUp).toBe(false);
  });

  it("updates exactly at the 10px threshold", () => {
    const { result } = renderHook(() => useScroll());

    setScrollY(10);
    dispatchScroll();

    expect(result.current.scrolledDown).toBe(true);
    expect(result.current.scrolledUp).toBe(false);
  });

  it("flips direction when the user scrolls back up past the threshold", () => {
    const { result } = renderHook(() => useScroll());

    setScrollY(100);
    dispatchScroll();
    expect(result.current.scrolledDown).toBe(true);
    expect(result.current.scrolledUp).toBe(false);

    // lastYPos is now 100; a 100px upward move is well past the threshold.
    setScrollY(0);
    dispatchScroll();
    expect(result.current.scrolledDown).toBe(false);
    expect(result.current.scrolledUp).toBe(true);
  });

  it("initialises from the current scroll position, for pages reloaded mid-scroll", () => {
    // The page was at 500px when it reloaded. The effect seeds lastYPos from window.scrollY, so a
    // subsequent 5px move is jitter relative to 500 -- not a 495px jump from 0. If the seed were
    // missing, lastYPos would be 0 and this would report a massive downward scroll.
    setScrollY(500);
    const { result } = renderHook(() => useScroll());

    setScrollY(495);
    dispatchScroll();

    expect(result.current.scrolledDown).toBe(false);
    expect(result.current.scrolledUp).toBe(false);
  });

  it("registers a passive scroll listener and removes it on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useScroll());

    const scrollCall = addSpy.mock.calls.find(([type]) => type === "scroll");
    expect(scrollCall).toBeDefined();
    // { passive: true } -- the hook must never scroll-block the main thread.
    expect(scrollCall?.[2]).toEqual({ passive: true });
    const handler = scrollCall?.[1];

    unmount();
    expect(removeSpy).toHaveBeenCalledWith("scroll", handler);
  });
});
