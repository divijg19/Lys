/**
 * @file: src/components/theme/SceneBoundary.tsx
 * @description: Error boundary around the active background scene.
 *
 * Every theme background is decorative, so losing one is always preferable to losing the
 * page. But "the scene vanished" was previously indistinguishable from "the scene chose to
 * render nothing", which is exactly how the v0.2.6 blank-scene regression went unnoticed:
 * three themes returning null looked identical to three themes crashing.
 *
 * This boundary draws that line. A scene that throws is caught, logged with the theme name
 * and the calm reason currently on `<html>`, and replaced by nothing -- the fallback
 * gradient painted by `ThemeBackground` shows through. A scene that renders nothing is still
 * indistinguishable from a healthy scene, so the calm reason is exposed as an attribute
 * precisely so that case can be diagnosed from the outside.
 */

"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface SceneBoundaryProps {
  /** Theme name, included in the report so a log line identifies the failing scene. */
  themeName: string;
  /** Human-readable scene key from the theme registry. */
  sceneKey: string;
  children: ReactNode;
}

interface SceneBoundaryState {
  failed: boolean;
}

export class SceneBoundary extends Component<SceneBoundaryProps, SceneBoundaryState> {
  state: SceneBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Read the attributes directly rather than importing the hook: a class component cannot
    // use hooks, and this must reflect the DOM state at the moment of the failure.
    const root = typeof document === "undefined" ? null : document.documentElement;
    const calmReason = root?.getAttribute("data-calm-reason");
    const calm = root?.hasAttribute("data-low-data") || root?.hasAttribute("data-reduce-motion");

    const report = {
      scope: "theme-scene",
      theme: this.props.themeName,
      scene: this.props.sceneKey,
      calm,
      calmReason,
      message: error.message,
      componentStack: info.componentStack ?? null,
    };

    if (process.env.NODE_ENV === "production") {
      /*
       * `console.error` is the only reporting channel this project has -- there is no error
       * reporting service wired up -- so this is deliberately a single structured line
       * rather than a swallowed exception.
       */
      console.error("[theme-scene] scene failed to render", report);
    } else {
      console.error("[theme-scene] scene failed to render", error, report);
    }
  }

  render(): ReactNode {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export default SceneBoundary;
