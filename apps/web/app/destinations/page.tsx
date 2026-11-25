import type { Metadata } from "next";
import { COUNTRIES, REGIONS, flagEmoji } from "@bleusim/geospatial";
import { CommerceShell } from "@/components/commerce/Shell";
import { serverCatalog, slugOf, INDEXABLE, langAlternates } from "@/lib/server-catalog";
import { formatPrice } from "@/lib/catalog-format";
export const revalidate = 300;
export const metadata: Metadata = { title: "All destinations", description: "Every country, region and global eSIM BLEUSIM offers, with starting prices.", alternates: { canonical: "/destinations", languages: langAlternates("/destinations") }, robots: { index: INDEXABLE, follow: true } };
export default async function Page() {
  const dests = await serverCatalog.destinations();
  const rows = dests.map((d) => ({ d, c: COUNTRIES.find((c) => c.iso2 === d.iso2)! })).filter((x) => x.c).sort((a, b) => a.c.names.en.localeCompare(b.c.names.en));
  const fixture = dests.some((d) => d.source === "DEV_FIXTURE");
  return (
    <CommerceShell>
      <h1 className="font-display text-4xl font-semibold tracking-tight">All destinations</h1>
      {fixture && <p role="note" className="mt-2 text-sm text-amber-900 dark:text-amber-200">Sandbox catalog: coverage and prices are development fixtures.</p>}
      <h2 className="mt-10 font-display text-xl font-semibold">Regions</h2>
      <ul className="mt-3 flex flex-wrap gap-2">{REGIONS.map((r) => <li key={r.id}><a href={`/esim/region/${r.id}`} className="inline-block rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-white/5">{r.names.en}</a></li>)}<li><a href="/esim/global" className="inline-block rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-white/5">Global</a></li></ul>
      <h2 className="mt-10 font-display text-xl font-semibold">Countries</h2>
      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {rows.map(({ d, c }) => (
          <li key={c.iso2}><a href={`/esim/${slugOf(c)}`} className="flex items-center gap-3 rounded-xl border border-[var(--border)] px-4 py-3 hover:bg-white/5"><span aria-hidden className="text-xl">{flagEmoji(c.iso2!)}</span><span className="flex-1">{c.names.en}</span><span className="text-sm text-[var(--fg-muted)]">from {formatPrice(d.fromPrice.amount, d.fromPrice.currency)}</span></a></li>
        ))}
      </ul>
    </CommerceShell>
  );
}
