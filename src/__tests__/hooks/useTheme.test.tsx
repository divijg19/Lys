import { act, render, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTheme } from "@/hooks/useTheme";
import { themes } from "@/lib/themes";

/**
 * `useTheme` sat at 58% lines / **17% branches**: the fallback paths (no stored theme, unknown
 * stored name), the wrap-around in `cycleTheme` and the pre-mount state were all unexercised.
 * These are the branches that decide what a visitor sees before hydration and where cycling lands
 * after the last theme -- both user-visible, both previously only reachable in a browser.
 */

const nextThemes = vi.hoisted(() => ({
  /** What next-themes reports as the stored theme; mutated per test. */
  current: "dark" as string | null,
  setTheme: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: nextThemes.current, setTheme: nextThemes.setTheme }),
}));

beforeEach(() => {
  nextThemes.setTheme.mockClear();
  nextThemes.current = "dark";
});

describe("useTheme", () => {
  it("resolves the stored theme name to its full theme object", () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme.name).toBe("dark");
    // The consumer contract: displayName/icon come from the object, not from a separate lookup.
    expect(result.current.theme.displayName).toBe(
      themes.find((t) => t.name === "dark")?.displayName
    );
  });

  it("falls back to the first theme when nothing is stored yet", () => {
    nextThemes.current = null;
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe(themes[0]);
  });

  it("falls back to the first theme when the stored name is unknown", () => {
    // A theme renamed in a later release leaves the old name in the visitor's localStorage.
    nextThemes.current = "no-longer-exists";
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe(themes[0]);
  });

  it("reports unmounted before the effect, then mounted", () => {
    // renderHook's result only exposes the latest value, so record every render instead: the
    // first must be the server-matching `false` (theme not yet trustworthy), the last `true`.
    const observed: boolean[] = [];
    function Probe() {
      observed.push(useTheme().isMounted);
      return null;
    }
    render(<Probe />);

    expect(observed[0]).toBe(false);
    expect(observed[observed.length - 1]).toBe(true);
  });

  it("returns a stable theme object reference across re-renders", () => {
    // Consumers memoise on `theme`; a new object per render would defeat that.
    const { result, rerender } = renderHook(() => useTheme());
    const first = result.current.theme;
    rerender();
    expect(result.current.theme).toBe(first);
  });

  it("cycles to the next theme in order", () => {
    nextThemes.current = "light";
    const { result, rerender } = renderHook(() => useTheme());
    rerender();

    act(() => result.current.cycleTheme());

    expect(nextThemes.setTheme).toHaveBeenCalledWith(themes[1].name);
  });

  it("wraps around from the last theme back to the first", () => {
    const last = themes[themes.length - 1];
    nextThemes.current = last.name;
    const { result, rerender } = renderHook(() => useTheme());
    rerender();

    act(() => result.current.cycleTheme());

    // Without the modulo this would call setTheme(undefined) and the visitor would be stuck on
    // the last theme forever.
    expect(nextThemes.setTheme).toHaveBeenCalledWith(themes[0].name);
  });

  it("setTheme passes the theme's name through to next-themes", () => {
    const { result } = renderHook(() => useTheme());
    const target = themes.find((t) => t.name === "horizon");
    if (!target) throw new Error("expected a horizon theme");

    act(() => result.current.setTheme(target));

    expect(nextThemes.setTheme).toHaveBeenCalledWith("horizon");
  });
});
