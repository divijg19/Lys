import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { acquireScrollLock, isScrollLocked, resetScrollLockForTests } from "@/lib/scrollLock";

/**
 * Coverage for the shared scroll lock.
 *
 * `document.body.style.overflow` previously had two independent writers -- the navbar's mobile
 * menu and the expertise dialog -- each setting and releasing it unconditionally. Opening one
 * over the other released a lock the first still owned, leaving the page scrolling behind it.
 */

describe("acquireScrollLock", () => {
  it("starts unlocked", () => {
    expect(isScrollLocked()).toBe(false);
  });

  it("locks on acquire and unlocks on release", () => {
    document.body.style.overflow = "";
    const release = acquireScrollLock();

    expect(isScrollLocked()).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");

    release();
    expect(isScrollLocked()).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("keeps the lock while any holder is outstanding", () => {
    document.body.style.overflow = "";
    const releaseA = acquireScrollLock();
    const releaseB = acquireScrollLock();

    expect(isScrollLocked()).toBe(true);

    // The menu closing must not unlock the page while the dialog still holds it.
    releaseA();
    expect(isScrollLocked()).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");

    releaseB();
    expect(isScrollLocked()).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("restores the previous value rather than assuming auto", () => {
    document.body.style.overflow = "clip";
    const release = acquireScrollLock();
    expect(document.body.style.overflow).toBe("hidden");
    release();
    expect(document.body.style.overflow).toBe("clip");
  });

  it("is safe to release the same handle twice", () => {
    document.body.style.overflow = "";
    const release = acquireScrollLock();
    release();
    release();
    // Must not push the counter negative, which would permanently disable the lock.
    expect(isScrollLocked()).toBe(false);
    expect(acquireScrollLock()).toBeTypeOf("function");
    resetScrollLockForTests();
  });

  it("survives being rendered through renderHook", () => {
    document.body.style.overflow = "";
    const { result, unmount } = renderHook(() => acquireScrollLock(), {
      initialProps: undefined as never,
    });
    expect(isScrollLocked()).toBe(true);
    result.current();
    expect(isScrollLocked()).toBe(false);
    unmount();
  });
});
