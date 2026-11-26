import { devFixtureCatalog, type CatalogProvider, type DestinationSummary, type Plan } from "@bleusim/catalog";
import { createApiClient } from "@bleusim/api-client";
import { COUNTRIES, REGIONS, type Locale } from "@bleusim/geospatial";
import { useEffect, useState } from "react";
import { intlLocale } from "@/i18n";
import { MEDIA } from "./media";

// Catalog from the API when EXPO_PUBLIC_API_URL is set; otherwise the labelled DEV FIXTURE (sandbox) catalog.
const remote = process.env.EXPO_PUBLIC_API_URL ? createApiClient(process.env.EXPO_PUBLIC_API_URL).catalog : null; // the client adds /v1 itself
async function withFallback<T>(fn: (c: CatalogProvider) => Promise<T>): Promise<T> {
  if (remote) { try { return await fn(remote); } catch { /* API down → fixture */ } }
  return fn(devFixtureCatalog);
}
export const catalog = {
  destinations: () => withFallback((c) => c.listDestinations()),
  plans: (dest: string) => withFallback((c) => dest === "global" ? c.globalPlans() : dest.startsWith("region:") ? c.plansForRegion(dest.slice(7)) : c.plansForCountry(dest)),
};
export type { Plan, DestinationSummary };

/** In Arabic the price is shown as a left-to-right island ("$31.09"), not "US$" reordered by the RTL text. */
export const formatPrice = (amount: number, currency: string, l: Locale) =>
  l === "ar" ? `\u2066${new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)}\u2069` : new Intl.NumberFormat(intlLocale(l), { style: "currency", currency }).format(amount);
export const cheapest = (plans: Plan[]) => plans.reduce<Plan | null>((a, b) => (!a || b.price.amount < a.price.amount ? b : a), null);

/** Display name for "JP", "region:europe" or "global". */
export function destName(dest: string, l: Locale, globalLabel: string) {
  if (dest === "global") return globalLabel;
  if (dest.startsWith("region:")) return REGIONS.find((r) => r.id === dest.slice(7))?.names[l] ?? dest;
  return COUNTRIES.find((c) => c.iso2 === dest)?.names[l] ?? dest;
}

/** Small async hook with reload. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, set] = useState<{ data?: T; error?: unknown; loading: boolean }>({ loading: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    let live = true;
    set((s) => ({ ...s, loading: true, error: undefined }));
    fn().then((data) => live && set({ data, loading: false }), (error) => live && set({ error, loading: false }));
    return () => { live = false; };
  }, [...deps, n]); // eslint-disable-line react-hooks/exhaustive-deps
  return { ...state, reload: () => setN((x) => x + 1) };
}

/** Illustrative photo (Higgsfield) for "JP", "region:europe" or "global", when one exists. */
export function destImage(dest: string): number | undefined {
  if (dest === "global") return MEDIA["global"];
  if (dest.startsWith("region:")) return MEDIA[`region-${dest.slice(7)}`];
  return MEDIA[`dest-${dest.toLowerCase()}`];
}
