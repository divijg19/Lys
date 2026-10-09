/**
 * Silences one specific deprecation warning raised by a dependency.
 *
 * `three@0.186` deprecated `THREE.Clock` in favour of `THREE.Timer` (r183), and
 * `@react-three/fiber@9.8.1` still constructs a `Clock` in its store
 * (`dist/events-*.js`). The warning therefore fires on every page that mounts a scene, from
 * library code we do not control:
 *
 *   [next] [browser] THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.
 *
 * It is deliberately not fixed by aliasing `Clock` to `Timer`. The two are not
 * interchangeable: `Timer.getDelta()` returns zero until `update()` is called, whereas
 * `Clock.getDelta()` advances on read. Swapping them would silently stop every frame-based
 * animation in the theme scenes rather than quiet a log line.
 *
 * So this filters that exact message and nothing else -- any other warning, and any error,
 * still reaches the console normally. Remove it once r3f moves off `Clock` upstream.
 */
const SUPPRESSED = "Clock: This module has been deprecated. Please use THREE.Timer instead.";

export function suppressThreeClockDeprecation(): void {
  if (typeof window === "undefined") return;
  const console_ = window.console;
  if (!console_ || (console_ as ConsoleWithFlag).__lysClockSuppressed) return;

  const original = console_.warn.bind(console_);
  const patched = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes(SUPPRESSED)) return;
    original(...args);
  };

  console_.warn = patched;
  (console_ as ConsoleWithFlag).__lysClockSuppressed = true;
}

type ConsoleWithFlag = Console & { __lysClockSuppressed?: boolean };
