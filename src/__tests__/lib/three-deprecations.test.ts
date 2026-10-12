import { describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { suppressThreeClockDeprecation } from "@/lib/three-deprecations";

/**
 * The Three.js `Clock` deprecation is silenced by intercepting Three's own log calls.
 *
 * This used to wrap `console.warn` globally and match messages by text. That had three problems:
 * every warning in the app passed through the wrapper, unrelated warnings were at risk of being
 * swallowed, and because the wrapper sat in the call stack, Next's dev overlay attributed surviving
 * warnings to this file rather than to the code that logged them -- which is how the
 * `scroll-behavior` warning in the v0.2.3 report got blamed here.
 *
 * `THREE.setConsoleFunction` intercepts only Three's own log calls, so nothing else in the app is
 * touched and no global console state is mutated.
 */

describe("suppressThreeClockDeprecation", () => {
  it("installs a Three console function rather than wrapping console.warn", () => {
    // The whole point of the change. A global console.warn wrapper is what mis-attributed warnings
    // to this file and risked swallowing unrelated ones.
    const before = console.warn;
    suppressThreeClockDeprecation();

    expect(console.warn).toBe(before);
    expect(THREE.getConsoleFunction()).toBeTypeOf("function");
  });

  it("suppresses the Clock deprecation when Three constructs a Clock", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      suppressThreeClockDeprecation();

      // Constructing a Clock is what r3f does internally, and what used to emit the warning.
      new THREE.Clock();

      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it("still forwards warnings that are not the Clock deprecation", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      suppressThreeClockDeprecation();

      const handler = THREE.getConsoleFunction();
      expect(handler).toBeTypeOf("function");
      handler?.("warn", "THREE.SomethingElse: an unrelated warning");

      expect(warn).toHaveBeenCalledWith("THREE.SomethingElse: an unrelated warning");
    } finally {
      warn.mockRestore();
    }
  });

  it("forwards log and error levels, not just warnings", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      suppressThreeClockDeprecation();

      const handler = THREE.getConsoleFunction();
      handler?.("log", "THREE.Renderer: info");
      handler?.("error", "THREE.Renderer: failure");

      expect(log).toHaveBeenCalledWith("THREE.Renderer: info");
      expect(error).toHaveBeenCalledWith("THREE.Renderer: failure");
    } finally {
      log.mockRestore();
      error.mockRestore();
    }
  });

  it("is safe to call more than once", () => {
    // The previous version guarded against double-wrapping console.warn. setConsoleFunction
    // replaces rather than accumulates, so a second call must still leave a working handler.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      suppressThreeClockDeprecation();
      suppressThreeClockDeprecation();

      new THREE.Clock();
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});
