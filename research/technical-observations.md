# Technical observations

- Next.js (robots disallows `/_next/data/`, allows `/_next/image`), SSR HTML contains full headings and copy (good SEO).
- Locale prefixes (`/fr/`, `/de/`, …) with per-locale sitemaps; English at root.
- Help center on Zendesk (`support.saily.com/hc/...`).
- App links via AppsFlyer OneLink (`saily.onelink.me`).
- Plan selection likely keyed by `?planId=` (disallowed in robots) — deep-linkable plans.
- Data and checkout are behind `/api/` and `/checkout` — not inspected.
