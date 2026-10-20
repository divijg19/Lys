// src/lib/fonts.ts

/*
 * The fonts are self-hosted, with `next/font/local`, rather than fetched from Google Fonts by
 * `next/font/google`.
 *
 * `next/font/google` downloads the font at build time and again at development time. When the
 * machine cannot reach `fonts.googleapis.com` -- offline, behind a proxy, or on a network that
 * blocks it -- the dev server logs a wall of warnings for every route and falls back to a system
 * font, so the site is developed against a typeface it will never ship with. The build can fail
 * the same way, in a different place.
 *
 * The files in `src/app/fonts` are the *same bytes* the build was serving before: they are the
 * output of `next/font/google`'s own subsetting and re-compression, taken from the build. Serving
 * them from the repository removes the network dependency without changing a single glyph or a
 * single advance width -- verified by measuring the rendered text against the previous build,
 * not by eyeballing it.
 *
 * Geist is licensed under the SIL Open Font License 1.1; the licence is next to the files.
 */

import localFont from "next/font/local";

export const geistSans = localFont({
  src: "../app/fonts/Geist-Variable-latin.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const geistMono = localFont({
  src: "../app/fonts/GeistMono-Variable-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});
