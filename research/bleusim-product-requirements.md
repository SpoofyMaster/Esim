# BLEUSIM product requirements (v0.1, from research + master spec)

## Positioning
Saily wins on search-first simplicity and one-template scale. BLEUSIM keeps that clarity for buying (Universe B) and adds what nobody in the category has: the Earth as a live, synchronized discovery surface (Universe A).

## Information architecture (v1)
- `/` cinematic globe + search · `/explore` full-screen globe explorer
- `/destinations` directory · `/esim/[country]` (e.g. `/esim/japan`) · `/esim/region/[region]` · `/esim/global`
- `/plans/[planId]` (deep-linkable, server-rendered)
- `/how-it-works`, `/install`, `/devices`, `/why-bleusim`, `/about`, `/contact`, `/faq`, `/help`, `/help/[article]`, `/blog`, `/guides`, `/affiliate`, `/referral`, `/business`, `/app`
- Auth: `/login`, `/register`, `/forgot-password`
- Commerce: `/cart`, `/checkout`, `/checkout/success`, `/checkout/failed`, `/orders/[id]`
- Account: `/account` (+ `esims`, `usage`, `top-up`, `orders`, `invoices`, `notifications`, `referral`, `support`, `profile`, `privacy`)
- Legal: terms, privacy, cookies, refunds, acceptable-use (flagged for legal review)
- Locale prefix: `/{en|fr|es|de|ar|pt|it}/…` with hreflang; Arabic RTL.

## Catalog data model must carry (per supplier plan)
data allowance (or unlimited + fair-use rule), validity days, price + currency, coverage ISO list, networks per country + technology (4G/5G), activation policy (on arrival / on install / window days), hotspot, top-up availability, SMS/voice (none in v1), KYC requirement, supplier id + wholesale cost. All values come from the supplier sync or from fixtures labelled `DEV FIXTURE`.

## Must-have journeys (acceptance)
1. Search "Japan" → globe flies to Japan, highlights it, panel shows plans → select plan → checkout (sandbox) → order confirmation with QR + manual details + "install before you fly" checklist.
2. Click any country on the globe → same panel. Drag never selects.
3. Select "Europe" → globe frames Europe, highlights all covered countries → regional plans.
4. No-WebGL / reduced-motion / keyboard → complete purchase without the globe.
5. Account: see eSIM status, remaining data (sandbox provider), top up.

## Differentiators vs Saily
Live coverage visualization on the globe; one-screen plan-to-checkout bottom sheet on mobile; first-class web account management; transparent activation rules before payment; honest data (no invented reviews or counts).

## Out of scope v1
Phone numbers, VPN/security features, subscriptions with travel perks, cruise plans, business dashboard.
