/**
 * @file: src/components/theme/effects/filmGrain.ts
 * @description: Shared film-grain overlay asset.
 *
 * A tiny inline SVG turbulence tile, scaled and repeated by the consumer. Kept as a
 * data URI so it needs no network request and adds no bitmap payload to the bundle.
 * Extracted so scenes that want grain (Cyberpunk, Horizon) share one definition
 * instead of each inlining a near-identical string.
 */
export const FILM_GRAIN_DATA_URI =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='180'%20height='180'%20viewBox='0%200%20180%20180'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='.9'%20numOctaves='3'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='180'%20height='180'%20filter='url(%23n)'%20opacity='.38'/%3E%3C/svg%3E";

/** CSS `background-image` value that tiles the grain across an element. */
export const FILM_GRAIN_BACKGROUND = `url("${FILM_GRAIN_DATA_URI}")`;
