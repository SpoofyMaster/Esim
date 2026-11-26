import type { MetadataRoute } from "next";
import { COUNTRIES, REGIONS } from "@bleusim/geospatial";
import { serverCatalog, SITE, slugOf } from "@/lib/server-catalog";
import { LOCALES, localePath } from "@/lib/i18n";
export const revalidate = 3600;
type Freq = MetadataRoute.Sitemap[number]["changeFrequency"];
// One entry per language version, each listing all its alternates (hreflang in the sitemap).
const entries = (path: string, changeFrequency: Freq, priority: number): MetadataRoute.Sitemap => {
  const languages = { ...Object.fromEntries(LOCALES.map((l) => [l, SITE + localePath(l, path)])), "x-default": SITE + path };
  return LOCALES.map((l) => ({ url: SITE + localePath(l, path), changeFrequency, priority, alternates: { languages } }));
};
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dests = await serverCatalog.destinations();
  const countries = dests.map((d) => COUNTRIES.find((c) => c.iso2 === d.iso2)).filter(Boolean);
  return [
    ...entries("/", "weekly", 1),
    ...entries("/destinations", "daily", 0.9),
    ...entries("/explore", "weekly", 0.6),
    ...["/privacy", "/terms", "/cookies"].flatMap((p) => entries(p, "yearly", 0.2)),
    ...entries("/esim/global", "daily", 0.8),
    ...REGIONS.flatMap((r) => entries(`/esim/region/${r.id}`, "daily", 0.8)),
    ...countries.flatMap((c) => entries(`/esim/${slugOf(c!)}`, "daily", 0.7)),
  ];
}
