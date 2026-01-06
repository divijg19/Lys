# Changelog

Some notable changes to this project will be documented in this file.

The format loosely follows Keep a Changelog; versions are date-stamped until semantic versioning is formalized.

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
