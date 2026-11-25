# BLEUSIM — project guide for Claude sessions

**Mission.** Build BLEUSIM (bleusim.com), a global travel eSIM platform where a real-time 3D Earth is the shopping interface. "One planet. Endless connections." Full spec: `MASTER_SPECIFICATION.md` (original: Badr's message in the project thread, 2026-11-25).

**Start every session by reading:** `NEXT_ACTION.md` → `TASKS.md` → `DECISIONS.md` → `BLOCKERS.md`. Continue from the last verified checkpoint. Don't restart.

## Mandatory rules
- Never fabricate prices, coverage, supplier capabilities, reviews, stats, integrations or test results. Sandbox data must carry `source: "DEV_FIXTURE"` and be labelled in the UI.
- Never copy Saily copy/assets/code. Research lives in `research/` and is data only.
- Ask Badr before: creating/pushing a GitHub repo, spending Higgsfield credits (quote first), real payments, supplier signups, deployments, production changes.
- Geography (`packages/geospatial`) is separate from commercial coverage (`packages/catalog`).
- The globe is optional: every journey must work with `?nogl` (no WebGL), keyboard only, and reduced motion.
- A task is COMPLETED only when acceptance criteria and tests pass.

## Layout
- `apps/web` Next.js 16 (App Router, Turbopack), React 19, R3F 9 + drei 10, three 0.187, Tailwind 4, GSAP 3.
  - `components/globe/EarthScene.tsx` scene, camera flights, picking · `shaders.ts` GLSL · `geodata.ts` TopoJSON → borders, id-map, point-in-polygon picker
  - `components/Explorer.tsx` hero + globe + overlays · `SearchBox.tsx` combobox · `DestinationPanel.tsx` plans panel / bottom sheet
  - `lib/store.ts` explorer state + URL sync (`?d=jp`, `?r=europe`, `?g=1`)
- `packages/geospatial` 241 Natural Earth countries, 7-language names, regions, cities, Fuse search (`pnpm --filter @bleusim/geospatial build:data` regenerates `data/`)
- `packages/catalog` catalog contract + DEV FIXTURE provider
- `packages/design-tokens` colours, type, radius, motion (TS + CSS vars)
- `apps/{mobile,admin,api}`, other packages: scaffold folders, not started
- `research/` Saily audit · `documentation/qa/` screenshots · `tests/` Playwright e2e + visual script

## Commands
```
pnpm install
pnpm --filter @bleusim/web build && pnpm --filter @bleusim/web start   # http://localhost:3000
pnpm --filter @bleusim/geospatial test                                   # unit tests (vitest)
cd tests && PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers ./node_modules/.bin/playwright test --trace off
cd tests/visual && NODE_PATH=$(npm root -g) node shoot.mjs <outDir>      # 6-viewport screenshots
```
Headless WebGL needs `--use-angle=swiftshader --enable-unsafe-swiftshader` (already in configs).

## Environment facts
- Cloud container: npm registry reachable; saily.com, NASA, unpkg NOT reachable. Use Claude's built-in browser on Badr's Mac for web research.
- Earth textures come from the `three-globe` npm package (NASA Blue/Black Marble derivatives). Country shapes from `world-atlas` (Natural Earth, public domain).
- Durable copies: git bundle `/mnt/project-files/bleusim/bleusim.bundle`; snapshots on Badr's Mac `~/Projects/bleusim/source-<commit>` (see LATEST.txt). No GitHub repo yet.

## Coding standards
TypeScript strict, `noUncheckedIndexedAccess`. Accessible primitives (labels, roles, focus rings). Tokens only from `@bleusim/design-tokens`. Universe A (cinematic, dark) for globe/marketing; Universe B (clean, legible) for commerce/account/admin.

## Current status
See `PROGRESS.md`. Priorities: `NEXT_ACTION.md`.
