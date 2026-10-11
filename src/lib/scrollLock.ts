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

    state.count -= 1;
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
 * Test/diagnostic helper: drops all recorded locks without touching the DOM.
 * Only intended for teardown between tests.
 */
export function resetScrollLockForTests(): void {
  state.count = 0;
  state.previousOverflow = "";
  state.previousBodyClass = "";
}
