import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDayPhase } from "@/hooks/useDayPhase";

function mockHour(hour: number) {
  vi.setSystemTime(new Date(2024, 0, 1, hour, 0, 0));
}

describe("useDayPhase", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns late-night phase", () => {
    mockHour(2);
    const { result } = renderHook(() => useDayPhase());
    expect(result.current.phase).toBe("late-night");
  });
  it("returns morning phase", () => {
    mockHour(9);
    const { result } = renderHook(() => useDayPhase());
    expect(result.current.phase).toBe("morning");
  });
  it("returns afternoon phase", () => {
    mockHour(13);
    const { result } = renderHook(() => useDayPhase());
    expect(result.current.phase).toBe("afternoon");
  });
  it("returns evening phase", () => {
    mockHour(20);
    const { result } = renderHook(() => useDayPhase());
    expect(result.current.phase).toBe("evening");
  });
});
