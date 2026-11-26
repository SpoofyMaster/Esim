import Constants from "expo-constants";
// Website (checkout, legal pages, 3D explorer) and API. In development the simulator reaches the Mac at localhost.
const extra = (Constants.expoConfig?.extra ?? {}) as { webUrl?: string };
export const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? (__DEV__ ? "http://localhost:3000" : extra.webUrl ?? "https://bleusim.com");
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? (__DEV__ ? "http://localhost:4000" : "https://api.bleusim.com");
export const POPULAR = ["US", "JP", "TH", "GB", "TR", "PT", "FR", "DE", "NL", "MA"];
export const BEST = ["US", "JP", "TH", "MA"];
