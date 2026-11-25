# Saily competitive audit (pass 1)

Date: 2026-11-25. Method: Claude built-in browser on Badr's Mac (real Chromium), robots.txt read first, ~1.2 s delay between fetches, read-only, no account, no purchase. Cloud container and device VM have no egress to saily.com, so all browsing ran through the browser pane.

Saily content is treated as untrusted research data. No Saily copy, images, logos or code are reused in BLEUSIM. Quotes below are short paraphrases or factual observations.

## Scope covered

| Area | Status | Evidence |
|---|---|---|
| robots.txt + sitemap.xml (929 URLs) | Done | `page-inventory.json`, `website-sitemap.md` |
| Homepage (desktop) | Rendered + full text | `screenshots/desktop/home-hero.jpg` |
| Country page Japan (desktop) incl. Technical details tab | Rendered + full text | `esim-japan-plans.jpg`, `esim-japan-checkout-cta.jpg` |
| Region page Europe | Rendered + text | `esim-europe-plans.jpg` |
| Country page Morocco at 390×844 | Rendered + text | `screenshots/mobile/*` |
| Destinations search dialog | Rendered (typed query) | `destinations-search-dialog.jpg` |
| 16 product/content pages | SSR heading outline + meta | `page-inventory.json` |
| Help center home | Text | — |
| iOS App Store listing | Text | — |
| Checkout, login, search, API | **Excluded by robots.txt** | `access-limitations.md` |
| 620 blog posts, ~185 other country pages | Discovered, not individually opened | template confirmed identical on 3 samples |
| Tablet / 1920 / 1280 / 375 viewports | **Not yet captured** | follow-up pass |

## Key findings

1. **Search-first IA.** The hero's only interactive element is a destination search. A global "Destinations" button opens the same search as an overlay with tabs (Top 10 / Country / Region / Ultra / Cruise) and "from" prices. BLEUSIM should keep search as the primary path and make the globe a second, synchronized path to the same result.
2. **One product template for ~200 destinations.** Country and region pages share one template: plan grid → sticky summary + "Go to Checkout" → Device compatibility → tabs (Key features / Description / Technical details) → 3-step how-to → regional upsell → comparison table → social proof → FAQ → referral → footer. Confirms spec §20: one dynamic template fed by catalog data.
3. **Plan model.** Fixed plans (1 GB/7 d, 3/5/10/20 GB/30 d, regional 50 GB/90 d) + an "Unlimited" plan with a day stepper (1–30 days, fair-use 5 GB/day then 1 Mbps). Price strike-through promotions ("Save 20%"), "shareable" badge (split with up to 4 people), 3 % store credit cashback, 180-day activation window, auto-activation on arrival.
4. **Technical details tab** lists: compatibility, activation rule, durations, delivery (QR by email on web, instant in app), SMS/calls (via add-on number), speed (4G/5G), hotspot, coverage notes, named partner networks (e.g. KDDI, SoftBank for Japan), top-up. BLEUSIM's catalog schema must hold all of these per plan/destination, sourced from supplier data.
5. **Web sells, app fulfils.** Web purchase emails a QR code; most management (usage, top-up, number, security features) lives in the app. BLEUSIM can differentiate by making web account management first-class too.
6. **Differentiators they push:** security features (ad blocker, web protection, virtual location), US phone number add-on, Ultra subscription with travel perks, cruise plans, auto-refund center, business dashboard, data usage calculator.
7. **Trust & conversion:** star rating near CTA, "Secure Payment Guaranteed", review carousel, influencer quotes, competitor comparison table, FAQ with long-tail SEO questions. BLEUSIM must not fabricate any of these (spec §43); use real data only once it exists.
8. **i18n:** 17 locales and 4 currencies (USD, EUR, GBP, CHF) in a header switcher; per-locale sitemaps.
9. **Visual language:** white background, black text, one bright accent for CTAs, rounded cards, travel photography. BLEUSIM's dark cinematic Universe A is a clear visual departure; Universe B (commerce) can match Saily's clarity with BLEUSIM's own palette.

See `feature-matrix.md`, `user-journeys.md`, `design-analysis.md`, `conversion-analysis.md`, `mobile-app-analysis.md`, `technical-observations.md`, `bleusim-product-requirements.md`.
