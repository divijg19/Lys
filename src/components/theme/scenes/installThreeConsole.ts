/**
 * @file: src/components/theme/scenes/installThreeConsole.ts
 * @description: Installs the Three.js console filter, for theme scenes to import.
 *
 * The filter silences one specific deprecation warning that `three@0.186` raises and
 * `@react-three/fiber@9.8` triggers on every scene mount. The reasoning behind the filter -- and
 * why it must not be a global `console.warn` wrapper -- is documented in
 * `src/lib/three-deprecations.ts`.
 *
 * It lives here, and every scene imports it for its side effect, because of *when* it has to run:
 * the warning is emitted while `@react-three/fiber` constructs its store, and that store is
 * created when the `<Canvas>` mounts. Module scope is early enough; a component effect is not.
 *
 * Importing this module also imports three.js. That is deliberate and it is the reason this file
 * exists: the previous call site was `ClientThemeBackground`, which is rendered eagerly on every
 * page, and its import of three.js therefore put the whole library into the *initial* bundle
 * (~98 KB gzip) even though every scene is loaded lazily. Scenes are loaded on demand, so the
 * library now travels with them.
 */

import { suppressThreeClockDeprecation } from "@/lib/three-deprecations";

suppressThreeClockDeprecation();
