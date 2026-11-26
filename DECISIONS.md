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
| 2026-11-25 | Seven languages (en, fr, es, de, ar, pt, it). English unprefixed (`/esim/japan`), others prefixed (`/fr/esim/japan`), `/en/...` 308-redirects to the clean URL. Routing in `apps/web/proxy.ts`, pages in `app/[lang]/` | One canonical URL per language; English URLs already shared stay stable |
| 2026-11-25 | No automatic redirect by browser language; visitors pick with the switcher | Stable, crawlable URLs; no surprise redirects |
| 2026-11-25 | Checkout, account, sign-in, orders and admin stay English-only for now (`app/(app)/`, own root layout `lang="en"`) | Ship localized discovery first; transactional copy needs careful review (T-132) |
| 2026-11-25 | Arabic: `dir="rtl"`, IBM Plex Sans Arabic, Latin digits for prices (`ar-u-nu-latn`); layout uses logical start/end utilities | Readable prices across markets; one layout for both directions |
| 2026-11-25 | Translations are machine-drafted (`apps/web/lib/i18n/dict/`) and need native review before launch (T-131) | Honest status; no unreviewed copy presented as final |

## 2026-11-26 — Light homepage, globe moves to /explore (Badr's request)
- Site is light (white, soft ice-blue panels, BLEUSIM blue CTAs) instead of the dark space theme; `data-theme="light"` is forced so OS dark mode doesn't darken pages. Brand blue/cyan plays the accent role Saily gives yellow (our logo colours, not theirs).
- Homepage is a Saily-style marketing page with original copy in 7 languages: hero + search, what is an eSIM, 9 popular countries (US, JP, TH, GB, TR, PT, FR, DE, NL) with Country/Region/Global tabs, features, two image cards, 3D-globe card, how it works, FAQ, CTA, footer. The full directory list was removed from home (it stays at /destinations).
- The 3D globe explorer now lives at `/explore`; old deep links `/?d=jp`, `/?r=…`, `/?g=1` redirect there (307).
- No reviews/ratings/app-store sections: we have none yet and must not fabricate them.
- Legal pages `/privacy`, `/terms`, `/cookies` are original DRAFTS in English (bracketed placeholders highlighted, draft banner shown) and need a lawyer before launch. Cookie page has working preferences (localStorage `bleusim.cookieConsent`); no analytics/marketing cookies exist today.
- Round flags: `public/flags/*.svg` from the `flag-icons` package (MIT, licence in `public/flags/LICENSE.txt`).

## 2026-11-26 — Pink accent, app concept in the hero, store buttons
- Pink (#FF3EA5, tint #FFE3F1, text #B0136A) is an accent only: one highlighted phrase in the hero headline (large text, AA-large), section kickers, confetti, "Coming soon" badges, app-screen details. Blue stays the main colour.
- Hero visual: Higgsfield photo of a hand holding a phone with a transparent screen (`hand-phone-confetti`, Badr's credits, 2026-11-26); the BLEUSIM app screen is coded (`components/home/AppPhone.tsx`), translated, placed behind the photo and scaled with container units. Labelled "App concept · coming soon". `hand-phone-studio` is kept as an alternative (`HERO_VARIANT`).
- App Store / Google Play buttons are look-alikes that are NOT links (no href, aria-disabled, "Coming soon") until the apps exist. No ratings, download counts or user numbers.

## 2026-11-26 — Mobile app (apps/mobile)
- Expo SDK 58 + Expo Router + TypeScript (per spec §22), in the pnpm workspace; reuses `@bleusim/geospatial`, `@bleusim/catalog` and `@bleusim/api-client`.
- Tabs: Home / My eSIMs / Help / Profile with a floating pill tab bar. Screens: search (countries, regions, cities), plans (best choice + list + activation info + coverage), email sign-in against the API, install/compat/network guide.
- Checkout and legal pages open the website in an in-app browser; Apple/Google sign-in and chat/feedback are shown as "Coming soon" (no provider setup yet). Sandbox prices are labelled.
- 7 languages; Arabic mirrors the layout with Yoga `direction: "rtl"` on the root view (works in Expo Go and builds, no restart). The tree is keyed by language so fonts/direction re-apply cleanly.
- Flags are 96px PNGs rendered from flag-icons (MIT). App icon: BLEUSIM planet on blue gradient.
- Run: `cd apps/mobile && npx expo start` (needs a `pnpm` on PATH for `expo install`). Dev builds reach the website at localhost:3000 and the API at localhost:4000.
