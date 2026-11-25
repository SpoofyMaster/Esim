# Next action

1. Milestone 07: scaffold `apps/api` (NestJS) + `packages/database` (Prisma schema for users, destinations, suppliers, plans, orders, payments, esim_profiles, usage, top-ups, promotions, tickets, webhooks, audit logs) with migrations against local Postgres 16; seed from DEV FIXTURE.
2. Move catalog reads in `apps/web` to the API via `packages/api-client`.
3. SSR destination pages `/esim/[country]`, region and global pages with metadata, JSON-LD, sitemap.
4. Keyboard globe controls (T-016).
5. After approvals: GitHub repo + CI (B-1), Higgsfield budget (B-2).
