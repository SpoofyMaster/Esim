import type { Country } from "@bleusim/geospatial";
// Shared by server pages and client components so the globe panel links to the same URL the page lives at.
const SLUG_OVERRIDES: Record<string, string> = { US: "united-states", GB: "united-kingdom", AE: "united-arab-emirates", KR: "south-korea", CZ: "czechia" };
export const slugOf = (c: Country) => (c.iso2 && SLUG_OVERRIDES[c.iso2]) || c.names.en.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
