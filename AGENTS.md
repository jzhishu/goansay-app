# Go and Say App Agent Guide

This file is the working guide for agents and contributors developing the first production version of `goansay-app`.

## Project Context

`goansay-app` is the formal application project for Go and Say, a scene-driven travel language and culture preparation product. The app should be treated as a production codebase from the beginning, not as a continuation of the demo implementation.

The current implementation goal is to rebuild `../goansay-materials/demo.tsx` as a structured production React app while preserving the demo experience as closely as possible.

The current product direction is:

- A Web PC-first learning app.
- Level 1: editorial China scene map.
- Level 2: city canvas with landmarks.
- Level 3: immersive hero video and interactive video learning flow.
- English UI for the product shell.
- Chinese appears only as learning content.
- Design tone: calm, adult, premium, real travel content, no game-like or neon interface language.

## Environment

Use Node.js 24 through nvm:

```bash
nvm use 24
```

Use `pnpm` for package management and scripts:

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
```

Do not introduce npm or yarn lockfiles. The project should use `pnpm-lock.yaml` once dependencies are installed.

## Verification Behavior

Do not open a browser for manual or visual verification unless the user explicitly asks agents to do so.

After completing implementation work, run the appropriate non-browser checks when available, then report the result to the user. If browser verification would normally be useful, mention it as an optional next step instead of launching it yourself.

## Technical Direction

The first-version app uses:

- React + TypeScript
- Vite
- Tailwind CSS
- Vitest for focused logic tests

Future additions can include:

- TanStack Router when URL-level routing becomes useful.
- Zustand when app state grows beyond local view state.
- Zod for content/config validation.
- Playwright for end-to-end and visual checks.
- Supabase later for auth and cloud progress, behind an app-level service boundary.

Keep the codebase strongly typed. Content data, assets, progress, derived status, and video timeline behavior should be modeled explicitly instead of embedded directly in page components.

## Source Materials

All project reference materials live outside this app directory in `../goansay-materials`.

### Demo Reference

- `../goansay-materials/demo.tsx`

Use this as the 1:1 reference for the first implementation. Rebuild the experience through production directories instead of keeping it as one large component file.

### Product Documents

- `../goansay-materials/docs/product/prd-1.0.md`
  - Main PRD for account, progress, map, trip prep, landmark learning, and interactive video requirements.
- `../goansay-materials/docs/product/teaching-principles.md`
  - Teaching method, feedback strategy, chunk-first learning principles, ASR tolerance philosophy.
- `../goansay-materials/docs/product/knowledge-graph.md`
  - Full learning content framework and capability domains.

### Design Documents

- `../goansay-materials/docs/design/design-system.md`
  - Current global design system and brand direction.
- `../goansay-materials/docs/design/design-system-scene-map.md`
  - Level 1 map, city canvas, marker, route, and detail card design rules.
- `../goansay-materials/docs/design/design-system-video-learning.md`
  - Hero video, guided/shadowing/immersion modes, ASR feedback, culture cards, and video UI rules.
- `../goansay-materials/docs/design/map-design-prompt.md`
  - Map visual generation/reference prompt.

### Data and Schema

- `../goansay-materials/docs/schema.md`
  - Core content schema, assets manifest, progress model, selectors, interaction nodes, and mode policies.

Treat this as the source of truth when defining TypeScript types and content structures.

### Assets

- `../goansay-materials/public/assets/map/`
  - Map and city canvas backgrounds.
- `../goansay-materials/public/assets/markers/`
  - City and trip prep marker images.
- `../goansay-materials/public/assets/hero/`
  - City and landmark hero images.

The app serves copied assets from `goansay-app/public/assets/` under stable `/assets/...` paths.

## Product Rules To Preserve

- Progress status should be derived through selectors wherever possible.
- Stored progress should keep only durable state, not duplicated percentages or derived labels.
- Map routes are authored data, not auto-generated geometry.
- City and landmark states must use a single status derivation path.
- Learning modes are strictly ordered: guided, shadowing, immersion.
- UI text is English except target learning content.
- Do not show pinyin in the learning experience.
- Keep the learning flow audio-first. Visual UI should support listening and speaking, not dominate it.
- Do not use generic SaaS dashboard styling, game-like rewards, neon effects, or heavy component-library defaults.

## Repository Hygiene

- Keep changes scoped to `goansay-app` unless explicitly updating shared materials.
- Do not delete or rewrite user-provided assets.
- Prefer small, well-named modules over large single-file demos.
- Keep project documentation updated as architecture decisions become stable.
