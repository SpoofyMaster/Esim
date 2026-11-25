# Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-11-25 | pnpm monorepo, Next 16 / React 19 / R3F 9 / three 0.187 / Tailwind 4 | Spec §23 stack, current stable versions |
| 2026-11-25 | Earth textures from `three-globe` npm (NASA Blue/Black Marble derivatives, MIT package; NASA imagery public domain) | Only legitimate source reachable from the container; upgrade to 8k NASA originals later |
| 2026-11-25 | Country geometry: Natural Earth 50m via `world-atlas` | Public domain, ISO numeric ids |
| 2026-11-25 | GPU id-map + CPU geoContains picking | Exact picking, single draw call highlighting |
| 2026-11-25 | Art-directed sun fixed to camera (real-time sun = later option) | Visible hemisphere always lit, terminator + city lights on the limb |
| 2026-11-25 | Sandbox catalog with visible "development fixtures" label; Continue button disabled until commerce milestone | Spec §15/§35/§43 |
| 2026-11-25 | Display font Sora + Inter body (OFL, self-hosted via @fontsource) | Distinct, legible, no Google Fonts network dependency |
| 2026-11-25 | ~~Default boundaries = Natural Earth de facto (Western Sahara separate) pending Badr's choice~~ superseded below | Spec §13 "configurable"; business decision |
| 2026-11-25 | API on Fastify 5 + zod instead of NestJS | Spec allows 'NestJS or equivalent'. Nest DI needs decorator metadata, which conflicts with the ESM/TS-source workspace packages (tsx/esbuild). Fastify keeps one module system, is production-grade, fast, and has helmet/cors/rate-limit plugins |
| 2026-11-25 | Prisma 7.10.1 (stable) with driver adapter `@prisma/adapter-pg`, client generated into packages/database/src/generated | 8.x is still RC |
| 2026-11-25 | Money in minor units (Int) + ISO currency; activation material stored encrypted | Precision + spec §32 |
| 2026-11-25 | Morocco shown as one country including its Sahara provinces: Natural Earth "W. Sahara" merged into Morocco at data build (no internal border, no separate pick/search entry; "Sahara", "Laayoune", "Dakhla" resolve to Morocco) | Badr's decision, 2026-11-25 20:08 UTC |
| 2026-11-25 | Code hosted at github.com/SpoofyMaster/Esim (private), CI on GitHub Actions | Badr created the repo |
| 2026-11-25 | Higgsfield: Badr approved spending the full credit balance on brand/hero assets | Badr, 2026-11-25 20:08 UTC |
| 2026-11-25 | Back office lives at `/admin` inside apps/web for now (not a separate apps/admin) | Same session cookie and design system, one deploy; split later if the team or attack surface grows |
| 2026-11-25 | Staff roles: SUPPORT (orders, eSIMs, retry provisioning), CATALOG_MANAGER (plans, view suppliers), FINANCE (orders, overview), ADMIN (all). Enforced in `apps/api/src/routes/admin.ts`; first admin only via `pnpm --filter @bleusim/api grant-role` | Least privilege; no HTTP path to self-promote |
