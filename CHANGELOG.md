# Changelog

Some notable changes to this project will be documented in this file.

The format loosely follows Keep a Changelog; versions are date-stamped until semantic versioning is formalized.

## [2026-03-24]
### Fixed
- Prevented nested anchor hydration error in project cards (external links no longer render inner `<a>` inside the outer project `<a>`).
- Resolved runtime errors and 404s for article pages by safely unwrapping Next.js `params` (awaited in server components) and making slug matching case-insensitive.

### Accessibility
- Marked decorative/icon-only SVGs as `aria-hidden` where appropriate, added ARIA labels to icon-only buttons, and fixed several a11y test regressions.

### Compatibility
- Added a small client-side compatibility alias to map deprecated `THREE.Clock` to `THREE.Timer` on the client to silence deprecation warnings (temporary shim; recommend upgrading `three`/`@react-three/fiber` in future).

### Tests
- Added/updated accessibility fixes and integration checks; full test suite passing (33/33) after changes.

## Cleanup & Maintenance
- Removed unused scripts, dependencies and modernized some package.json fields.
- Updated README to be cleaner, removed ROADMAP and shifted to CHANGELOG.md.
- Cleaned up some unused code and refs in the scene components.
- Cleaned up next.config.js and tsconfig.json for better defaults and removed some unused config.

## [2026-01-07]
### Changed
- Updated dependencies and package upgrades across the repository.
- Lint fixes and code cleanups.
- Performance improvements to the Cyberpunk theme (reduced per-frame work, optimized lightning and skyline updates) and `BaseIcon` rendering.

### Security
- Updated Next.js and React Flight to mitigate known RCE vulnerabilities (Dec 2025).

### Maintenance
- Miscellaneous packaging and maintenance updates (notable housekeeping commits on 2026-03-01 and 2026-01-08).

## [2025-10-09]
### Added
- Procedural lightning bolt system (canvas) for Cyberpunk theme (cyan & yellow branching bolts, idle frame skip).
- Centralized neon pulse (single frame computation) replacing per-building `useFrame` calls.
- Dynamic skyline height expansion (55–110%) & container height bump to 85% for stronger vertical presence.

### Changed
- Reduced alley z-spacing (−3.2 → −2.2) for denser forward motion feel.
- Shortened building height range (~1.26–2.52 units) to emphasize backdrop scale.
- Refactored vertical descent & divergence loop to use direct refs array (removes userData scans).
- Replaced radial flash lightning overlay with bolt canvas; improved emissive layering.
- FlowingPlane ripple decay moved from state updates to ref-based uniform decay (removes per-frame re-render pressure).
- Optimized lightning loop (reverse iteration + early idle bailout).
- README fully authored with architecture, performance, and roadmap.

### Fixed
- Eliminated unnecessary repeated divergence exponent calculations (cached per-building divergence factor).
- Prevented recycled building z drift by persisting updated `zPos` to data objects.
- Removed unused mesh refs and redundant height computations.

### Performance
- Single neon emissive intensity update per frame instead of N `useFrame` hooks.
- Idle skip when no lightning bolts present (avoids needless canvas clear/draw).
- Precomputed factors (invPairs, divergence) reduce math in hot animation loop.

## [2025-10-07]
### Added
- Initial vertical descent easing + stepped pair drop for cinematic depth in alley.
- Dual-layer data rain with top-portion clipping behind skyline.

### Changed
- Multiple iterative tuning passes on building scale, camera lowering, and divergence easing.

## [2025-10-05]
### Added
- Theme registry (`themes.ts`) and scene orchestration via `ThemeBackground` + `themeScenes` mapping.
- Ethereal GLSL flowing plane, wisps, and ripple shader effects.
- Light (anomaly) theme camera rig state machine.

---
Historical earlier changes prior to this tracking were exploratory and not formalized.

