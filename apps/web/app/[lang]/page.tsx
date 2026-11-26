import { notFound } from "next/navigation";
import { COUNTRIES, REGIONS } from "@bleusim/geospatial";
import { Landing } from "@/components/home/Landing";
import type { TabDef } from "@/components/home/DestinationTabs";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter, POPULAR_ISO } from "@/components/site/SiteFooter";
import { serverCatalog, slugOf } from "@/lib/server-catalog";
import { formatPrice } from "@/lib/catalog-format";
import { fmt, intlLocale, isLocale, localePath } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";
import type { Plan } from "@bleusim/catalog";

export const revalidate = 300;

// Light marketing homepage. The interactive 3D globe lives at /explore.
export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang).landing;
  const il = intlLocale(lang);
  const L = (p: string) => localePath(lang, p);
  const price = (p: { amount: number; currency: string }) => fmt(t.from, { price: formatPrice(p.amount, p.currency, il) });
  const cheapest = (plans: Plan[]) => plans.reduce<Plan | null>((a, b) => (!a || b.price.amount < a.price.amount ? b : a), null);

  const [dests, regionPlans, globalPlans] = await Promise.all([
    serverCatalog.destinations(),
    Promise.all(REGIONS.map((r) => serverCatalog.region(r.id))),
    serverCatalog.global(),
  ]);
  const fromByIso = new Map(dests.map((d) => [d.iso2, d.fromPrice]));

  const tabs: TabDef[] = [
    {
      id: "country", label: t.tabCountry,
      cards: POPULAR_ISO.map((iso) => COUNTRIES.find((c) => c.iso2 === iso)).filter((c) => !!c).map((c) => {
        const p = fromByIso.get(c.iso2!);
        return { key: c.iso2!, title: c.names[lang], sub: p ? price(p) : getDict(lang).common.notAvailable, href: L(`/esim/${slugOf(c)}`), flag: `/flags/${c.iso2!.toLowerCase()}.svg` };
      }),
    },
    {
      id: "region", label: t.tabRegion,
      cards: REGIONS.map((r, i) => {
        const plans = regionPlans[i] ?? [];
        const c = cheapest(plans);
        const n = plans[0]?.coverage.length ?? 0;
        return { key: r.id, title: r.names[lang], sub: c ? `${price(c.price)} · ${fmt(t.countriesN, { n })}` : getDict(lang).common.notAvailable, href: L(`/esim/region/${r.id}`), image: `/media/region-${r.id}-16x9-1200.webp` };
      }),
    },
    {
      id: "global", label: t.tabGlobal,
      cards: [{ key: "global", title: getDict(lang).common.global, sub: (() => { const c = cheapest(globalPlans); return c ? `${price(c.price)} · ${fmt(t.countriesN, { n: c.coverage.length })}` : t.globalBody; })(), href: L("/esim/global") }],
    },
  ];

  return (
    <>
      <SiteHeader lang={lang} />
      <Landing lang={lang} tabs={tabs} />
      <SiteFooter lang={lang} />
    </>
  );
}
