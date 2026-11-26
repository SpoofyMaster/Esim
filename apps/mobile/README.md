# BLEUSIM mobile app (iOS + Android)

Expo SDK 58, Expo Router, React Native 0.88. Light "Universe B" look with BLEUSIM blue, cyan and a pink accent.

Screens: Home (Earth hero, search, popular destinations, regional carousel, global card, why BLEUSIM) · Search (countries, regions, cities; Dakhla/Laayoune resolve to Morocco) · Plans (best-choice unlimited card, data plans, activation rule, coverage) · Checkout (sandbox payment through the API) · Order (QR code + LPA) · My eSIMs · Help + guides · Profile · Language (7 languages, Arabic right-to-left).

## Data
- No `EXPO_PUBLIC_API_URL`: DEV FIXTURE catalog, labelled "Sandbox"; checkout and sign-in say they are not connected. No fake orders.
- `EXPO_PUBLIC_API_URL=http://<host>:4000`: catalog, checkout, order and account from the BLEUSIM API (start it with `CORS_ORIGINS` including the web preview origin).
- Apple / Google / Microsoft sign-in buttons show "arrives with the store release": they need developer accounts (ask Badr).

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
`node scripts/prepare-assets.mjs` regenerates round flags (circle-flags, MIT; no Western Sahara flag, it is part of Morocco), Higgsfield images (from `apps/web/public/media`, illustrative) and the app icon / splash from the Orbit symbol.
