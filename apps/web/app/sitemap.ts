import type { MetadataRoute } from "next";
import { COUNTRIES, REGIONS } from "@bleusim/geospatial";
import { serverCatalog, SITE, slugOf } from "@/lib/server-catalog";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dests = await serverCatalog.destinations();
  const countries = dests.map((d) => COUNTRIES.find((c) => c.iso2 === d.iso2)).filter(Boolean);
  return [
    { url: SITE + "/", changeFrequency: "weekly", priority: 1 },
    { url: SITE + "/destinations", changeFrequency: "daily", priority: 0.9 },
    { url: SITE + "/esim/global", changeFrequency: "daily", priority: 0.8 },
    ...REGIONS.map((r) => ({ url: `${SITE}/esim/region/${r.id}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ...countries.map((c) => ({ url: `${SITE}/esim/${slugOf(c!)}`, changeFrequency: "daily" as const, priority: 0.7 })),
  ];
}
