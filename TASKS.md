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
| T-031 | Provider adapter interface + sandbox provider | P0 | T-030 | eSIM | provision/usage/top-up in sandbox | PENDING | — |
| T-032 | Supplier research (eSIM Go, 1GLOBAL, Gigs, …) from official docs | P1 | — | eSIM | comparison doc | PENDING | — |
| T-040 | Stripe test-mode checkout + webhooks + idempotency | P0 | T-030 | Payments | sandbox order end to end | PENDING | — |
| T-050 | Higgsfield cinematic assets | P2 | approval | Creative | registry entries | BLOCKED (budget approval) | — |
| T-060 | GitHub repo + CI | P1 | approval | DevOps | pushed, CI green | BLOCKED (approval) | — |
