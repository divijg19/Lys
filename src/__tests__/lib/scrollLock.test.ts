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

describe("resetScrollLockForTests", () => {
  it("undoes the DOM changes the lock made", () => {
    // Regression: the reset used to only zero the counters, leaving `overflow: hidden` and the
    // `overflow-hidden` class behind. jsdom shares one document across every test in a file, so
    // that leaked silently into whatever ran next.
    document.body.style.overflow = "";
    document.body.className = "";

    acquireScrollLock();
    expect(document.body.classList.contains("overflow-hidden")).toBe(true);

    resetScrollLockForTests();

    expect(isScrollLocked()).toBe(false);
    expect(document.body.style.overflow).toBe("");
    expect(document.body.classList.contains("overflow-hidden")).toBe(false);
  });

  it("does not permanently re-lock the body on the next acquire/release cycle", () => {
    // The subtler half of the same bug. With the counters reset but the DOM left locked, the next
    // acquire recorded the leaked `hidden` values as the "previous" state, so its release
    // faithfully restored them -- leaving the page locked no matter how often the lock cycled.
    document.body.style.overflow = "";
    document.body.className = "";

    acquireScrollLock();
    resetScrollLockForTests();

    const release = acquireScrollLock();
    release();

    expect(isScrollLocked()).toBe(false);
    expect(document.body.style.overflow).toBe("");
    expect(document.body.classList.contains("overflow-hidden")).toBe(false);
  });

  it("preserves unrelated body classes while locked", () => {
    document.body.style.overflow = "";
    document.body.className = "some-theme-class";

    acquireScrollLock();
    resetScrollLockForTests();

    expect(document.body.className).toBe("some-theme-class");
  });

  it("does not let a post-reset release drive the counter negative", () => {
    // Regression found while adding the menu tests. If a reset runs while a caller is still
    // mounted (which happens when test teardown resets the module before unmounting the tree), its
    // release runs afterwards and used to take the count to -1. From there `count > 0` is never
    // true again, so every later acquire silently skipped the lock and the page stayed scrollable.
    document.body.style.overflow = "";
    document.body.className = "";

    const release = acquireScrollLock();
    resetScrollLockForTests();
    release(); // the late release, after the counter was already zeroed

    // A fresh lock must still work.
    const releaseAgain = acquireScrollLock();
    expect(isScrollLocked()).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
    releaseAgain();
    expect(isScrollLocked()).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("leaves the DOM alone when nothing is locked", () => {
    // Must not stomp on overflow styling this module never wrote.
    document.body.style.overflow = "clip";
    document.body.className = "kept";

    resetScrollLockForTests();

    expect(document.body.style.overflow).toBe("clip");
    expect(document.body.className).toBe("kept");

    document.body.style.overflow = "";
    document.body.className = "";
  });
});
