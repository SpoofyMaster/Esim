import { COUNTRIES, REGIONS, flagEmoji } from "@bleusim/geospatial";
import { HomeDestinations, type DestCard } from "./HomeDestinations";
import { Reveal } from "./Reveal";
import { POPULAR } from "@/components/SiteFooter";
import { serverCatalog } from "@/lib/server-catalog";
import { slugOf } from "@/lib/slug";
import { formatPrice } from "@/lib/catalog-format";
import { fmt, intlLocale, localePath, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";
import type { Plan } from "@bleusim/catalog";

const Kicker = ({ children }: { children: React.ReactNode }) => <p className="text-sm font-medium text-blue-600">{children}</p>;
const H2 = ({ children, id }: { children: React.ReactNode; id?: string }) => <h2 id={id} className="mt-2 font-display text-[32px] font-semibold leading-tight tracking-[-0.02em] text-ice-900 md:text-[44px]">{children}</h2>;
const cheapest = (plans: Plan[]) => plans.reduce<Plan | null>((a, b) => (!a || b.price.amount < a.price.amount ? b : a), null);

const ICONS: Record<string, React.ReactNode> = {
  layers: <path d="M12 3 3 8l9 5 9-5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" />,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6" /></>,
  sim: <><path d="M7 3h7l4 4v14H7V3Z" /><rect x="9.5" y="11" width="6" height="6" rx="1" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z" /></>,
};
const Icon = ({ name }: { name: string }) => (
  <span aria-hidden className="grid size-11 place-items-center rounded-2xl bg-blue-500/[0.07] text-blue-600">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{ICONS[name]}</svg>
  </span>
);

export async function HomeSections({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const T = t.landing;
  const il = intlLocale(lang);
  const L = (p: string) => localePath(lang, p);
  const price = (p: { amount: number; currency: string }) => formatPrice(p.amount, p.currency, il);

  // Cards: prices come from the catalog (sandbox fixtures today, labelled as such).
  const [dests, regionPlans, globalPlans] = await Promise.all([
    serverCatalog.destinations(),
    Promise.all(REGIONS.map((r) => serverCatalog.region(r.id))),
    serverCatalog.global(),
  ]);
  const sandbox = dests.some((d) => d.source === "DEV_FIXTURE");
  const countries: DestCard[] = POPULAR.map((iso) => {
    const c = COUNTRIES.find((x) => x.iso2 === iso)!;
    const d = dests.find((x) => x.iso2 === iso);
    return { key: iso, iso2: iso, href: `/esim/${slugOf(c)}`, name: c.names[lang], sub: d ? fmt(t.home.from, { price: price(d.fromPrice) }) : t.common.notAvailable };
  });
  const regions: DestCard[] = REGIONS.map((r, i) => {
    const plans = regionPlans[i] ?? [];
    const low = cheapest(plans);
    const n = plans[0]?.coverage.length ?? 0;
    return { key: r.id, icon: "◎", href: `/esim/region/${r.id}`, name: r.names[lang], sub: low ? `${fmt(t.home.from, { price: price(low.price) })} · ${fmt(T.regionCountries, { n })}` : t.common.notAvailable };
  });
  const gLow = cheapest(globalPlans);
  const global: DestCard[] = [{ key: "global", icon: "◍", href: "/esim/global", name: t.common.global, sub: gLow ? `${fmt(t.home.from, { price: price(gLow.price) })} · ${T.globalCardBody}` : T.globalCardBody }];

  const why = [["layers", T.why1, T.why1Body], ["check", T.why2, T.why2Body], ["receipt", T.why3, T.why3Body], ["sim", T.why4, T.why4Body], ["phone", T.why5, T.why5Body], ["globe", T.why6, T.why6Body]] as const;
  const faqs = [[T.faqQ1, T.faqA1], [T.faqQ2, T.faqA2], [t.page.q2, t.page.a2], [t.page.q3, t.page.a3], [t.page.q4, t.page.a4Maybe], [t.page.q5, t.page.a5TopUp]] as const;
  const ma = COUNTRIES.find((c) => c.iso2 === "MA")!;

  return (
    <>
      {/* What is an eSIM? */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:px-8 lg:grid-cols-2 lg:py-28">
        <Reveal className="relative mx-auto w-full max-w-md">
          <div aria-hidden className="absolute -inset-6 -z-10 rounded-full bg-[radial-gradient(circle,rgba(57,198,255,0.25),transparent_65%)]" />
          <img src="/media/airport-window-traveller-4x5-1200.webp" alt="" width={1200} height={1490} loading="lazy" className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-[0_40px_80px_-40px_rgba(0,40,120,0.5)]" />
          <div aria-hidden className="float-slow absolute -end-4 bottom-10 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_20px_40px_-16px_rgba(2,11,31,0.35)] sm:-end-10">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-500 text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 3h7l4 4v14H7V3Z" /><rect x="9.5" y="11" width="6" height="6" rx="1" /></svg></span>
            <span><span className="block text-sm font-medium text-ice-900">{T.whatChip}</span><span className="block text-xs text-emerald-600">{T.whatChipState}</span></span>
            <span className="pulse-dot ms-2 size-2.5 rounded-full bg-emerald-500" />
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Kicker>{T.whatKicker}</Kicker>
          <H2>{T.whatTitle}</H2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ice-600">{T.whatBody}</p>
        </Reveal>
      </section>

      {/* Choose your destination */}
      <section id="destinations" aria-labelledby="dest-h" className="scroll-mt-20 bg-gradient-to-b from-white via-ice-50/60 to-white">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 lg:py-24">
          <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Kicker>{T.destKicker}</Kicker>
              <H2 id="dest-h">{T.destTitle}</H2>
              <p className="mt-3 text-lg text-ice-600">{T.destBody}</p>
            </div>
            <a href={L("/destinations")} className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-blue-500 px-6 font-medium text-white shadow-[0_12px_24px_-12px_rgba(0,87,255,0.7)] transition hover:bg-blue-600">{T.viewAll}</a>
          </Reveal>
          <Reveal delay={100} className="mt-10"><HomeDestinations countries={countries} regions={regions} global={global} sandbox={sandbox} /></Reveal>
        </div>
      </section>

      {/* Why BLEUSIM */}
      <section aria-labelledby="why-h" className="mx-auto max-w-7xl px-5 py-20 md:px-8 lg:py-24">
        <Reveal><Kicker>{T.whyKicker}</Kicker><H2 id="why-h">{T.whyTitle}</H2></Reveal>
        <ul className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {why.map(([icon, title, body], i) => (
            <Reveal as="li" key={title} delay={(i % 3) * 90}>
              <Icon name={icon} />
              <h3 className="mt-5 text-xl font-semibold text-ice-900">{title}</h3>
              <p className="mt-2 leading-relaxed text-ice-600">{body}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Two feature cards */}
      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-20 md:px-8 lg:grid-cols-2 lg:pb-24">
        <Reveal className="relative flex min-h-[560px] flex-col overflow-hidden rounded-[2rem] bg-ice-100 p-8 md:p-10">
          <h3 className="font-display text-3xl font-semibold tracking-tight text-ice-900">{T.card1Title}</h3>
          <p className="mt-3 max-w-md text-lg leading-relaxed text-ice-600">{T.card1Body}</p>
          <div aria-hidden className="relative mt-auto h-[300px]">
            <div className="float-slow absolute start-0 top-2 z-20 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lg">
              <span className="grid size-8 place-items-center rounded-lg bg-blue-500 text-xs font-bold text-white">e</span>
              <span className="text-sm font-medium text-ice-900">{T.mockInstalled}</span>
              <span className="ms-3 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">✓</span>
            </div>
            {[["dest-japan-16x9", "JP", "-rotate-6 start-[4%] top-20"], ["dest-usa-16x9", "US", "-rotate-2 start-[28%] top-14"], ["dest-italy-16x9", "IT", "rotate-3 start-[52%] top-8"]].map(([img, iso, pos]) => (
              <div key={iso} className={`absolute h-[240px] w-[44%] overflow-hidden rounded-3xl shadow-[0_24px_48px_-20px_rgba(2,11,31,0.45)] ring-4 ring-white ${pos}`}>
                <img src={`/media/${img}-1200.webp`} alt="" loading="lazy" className="h-full w-full object-cover" />
                <span className="absolute start-3 top-3 grid size-9 place-items-center rounded-full bg-white text-lg shadow">{flagEmoji(iso!)}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={120} className="relative flex min-h-[560px] flex-col overflow-hidden rounded-[2rem] bg-[#CFE6FF] p-8 md:p-10">
          <img src="/media/sahara-dunes-traveller-16x9-1200.webp" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-90" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#E3F1FF] via-[#E3F1FF]/80 to-transparent" />
          <div className="relative">
            <h3 className="font-display text-3xl font-semibold tracking-tight text-ice-900">{T.card2Title}</h3>
            <p className="mt-3 max-w-md text-lg leading-relaxed text-ice-700">{T.card2Body}</p>
          </div>
          <div aria-hidden className="float-slower relative ms-auto mt-auto w-56 space-y-2">
            {[["5", true], ["3", false], ["1", false]].map(([gb, on]) => (
              <div key={gb as string} className={`flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-lg ${on ? "ring-2 ring-blue-500" : ""}`}>
                <span><span className="block font-semibold text-ice-900">{fmt(t.common.gb, { n: gb as string })}</span><span className="block text-xs text-ice-500">{fmt(t.common.days, { n: 30 })}</span></span>
                <span className={`grid size-6 place-items-center rounded-full ${on ? "bg-blue-500 text-white" : "border-2 border-ice-300"}`}>{on ? "✓" : ""}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section id="how" aria-labelledby="how-h" className="scroll-mt-20 bg-ice-50/70">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 lg:py-24">
          <Reveal><Kicker>{t.page.how}</Kicker><H2 id="how-h">{T.howTitle}</H2><p className="mt-3 text-lg text-ice-600">{T.howBody}</p></Reveal>
          <ol className="mt-12 grid gap-6 lg:grid-cols-3">
            {[[t.page.step1, t.page.step1Body], [t.page.step2, t.page.step2Body], [t.page.step3, t.page.step3Body]].map(([title, body], i) => (
              <Reveal as="li" key={title} delay={i * 110} className="flex flex-col overflow-hidden rounded-[1.75rem] bg-white p-7 ring-1 ring-ice-200/70">
                <span className="grid size-9 place-items-center rounded-full bg-blue-500 text-sm font-semibold text-white">{i + 1}</span>
                <h3 className="mt-5 text-xl font-semibold text-ice-900">{title}</h3>
                <p className="mt-2 leading-relaxed text-ice-600">{body}</p>
                <div aria-hidden className="mt-8 rounded-2xl bg-ice-50 p-4">
                  {i === 0 && [["1", false], ["3", true], ["5", false]].map(([gb, on]) => (
                    <div key={gb as string} className={`mb-2 flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 last:mb-0 ${on ? "ring-2 ring-ice-900" : ""}`}>
                      <span className={`size-4 rounded-full ${on ? "border-[5px] border-ice-900" : "border-2 border-ice-300"}`} />
                      <span className="text-sm font-medium text-ice-900">{fmt(t.common.gb, { n: gb as string })}</span>
                      <span className="ms-auto text-xs text-ice-500">{fmt(t.common.days, { n: 30 })}</span>
                    </div>
                  ))}
                  {i === 1 && (
                    <div className="grid place-items-center py-6">
                      <span className="grid size-16 place-items-center rounded-full bg-blue-500 text-2xl text-white shadow-[0_0_0_10px_rgba(0,87,255,0.12)]">✓</span>
                      <span className="mt-4 text-sm font-medium text-ice-900">{T.mockInstalled}</span>
                    </div>
                  )}
                  {i === 2 && (
                    <div className="rounded-xl bg-white p-4 text-sm">
                      <div className="flex items-center gap-2 font-medium text-ice-900"><span>{flagEmoji("MA")}</span>{ma.names[lang]}<span className="ms-auto rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">{T.mockActive}</span></div>
                      <div className="mt-3 flex justify-between text-ice-600"><span>{T.mockRemaining}</span><span className="font-medium text-ice-900">{fmt(t.common.gb, { n: "4.2" })} / {fmt(t.common.gb, { n: 5 })}</span></div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ice-100"><div className="h-full w-[84%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" /></div>
                      <div className="mt-3 flex justify-between text-ice-600"><span>{T.mockExpires}</span><span className="font-medium text-ice-900">{T.mockExpiresValue}</span></div>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Global band */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 lg:py-24">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-space-900 px-8 py-14 md:px-14 md:py-20">
          <img src="/media/brand-earth-network-21x9-1200.webp" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-space-900 via-space-900/80 to-transparent rtl:bg-gradient-to-l" />
          <div className="relative max-w-lg">
            <p className="text-sm font-medium text-cyan-300">{T.bandKicker}</p>
            <h2 className="mt-3 font-display text-[32px] font-semibold leading-tight tracking-[-0.02em] text-white md:text-[44px]">{t.home.tagline}</h2>
            <p className="mt-4 text-lg text-ice-300">{T.bandBody}</p>
            <a href={L("/esim/global")} className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-6 font-medium text-ice-900 transition hover:bg-cyan-200">{T.bandCta}</a>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-h" className="mx-auto max-w-3xl scroll-mt-20 px-5 pb-24 md:px-8">
        <Reveal><h2 id="faq-h" className="text-center font-display text-[32px] font-semibold tracking-[-0.02em] text-ice-900 md:text-[44px]">{T.faqTitle}</h2></Reveal>
        <div className="mt-10 space-y-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="group rounded-2xl border border-ice-200 bg-white px-6 py-5 transition open:shadow-[0_16px_40px_-24px_rgba(2,11,31,0.35)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium text-ice-900 marker:hidden">
                {q}
                <svg aria-hidden width="18" height="18" viewBox="0 0 18 18" className="shrink-0 text-ice-500 transition group-open:rotate-180"><path d="M4 7l5 5 5-5" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </summary>
              <p className="mt-3 leading-relaxed text-ice-600">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
