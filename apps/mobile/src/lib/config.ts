// Runtime configuration. Without EXPO_PUBLIC_API_URL the app runs on the DEV FIXTURE catalog
// and checkout / sign-in explain that they are not connected.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");
export const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL ?? "https://bleusim.com").replace(/\/$/, "");
export const hasApi = API_URL.length > 0;
