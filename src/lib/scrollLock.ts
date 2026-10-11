/**
 * Reference-counted scroll lock.
 *
 * `document.body.style.overflow` is global state, and until this module existed it had two
 * independent writers: the navbar's mobile menu and the expertise dialog. Each set
 * `overflow: "hidden"` on open and unconditionally released it on close, so opening the
 * hamburger while a dialog was open released a lock the dialog still owned, and closing the
 * dialog while the menu was open released the menu's lock instead. Both left the page
 * scrolling behind a UI that is supposed to trap it.
 *
 * Counting acquisitions makes overlapping locks harmless: the page stays locked until the
 * last holder releases. Each `acquireScrollLock()` returns its own release function, so
 * lifetimes pair up lexically with the components that requested them.
 *
 * The previous value is remembered per lock, not hard-coded, so releasing restores whatever
 * was there before (including `auto`, which the previous navbar code wrote explicitly).
 */

type LockState = {
  count: number;
  previousOverflow: string;
  previousBodyClass: string;
};

const state: LockState = { count: 0, previousOverflow: "", previousBodyClass: "" };
const VISUALLY_HIDDEN = "overflow-hidden";

/**
 * Blocks scrolling of the page behind the calling UI.
 * Returns a release function that is safe to call more than once.
 */
export function acquireScrollLock(): () => void {
  if (typeof document === "undefined") return () => {};

  if (state.count === 0) {
    state.previousOverflow = document.body.style.overflow;
    state.previousBodyClass = document.body.className;

    document.body.style.overflow = "hidden";
    document.body.classList.add(VISUALLY_HIDDEN);
  }

  state.count += 1;
  let released = false;

  return () => {
    if (released) return;
    released = true;

    // Clamped at zero. A reset (see resetScrollLockForTests) can drop the counter while a caller
    // is still mounted; its release then runs afterwards and would otherwise take the count to
    // -1, after which `count > 0` is never true again and every later lock silently does nothing.
    if (state.count > 0) state.count -= 1;
    if (state.count > 0) return;

    // Last holder out. Restore exactly what was there, rather than guessing "auto".
    document.body.style.overflow = state.previousOverflow;
    if (!/(^|\s)overflow-hidden(\s|$)/.test(state.previousBodyClass)) {
      document.body.classList.remove(VISUALLY_HIDDEN);
    }
  };
}

/** Whether the page is currently scroll-locked. Useful for tests and diagnostics. */
export function isScrollLocked(): boolean {
  return state.count > 0;
}

/**
 * Test/diagnostic helper: drops all recorded locks and undoes anything they applied to the DOM.
 * Only intended for teardown between tests.
 *
 * Restoring the DOM matters, and not just for tidiness. This used to only zero the counters,
 * which left `overflow: hidden` and the `overflow-hidden` class on `document.body`. jsdom shares
 * one document across every test in a file, so that leaked silently into the tests after it. Worse,
 * it corrupted the next lock rather than just the current one: with the counters at zero, the next
 * `acquireScrollLock()` would record the *leaked* `hidden` values as `previousOverflow` /
 * `previousBodyClass`, and releasing would then faithfully restore them -- leaving the page
 * permanently locked no matter how many times the lock was cycled.
 */
export function resetScrollLockForTests(): void {
  // Only touch the DOM if this module actually wrote to it, so calling this while unlocked cannot
  // stomp on overflow styling owned by something else.
  if (state.count > 0) {
    document.body.style.overflow = state.previousOverflow;
    document.body.className = state.previousBodyClass;
  }

  state.count = 0;
  state.previousOverflow = "";
  state.previousBodyClass = "";
}
