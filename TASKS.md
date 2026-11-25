# Tasks

| ID | Task | Pri | Deps | Agent | Acceptance | Status | Tests |
|---|---|---|---|---|---|---|---|
| T-001 | Init repo, memory files | P0 | — | CTO | files exist, git commit | COMPLETED | n/a |
| T-002 | Tool audit | P0 | — | DevOps | recorded in PROGRESS | COMPLETED | n/a |
| T-003 | Saily research pass 1 | P0 | — | Research | deliverables in research/ | COMPLETED | n/a |
| T-004 | Saily pass 2: 1920/1440/1280/768/375 shots, Google Play, help articles | P2 | T-003 | Research | screenshots + notes | PENDING | — |
| T-010 | Geospatial dataset + search | P0 | — | Geo | 241 countries, 7 langs, alias/typo/city/region | TESTED | vitest 7/7 |
| T-011 | Earth renderer (day/night, clouds, atmosphere, arcs, stars) | P0 | T-010 | 3D | renders at 6 viewports, no console errors | TESTED | visual 6/6 |
| T-012 | Country picking (point-in-polygon), hover, drag-safe click | P0 | T-011 | 3D | click selects, drag doesn't | TESTED | e2e |
| T-013 | Search ↔ globe ↔ URL sync | P0 | T-010 | Frontend | Japan/USA/Morocco/Europe flows | TESTED | e2e 12/12 |
| T-014 | Destination panel + bottom sheet + states | P0 | T-013 | Frontend | loading/empty/error/ready | IMPLEMENTED | e2e (ready only) |
| T-015 | No-WebGL fallback | P0 | T-013 | Frontend | ?nogl purchase path works | TESTED | e2e |
| T-016 | Keyboard globe controls (arrow keys rotate, +/- zoom) | P1 | T-011 | A11y | operable without mouse | PENDING | — |
| T-017 | Disputed-territory boundary policy (Western Sahara etc.) | P1 | — | Geo | config + Badr decision | BLOCKED (decision) | — |
| T-018 | KTX2 textures + 8k tier, progressive loading | P2 | T-011 | Perf | measured gain | PENDING | — |
| T-019 | Real-time sun position option | P3 | T-011 | 3D | toggle | PENDING | — |
| T-020 | Brand book: logo variants, app icon, type scale, components | P1 | — | Design | DESIGN_SYSTEM complete | IN_PROGRESS | — |
| T-030 | API scaffold (Fastify), Prisma 7 schema (24 models), init migration, seed | P0 | — | Backend | `pnpm --filter @bleusim/api test` green | TESTED | vitest 5/5 |
| T-033 | Web reads catalog from API via @bleusim/api-client (fixture fallback) | P0 | T-030 | Frontend | e2e green against API | TESTED | e2e 12/12 |
| T-031 | Provider adapter interface + sandbox provider (.invalid SM-DP+, fake ICCID range) | P0 | T-030 | eSIM | provision/usage/top-up in sandbox | TESTED (provision); usage/top-up API not exposed yet | vitest |
| T-032 | Supplier research (eSIM Go, 1GLOBAL, Gigs, …) from official docs | P1 | — | eSIM | comparison doc | PENDING | — |
| T-040 | Sandbox checkout: idempotent orders, HMAC-signed idempotent webhooks, provisioning with retries, AES-GCM eSIM details, order page with QR | P0 | T-030 | Payments | sandbox order end to end | TESTED | vitest 8 + e2e 4 |
| T-041 | Stripe test-mode adapter on the same webhook path | P1 | B-4 | Payments | Stripe test card → FULFILLED | BLOCKED (keys) | — |
| T-042 | Move provisioning to a Redis-backed job queue + reconciliation job | P1 | T-040 | Backend | retry/backoff, admin requeue | PENDING | — |
| T-050 | Higgsfield cinematic assets | P2 | approval | Creative | registry entries | BLOCKED (budget approval) | — |
| T-060 | GitHub repo + CI | P1 | approval | DevOps | pushed, CI green | BLOCKED (approval) | — |
| T-070 | Accounts: email+password (scrypt), httpOnly session cookies, /me, logout, rate-limited auth | P0 | T-030 | Backend | register/login/logout tests | TESTED | vitest 6 + e2e |
| T-071 | My eSIMs: live usage (recorded), install details (owner-only), purchase history, top-ups through sandbox payment | P0 | T-070 | Full-stack | e2e register→buy→top-up | TESTED | vitest + e2e 2 |
| T-072 | Email verification + magic link, password reset, Apple/Google sign-in | P1 | T-070 | Backend | flows tested | PENDING (needs email provider) | — |
| T-130 | i18n: 7 languages, locale routing, Arabic RTL, hreflang, sitemap alternates | P1 | T-090 | Frontend | /fr, /ar render localized; /en redirects; hreflang ×8 | TESTED | e2e i18n.spec 12/12 (desktop+mobile) |
| T-131 | Native review of translations (ar first) | P1 | T-130 | Content | Reviewed by native speakers | NOT STARTED | — |
| T-132 | Translate checkout / account / auth / emails | P2 | T-130 | Frontend | Same flows in 7 languages | NOT STARTED | — |
