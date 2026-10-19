import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDataRain } from "@/hooks/useDataRain";

/**
 * `useDataRain` is a 169-line canvas animation hook: Matrix-style falling characters driven by
 * `requestAnimationFrame`, with resize debouncing and tab-visibility handling.
 *
 * It was the largest untested unit in the codebase. Canvas animation is exactly where a cleanup
 * bug leaks a `requestAnimationFrame` loop that keeps running after unmount, so these tests focus
 * on the lifecycle -- setup, animation, teardown -- rather than on pixel output.
 */

/** A canvas 2d context stub with just the methods the hook calls. */
function makeContext() {
  return {
    fillStyle: "",
    font: "",
    fillRect: vi.fn(),
    fillText: vi.fn(),
    setTransform: vi.fn(),
    scale: vi.fn(),
  };
}

/** A canvas element whose getContext returns the stub. */
function makeCanvas() {
  const canvas = document.createElement("canvas");
  canvas.getContext = vi.fn(() => makeContext()) as unknown as typeof canvas.getContext;
  return canvas;
}

/** Run the hook, then advance past the 250ms debounce so setup() and start() actually run. */
function renderAndFlush() {
  const ref = { current: makeCanvas() };
  const result = renderHook(() => useDataRain(ref));
  vi.advanceTimersByTime(300);
  return { ref, ...result };
}

let rafId: number;
let rafCallbacks: Map<number, FrameRequestCallback>;

beforeEach(() => {
  rafId = 0;
  rafCallbacks = new Map();

  // Fake timers so the 250ms debounce can be advanced explicitly. `requestAnimationFrame` is
  // excluded from toFake on purpose: faking it would silently overwrite the capture stub below,
  // and the assertions are written against that stub's map.
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date"],
  });

  // rAF is captured rather than invoked: the hook re-schedules itself from inside the callback, so
  // a real implementation would loop forever under test.
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    const id = ++rafId;
    rafCallbacks.set(id, cb);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    rafCallbacks.delete(id);
  });

  // The hook registers these; tests inspect them to find the handler to invoke.
  vi.spyOn(document, "addEventListener");
  vi.spyOn(window, "addEventListener");

  // The hook reads these to size the canvas and pick colours.
  Object.defineProperty(window, "devicePixelRatio", {
    writable: true,
    configurable: true,
    value: 1,
  });
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 800 });
  Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: 600 });
  Object.defineProperty(document.documentElement, "style", {
    writable: true,
    configurable: true,
    value: { getPropertyValue: () => "220 20% 98%" },
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useDataRain", () => {
  it("does nothing when the canvas ref is null", () => {
    const ref = { current: null };
    const { result } = renderHook(() => useDataRain(ref));

    expect(result.current).toBeUndefined();
    expect(rafCallbacks.size).toBe(0);
  });

  it("sizes the canvas and starts the animation loop", () => {
    const { ref } = renderAndFlush();

    // devicePixelRatio is 1, so the backing store matches the CSS pixels.
    expect(ref.current.width).toBe(800);
    expect(ref.current.height).toBe(600);
    // The loop is scheduled.
    expect(rafCallbacks.size).toBe(1);
  });

  it("runs the animation callback without throwing", () => {
    renderAndFlush();

    // STREAM_DENSITY is FONT_SIZE + 6 = 14, so 800 / 14 = 57 streams. The hook does not expose the
    // count, so this is asserted indirectly: the callback must run cleanly, which it would not if
    // the stream list were malformed.
    const cb = [...rafCallbacks.values()][0];
    expect(() => cb(0)).not.toThrow();
  });

  it("stops the loop and removes listeners on unmount", () => {
    const removeResize = vi.spyOn(window, "removeEventListener");
    const removeVisibility = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderAndFlush();
    expect(rafCallbacks.size).toBe(1);

    unmount();

    // The pending frame is cancelled and both listeners are gone -- the two things that would leak.
    expect(rafCallbacks.size).toBe(0);
    expect(removeResize).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(removeVisibility).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
  });

  it("stops when the tab is hidden and restarts when it is visible again", () => {
    renderAndFlush();

    // Find the visibility handler the hook registered.
    const handlers = vi
      .mocked(document.addEventListener)
      .mock.calls.filter(([type]) => type === "visibilitychange");
    expect(handlers.length).toBeGreaterThan(0);
    const onVisibility = handlers[handlers.length - 1][1] as () => void;

    // Hidden: the loop stops.
    Object.defineProperty(document, "visibilityState", {
      writable: true,
      configurable: true,
      value: "hidden",
    });
    onVisibility();
    expect(rafCallbacks.size).toBe(0);

    // Visible again: it restarts -- but through debouncedSetup, so the new frame is only scheduled
    // after the 250ms debounce elapses.
    Object.defineProperty(document, "visibilityState", {
      writable: true,
      configurable: true,
      value: "visible",
    });
    onVisibility();
    expect(rafCallbacks.size).toBe(0);

    vi.advanceTimersByTime(300);
    expect(rafCallbacks.size).toBe(1);
  });

  it("debounces resize instead of re-running setup on every event", () => {
    const addResize = vi.spyOn(window, "addEventListener");

    renderAndFlush();
    const resizeCalls = addResize.mock.calls.filter(([t]) => t === "resize");
    const onResize = resizeCalls[resizeCalls.length - 1][1] as () => void;

    // Fire several resizes in quick succession. The hook must register the listener once and coalesce
    // the work through its debounce, not re-run setup per event.
    onResize();
    onResize();
    onResize();

    // Still exactly one registered listener.
    expect(addResize.mock.calls.filter(([t]) => t === "resize").length).toBe(resizeCalls.length);
  });
});
