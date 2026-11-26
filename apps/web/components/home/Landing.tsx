import { COUNTRIES } from "@bleusim/geospatial";
import { SearchBox } from "@/components/SearchBox";
import { Symbol } from "@/components/brand/Logo";
import { Reveal } from "@/components/site/Reveal";
import { DestinationTabs, type TabDef } from "./DestinationTabs";
import { HandPhone, StoreButtons } from "./AppPhone";

/** Hero photo: "studio" (soft blue backdrop + CSS confetti) or "confetti" (confetti in the photo). */
const HERO_VARIANT: "studio" | "confetti" = "confetti";
import { slugOf } from "@/lib/slug";
import { fmt, localePath, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";

const img = (base: string) => `/media/${base}-1200.webp`;
const HERO_CHIPS = ["US", "JP", "TH", "MA", "FR"];

/* ---------- small building blocks ---------- */
function Kicker({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return <p className={`text-[15px] font-semibold text-pink-700 ${center ? "text-center" : ""}`}>{children}</p>;
}
function H2({ children, id, center = false }: { children: React.ReactNode; id?: string; center?: boolean }) {
  return <h2 id={id} className={`mt-3 font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-ice-900 md:text-[44px] ${center ? "text-center" : ""}`}>{children}</h2>;
}
function PrimaryLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} className={`inline-flex h-12 items-center justify-center rounded-full bg-blue-500 px-7 text-[15px] font-medium text-white shadow-[0_10px_30px_-12px_rgba(0,87,255,0.7)] transition hover:-translate-y-0.5 hover:bg-blue-600 active:translate-y-0 ${className}`}>{children}</a>;
}
const Check = ({ className = "" }: { className?: string }) => (
  <svg aria-hidden viewBox="0 0 24 24" width="14" height="14" fill="none" className={className}><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Flag = ({ iso, className = "size-8" }: { iso: string; className?: string }) => (
  <img src={`/flags/${iso.toLowerCase()}.svg`} alt="" aria-hidden width={40} height={40} className={`shrink-0 rounded-full object-cover shadow-[0_0_0_1px_rgba(13,21,38,0.08)] ${className}`} />
);

const ICONS: Record<string, React.ReactNode> = {
  layers: <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" />,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12.5 3 3 5-6" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  plus: <><rect x="6" y="3" width="12" height="18" rx="2.5" /><path d="M12 9v6M9 12h6" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
};
function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <span className="grid size-12 place-items-center rounded-2xl bg-ice-50 text-blue-500 transition-colors duration-300 group-hover:bg-blue-500 group-hover:text-white">
      <svg aria-hidden viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ICONS[name]}</svg>
    </span>
  );
}

/* ---------- page ---------- */
export function Landing({ lang, tabs }: { lang: Locale; tabs: TabDef[] }) {
  const d = getDict(lang);
  const t = d.landing;
  const L = (p: string) => localePath(lang, p);
  const country = (iso: string) => COUNTRIES.find((c) => c.iso2 === iso)!;

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="drift absolute -top-40 end-[-10%] size-[620px] rounded-full bg-[radial-gradient(circle_at_center,rgba(57,198,255,0.28),transparent_65%)]" />
          <div className="drift absolute -bottom-48 start-[-12%] size-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,87,255,0.14),transparent_65%)]" style={{ animationDelay: "-6s" }} />
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-12 grid-cols-1 px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-16 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="reveal inline-flex items-center gap-2 rounded-full bg-ice-50 px-3.5 py-1.5 text-sm font-medium text-ice-700" style={{ animationDelay: "0.05s" }}>
              <span className="pulse-dot size-2 rounded-full bg-[var(--success)]" />{t.heroKicker}
            </p>
            <h1 aria-label={t.heroTitle} className="reveal mt-5 font-display text-[40px] font-semibold leading-[1.04] tracking-[-0.03em] text-ice-900 md:text-[60px]" style={{ animationDelay: "0.12s" }}><Highlight text={t.heroTitle} word={d.app.heroTitleHighlight} /></h1>
            <p className="reveal mt-5 max-w-xl text-lg leading-relaxed text-ice-600" style={{ animationDelay: "0.2s" }}>{t.heroBody}</p>
            <div className="reveal relative z-20 mt-8 max-w-xl" style={{ animationDelay: "0.28s" }}><SearchBox tone="light" navigate /></div>
            <div className="reveal mt-5 flex flex-wrap items-center gap-2" style={{ animationDelay: "0.36s" }}>
              <span className="me-1 text-sm text-ice-500">{t.heroPopular}</span>
              {HERO_CHIPS.map((iso) => {
                const c = country(iso);
                return (
                  <a key={iso} href={L(`/esim/${slugOf(c)}`)} className="inline-flex items-center gap-2 rounded-full border border-ice-200 bg-white py-1 pe-3.5 ps-1 text-sm text-ice-800 transition hover:border-ice-400 hover:shadow-sm">
                    <Flag iso={iso} className="size-6" />{c.names[lang]}
                  </a>
                );
              })}
            </div>
            <div className="reveal mt-8" style={{ animationDelay: "0.44s" }}><StoreButtons lang={lang} /></div>
          </div>

          <div className="reveal relative mx-auto w-full max-w-[480px] py-6" style={{ animationDelay: "0.2s" }}>
            <div aria-hidden className="absolute -inset-4 -z-10 rounded-[48px] bg-gradient-to-br from-cyan-200/60 via-ice-100 to-pink-100/70 blur-2xl" />
            {HERO_VARIANT === "studio" && <Confetti />}
            <div className="overflow-hidden rounded-[36px] bg-[#DCE8F7] shadow-[0_40px_80px_-40px_rgba(13,21,38,0.55)]"><HandPhone lang={lang} variant={HERO_VARIANT} className="origin-[50%_42%] scale-[1.28]" /></div>
            <p className="mt-4 text-center text-xs font-medium text-ice-500">{d.app.conceptChip}</p>
            {/* floating eSIM status card (illustrative UI) */}
            <div aria-hidden className="float absolute -left-3 bottom-[7%] hidden w-[220px] sm:block md:-left-12 rounded-2xl bg-white/95 p-4 shadow-[0_24px_50px_-20px_rgba(13,21,38,0.45)] backdrop-blur">
              <div className="flex items-center gap-2.5">
                <Flag iso="JP" />
                <span className="flex-1 font-medium text-ice-900">{country("JP").names[lang]}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F7EF] px-2 py-0.5 text-xs font-medium text-[#0E7A4A]"><span className="pulse-dot size-1.5 rounded-full bg-[var(--success)]" />{t.heroActive}</span>
              </div>
              <div className="mt-4 flex justify-between text-xs text-ice-600"><span>{t.heroRemaining}</span><span dir="ltr" className="font-medium text-ice-900">3.6 / 5 GB</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ice-100"><div className="fill-bar h-full w-[72%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 rtl:ms-auto" style={{ animationDelay: "0.9s" }} /></div>
            </div>
            <div aria-hidden className="float-slow absolute -right-3 top-[14%] hidden sm:flex md:-right-8 items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-[0_24px_50px_-20px_rgba(13,21,38,0.45)] backdrop-blur">
              <span className="grid size-9 place-items-center rounded-full bg-blue-500 text-white"><Symbol className="size-6" /></span>
              <span><span className="block text-xs text-ice-600">BLEUSIM</span><span className="block text-sm font-medium text-ice-900">5G · {t.heroConnected}</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS AN ESIM */}
      <section id="what" aria-labelledby="what-h" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <Reveal className="relative mx-auto aspect-[16/10] w-full max-w-[520px]">
            <EsimIllustration active={t.heroActive} />
          </Reveal>
          <Reveal delay={0.1}>
            <h2 id="what-h" className="font-display text-[32px] font-semibold tracking-[-0.02em] text-ice-900 md:text-[44px]">{t.whatTitle}</h2>
            <p className="mt-5 text-lg leading-relaxed text-ice-600">{t.whatBody}</p>
            <p className="mt-3 text-lg leading-relaxed text-ice-600">{t.whatBody2}</p>
          </Reveal>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section id="destinations" aria-labelledby="dest-h" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Kicker>{t.destKicker}</Kicker>
              <H2 id="dest-h">{t.destTitle}</H2>
              <p className="mt-3 text-lg text-ice-600">{t.destBody}</p>
            </div>
            <PrimaryLink href={L("/destinations")} className="self-start md:self-auto">{t.viewAll}</PrimaryLink>
          </Reveal>
          <Reveal className="mt-10" delay={0.05}><DestinationTabs tabs={tabs} label={t.tabsLabel} /></Reveal>
          <p className="mt-5 text-xs text-ice-500">{d.site.sandbox}</p>
        </div>
      </section>

      {/* WHY */}
      <section aria-labelledby="why-h">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Reveal><Kicker>{t.whyKicker}</Kicker><H2 id="why-h">{t.whyTitle}</H2></Reveal>
          <ul className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {([["layers", t.f1, t.f1Body], ["check", t.f2, t.f2Body], ["receipt", t.f3, t.f3Body], ["phone", t.f4, t.f4Body], ["plus", t.f5, t.f5Body], ["globe", t.f6, t.f6Body]] as const).map(([icon, title, body], i) => (
              <Reveal as="li" key={title} delay={(i % 3) * 0.08} className="group">
                <Icon name={icon} />
                <h3 className="mt-5 text-xl font-semibold text-ice-900">{title}</h3>
                <p className="mt-2 leading-relaxed text-ice-600">{body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* TWO IMAGE CARDS */}
      <section aria-labelledby="cards-h">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <H2 id="cards-h" center>{t.cardsTitle}</H2>
            <p className="mt-4 text-lg text-ice-600">{t.cardsBody}</p>
            <PrimaryLink href={L("/destinations")} className="mt-8">{t.viewAll}</PrimaryLink>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Reveal className="group relative flex min-h-[560px] flex-col overflow-hidden rounded-[36px] bg-gradient-to-b from-ice-50 to-ice-100">
              <div className="p-8 md:p-10">
                <h3 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-ice-900 md:text-[34px]">{t.card1}</h3>
                <p className="mt-3 max-w-md text-lg leading-relaxed text-ice-600">{t.card1Body}</p>
              </div>
              <div aria-hidden className="relative mt-auto h-[300px]">
                <div className="float absolute start-8 top-0 z-20 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_-20px_rgba(13,21,38,0.5)]">
                  <span className="grid size-8 place-items-center rounded-full bg-blue-500 text-white"><Symbol className="size-5" /></span>
                  <span className="font-medium text-ice-900">{t.card1Chip}</span>
                  <span className="rounded-full bg-[#E7F7EF] p-1 text-[#0E7A4A]"><Check /></span>
                </div>
                {([["JP", "dest-japan-16x9", "-rotate-[14deg] start-[4%] top-24 group-hover:-rotate-[18deg] group-hover:-translate-x-2"], ["US", "dest-usa-16x9", "-rotate-[4deg] start-[30%] top-14 group-hover:-translate-y-2"], ["IT", "dest-italy-16x9", "rotate-[7deg] start-[56%] top-6 group-hover:rotate-[11deg] group-hover:translate-x-2"]] as const).map(([iso, base, pos]) => (
                  <div key={iso} className={`absolute h-[300px] w-[200px] overflow-hidden rounded-3xl shadow-[0_24px_50px_-24px_rgba(13,21,38,0.6)] transition-transform duration-700 ease-[var(--ease-out-expo)] ${pos}`}>
                    <img src={img(base)} alt="" loading="lazy" className="h-full w-full object-cover" />
                    <Flag iso={iso} className="absolute start-3 top-3 size-10 ring-2 ring-white" />
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.1} className="relative flex min-h-[560px] flex-col overflow-hidden rounded-[36px] bg-gradient-to-b from-[#BFE6FF] to-[#7DC4FF]">
              <div className="relative z-10 p-8 md:p-10">
                <h3 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-ice-900 md:text-[34px]">{t.card2}</h3>
                <p className="mt-3 max-w-md text-lg leading-relaxed text-ice-800">{t.card2Body}</p>
              </div>
              <img src={img("sahara-dunes-traveller-16x9")} alt="" loading="lazy" className="absolute inset-x-0 bottom-0 h-[58%] w-full object-cover [mask-image:linear-gradient(to_bottom,transparent,black_30%)]" />
              <ul aria-hidden className="relative z-10 mt-auto mb-8 me-8 ms-auto w-[210px] space-y-2.5">
                {([[5, 30, true], [3, 30, false], [1, 7, false]] as const).map(([gb, days, on], i) => (
                  <li key={gb} className={`flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_-22px_rgba(13,21,38,0.6)] ${i === 0 ? "float" : ""}`}>
                    <span><span dir="ltr" className="block font-semibold text-ice-900">{gb} GB</span><span className="block text-xs text-ice-600">{fmt(t.card2Days, { n: days })}</span></span>
                    {on ? <span className="grid size-7 place-items-center rounded-full bg-blue-500 text-white"><Check /></span> : <span className="size-6 rounded-full border-2 border-ice-200" />}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* GLOBE (dark feature card) */}
      <section aria-labelledby="globe-h">
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
          <Reveal className="relative grid min-h-[440px] overflow-hidden rounded-[36px] bg-space-900 md:grid-cols-2">
            <div className="relative z-10 flex flex-col justify-center p-8 md:p-14">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">{t.globeKicker}</p>
              <h2 id="globe-h" className="mt-4 font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-[44px]">{t.globeTitle}</h2>
              <p className="mt-4 max-w-md text-lg text-ice-300">{t.globeBody}</p>
              <a href={L("/explore")} className="mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-white px-7 text-[15px] font-medium text-ice-900 transition hover:-translate-y-0.5 hover:bg-cyan-200">
                {t.globeCta}<svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" className="rtl:-scale-x-100"><path d="M5 12h14m-5-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>
            <div aria-hidden className="relative min-h-[280px]">
              <img src="/media/hero-earth-orbit-loop-16x9-poster.webp" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <video className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden" src="/media/hero-earth-orbit-loop-16x9-720.mp4" autoPlay muted loop playsInline preload="none" />
              <div className="absolute inset-0 bg-gradient-to-r from-space-900 via-space-900/30 to-transparent rtl:bg-gradient-to-l max-md:bg-gradient-to-b" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" aria-labelledby="how-h" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Reveal>
            <Kicker>{t.howKicker}</Kicker>
            <H2 id="how-h">{t.howTitle}</H2>
            <p className="mt-3 max-w-xl text-lg text-ice-600">{t.howBody}</p>
          </Reveal>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {[[t.s1, t.s1Body], [t.s2, t.s2Body], [t.s3, t.s3Body]].map(([title, body], i) => (
              <Reveal as="li" key={title} delay={i * 0.1} className="card-lift flex flex-col overflow-hidden rounded-[28px] bg-ice-50">
                <div className="p-7">
                  <span className="grid size-9 place-items-center rounded-full bg-white font-display font-semibold text-ice-900 shadow-sm">{i + 1}</span>
                  <h3 className="mt-6 text-xl font-semibold text-ice-900">{title}</h3>
                  <p className="mt-2 leading-relaxed text-ice-600">{body}</p>
                </div>
                <div aria-hidden className="mt-auto px-7 pb-7">{i === 0 ? <StepPlans t={t} /> : i === 1 ? <StepInstalled label={t.s2Done} /> : <StepUsage t={t} name={country("TH").names[lang]} />}</div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-h" className="scroll-mt-20">
        <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
          <Reveal><h2 id="faq-h" className="text-center font-display text-[32px] font-semibold tracking-[-0.02em] text-ice-900 md:text-[44px]">{t.faqTitle}</h2></Reveal>
          <div className="mt-10 space-y-3">
            {[[t.q1, t.a1], [t.q2, t.a2], [t.q3, t.a3], [t.q4, t.a4], [t.q5, t.a5], [t.q6, t.a6]].map(([q, a], i) => (
              <Reveal key={q} delay={i * 0.04}>
                <details className="group rounded-2xl border border-ice-200 bg-white transition-colors open:border-ice-300 open:bg-ice-50/60">
                  <summary className="flex cursor-pointer list-none items-center gap-4 px-6 py-5 text-lg font-medium text-ice-900">
                    <span className="flex-1">{q}</span>
                    <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" className="chev shrink-0 text-ice-600 transition-transform duration-300"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </summary>
                  <p className="px-6 pb-6 leading-relaxed text-ice-600">{a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="cta-h">
        <div className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
          <Reveal className="relative overflow-hidden rounded-[36px] bg-[linear-gradient(120deg,#0057FF_0%,#2F7BFF_45%,#39C6FF_75%,#FF3EA5_115%)] px-8 py-14 text-center md:py-20">
            <svg aria-hidden viewBox="0 0 800 400" className="pointer-events-none absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none">
              <ellipse cx="400" cy="420" rx="520" ry="200" fill="none" stroke="white" strokeWidth="1.5" />
              <ellipse cx="400" cy="460" rx="680" ry="260" fill="none" stroke="white" strokeWidth="1" />
            </svg>
            <h2 id="cta-h" className="relative font-display text-[32px] font-semibold tracking-[-0.02em] text-white md:text-[44px]">{t.ctaTitle}</h2>
            <p className="relative mx-auto mt-3 max-w-lg text-lg text-white/85">{t.ctaBody}</p>
            <a href={L("/destinations")} className="relative mt-8 inline-flex h-12 items-center rounded-full bg-white px-8 text-[15px] font-medium text-blue-600 transition hover:-translate-y-0.5 hover:shadow-lg">{t.ctaButton}</a>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

/* ---------- pink accent helpers ---------- */
/** Colours one phrase of the headline pink (large text, AA for large type) with a soft underline swash. */
function Highlight({ text, word }: { text: string; word: string }) {
  const i = text.indexOf(word);
  if (!word || i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="relative whitespace-nowrap text-pink-500">
        {word}
        <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-1 start-0 h-2.5 w-full text-pink-300"><path d="M2 9C50 3 120 2 198 7" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
      </span>
      {text.slice(i + word.length)}
    </>
  );
}
const CONFETTI: [string, string, string, string][] = [
  // [left %, top %, colour class, shape classes]
  ["4%", "6%", "bg-pink-500", "h-1.5 w-5 rotate-[30deg] rounded-full"],
  ["18%", "0%", "bg-cyan-400", "size-2 rounded-full"],
  ["78%", "2%", "bg-blue-500", "h-1.5 w-5 -rotate-[25deg] rounded-full"],
  ["92%", "14%", "bg-pink-500", "size-2.5 rounded-full"],
  ["0%", "30%", "bg-blue-500", "size-2 rounded-full"],
  ["96%", "40%", "bg-cyan-400", "h-1.5 w-4 rotate-[60deg] rounded-full"],
  ["2%", "64%", "bg-pink-300", "h-1.5 w-5 -rotate-[40deg] rounded-full"],
  ["94%", "70%", "bg-pink-500", "h-1.5 w-5 rotate-[15deg] rounded-full"],
  ["10%", "88%", "bg-cyan-400", "size-2.5 rounded-full"],
  ["86%", "92%", "bg-blue-500", "size-2 rounded-full"],
  ["30%", "96%", "bg-pink-500", "size-1.5 rounded-full"],
  ["64%", "-2%", "bg-pink-300", "size-2 rounded-full"],
];
function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {CONFETTI.map(([l, t, c, shape], i) => (
        <span key={i} className={`absolute ${c} ${shape} ${i % 2 ? "float" : "float-slow"}`} style={{ insetInlineStart: l, top: t, animationDelay: `${-i * 0.7}s` }} />
      ))}
    </div>
  );
}

/* ---------- illustrations (decorative, original) ---------- */
function EsimIllustration({ active }: { active: string }) {
  return (
    <div aria-hidden className="absolute inset-0">
      <svg viewBox="0 0 520 325" className="absolute inset-0 h-full w-full">
        <path d="M20 320 A240 240 0 0 1 500 320" fill="none" stroke="#D3E0F7" strokeWidth="1.5" />
        <path d="M80 320 A180 180 0 0 1 440 320" fill="none" stroke="#E8F0FE" strokeWidth="1.5" />
      </svg>
      <div className="float absolute start-[16%] top-[24%] w-[54%] -rotate-[14deg]">
        <div className="relative aspect-[1.55] rounded-[22px] bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 shadow-[0_30px_60px_-24px_rgba(0,71,214,0.7)]">
          <div className="absolute inset-[9%] grid grid-cols-3 gap-[6%]">
            {Array.from({ length: 6 }, (_, i) => <span key={i} className="rounded-md bg-white/25" />)}
          </div>
          <span className="absolute left-1/2 top-1/2 grid size-[34%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg"><Symbol className="size-[70%]" /></span>
        </div>
      </div>
      <span className="float-slow absolute start-[8%] top-[6%] grid size-14 place-items-center rounded-full bg-blue-500 text-white shadow-[0_14px_30px_-12px_rgba(0,87,255,0.8)]">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="6" y="3" width="12" height="18" rx="2.5" /><path d="M10 7.5h4M9.5 13a4 4 0 0 1 5 0M8 10.5a6.5 6.5 0 0 1 8 0" /></svg>
      </span>
      <div className="float-slow absolute bottom-[10%] end-[6%] flex w-[44%] items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_-20px_rgba(13,21,38,0.45)]">
        <span><span className="block font-semibold text-ice-900">eSIM #1</span><span className="block text-xs font-medium text-[#0E7A4A]">{active}</span></span>
        <span className="pulse-dot size-2.5 rounded-full bg-[var(--success)]" />
      </div>
    </div>
  );
}

type T = ReturnType<typeof getDict>["landing"];
function StepPlans({ t }: { t: T }) {
  return (
    <div className="space-y-2 rounded-2xl bg-white p-3 shadow-sm">
      {[[1, 7], [3, 30], [5, 30]].map(([gb, days], i) => (
        <div key={gb} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${i === 1 ? "ring-2 ring-ice-900" : ""}`}>
          <span className={`grid size-4 place-items-center rounded-full border-2 ${i === 1 ? "border-ice-900" : "border-ice-300"}`}>{i === 1 && <span className="size-1.5 rounded-full bg-ice-900" />}</span>
          <span className="flex-1"><span dir="ltr" className="block text-sm font-semibold text-ice-900">{gb} GB</span><span className="block text-xs text-ice-600">{fmt(t.card2Days, { n: days! })}</span></span>
          <span className="h-2.5 w-10 rounded-full bg-ice-100" />
        </div>
      ))}
    </div>
  );
}
function StepInstalled({ label }: { label: string }) {
  return (
    <div className="mx-auto flex h-[176px] w-[70%] flex-col items-center justify-center rounded-t-[28px] border-x-[6px] border-t-[6px] border-ice-200 bg-white">
      <span className="grid size-14 place-items-center rounded-full bg-blue-500 text-white shadow-[0_12px_30px_-10px_rgba(0,87,255,0.8)]"><Check className="size-6" /></span>
      <span className="mt-3 text-sm font-medium text-ice-900">{label}</span>
    </div>
  );
}
function StepUsage({ t, name }: { t: T; name: string }) {
  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2.5"><Flag iso="TH" className="size-6" /><span className="flex-1 text-sm font-medium text-ice-900">{name}</span><span className="rounded-full bg-[#E7F7EF] px-2 py-0.5 text-xs font-medium text-[#0E7A4A]">{t.heroActive}</span></div>
      <div className="flex justify-between border-t border-ice-100 pt-3 text-xs text-ice-600"><span>{t.heroRemaining}</span><span dir="ltr" className="font-semibold text-ice-900">5 / 5 GB</span></div>
      <div className="flex justify-between text-xs text-ice-600"><span>{t.s3Expires}</span><span className="font-semibold text-ice-900">{t.s3ExpiresValue}</span></div>
    </div>
  );
}
