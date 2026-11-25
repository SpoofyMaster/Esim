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
