import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COUNTRIES, REGIONS, flagEmoji } from "@bleusim/geospatial";
import { CommerceShell } from "@/components/commerce/Shell";
import { serverCatalog, slugOf, INDEXABLE, langAlternates } from "@/lib/server-catalog";
import { formatPrice } from "@/lib/catalog-format";
import { fmt, intlLocale, isLocale, localePath } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";
export const revalidate = 300;
type P = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return { title: t.meta.destinationsTitle, description: t.meta.destinationsDescription, alternates: { canonical: localePath(lang, "/destinations"), languages: langAlternates("/destinations") }, robots: { index: INDEXABLE, follow: true } };
}
export default async function Page({ params }: P) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const il = intlLocale(lang);
  const dests = await serverCatalog.destinations();
  const rows = dests.map((d) => ({ d, c: COUNTRIES.find((c) => c.iso2 === d.iso2)! })).filter((x) => x.c).sort((a, b) => a.c.names[lang].localeCompare(b.c.names[lang], il));
  const fixture = dests.some((d) => d.source === "DEV_FIXTURE");
  const L = (p: string) => localePath(lang, p);
  return (
    <CommerceShell lang={lang}>
      <h1 className="font-display text-4xl font-semibold tracking-tight">{t.directory.title}</h1>
      {fixture && <p role="note" className="mt-2 text-sm text-amber-900">{t.directory.sandbox}</p>}
      <h2 className="mt-10 font-display text-xl font-semibold">{t.directory.regions}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">{REGIONS.map((r) => <li key={r.id}><a href={L(`/esim/region/${r.id}`)} className="inline-block rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--bg-subtle)]">{r.names[lang]}</a></li>)}<li><a href={L("/esim/global")} className="inline-block rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--bg-subtle)]">{t.common.global}</a></li></ul>
      <h2 className="mt-10 font-display text-xl font-semibold">{t.directory.countries}</h2>
      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {rows.map(({ d, c }) => (
          <li key={c.iso2}><a href={L(`/esim/${slugOf(c)}`)} className="flex items-center gap-3 rounded-xl border border-[var(--border)] px-4 py-3 hover:bg-[var(--bg-subtle)]"><span aria-hidden className="text-xl">{flagEmoji(c.iso2!)}</span><span className="flex-1">{c.names[lang]}</span><span className="text-sm text-[var(--fg-muted)]">{fmt(t.directory.from, { price: formatPrice(d.fromPrice.amount, d.fromPrice.currency, il) })}</span></a></li>
        ))}
      </ul>
    </CommerceShell>
  );
}
