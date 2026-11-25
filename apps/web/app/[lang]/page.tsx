import { notFound } from "next/navigation";
import { Explorer } from "@/components/Explorer";
import { COUNTRIES, flagEmoji } from "@bleusim/geospatial";
import { slugOf } from "@/lib/slug";
import { DEV_COVERAGE } from "@bleusim/catalog";
import { intlLocale, isLocale, localePath } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";

// Server-rendered destination directory below the globe: crawlable, and the full no-WebGL path.
export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const list = DEV_COVERAGE.map((iso) => COUNTRIES.find((c) => c.iso2 === iso)!).filter(Boolean).sort((a, b) => a.names[lang].localeCompare(b.names[lang], intlLocale(lang)));
  return (
    <main>
      <Explorer />
      <section id="destinations" className="mx-auto max-w-6xl px-5 py-20 md:px-10">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">{t.home.allDestinations}</h2>
        <p className="mt-2 text-ice-400">{t.home.sandboxDirectory}</p>
        <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((c) => (
            <li key={c.iso2}>
              <a href={localePath(lang, `/esim/${slugOf(c)}`)} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-ice-100 transition hover:border-cyan-400/40 hover:bg-white/[0.05]">
                <span aria-hidden className="text-xl">{flagEmoji(c.iso2!)}</span>{c.names[lang]}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
