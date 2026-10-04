/**
 * @file: src/__tests__/theme/SceneBoundary.test.tsx
 * @description: Tests that a failing scene is diagnosable from production.
 *
 * v0.2.7 added a boundary around the theme scene with the right instinct -- a decorative scene
 * should never take the page down -- but it left two gaps that this release closes:
 *
 * 1. The failure was reported with a single `console.error`, which nobody sees in production. A
 *    scene rendering nothing and a scene failing are indistinguishable from outside, which is
 *    precisely how three blank themes shipped unnoticed for six releases. The boundary now
 *    publishes `data-scene-state="error"` on `<html>`, so the question "is the background
 *    working?" is answerable from a production page.
 * 2. Nothing asserted the boundary worked at all.
 */

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SceneBoundary } from "@/components/theme/SceneBoundary";
import { SCENE_STATE_ATTRIBUTE } from "@/lib/sceneState";

function Boom(): never {
  throw new Error("WebGL context creation failed");
}

/**
 * Pull the structured reports out of a `console.error` spy.
 *
 * The boundary logs `[scope, report]` in production but `[scope, error, report]` otherwise -- it
 * attaches the Error object for a usable dev stack trace -- so the report is always the *last*
 * argument, and callers should not depend on which branch ran.
 */
function boundaryReports(spy: ReturnType<typeof vi.spyOn>): Record<string, unknown>[] {
  return spy.mock.calls
    .filter(
      (call: unknown[]) => typeof call[0] === "string" && String(call[0]).includes("theme-scene")
    )
    .map((call: unknown[]) => call[call.length - 1] as Record<string, unknown>);
}

afterEach(() => {
  document.documentElement.removeAttribute(SCENE_STATE_ATTRIBUTE);
  vi.restoreAllMocks();
});

describe("SceneBoundary", () => {
  it("renders its children when nothing throws", () => {
    const { getByText } = render(
      <SceneBoundary
        themeName="light"
        sceneKey="lightScene"
      >
        <span>scene content</span>
      </SceneBoundary>
    );
    expect(getByText("scene content")).toBeInTheDocument();
    expect(document.documentElement).not.toHaveAttribute(SCENE_STATE_ATTRIBUTE);
  });

  it("swallows a throwing child instead of taking the page down", () => {
    // The whole point: a decorative background must not be able to break the site.
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { container } = render(
      <SceneBoundary
        themeName="cyberpunk"
        sceneKey="cyberpunkScene"
      >
        <Boom />
      </SceneBoundary>
    );
    expect(container.innerHTML).toBe("");
    expect(errorLog).toHaveBeenCalled();
  });

  it("publishes data-scene-state=error so the failure is observable", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <SceneBoundary
        themeName="ethereal"
        sceneKey="etherealScene"
      >
        <Boom />
      </SceneBoundary>
    );
    expect(document.documentElement).toHaveAttribute(SCENE_STATE_ATTRIBUTE, "error");
  });

  it("includes the theme and scene in the report", () => {
    /*
     * Without the theme name a production log line cannot identify which of the seven scenes
     * failed, and the scene key distinguishes the component from the theme.
     */
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <SceneBoundary
        themeName="horizon"
        sceneKey="horizonScene"
      >
        <Boom />
      </SceneBoundary>
    );
    const [report] = boundaryReports(errorLog);
    expect(report.theme).toBe("horizon");
    expect(report.scene).toBe("horizonScene");
    expect(report.message).toContain("WebGL context creation failed");
  });

  it("records the calm reason that was active at the moment of failure", () => {
    /*
     * The diagnostic that would have shortened the original investigation: a scene that blanks
     * *only* for reduced-motion visitors is a calm-mode bug, and one that blanks for everyone
     * is not. The attribute is read straight off `<html>` because a class component cannot use
     * hooks, and the DOM state at the moment of failure is what matters.
     */
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    document.documentElement.setAttribute("data-reduce-motion", "true");
    document.documentElement.setAttribute("data-calm-reason", "reduce-motion");

    render(
      <SceneBoundary
        themeName="light"
        sceneKey="lightScene"
      >
        <Boom />
      </SceneBoundary>
    );

    const [report] = boundaryReports(errorLog);
    expect(report.calm).toBe(true);
    expect(report.calmReason).toBe("reduce-motion");

    document.documentElement.removeAttribute("data-reduce-motion");
    document.documentElement.removeAttribute("data-calm-reason");
  });

  it("can recover when the theme changes", () => {
    /*
     * The boundary is keyed on the theme in `ThemeBackground`, so a scene that failed for one
     * theme must not poison the next. Asserted by re-rendering with a fresh key.
     */
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { unmount } = render(
      <SceneBoundary
        key="dark"
        themeName="dark"
        sceneKey="darkScene"
      >
        <Boom />
      </SceneBoundary>
    );
    expect(document.documentElement).toHaveAttribute(SCENE_STATE_ATTRIBUTE, "error");
    unmount();

    const { getByText } = render(
      <SceneBoundary
        key="light"
        themeName="light"
        sceneKey="lightScene"
      >
        <span>recovered</span>
      </SceneBoundary>
    );
    expect(getByText("recovered")).toBeInTheDocument();
    // Exactly one *boundary* report: the light render must not have been blamed for dark's failure.
    expect(boundaryReports(errorLog)).toHaveLength(1);
  });
});
