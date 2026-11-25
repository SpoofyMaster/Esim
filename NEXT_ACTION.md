# Next action

Done this session: API (Fastify) + Prisma schema/migration/seed; web reads catalog from API when NEXT_PUBLIC_API_URL is set.

Local run: `service postgresql start && service redis-server start`; DB `bleusim/bleusim_dev`; `cd packages/database && npx prisma migrate deploy && npx tsx src/seed.ts`; `cd apps/api && npx tsx src/server.ts` (:4000); `NEXT_PUBLIC_API_URL=http://localhost:4000 pnpm --filter @bleusim/web build && start`.

1. Provider adapter interface + sandbox provider (provision → ICCID + LPA, usage, top-up), `packages/provider-adapters` (T-031).
2. Orders + sandbox payments: POST /v1/checkout (idempotency key), payment webhook stub with signature check, provisioning job (Redis queue), order state machine + tests (T-040).
3. SSR destination pages `/esim/[slug]`, region, global + sitemap/metadata/JSON-LD.
4. Checkout UI wired to the panel's Continue button (sandbox).
5. Keyboard globe controls (T-016).
6. Pending Badr: GitHub repo (B-1), Higgsfield 180-credit budget (B-2), Western Sahara policy (B-5).
