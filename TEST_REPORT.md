# Test report

## 2026-11-25 (cloud container, Linux, Node 22.23, headless Chromium via Playwright 1.63, SwiftShader WebGL)
- `packages/geospatial` vitest: **7 passed** (name/ISO/French, USA alias, typos Morroco/Japn, cities Marrakech/Kyoto, regions, global, Arabic, dataset).
- `tests/e2e/explorer.spec.ts` (production build, `next start`): **12 passed, 2 skipped** (drag and globe-click checks are desktop-only by design and skipped in the mobile project).
  - search Japan → panel + URL `?d=jp` + 6 plans + fixture label (desktop, mobile)
  - USA / Morroco / Marrakech resolve (desktop, mobile)
  - Europe chip → regional panel + `?r=europe`
  - deep link `?d=ma` restores, close clears URL
  - drag across globe does not select (desktop)
  - click on globe selects a country (desktop)
  - `?nogl` fallback: no canvas, search + panel + directory work
- Visual: 6 viewports + Japan/Europe/Morocco, no console errors. Files in `documentation/qa/2026-11-25/`.
- Not yet tested: touch rotation/pinch on real devices, keyboard globe control (not built), performance on real GPUs, screen readers.

## 2026-11-25, later (same environment, local Postgres 16 seeded, API on :4000, web built with NEXT_PUBLIC_API_URL)
- `apps/api` vitest: **14 passed** (catalog 6, commerce 8: idempotent checkout, success → exactly one sandbox eSIM, duplicate webhook ignored, encrypted activation at rest, failed payment, bad HMAC 401, token-guarded order lookup, input validation, supplier failure → PROVISIONING_FAILED after 3 attempts).
- Playwright: **16 passed, 2 skipped** (adds full sandbox purchase and declined payment on desktop + mobile).
- geospatial vitest 7 passed. `tsc --noEmit` clean for api and web.

## 2026-11-25, accounts
- `apps/api` vitest: **20 passed** (adds auth + account: cookie flags, scrypt hash, duplicate/weak/wrong password, /me, signed-in purchase in My eSIMs, top-up adds data exactly once on duplicate webhook, cross-destination top-up refused, other user can't read install details, logout).
- Playwright: **18 passed, 2 skipped** (adds register → signed-in purchase → My eSIMs usage → top-up → install QR, desktop + mobile).
