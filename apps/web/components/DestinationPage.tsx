import type { Plan } from "@bleusim/catalog";
import { COUNTRIES, flagEmoji } from "@bleusim/geospatial";
import { CommerceShell } from "@/components/commerce/Shell";
import { PlanTable } from "@/components/PlanTable";
import { formatPrice } from "@/lib/catalog-format";
import { SITE, slugOf } from "@/lib/server-catalog";
import { type MediaImage, type MediaVideo, src, srcSet } from "@/lib/media";

export interface DestinationPageProps {
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

export function DestinationPage({ kind, name, path, globeHref, iso2, plans, image, video, gallery }: DestinationPageProps) {
  const cheapest = plans.reduce<Plan | null>((a, b) => (!a || b.price.amount < a.price.amount ? b : a), null);
  const sample = plans[0];
  const coverage = sample ? sample.coverage : [];
  const coveredCountries = coverage.map((i) => COUNTRIES.find((c) => c.iso2 === i)).filter(Boolean);
  const techs = [...new Set(plans.flatMap((p) => p.networks.flatMap((n) => n.tech)))];
  const live = plans.some((p) => p.source === "SUPPLIER");

  const faqs = [
    { q: `When does my ${name} eSIM start?`, a: sample ? `It activates the first time it connects to a supported network in ${kind === "country" ? name : "a covered country"}. You have ${sample.activation.windowDays} days after purchase to start using it.` : "Activation rules are shown with each plan." },
    { q: "Should I install it before I travel?", a: "Yes. Install it at home on Wi-Fi, leave it switched off, then turn it on and enable data roaming for that line when you land." },
    { q: "Will I keep my usual phone number?", a: "Yes. BLEUSIM plans are data only, so your usual SIM stays active for calls and texts if you want it to." },
    { q: "Can I share data with a hotspot?", a: sample?.hotspot ? "Yes, hotspot sharing is allowed on these plans." : "Hotspot rules depend on the plan and are shown before you buy." },
    { q: "What if I run out of data?", a: plans.some((p) => p.topUp) ? "Top up the same eSIM from My eSIMs. There is nothing new to install." : "Buy another plan from this page." },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Destinations", item: SITE + "/destinations" },
        { "@type": "ListItem", position: 3, name: `${name} eSIM`, item: SITE + path },
      ],
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    // Offer data is published only for real supplier offers, never for sandbox fixtures.
    ...(live && cheapest ? [{ "@context": "https://schema.org", "@type": "Product", name: `${name} eSIM data plan`, brand: { "@type": "Brand", name: "BLEUSIM" }, offers: { "@type": "AggregateOffer", lowPrice: cheapest.price.amount, priceCurrency: cheapest.price.currency, offerCount: plans.length } }] : []),
  ];

  return (
    <CommerceShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="text-sm text-[var(--fg-muted)]"><a href="/" className="hover:underline">Home</a> / <a href="/destinations" className="hover:underline">Destinations</a> / <span aria-current="page">{name}</span></nav>
      {image && (
        <figure className="relative mt-6 overflow-hidden rounded-3xl bg-[var(--bg-subtle)]">
          {video && <video aria-hidden className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden" src={video.src} poster={video.poster} autoPlay muted loop playsInline preload="metadata" />}
          <img src={src(image)} srcSet={srcSet(image)} sizes="(min-width: 1024px) 960px, 100vw" alt={image.alt} width={1200} height={670} fetchPriority="high" className={`aspect-[21/9] w-full object-cover ${video ? "motion-safe:invisible" : ""}`} />
          <figcaption className="absolute bottom-2 right-3 rounded-full bg-black/50 px-2 py-0.5 text-[11px] text-white/80">Illustrative image</figcaption>
        </figure>
      )}
      <header className="mt-6 flex items-center gap-4">
        <span aria-hidden className="grid size-14 place-items-center rounded-2xl bg-[var(--bg-subtle)] text-3xl">{iso2 ? flagEmoji(iso2) : kind === "region" ? "◎" : "◍"}</span>
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">{name} eSIM</h1>
          <p className="mt-1 text-[var(--fg-muted)]">
            {cheapest ? <>Mobile data from {formatPrice(cheapest.price.amount, cheapest.price.currency)}{techs.length ? ` · ${techs.join(" / ")}` : ""}{coverage.length > 1 ? ` · ${coverage.length} countries` : ""}</> : "Not available yet"}
          </p>
        </div>
      </header>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={globeHref} className="inline-flex h-10 items-center rounded-full border border-[var(--border)] px-4 text-sm hover:bg-white/5">View on the globe</a>
      </div>

      {plans.length > 0 ? <PlanTable plans={plans} title={`Choose your ${name} data plan`} /> : (
        <p className="mt-10 rounded-2xl border border-[var(--border)] p-6 text-[var(--fg-muted)]">We don’t sell plans for {name} yet. <a href="/esim/global" className="text-[var(--accent)] underline">See global plans</a>.</p>
      )}

      {sample && (
        <section aria-labelledby="facts-h" className="mt-12">
          <h2 id="facts-h" className="font-display text-2xl font-semibold tracking-tight">Before you buy</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["Activation", `Starts when it first connects in a covered country, within ${sample.activation.windowDays} days of purchase.`],
              ["Network", techs.length ? `${techs.join(" / ")} where available.` : "Shown per plan."],
              ["Hotspot", sample.hotspot ? "Allowed." : "Not allowed."],
              ["Phone number", "Data only. Calls and texts use apps such as WhatsApp or FaceTime."],
              ["Compatibility", "Needs an eSIM-capable, carrier-unlocked phone."],
              ["Identity check", sample.kycRequired ? "Required by local rules after purchase." : "Not required."],
            ].map(([k, v]) => <div key={k} className="rounded-2xl bg-[var(--bg-subtle)] p-4"><dt className="text-sm text-[var(--fg-muted)]">{k}</dt><dd className="mt-1">{v}</dd></div>)}
          </dl>
        </section>
      )}

      {coveredCountries.length > 1 && (
        <section aria-labelledby="cov-h" className="mt-12">
          <h2 id="cov-h" className="font-display text-2xl font-semibold tracking-tight">Countries covered</h2>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm">
            {coveredCountries.map((c) => <li key={c!.iso2}><a href={`/esim/${slugOf(c!)}`} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 hover:bg-white/5"><span aria-hidden>{flagEmoji(c!.iso2!)}</span>{c!.names.en}</a></li>)}
          </ul>
        </section>
      )}

      {gallery && gallery.length > 0 && (
        <section aria-labelledby="gal-h" className="mt-12">
          <h2 id="gal-h" className="font-display text-2xl font-semibold tracking-tight">{name}, from the north to the Sahara</h2>
          <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.map((g) => <li key={g.base}><img src={src(g)} alt={g.alt} loading="lazy" width={1200} height={675} className="aspect-[4/3] w-full rounded-2xl object-cover" /></li>)}
          </ul>
          <p className="mt-2 text-xs text-[var(--fg-muted)]">Illustrative images.</p>
        </section>
      )}

      <section aria-labelledby="how-h" className="mt-12">
        <h2 id="how-h" className="font-display text-2xl font-semibold tracking-tight">How it works</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          {[["Choose your data", "Pick the amount and number of days that fit your trip."], ["Install at home", "Scan the QR code on Wi-Fi before you leave. It takes a minute."], ["Connect when you land", "Turn on the BLEUSIM line and data roaming. You’re online."]].map(([t, d], i) => (
            <li key={t} className="rounded-2xl border border-[var(--border)] p-5"><span className="font-display text-sm text-[var(--accent)]">0{i + 1}</span><p className="mt-2 font-medium">{t}</p><p className="mt-1 text-sm text-[var(--fg-muted)]">{d}</p></li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="faq-h" className="mt-12">
        <h2 id="faq-h" className="font-display text-2xl font-semibold tracking-tight">Questions about {name} eSIMs</h2>
        <div className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)]">
          {faqs.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="cursor-pointer list-none font-medium marker:hidden">{f.q}<span aria-hidden className="float-right text-[var(--fg-muted)] group-open:rotate-45">+</span></summary>
              <p className="mt-2 text-sm text-[var(--fg-muted)]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </CommerceShell>
  );
}
