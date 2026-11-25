# Design system (v0)

Tokens: `packages/design-tokens` (TS + CSS). 
- **Palette.** Space navy 950–600 (#010714 → #1D3A6B; brand base #020B1F, #06152E), Electric Blue 600/500/400/300 (#0057FF primary, CTA), Connectivity Cyan 500–200 (#39C6FF accents, focus ring), Ice neutrals 50–900 (#F4F8FF text on dark). Status: success #18B26B, warning #F5A524, danger #E5484D.
- **Type.** Display: Sora (variable, OFL) — headlines, plan sizes, wordmark. UI/body: Inter (variable, OFL). Arabic: IBM Plex Sans Arabic. Headline 64/1.04, tracking −3 %; eyebrow 12 px uppercase tracking 0.22em.
- **Radius.** 6/10/14/20/28/pill. Cards 16–24, panels 24.
- **Glass.** Navy gradient 72–78 % + 18 px blur + 1 px cyan hairline (14 %). Used only on overlays above the globe.
- **Motion.** ease-out-expo `cubic-bezier(.16,1,.3,1)`; reveals 0.9 s staggered 100 ms; camera flights 1.7 s power3.inOut; reduced-motion = no reveals, instant flights, no auto-rotate.
- **Logo v0 "Orbit".** Planet disc (cyan→blue→navy gradient) crossed by an orbit line with a glowing node; wordmark BLEU (semibold) + SIM (regular, cyan), letter-spaced 0.08em. Files: `apps/web/components/brand/Logo.tsx`, `apps/web/public/brand/favicon.svg`.
- **Universes.** A: dark cinematic (home, explorer, marketing). B: light/dark commerce surfaces using semantic vars `--bg --fg --border --accent`.
- Accessibility: focus ring 2 px cyan, AA contrast for text on navy (ice-300+ for body), all controls keyboard reachable.
