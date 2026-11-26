# Progress log

## 2026-11-26 — Mobile app
- `apps/mobile`: Expo SDK 58 / Expo Router app inspired by the structure of Badr's Saily iPhone screenshots (no copied copy or assets). Floating pill tab bar (Home, My eSIMs, Help, Profile), Earth hero + search, plans with best-choice card, sandbox checkout, order QR, sign-in panel, 7 languages + Arabic RTL, 235 round flags, Higgsfield imagery, app icon.
- Verified: `tsc` clean; web export; 13 iPhone-size screenshots (`documentation/qa/2026-11-26-mobile/`); sandbox purchase Japan unlimited → order BS-… with QR against the local API + Postgres.

## 2026-11-25 — Session 1
- Tool audit: Node 22.23, pnpm 10.28, Python 3.13, git 2.43, Docker 29.9 (CLI), PostgreSQL 16 client/server, Redis 7.0, preinstalled Chromium + Playwright 1.63, Java present. No Xcode/Android SDK in the cloud container (Badr's Mac has `~/ios`, `~/android`, `.expo`, `.cocoapods` folders: mobile builds can run there later). MCP: Higgsfield (generation, quoting), Claude Docs, GitHub, built-in browser on Badr's Mac. No Context7/Chrome DevTools MCP. No UI/UX Pro Max skill installed; design review done manually against spec §35.
- Network: cloud egress limited to package registries; research via built-in browser.
- Saily research pass 1 complete (`research/`).
- Monorepo initialised; geospatial, catalog, design-tokens packages; Next.js web app with the interactive Earth.
- Tests: vitest 7/7; Playwright 12 passed, 2 skipped (desktop-only checks on mobile project).
- Visual QA screenshots: `documentation/qa/2026-11-25/` (6 viewports + Japan, Europe, Morocco states).
