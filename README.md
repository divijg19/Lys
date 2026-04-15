<h1 align="center">Lys: Multi‑Theme Immersive Portfolio</h1>

Lys is a laptop-first web-based performance‑focused, multi‑aesthetic developer portfolio built with:

- Next.js (App Router) + React 19
- TypeScript + strict Biome linting / formatting
- Tailwind CSS (layered with CSS variables per theme)
- Seven real‑time visual themes (React Three Fiber / Three.js / GLSL)
- Content sourced & prebuilt via Velite (MDX + YAML metadata)

## ✨ Features Overview

| Domain | Highlights |
|--------|-----------|
| Theming | 7 switchable worlds (light, dark, cyberpunk, ethereal, horizon, mirage, simple) with shared semantic tokens |
| 3D / FX | Procedural city alley (alley scroll + divergence), lightning bolts, data rain, starfield, flowing plane, particles, ripples, anomaly scene |
| Performance | Centralized effect loops, memoized scene data, ref‑based decay logic, conditional rendering (low‑data / reduced‑motion) |
| Accessibility | Skip link, semantic MDX rendering, reduced motion & data fallbacks, keyboard focus integrity |
| Content System | MDX blog & project pages (Velite pipeline), YAML structured bio / expertise / resume data |
| Tooling | Biome (lint+format), Vitest, Storybook, type‑safe theme registry, strict tsconfig |

## 🧱 Architecture

```
src/
	app/               # Next.js routes (App Router)
	components/
		layout/          # Structural + content render components
		sections/        # Landing page sections (Hero, Projects, etc.)
		theme/
			effects/       # Reusable effect primitives per theme
			scenes/        # Theme scene composition (maps theme -> effect cluster)
			ThemeProvider  # next-themes wrapper (data-theme attribute)
	content/           # MDX + YAML (Velite processed)
	hooks/             # Scroll, theme, data rain, motion prefs
	lib/               # Fonts, icons, themes registry, utils, types
	styles/            # Global CSS + animations
```

### Theme System
Single source of truth: `lib/themes.ts` exports `themes` & `THEME_NAMES`. `ThemeProvider` binds names to `data-theme` for CSS variable resolution. `ThemeBackground` selects a scene via `themeScenes` (see `theme/themeScenes.tsx`). Reduced‑motion / low‑data attributes short‑circuit heavy scenes.

### Cyberpunk Alley (Key Example)
- Infinite alley via building recycling & dynamic repositioning.
- Perspective‑aware divergence (FOV math) to screen edges.
- Vertical descent: eased + stepped base Y for cinematic “heading downtown” feel.
- Lean (progressive X‑axis rotation) for forward thrust.
- Dual data rain layers (rear clipped, front overlay) with density control.
- Procedural lightning bolts (canvas) replacing radial flash overlay (idle skip when no bolts).
- Centralized neon pulse (single frame hook) updates all emissive signs.

### Ethereal Theme
- Flowing GLSL plane (dual noise blend + ripple uniform).
- Ref‑based click ripple decay (no per‑frame state churn).
- Wisps + ripples as on‑demand ephemeral FX.

### Light / Anomaly Theme
- Camera state machine (`CameraRig`): first → third person → anomaly lock.
- Debris field, HUD distance tracking, cinematic easing.

## 🧪 Quality & Tooling

| Tool | Purpose |
|------|---------|
| Biome | Unified lint + format (scripts: `lint`, `format`) |
| Vitest | Unit / component tests (scripts: `test`, `test:watch`) |
| Storybook | UI surface exploration (`storybook`) |
| Velite | Static content build (blogs, projects) |
| Bun | Package + runtime speed |

### Scripts
- `bun run dev` – Dev server + Velite watch
- `bun run build` – Clean, content build, Next production build
- `bun run qa` – Type check + lint + tests

## ♿ Accessibility & Preferences
- Skip link and focus management in layout.
- `data-low-data` / `data-reduce-motion` attributes disable heavy scenes.
- Semantic headings & MDX mapping for screen readers.

## ⚙️ Performance Techniques
- Effect consolidation (shared neon pulse instead of per-building frames).
- Reverse iteration + idle skip for lightning canvas (no unnecessary clears).
- Precomputed divergence and pair factors; minimized math per frame.
- Ref caching of building groups + persistent recycled z positions.
- Ref-based shader uniform decay (no re-render loops).

## 🗂 Content Modeling
Velite ingests:
- `/content/blogs/*.mdx`
- `/content/projects/*.mdx`
- YAML index files (bio, expertise, resume, services)

Generates typed artifacts consumed in pages & lists.

## 🔐 Environment
Project intentionally avoids leaking secrets; contact API uses Resend. Add `.env.local` with required keys (not included here).

```env
RESEND_API_KEY=your_resend_api_key
```

If `RESEND_API_KEY` is missing, builds still succeed, but `POST /api/contact` returns `503` until configured.

## 🚀 Deployment
- Vercel (configured via `vercel.json` & Next edge defaults).
- Analyze bundle with `bun run build:analyze`.

## 🤝 Contributing
Internal personal project. Ideas welcome via issues and discussion.

## 📄 License
All rights reserved (personal portfolio).

---
Built with intention: immersive aesthetics balanced by performance, accessibility, and maintainability.



