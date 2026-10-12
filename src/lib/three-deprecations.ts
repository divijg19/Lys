/**
 * Silences one specific deprecation warning raised by a dependency.
 *
 * `three@0.186` deprecated `THREE.Clock` in favour of `THREE.Timer` (r183), and
 * `@react-three/fiber@9.8.1` still constructs a `Clock` in its store, so the warning fires on every
 * page that mounts a scene, from library code we do not control:
 *
 *   THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.
 *
 * It is deliberately not fixed by aliasing `Clock` to `Timer`. The two are not interchangeable:
 * `Timer.getDelta()` returns zero until `update()` is called, whereas `Clock.getDelta()` advances
 * on read. Swapping them would silently stop every frame-based animation in the theme scenes rather
 * than quiet a log line.
 *
 * ## Why this changed
 *
 * This used to wrap `console.warn` globally and match messages by text. That had three problems,
 * each of which cost real time:
 *
 * 1. Every warning in the app passed through the wrapper, so an unrelated warning could be swallowed
 *    by a message match that happened to overlap.
 * 2. Because the wrapper sat in the call stack, Next's dev overlay attributed surviving warnings to
 *    this file rather than to the code that logged them. The `[next] Detected scroll-behavior:
 *    smooth...` warning in the v0.2.3 report was blamed here and sent the investigation down the
 *    wrong path entirely.
 * 3. Filtering on message text is fragile: a library rewording its warning silently re-enables the
 *    noise.
 *
 * `THREE.setConsoleFunction` is the supported hook for exactly this. It intercepts only Three's own
 * log calls, so nothing else in the app is touched, no global console state is mutated, and the call
 * site stays where it belongs.
 */
import * as THREE from "three";

const SUPPRESSED = "Clock: This module has been deprecated. Please use THREE.Timer instead.";

export function suppressThreeClockDeprecation(): void {
  if (typeof window === "undefined") return;

  THREE.setConsoleFunction((type, message, ...params) => {
    if (type === "warn" && message.includes(SUPPRESSED)) return;

    const console_ = window.console;
    if (!console_) return;

    if (type === "log") {
      console_.log(message, ...params);
    } else if (type === "error") {
      console_.error(message, ...params);
    } else {
      console_.warn(message, ...params);
    }
  });
}
