"use client";
import { useEffect, useState } from "react";
import { REGIONS, countryByIso2, flagEmoji } from "@bleusim/geospatial";
import type { Plan } from "@bleusim/catalog";
import { catalog, formatPrice } from "@/lib/catalog";
import { explorer, useExplorer, type Selection } from "@/lib/store";

type Load = { state: "loading" } | { state: "error"; message: string } | { state: "ready"; plans: Plan[] };

function titleOf(s: NonNullable<Selection>) {
  if (s.kind === "country") { const c = countryByIso2(s.iso2); return { title: c?.names.en ?? s.iso2, icon: flagEmoji(s.iso2), kicker: "Destination" }; }
  if (s.kind === "region") { const r = REGIONS.find((x) => x.id === s.id); return { title: r?.names.en ?? s.id, icon: "◎", kicker: "Regional eSIM" }; }
  return { title: "Global", icon: "◍", kicker: "Worldwide eSIM" };
}

export function DestinationPanel() {
  const selection = useExplorer((s) => s.selection);
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [chosen, setChosen] = useState<string | null>(null);
  const key = selection ? JSON.stringify(selection) : "";

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
  const { title, icon, kicker } = titleOf(selection);
  const plan = load.state === "ready" ? load.plans.find((p) => p.id === chosen) : undefined;
  const isFixture = load.state === "ready" && load.plans.some((p) => p.source === "DEV_FIXTURE");

  return (
    <aside
      key={key}
      aria-label={`${title} eSIM plans`}
      className="glass reveal fixed inset-x-0 bottom-0 z-20 flex max-h-[72dvh] flex-col rounded-t-3xl md:inset-x-auto md:bottom-6 md:right-6 md:top-24 md:max-h-none md:w-[400px] md:rounded-3xl"
    >
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-ice-500/50 md:hidden" aria-hidden />
      <header className="flex items-start gap-4 px-6 pb-4 pt-4 md:pt-6">
        <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-2xl bg-space-700/80 text-2xl">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-cyan-300">{kicker}</p>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-white">{title}</h2>
        </div>
        <button onClick={() => explorer.select(null, false)} className="grid size-9 place-items-center rounded-full text-ice-300 hover:bg-white/10 hover:text-white" aria-label="Close destination panel">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
      </header>

      {isFixture && (
        <p className="mx-6 mb-3 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-xs leading-relaxed text-amber-200" role="note">
          Sandbox catalog: plans and prices below are development fixtures, not real offers.
        </p>
      )}

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {load.state === "loading" && (
          <div className="space-y-2" aria-busy="true" aria-live="polite">
            <span className="sr-only">Loading plans</span>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[68px] animate-pulse rounded-2xl bg-white/5" />)}
          </div>
        )}
        {load.state === "error" && (
          <div role="alert" className="rounded-2xl bg-danger/10 p-4 text-sm text-red-200">
            We couldn’t load plans right now. <button className="underline" onClick={() => explorer.select(selection, false)}>Try again</button>
          </div>
        )}
        {load.state === "ready" && load.plans.length === 0 && (
          <div className="rounded-2xl bg-white/5 p-5 text-sm leading-relaxed text-ice-300">
            <p className="font-medium text-white">Not available yet</p>
            <p className="mt-1">We don’t sell plans for {title} at the moment. Regional or global plans may cover it.</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => explorer.select({ kind: "global" })} className="rounded-full bg-white/10 px-3 py-1.5 text-white hover:bg-white/15">See global plans</button>
            </div>
          </div>
        )}
        {load.state === "ready" && load.plans.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-sm text-ice-300">Choose your data</legend>
            <div className="grid grid-cols-2 gap-2">
              {load.plans.map((p) => {
                const on = p.id === chosen;
                return (
                  <label key={p.id} className={`relative cursor-pointer rounded-2xl border p-3.5 transition ${on ? "border-cyan-400/70 bg-blue-500/20 shadow-[0_0_0_1px_rgba(57,198,255,0.35)]" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}>
                    <input type="radio" name="plan" value={p.id} checked={on} onChange={() => setChosen(p.id)} className="sr-only" />
                    <span className="block font-display text-lg font-semibold text-white">{p.dataGb === null ? "Unlimited" : `${p.dataGb} GB`}</span>
                    <span className="block text-xs text-ice-400">{p.validityDays} days</span>
                    <span className="mt-2 block text-[15px] font-medium text-cyan-200">{formatPrice(p.price.amount, p.price.currency)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
        {plan && (
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-white/[0.04] p-4 text-sm">
            <div><dt className="text-ice-400">Network</dt><dd className="text-ice-50">{[...new Set(plan.networks.flatMap((n) => n.tech))].join(" / ")}</dd></div>
            <div><dt className="text-ice-400">Hotspot</dt><dd className="text-ice-50">{plan.hotspot ? "Allowed" : "No"}</dd></div>
            <div><dt className="text-ice-400">Activation</dt><dd className="text-ice-50">On arrival, within {plan.activation.windowDays} days</dd></div>
            <div><dt className="text-ice-400">Coverage</dt><dd className="text-ice-50">{plan.coverage.length} {plan.coverage.length === 1 ? "country" : "countries"}</dd></div>
            {plan.fairUsage && <div className="col-span-2"><dt className="text-ice-400">Fair use</dt><dd className="text-ice-50">{plan.fairUsage}</dd></div>}
          </dl>
        )}
      </div>

      {plan && (
        <footer className="border-t border-white/10 px-6 py-4">
          {process.env.NEXT_PUBLIC_API_URL ? (
            <a href={`/checkout?plan=${plan.id}`} className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-500 font-medium text-white transition hover:bg-blue-400">
              Continue · {formatPrice(plan.price.amount, plan.price.currency)}
            </a>
          ) : (
            <>
              <button disabled aria-describedby="checkout-note" className="h-12 w-full rounded-xl bg-blue-500 font-medium text-white opacity-70 disabled:cursor-not-allowed">Continue · {formatPrice(plan.price.amount, plan.price.currency)}</button>
              <p id="checkout-note" className="mt-2 text-center text-xs text-ice-400">Checkout needs the BLEUSIM API in this environment.</p>
            </>
          )}
        </footer>
      )}
    </aside>
  );
}
