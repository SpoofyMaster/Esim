import "server-only";
import { devFixtureCatalog, type Plan } from "@bleusim/catalog";
import { createApiClient } from "@bleusim/api-client";
import { COUNTRIES, REGIONS } from "@bleusim/geospatial";
import { slugOf } from "./slug";
import { LOCALES, localePath } from "./i18n";

// Server-side catalog: API when API_URL (or NEXT_PUBLIC_API_URL) is set, otherwise the DEV FIXTURE provider.
const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
const cachedFetch: typeof fetch = (input, init) => fetch(input, { ...init, next: { revalidate: 300 } } as RequestInit);
const remote = API ? createApiClient(API, cachedFetch).catalog : null;

async function withFallback<T>(fn: (c: typeof devFixtureCatalog) => Promise<T>): Promise<T> {
  if (remote) { try { return await fn(remote); } catch { /* API down at build/request time → fixture */ } }
  return fn(devFixtureCatalog);
}
export const serverCatalog = {
  destinations: () => withFallback((c) => c.listDestinations()),
  country: (iso2: string) => withFallback((c) => c.plansForCountry(iso2)),
  region: (id: string) => withFallback((c) => c.plansForRegion(id)),
  global: () => withFallback((c) => c.globalPlans()),
};

export const SITE = process.env.SITE_URL ?? "https://bleusim.com";
/** Indexing stays off until real supplier offers replace the sandbox catalog. */
export const INDEXABLE = process.env.SITE_INDEXABLE === "true";

export { slugOf };
export const countryBySlug = (slug: string) => COUNTRIES.find((c) => c.iso2 && slugOf(c) === slug);
export const regionById = (id: string) => REGIONS.find((r) => r.id === id);
export type { Plan };

/** hreflang map for a locale-free path: every language version plus x-default (English, unprefixed). */
export const langAlternates = (path: string) => ({ ...Object.fromEntries(LOCALES.map((l) => [l, localePath(l, path)])), "x-default": path });
