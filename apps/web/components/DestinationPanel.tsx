"use client";
import { useEffect, useState } from "react";
import { REGIONS, countryByIso2, flagEmoji } from "@bleusim/geospatial";
import { slugOf } from "@/lib/slug";
import { useI18n } from "@/lib/i18n/client";
import { fmt, intlLocale, localePath, type Dict, type Locale } from "@/lib/i18n";

function detailsHref(s: NonNullable<Selection>) { if (s.kind === "country") { const c = countryByIso2(s.iso2); return c ? `/esim/${slugOf(c)}` : null; } return s.kind === "region" ? `/esim/region/${s.id}` : "/esim/global"; }
import type { Plan } from "@bleusim/catalog";
import { catalog, formatPrice } from "@/lib/catalog";
import { explorer, useExplorer, type Selection } from "@/lib/store";

type Load = { state: "loading" } | { state: "error"; message: string } | { state: "ready"; plans: Plan[] };

function titleOf(s: NonNullable<Selection>, l: Locale, t: Dict) {
  if (s.kind === "country") { const c = countryByIso2(s.iso2); return { title: c?.names[l] ?? s.iso2, icon: flagEmoji(s.iso2), kicker: t.panel.kickerCountry }; }
  if (s.kind === "region") { const r = REGIONS.find((x) => x.id === s.id); return { title: r?.names[l] ?? s.id, icon: "◎", kicker: t.panel.kickerRegion }; }
  return { title: t.common.global, icon: "◍", kicker: t.panel.kickerGlobal };
}

export function DestinationPanel() {
  const selection = useExplorer((s) => s.selection);
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [chosen, setChosen] = useState<string | null>(null);
  const key = selection ? JSON.stringify(selection) : "";
  const { locale, t } = useI18n();
  const P = t.panel;
  const il = intlLocale(locale);
  const price = (p: Plan) => formatPrice(p.price.amount, p.price.currency, il);

  useEffect(() => {
    if (!selection) return;
    let alive = true;
    setLoad({ state: "loading" }); setChosen(null);
    const p = selection.kind === "country" ? catalog.plansForCountry(selection.iso2) : selection.kind === "region" ? catalog.plansForRegion(selection.id) : catalog.globalPlans();
    p.then((plans) => { if (alive) { setLoad({ state: "ready", plans }); setChosen(plans[2]?.id ?? plans[0]?.id ?? null); } })
      .catch((e: unknown) => alive && setLoad({ state: "error", message: e instanceof Error ? e.message : "Unknown error" }));
    return () => { alive = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!selection) return null;
  const { title, icon, kicker } = titleOf(selection, locale, t);
  const details = detailsHref(selection);
  const plan = load.state === "ready" ? load.plans.find((p) => p.id === chosen) : undefined;
  const isFixture = load.state === "ready" && load.plans.some((p) => p.source === "DEV_FIXTURE");

  return (
    <aside
      key={key}
      aria-label={fmt(P.plansLabel, { name: title })}
      className="glass reveal fixed inset-x-0 bottom-0 z-20 flex max-h-[72dvh] flex-col rounded-t-3xl md:inset-x-auto md:bottom-6 md:end-6 md:top-24 md:max-h-none md:w-[400px] md:rounded-3xl"
    >
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-ice-500/50 md:hidden" aria-hidden />
      <header className="flex items-start gap-4 px-6 pb-4 pt-4 md:pt-6">
        <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-2xl bg-space-700/80 text-2xl">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-cyan-300">{kicker}</p>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-white">{title}</h2>
          {details && <a href={localePath(locale, details)} className="text-xs text-cyan-300 underline-offset-2 hover:underline">{P.details}</a>}
        </div>
        <button onClick={() => explorer.select(null, false)} className="grid size-9 place-items-center rounded-full text-ice-300 hover:bg-white/10 hover:text-white" aria-label={P.close}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
      </header>

      {isFixture && (
        <p className="mx-6 mb-3 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-xs leading-relaxed text-amber-200" role="note">
          {P.sandboxNote}
        </p>
      )}

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {load.state === "loading" && (
          <div className="space-y-2" aria-busy="true" aria-live="polite">
            <span className="sr-only">{P.loading}</span>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[68px] animate-pulse rounded-2xl bg-white/5" />)}
          </div>
        )}
        {load.state === "error" && (
          <div role="alert" className="rounded-2xl bg-danger/10 p-4 text-sm text-red-200">
            {P.loadError} <button className="underline" onClick={() => explorer.select(selection, false)}>{P.tryAgain}</button>
          </div>
        )}
        {load.state === "ready" && load.plans.length === 0 && (
          <div className="rounded-2xl bg-white/5 p-5 text-sm leading-relaxed text-ice-300">
            <p className="font-medium text-white">{t.common.notAvailable}</p>
            <p className="mt-1">{fmt(P.notSoldBody, { name: title })}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => explorer.select({ kind: "global" })} className="rounded-full bg-white/10 px-3 py-1.5 text-white hover:bg-white/15">{P.seeGlobal}</button>
            </div>
          </div>
        )}
        {load.state === "ready" && load.plans.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-sm text-ice-300">{P.chooseData}</legend>
            <div className="grid grid-cols-2 gap-2">
              {load.plans.map((p) => {
                const on = p.id === chosen;
                return (
                  <label key={p.id} className={`relative cursor-pointer rounded-2xl border p-3.5 transition ${on ? "border-cyan-400/70 bg-blue-500/20 shadow-[0_0_0_1px_rgba(57,198,255,0.35)]" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}>
                    <input type="radio" name="plan" value={p.id} checked={on} onChange={() => setChosen(p.id)} className="sr-only" />
                    <span className="block font-display text-lg font-semibold text-white">{p.dataGb === null ? t.common.unlimited : fmt(t.common.gb, { n: p.dataGb })}</span>
                    <span className="block text-xs text-ice-400">{fmt(t.common.days, { n: p.validityDays })}</span>
                    <span className="mt-2 block text-[15px] font-medium text-cyan-200">{price(p)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
        {plan && (
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-white/[0.04] p-4 text-sm">
            <div><dt className="text-ice-400">{P.network}</dt><dd className="text-ice-50">{[...new Set(plan.networks.flatMap((n) => n.tech))].join(" / ")}</dd></div>
            <div><dt className="text-ice-400">{P.hotspot}</dt><dd className="text-ice-50">{plan.hotspot ? P.allowed : P.no}</dd></div>
            <div><dt className="text-ice-400">{P.activation}</dt><dd className="text-ice-50">{fmt(P.activationValue, { n: plan.activation.windowDays })}</dd></div>
            <div><dt className="text-ice-400">{P.coverage}</dt><dd className="text-ice-50">{plan.coverage.length === 1 ? P.countriesOne : fmt(P.countriesMany, { n: plan.coverage.length })}</dd></div>
            {plan.fairUsage && <div className="col-span-2"><dt className="text-ice-400">{P.fairUse}</dt><dd className="text-ice-50">{plan.fairUsage}</dd></div>}
          </dl>
        )}
      </div>

      {plan && (
        <footer className="border-t border-white/10 px-6 py-4">
          {process.env.NEXT_PUBLIC_API_URL ? (
            <a href={`/checkout?plan=${plan.id}`} className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-500 font-medium text-white transition hover:bg-blue-400">
              {fmt(P.continue, { price: price(plan) })}
            </a>
          ) : (
            <>
              <button disabled aria-describedby="checkout-note" className="h-12 w-full rounded-xl bg-blue-500 font-medium text-white opacity-70 disabled:cursor-not-allowed">{fmt(P.continue, { price: price(plan) })}</button>
              <p id="checkout-note" className="mt-2 text-center text-xs text-ice-400">{P.needsApi}</p>
            </>
          )}
        </footer>
      )}
    </aside>
  );
}
