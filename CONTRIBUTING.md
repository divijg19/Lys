## Contributing Guide

### Workflow
1. Install deps: `bun install`
2. Content build & dev: `bun run dev`
3. Lint & format: `bun run lint && bun run format`
4. Type check: `bun run type-check`
5. Tests (all): `bun run test`
6. Storybook: `bun run storybook`

### Standards
- Accessibility first: all interactive components must be keyboard & screen-reader friendly.
- Prefer derived types and `as const` patterns for registries.
- Avoid `any`; if unavoidable, isolate and document.
- Keep components focused; extract complex logic to hooks or lib functions.

### Performance
- Use `Suspense` + lazy where heavy client bundles are optional.
- Gate non-critical visual effects behind reduced motion / low data attributes.
- Run `bun run analyze` (with `ANALYZE=true`) before merging large UI changes.

### Security
- Inline scripts must be JSON-LD only. If adding other inline scripts, introduce CSP nonces.
- Never interpolate untrusted content into `dangerouslySetInnerHTML`.

### Adding Structured Data
- Articles: use `<ArticleJsonLd />` with validated props.
- Projects: use `<ProjectJsonLd />`.

### Tests
- Add an interaction test when introducing new composite widgets (menus, dialogs, etc.).
- Keep coverage meaningful; focus on critical paths and a11y behavior.

### Git Hooks
Husky will run linting before commits (if configured). Keep commits small and descriptive.

### Release
- Update `CHANGELOG.md` succinctly (Added / Changed / Fixed).

Thank you for contributing to a fast, accessible, and maintainable portfolio codebase! 🌟
# Contributing Guide

Focus areas: accessibility, performance, maintainability.

## Principles
1. Accessibility first.
2. Single sources of truth (themes, motion, env).
3. Remove duplication.
4. Prefer composable utilities.

## Workflow
```
bun install
bun run dev
bun run test
bun run lint
```

## Components
- Respect reduced motion (`usePrefersReducedMotion`).
- Provide aria-labels for icon-only actions.

## Env Vars
Add to `src/lib/env.ts`; never access `process.env.*` directly elsewhere.

## Testing
- Add a11y test for new sections.
- Add interaction test for stateful UI.

## Performance
- Add `sizes` to all `next/image` usages.
- Dynamic import heavy scenes.

## PR Checklist
- TypeScript clean
- a11y tests pass
- Motion respects reduced motion
- Env schema updated if needed
- Images optimized
