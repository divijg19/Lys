// Type declarations for CSS imports.
//
// The app uses global (Tailwind) CSS rather than CSS modules, so `*.css` imports are side-effect
// imports with no meaningful default export. `unknown` is the honest type here; `Record<string,
// string>` would describe CSS modules and mislead anyone reaching for the import's value.
//
// This used to live in two files -- this one and `src/styles/global.d.ts` -- with differing
// default-export types for the same wildcard module. Consolidated here, in the directory that
// tsconfig includes explicitly.

declare module "*.css" {
  const content: unknown;
  export default content;
}

declare module "@/styles/globals.css";
