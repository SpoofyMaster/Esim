// Catalog access: the BLEUSIM API when EXPO_PUBLIC_API_URL is set, otherwise the DEV FIXTURE provider.
// Geography (names, regions) always comes from @bleusim/geospatial; commercial coverage only from the catalog.
import { useCallback, useEffect, useState } from "react";
import { devFixtureCatalog, type CatalogProvider, type DestinationSummary, type Plan } from "@bleusim/catalog";
import { createApiClient } from "@bleusim/api-client";
import { COUNTRIES, REGIONS, countryByIso2, createSearch, type Locale } from "@bleusim/geospatial";
import { API_URL, hasApi } from "./config";

export const catalog: CatalogProvider = hasApi ? createApiClient(API_URL).catalog : devFixtureCatalog;

/** Destination route id: "jp", "region-europe" or "global". */
export type DestKey = { kind: "country"; iso2: string } | { kind: "region"; id: string } | { kind: "global" };
export function parseDest(id: string): DestKey {
  if (id === "global") return { kind: "global" };
  if (id.startsWith("region-")) return { kind: "region", id: id.slice(7) };
  return { kind: "country", iso2: id.toUpperCase() };
}
export const destId = (d: DestKey) => (d.kind === "global" ? "global" : d.kind === "region" ? `region-${d.id}` : d.iso2.toLowerCase());

const GLOBAL_NAMES: Record<Locale, string> = { en: "Global", fr: "Monde", es: "Global", de: "Weltweit", ar: "عالمي", pt: "Global", it: "Globale" };
export function destName(d: DestKey, l: Locale): string {
  if (d.kind === "global") return GLOBAL_NAMES[l];
  if (d.kind === "region") return REGIONS.find((r) => r.id === d.id)?.names[l] ?? d.id;
  return countryByIso2(d.iso2)?.names[l] ?? d.iso2;
}
export function plansFor(d: DestKey): Promise<Plan[]> {
  if (d.kind === "global") return catalog.globalPlans();
  if (d.kind === "region") return catalog.plansForRegion(d.id);
  return catalog.plansForCountry(d.iso2);
}

/** Popular countries, in Badr's order for the home page. */
export const POPULAR = ["US", "JP", "TH", "GB", "TR", "PT", "FR", "DE", "NL"];
/** Region cards shown in the app (geographic ids shared with the web globe). */
export const APP_REGIONS = ["europe", "asia", "middle-east", "africa", "north-america", "latin-america", "oceania"];

export const search = createSearch(COUNTRIES, REGIONS);

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data?: T; error?: unknown; loading: boolean }>({ loading: true });
  const [n, setN] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: undefined }));
    run().then((data) => alive && setState({ data, loading: false }), (error) => alive && setState({ error, loading: false }));
    return () => { alive = false; };
  }, [run, n]);
  return { ...state, reload: () => setN((x) => x + 1) };
}

let destCache: Promise<DestinationSummary[]> | null = null;
export function useDestinations() {
  return useAsync(() => (destCache ??= catalog.listDestinations().catch((e) => { destCache = null; throw e; })), []);
}

/** Cheapest plan of a list, for "From" prices on region/global cards. */
export const cheapest = (plans: Plan[]) => plans.reduce<Plan | undefined>((a, p) => (!a || p.price.amount < a.price.amount ? p : a), undefined);

export function dataLabel(p: Plan, t: { common: { gb: string; unlimited: string } }) {
  return p.dataGb === null ? t.common.unlimited : t.common.gb.replace("{n}", String(p.dataGb));
}
