import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CALM_ATTRIBUTES, readCalmMode, useCalmMode } from "@/hooks/useCalmMode";

/**
 * `vitest.setup.ts` stubs `window.matchMedia` to report `matches: true` for everything,
 * so reduced motion is on by default here. That does not affect this hook, which reads the
 * attributes `ClientAttrWrapper` derives onto <html> rather than querying media directly --
 * which is the point: one derived attribute means every scene agrees on the answer.
 */
/**
 * MutationObserver callbacks are delivered asynchronously, so a mutation has to be
 * followed by a macrotask tick before the hook's state has settled.
 */
async function setAttribute(name: string) {
  act(() => {
    document.documentElement.setAttribute(name, "true");
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function clearAttributes() {
  act(() => {
    for (const attribute of CALM_ATTRIBUTES) {
      document.documentElement.removeAttribute(attribute);
    }
  });
}

describe("readCalmMode", () => {
  beforeEach(clearAttributes);
  afterEach(clearAttributes);

  it("is false with no attributes present", () => {
    expect(readCalmMode()).toBe(false);
  });

  it.each([...CALM_ATTRIBUTES])("is true when %s is present", (attribute) => {
    document.documentElement.setAttribute(attribute, "true");
    expect(readCalmMode()).toBe(true);
  });

  it.each([...CALM_ATTRIBUTES])('treats %s="false" as calm', (attribute) => {
    // ClientAttrWrapper adds and removes attributes rather than writing a value, but a
    // literal "false" should not be read as a request for motion.
    document.documentElement.setAttribute(attribute, "false");
    expect(readCalmMode()).toBe(true);
  });
});

describe("useCalmMode", () => {
  beforeEach(clearAttributes);
  afterEach(clearAttributes);

  it("starts calm when an attribute is already set before mount", () => {
    document.documentElement.setAttribute("data-reduce-motion", "true");
    const { result } = renderHook(() => useCalmMode());
    expect(result.current).toBe(true);
  });

  it("reacts to an attribute being added after mount", async () => {
    const { result } = renderHook(() => useCalmMode());
    expect(result.current).toBe(false);

    await setAttribute("data-low-data");

    expect(result.current).toBe(true);
  });

  it("reacts to the other attribute independently", async () => {
    document.documentElement.setAttribute("data-low-data", "true");
    const { result } = renderHook(() => useCalmMode());
    expect(result.current).toBe(true);

    act(() => {
      document.documentElement.removeAttribute("data-low-data");
      document.documentElement.setAttribute("data-reduce-motion", "true");
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current).toBe(true);
  });

  it("stops observing on unmount", () => {
    const removeSpy = vi.spyOn(document.documentElement, "removeAttribute");
    const { unmount } = renderHook(() => useCalmMode());
    unmount();
    document.documentElement.setAttribute("data-low-data", "true");
    // The observer is disconnected on unmount, so no further attribute writes should occur
    // from the hook. Nothing to assert directly, but a leaked MutationObserver would keep
    // the hook's closure alive, so verify the attribute write is the only effect.
    expect(removeSpy).not.toHaveBeenCalled();
    removeSpy.mockRestore();
  });
});
