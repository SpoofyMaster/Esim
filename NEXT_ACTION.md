# Next action (updated 2026-11-26 20:00 UTC)

Done 2026-11-26: mobile app `apps/mobile` (Expo SDK 58): Home, Search, Plans, Checkout → sandbox payment → Order with QR (verified end to end against the local API), My eSIMs, Help + guides, Profile, 7 languages with Arabic RTL. Web preview export runs in CI.
Mobile next: run on a real phone with Expo Go (Badr's Mac), Apple/Google/Microsoft sign-in (needs developer accounts, ask Badr), token auth for native instead of the session cookie, push notifications for low data, EAS builds + store listings (ask Badr before any signup or submission).

---
# Next action (updated 2026-11-26 13:40 UTC)

Done 2026-11-26: light redesign (white theme, new home sections, footer), legal drafts at /privacy /terms /cookies with a working cookie preference. Open: B-7 legal details.

Done this step: SSR destination pages + SEO; Western Sahara merged into Morocco; repo on GitHub (SpoofyMaster/Esim) with CI; Higgsfield assets (600 credits) wired into pages.

Next, in order:
1. ~~Admin dashboard~~ done 2026-11-25 (/admin). Follow-ups: staff MFA, refunds UI (needs real payments), support tickets.
2. ~~i18n UI with Arabic RTL (milestone 13)~~ done 2026-11-25: 7 languages on the globe, search, panel and destination pages; hreflang + sitemap alternates. Follow-ups: native review of all translations (Arabic first), translate checkout/account/auth (English-only today), localized image alt text, mirror the globe offset in RTL.
3. Email verification + password reset (T-072), Redis provisioning queue (T-042).
4. Use the vertical Earth video + brand banner for app splash / OG images when the mobile app starts.

---
# Next action

Done this session: API (Fastify) + Prisma schema/migration/seed; web reads catalog from API when NEXT_PUBLIC_API_URL is set.

Local run: `service postgresql start && service redis-server start`; DB `bleusim/bleusim_dev`; `cd packages/database && npx prisma migrate deploy && npx tsx src/seed.ts`; `cd apps/api && npx tsx src/server.ts` (:4000); `NEXT_PUBLIC_API_URL=http://localhost:4000 pnpm --filter @bleusim/web build && start`.

Done: sandbox purchase end to end (checkout → simulated payment → signed webhook → provisioning → order page with QR).
1. DONE: accounts, My eSIMs, usage, top-ups. Next: SSR destination pages + SEO (below), then admin dashboard (milestone 12).
2. Provisioning queue on Redis + reconciliation (T-042).
3. SSR destination pages `/esim/[slug]`, region, global + sitemap/metadata/JSON-LD.
4. Checkout UI wired to the panel's Continue button (sandbox).
5. Keyboard globe controls (T-016).
6. Pending Badr: GitHub repo (B-1), Higgsfield 180-credit budget (B-2), Western Sahara policy (B-5).
