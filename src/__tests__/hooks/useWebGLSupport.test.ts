/**
 * @file: src/__tests__/hooks/useWebGLSupport.test.ts
 * @description: Tests for the shared WebGL capability probe.
 *
 * The probe exists because of a measured failure: with `getContext("webgl")` forced to return
 * `null`, Light, Dark, Ethereal *and* Cyberpunk all threw, and because `SceneBoundary` wrapped
 * the whole scene rather than the canvas, each throw also destroyed any static art beside it.
 * Only Horizon survived, purely because it was the one theme that asked first.
 *
 * These tests pin the two properties that make the probe safe to rely on: it must report honestly
 * in both directions, and it must not hold a context open. The second matters because browsers
 * cap how many live WebGL contexts exist and start evicting the oldest, which would take the real
 * scene's context with it.
 */

import { describe, expect, it, vi } from "vitest";
import { probeWebGLContext } from "@/hooks/useWebGLSupport";

/** Minimal stand-in for a live WebGL context. */
function stubContext(overrides: Record<string, unknown> = {}) {
  return { getExtension: vi.fn(() => null), ...overrides };
}

/**
 * Replace `getContext` on a fresh canvas prototype-level spy.
 *
 * `document.createElement("canvas")` is the only way the probe obtains a context, so the stub has
 * to intercept that. It is restored after each call via the returned disposer.
 */
function stubGetContext(behaviour: (type: string) => unknown): () => void {
  const original = HTMLCanvasElement.prototype.getContext;
  const patched = function patched(this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
    const result = behaviour(String(type));
    // `undefined` means "not handled here", so an unstubbed 2d request still reaches the real
    // implementation and other tests in this file are unaffected.
    return result === undefined
      ? (original as (...args: unknown[]) => unknown).apply(this, [type, ...rest])
      : result;
  };
  HTMLCanvasElement.prototype.getContext = patched as typeof HTMLCanvasElement.prototype.getContext;
  return () => {
    HTMLCanvasElement.prototype.getContext = original;
  };
}

describe("probeWebGLContext", () => {
  it("reports true when a webgl2 context is obtainable", () => {
    const restore = stubGetContext((type) => (type === "webgl2" ? stubContext() : null));
    try {
      expect(probeWebGLContext()).toBe(true);
    } finally {
      restore();
    }
  });

  it("falls back to webgl when webgl2 is unavailable", () => {
    const restore = stubGetContext((type) => (type === "webgl" ? stubContext() : null));
    try {
      expect(probeWebGLContext()).toBe(true);
    } finally {
      restore();
    }
  });

  it("reports false when no context can be created", () => {
    const restore = stubGetContext(() => null);
    try {
      expect(probeWebGLContext()).toBe(false);
    } finally {
      restore();
    }
  });

  it("reports false rather than throwing when getContext throws", () => {
    // Safari and some embedded webviews throw on context creation instead of returning null.
    const restore = stubGetContext(() => {
      throw new Error("WebGL is blocked");
    });
    try {
      expect(() => probeWebGLContext()).not.toThrow();
      expect(probeWebGLContext()).toBe(false);
    } finally {
      restore();
    }
  });

  it("releases the probe context via WEBGL_lose_context", () => {
    /*
     * Browsers cap live contexts and evict the oldest, so a probe that held one would eventually
     * cost the real scene its context. `WEBGL_lose_context` is the supported way to release it.
     */
    const loseContext = vi.fn();
    const getExtension = vi.fn((name: string) =>
      name === "WEBGL_lose_context" ? { loseContext } : null
    );
    const restore = stubGetContext((type) =>
      type === "webgl2" ? stubContext({ getExtension }) : null
    );
    try {
      expect(probeWebGLContext()).toBe(true);
      expect(getExtension).toHaveBeenCalledWith("WEBGL_lose_context");
      expect(loseContext).toHaveBeenCalledTimes(1);
    } finally {
      restore();
    }
  });

  it("still reports success when the context cannot be released explicitly", () => {
    // No WEBGL_lose_context extension: the probe shrinks the canvas instead. Losing the ability
    // to release cleanly must not be mistaken for losing support.
    const restore = stubGetContext((type) => (type === "webgl2" ? stubContext() : null));
    try {
      expect(probeWebGLContext()).toBe(true);
    } finally {
      restore();
    }
  });

  it("reports false in a non-DOM environment, rather than throwing", () => {
    /*
     * Server render and workers have no `document`. The hook only calls the probe from an effect,
     * but the function is module-level and exported, so the contract should hold on its own.
     *
     * `document` is replaced rather than deleted: `delete` on a global is a lint error and would
     * also leave the module in a state jsdom cannot recover from cleanly.
     */
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, "document");
    Object.defineProperty(globalThis, "document", { value: undefined, configurable: true });
    try {
      expect(probeWebGLContext()).toBe(false);
    } finally {
      if (descriptor) Object.defineProperty(globalThis, "document", descriptor);
    }
  });
});
