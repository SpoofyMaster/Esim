import type { Plan } from "@bleusim/catalog";
import { COUNTRIES, flagEmoji } from "@bleusim/geospatial";
import { CommerceShell } from "@/components/commerce/Shell";
import { PlanTable } from "@/components/PlanTable";
import { formatPrice } from "@/lib/catalog-format";
import { SITE, slugOf } from "@/lib/server-catalog";
import { type MediaImage, type MediaVideo, src, srcSet } from "@/lib/media";
import { fmt, intlLocale, localePath, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";

export interface DestinationPageProps {
  lang: Locale;
  kind: "country" | "region" | "global";
  name: string;
  path: string; // canonical path
  globeHref: string;
  iso2?: string;
  plans: Plan[];
  image?: MediaImage;
  video?: MediaVideo;
  gallery?: MediaImage[];
}

export function DestinationPage({ lang, kind, name, path, globeHref, iso2, plans, image, video, gallery }: DestinationPageProps) {
  const cheapest = plans.reduce<Plan | null>((a, b) => (!a || b.price.amount < a.price.amount ? b : a), null);
  const sample = plans[0];
  const coverage = sample ? sample.coverage : [];
  const coveredCountries = coverage.map((i) => COUNTRIES.find((c) => c.iso2 === i)).filter(Boolean);
  const techs = [...new Set(plans.flatMap((p) => p.networks.flatMap((n) => n.tech)))];
  const live = plans.some((p) => p.source === "SUPPLIER");
  const t = getDict(lang).page;
  const c = getDict(lang).common;
  const il = intlLocale(lang);
  const L = (p: string) => localePath(lang, p);
  const n = sample?.activation.windowDays ?? 0;

  const faqs = [
    { q: fmt(t.q1, { name }), a: sample ? fmt(kind === "country" ? t.a1Country : t.a1Multi, { name, n }) : t.a1None },
    { q: t.q2, a: t.a2 },
    { q: t.q3, a: t.a3 },
    { q: t.q4, a: sample?.hotspot ? t.a4Yes : t.a4Maybe },
    { q: t.q5, a: plans.some((p) => p.topUp) ? t.a5TopUp : t.a5Buy },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "BLEUSIM", item: SITE + L("/") },
        { "@type": "ListItem", position: 2, name: t.destinations, item: SITE + L("/destinations") },
        { "@type": "ListItem", position: 3, name: fmt(t.title, { name }), item: SITE + L(path) },
      ],
    },
    { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: lang, mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    // Offer data is published only for real supplier offers, never for sandbox fixtures.
    ...(live && cheapest ? [{ "@context": "https://schema.org", "@type": "Product", name: `${name} eSIM data plan`, brand: { "@type": "Brand", name: "BLEUSIM" }, offers: { "@type": "AggregateOffer", lowPrice: cheapest.price.amount, priceCurrency: cheapest.price.currency, offerCount: plans.length } }] : []),
  ];

  return (
    <CommerceShell lang={lang}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label={t.breadcrumb} className="text-sm text-[var(--fg-muted)]"><a href={L("/")} className="hover:underline">BLEUSIM</a> / <a href={L("/destinations")} className="hover:underline">{t.destinations}</a> / <span aria-current="page">{name}</span></nav>
      {image && (
        <figure className="relative mt-6 overflow-hidden rounded-3xl bg-[var(--bg-subtle)]">
          {video && <video aria-hidden className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden" src={video.src} poster={video.poster} autoPlay muted loop playsInline preload="metadata" />}
          <img src={src(image)} srcSet={srcSet(image)} sizes="(min-width: 1024px) 960px, 100vw" alt={image.alt} width={1200} height={670} fetchPriority="high" className={`aspect-[21/9] w-full object-cover ${video ? "motion-safe:invisible" : ""}`} />
          <figcaption className="absolute bottom-2 end-3 rounded-full bg-black/50 px-2 py-0.5 text-[11px] text-white/80">{c.illustrative}</figcaption>
        </figure>
      )}
      <header className="mt-6 flex items-center gap-4">
        <span aria-hidden className="grid size-14 place-items-center rounded-2xl bg-[var(--bg-subtle)] text-3xl">{iso2 ? flagEmoji(iso2) : kind === "region" ? "◎" : "◍"}</span>
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">{fmt(t.title, { name })}</h1>
          <p className="mt-1 text-[var(--fg-muted)]">
            {cheapest ? <>{fmt(t.from, { price: formatPrice(cheapest.price.amount, cheapest.price.currency, il) })}{techs.length ? ` · ${techs.join(" / ")}` : ""}{coverage.length > 1 ? ` · ${fmt(t.countriesCount, { n: coverage.length })}` : ""}</> : c.notAvailable}
          </p>
        </div>
      </header>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={L(globeHref)} className="inline-flex h-10 items-center rounded-full border border-[var(--border)] px-4 text-sm hover:bg-[var(--bg-subtle)]">{t.viewOnGlobe}</a>
      </div>

      {plans.length > 0 ? <PlanTable lang={lang} plans={plans} title={fmt(t.choosePlan, { name })} /> : (
        <p className="mt-10 rounded-2xl border border-[var(--border)] p-6 text-[var(--fg-muted)]">{fmt(t.notSold, { name })} <a href={L("/esim/global")} className="text-[var(--accent)] underline">{t.seeGlobalPlans}</a></p>
      )}

      {sample && (
        <section aria-labelledby="facts-h" className="mt-12">
          <h2 id="facts-h" className="font-display text-2xl font-semibold tracking-tight">{t.beforeYouBuy}</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              [t.factActivation, fmt(t.factActivationValue, { n })],
              [t.factNetwork, techs.length ? fmt(t.factNetworkValue, { tech: techs.join(" / ") }) : t.factNetworkNone],
              [t.factHotspot, sample.hotspot ? t.factHotspotYes : t.factHotspotNo],
              [t.factNumber, t.factNumberValue],
              [t.factCompat, t.factCompatValue],
              [t.factKyc, sample.kycRequired ? t.factKycYes : t.factKycNo],
            ].map(([k, v]) => <div key={k} className="rounded-2xl bg-[var(--bg-subtle)] p-4"><dt className="text-sm text-[var(--fg-muted)]">{k}</dt><dd className="mt-1">{v}</dd></div>)}
          </dl>
        </section>
      )}

      {coveredCountries.length > 1 && (
        <section aria-labelledby="cov-h" className="mt-12">
          <h2 id="cov-h" className="font-display text-2xl font-semibold tracking-tight">{t.covered}</h2>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm">
            {coveredCountries.map((cc) => <li key={cc!.iso2}><a href={L(`/esim/${slugOf(cc!)}`)} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 hover:bg-[var(--bg-subtle)]"><span aria-hidden>{flagEmoji(cc!.iso2!)}</span>{cc!.names[lang]}</a></li>)}
          </ul>
        </section>
      )}

      {gallery && gallery.length > 0 && (
        <section aria-labelledby="gal-h" className="mt-12">
          <h2 id="gal-h" className="font-display text-2xl font-semibold tracking-tight">{fmt(t.gallery, { name })}</h2>
          <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.map((g) => <li key={g.base}><img src={src(g)} alt={g.alt} loading="lazy" width={1200} height={675} className="aspect-[4/3] w-full rounded-2xl object-cover" /></li>)}
          </ul>
          <p className="mt-2 text-xs text-[var(--fg-muted)]">{c.illustrativePlural}</p>
        </section>
      )}

      <section aria-labelledby="how-h" className="mt-12">
        <h2 id="how-h" className="font-display text-2xl font-semibold tracking-tight">{t.how}</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          {[[t.step1, t.step1Body], [t.step2, t.step2Body], [t.step3, t.step3Body]].map(([t, d], i) => (
            <li key={t} className="rounded-2xl border border-[var(--border)] p-5"><span className="font-display text-sm text-[var(--accent)]">0{i + 1}</span><p className="mt-2 font-medium">{t}</p><p className="mt-1 text-sm text-[var(--fg-muted)]">{d}</p></li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="faq-h" className="mt-12">
        <h2 id="faq-h" className="font-display text-2xl font-semibold tracking-tight">{fmt(t.questions, { name })}</h2>
        <div className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)]">
          {faqs.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="cursor-pointer list-none font-medium marker:hidden">{f.q}<span aria-hidden className="float-end text-[var(--fg-muted)] group-open:rotate-45">+</span></summary>
              <p className="mt-2 text-sm text-[var(--fg-muted)]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </CommerceShell>
  );
}
