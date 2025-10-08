## Theme Concepts & Implementation Guide

This document summarizes the intent, core identity, and key technical components for the active immersive themes in the portfolio.

---
### Cyberpunk – "Latent Glitch & Neon"
Atmospheric neon alley receding toward a towering skyline. Foreground elements are intentionally scaled down to emphasize depth.

Key Effects:
- Infinite procedural alley: recycled building pairs, FOV-based divergence, vertical descent + stepped drop.
- Dual data rain canvas: rear layer clipped (top 25% visible), front ambient layer.
- Procedural lightning (cyan/yellow branching bolts) with idle frame skip.
- Centralized neon emissive pulse (single frame hook) for power efficiency.
- Lean + perspective easing for cinematic spread.

Design Principles:
- High contrast; electric accent colors (cyan, fuchsia, lime) over near-black base.
- Fast, sharp micro-animations; scanline motifs; subtle glitch allowances.

---
### Ethereal – "A Placid Dreamscape"
Serene, luminous field anchored by a flowing noise-driven plane and ephemeral interaction echoes.

Key Effects:
- FlowingPlane (dual-scale simplex noise + ripple uniform injection).
- Wisps (on-demand particle sprites) & concentric shader ripples.
- Ref-based uniform decay (no re-render loops) for ripple intensity.

Design Principles:
- Soft translucency, pastel gradients, low-frequency motion, gentle easing.

---
### Horizon / Light (Anomaly Arc)
Expansive, forward journey culminating in anomaly encounter sequence.

Key Effects:
- CameraRig state machine: free travel → cinematic third-person → anomaly lock.
- Debris field + star/particle parallax.
- HUD distance feedback.

Design Principles:
- Clean luminous palette, spacefaring clarity, cinematic escalation.

---
### Mirage – "The Unstable Reality"
Still desert scene—distortion emerges only through interaction or scripted pulses (heat refraction potential).

Current Elements:
- Procedural sky + ground foundation (baseline scene file).
- Future: localized refractive heat shimmer & chromatic displacement.

Design Principles:
- Sand/ochre tonal base, crisp UI layering, abrupt distortion transitions.

---
### Simple / Dark / Light (Foundational Modes)
Baseline accessibility & contrast variants; act as low-complexity fallbacks in reduced-motion / low-data contexts.

Shared Technical Notes:
- Theme registry (`lib/themes.ts`) enumerates all names consumed by `ThemeProvider`.
- `ThemeBackground` orchestrates graceful cross-fades & low-data gating.
- All scenes respect `data-reduce-motion` and `data-low-data` attributes for perf & accessibility.

---
### Performance Patterns (Cross-Theme)
- Frame consolidation (shared pulses, centralized loops).
- Ref caches for scene objects (avoid per-frame tree scans).
- Idle skipping for procedural canvases (lightning).
- Precomputed per-building factors (divergence, pair index fraction).

### Roadmap (Visual Enhancements)
- Mirage heat refraction shader.
- Worker-offloaded rain / lightning (OffscreenCanvas) when supported.
- Unified EffectsClock to sync noise phases & pulses across themes.

This guide evolves with each thematic refinement; maintain behavioral parity when optimizing.