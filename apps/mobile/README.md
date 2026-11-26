# BLEUSIM mobile app (iOS + Android)

Expo SDK 58, Expo Router, React Native 0.88. Base: the app built and simulator-tested on Badr's Mac; merged with the cloud version on 2026-11-26 (in-app checkout → order QR, photo banners, region carousel, all round flags, sandbox labels, web export).

Screens: Home (blue hero card, search, best options, regional photo carousel, global) · Search (countries, regions, cities; Dakhla/Laayoune resolve to Morocco) · Plans (photo banner, best-choice card, data plans, activation rule, coverage) · Checkout (sandbox payment through the API) · Order (QR code + LPA) · My eSIMs · Help · Guide · Profile (language, legal). 7 languages, Arabic right-to-left; `bleusim://?lang=xx` deep link.

## Data
- Dev builds call the API at localhost:4000 (`EXPO_PUBLIC_API_URL` overrides). If it can't be reached the catalog falls back to the DEV FIXTURE (labelled "Sandbox") and checkout says it can't reach the server. No fake orders.
- `EXPO_PUBLIC_API_URL=http://<host>:4000`: catalog, checkout, order and account from the BLEUSIM API (start it with `CORS_ORIGINS` including the web preview origin).
- Apple / Google sign-in show "Coming soon": they need developer accounts (ask Badr).

## Run
```
pnpm install
cd apps/mobile
npx expo start                 # scan with Expo Go on a phone (same Wi-Fi)
npx expo start --web           # browser preview
CI=1 EXPO_OFFLINE=1 npx expo export --platform web --output-dir dist
node scripts/serve-dist.mjs dist & NODE_PATH=$(npm root -g) node scripts/screens.cjs screens   # PNGs; QA copies are saved as JPG
```
`EXPO_OFFLINE=1` is needed in the cloud container (api.expo.dev is blocked). Store builds use EAS (`npx eas-cli build`) and need Apple/Google developer accounts: not set up.

## Assets
`node scripts/prepare-assets.mjs` regenerates round flags (circle-flags, MIT; no Western Sahara flag, it is part of Morocco) into `src/lib/flags.ts` and Higgsfield images (from `apps/web/public/media`, illustrative) into `src/lib/media.ts`.
