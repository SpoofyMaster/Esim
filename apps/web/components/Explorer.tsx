"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { REGIONS, countryByIso2, flagEmoji } from "@bleusim/geospatial";
import { DEV_COVERAGE, regionCoverage, catalog, formatPrice } from "@/lib/catalog";
import { explorer, selectionFromUrl, useExplorer } from "@/lib/store";
import { SearchBox } from "./SearchBox";
import { DestinationPanel } from "./DestinationPanel";
import { SiteHeader } from "./SiteHeader";
import { useI18n } from "@/lib/i18n/client";
import { fmt, intlLocale } from "@/lib/i18n";

const EarthScene = dynamic(() => import("./globe/EarthScene"), { ssr: false });

function detectWebGL() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}
function detectQuality(): "high" | "low" {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const small = window.matchMedia("(max-width: 768px)").matches;
  if (small || (nav.deviceMemory && nav.deviceMemory <= 4) || (navigator.hardwareConcurrency ?? 8) <= 4) return "low";
  return "high";
}

export function Explorer() {
  const [env, setEnv] = useState<{ webgl: boolean; quality: "high" | "low"; reduced: boolean } | null>(null);
  const selection = useExplorer((s) => s.selection);
  const ready = useExplorer((s) => s.globeReady);
  const webglLost = useExplorer((s) => s.webgl === "unavailable");
  const [prices, setPrices] = useState<Record<string, { amount: number; currency: string }>>({});
  const { locale, t } = useI18n();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const forceFallback = new URLSearchParams(location.search).has("nogl");
    const webgl = !forceFallback && detectWebGL();
    setEnv({ webgl, quality: detectQuality(), reduced });
    explorer.set({ webgl: webgl ? "ok" : "unavailable" });
    const s = selectionFromUrl();
    if (s) explorer.select(s);
    catalog.listDestinations().then((d) => setPrices(Object.fromEntries(d.map((x) => [x.iso2, x.fromPrice]))));
  }, []);

  const highlight = useMemo(() => {
    if (selection?.kind === "region") return regionCoverage(selection.id);
    if (selection?.kind === "global") return DEV_COVERAGE;
    return [];
  }, [selection]);

  const showGlobe = env?.webgl && !webglLost;

  return (
    <>
      <SiteHeader />
      <section aria-label={t.home.exploreLabel} className="relative overflow-hidden">
        {/* Soft brand shapes: the blue/cyan of the logo plays the role of an accent colour on white. */}
        <div aria-hidden className="pointer-events-none absolute -top-40 end-[-10%] size-[620px] rounded-full bg-[radial-gradient(circle_at_center,rgba(57,198,255,0.28),transparent_65%)] float-slower" />
        <div aria-hidden className="pointer-events-none absolute -bottom-48 start-[-12%] size-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,87,255,0.14),transparent_65%)] float-slow" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-6 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14 lg:pb-24 lg:pt-10">
          <div className="relative z-10 min-w-0">
            <p className="reveal inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/[0.06] px-3 py-1 text-xs font-medium text-blue-600" style={{ animationDelay: "0.1s" }}>
              <span aria-hidden className="size-1.5 rounded-full bg-cyan-400" />{t.landing.heroKicker}
            </p>
            <h1 className="reveal mt-5 font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-ice-900 md:text-[60px]" style={{ animationDelay: "0.2s" }}>
              {t.home.title}
            </h1>
            <p className="reveal mt-4 max-w-lg text-lg text-ice-600 md:text-xl" style={{ animationDelay: "0.3s" }}>{t.home.subtitle}</p>
            <div className="reveal mt-8 max-w-xl" style={{ animationDelay: "0.4s" }}><SearchBox /></div>
            <div className="reveal mt-4 flex flex-wrap gap-2" style={{ animationDelay: "0.5s" }}>
              {REGIONS.slice(0, 4).map((r) => (
                <button key={r.id} onClick={() => explorer.select({ kind: "region", id: r.id })} className="rounded-full border border-ice-200 bg-white px-3.5 py-1.5 text-sm text-ice-700 transition hover:border-blue-500/40 hover:text-blue-600">
                  {r.names[locale]}
                </button>
              ))}
              <button onClick={() => explorer.select({ kind: "global" })} className="rounded-full border border-ice-200 bg-white px-3.5 py-1.5 text-sm text-ice-700 transition hover:border-blue-500/40 hover:text-blue-600">{t.common.global}</button>
            </div>
          </div>

          {/* The planet, framed like a window onto space. */}
          <div className="reveal-fade relative min-w-0" style={{ animationDelay: "0.15s" }}>
            <div aria-hidden className="absolute -inset-3 rounded-[2.4rem] bg-gradient-to-br from-cyan-300/40 via-blue-400/10 to-transparent blur-2xl" />
            <div className="relative h-[380px] overflow-hidden rounded-[2rem] bg-space-900 shadow-[0_40px_80px_-30px_rgba(0,40,120,0.45)] ring-1 ring-ice-900/5 sm:h-[460px] lg:h-[580px]">
              {showGlobe && env && <EarthScene coverage={DEV_COVERAGE} highlight={highlight} quality={env.quality} reducedMotion={env.reduced} />}
              {env && !showGlobe && <StaticEarth />}
              {showGlobe && (
                <p className={`pointer-events-none absolute inset-x-0 bottom-4 px-4 text-center text-xs tracking-wide text-ice-300 transition-opacity ${ready && !selection ? "opacity-100" : "opacity-0"}`}>
                  {t.home.hint}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
      {showGlobe && <HoverTip prices={prices} />}
      <DestinationPanel />
    </>
  );
}

function HoverTip({ prices }: { prices: Record<string, { amount: number; currency: string }> }) {
  const iso = useExplorer((s) => s.hoverIso);
  const { locale, t } = useI18n();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const f = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", f);
    return () => window.removeEventListener("pointermove", f);
  }, []);
  if (!iso) return null;
  const c = countryByIso2(iso);
  const p = prices[iso];
  return (
    <div role="status" className="glass pointer-events-none fixed z-40 rounded-xl px-3 py-2 text-sm text-ice-900" style={{ left: pos.x + 16, top: pos.y + 16 }}>
      <div className="flex items-center gap-2 font-medium text-ice-900"><span aria-hidden>{flagEmoji(iso)}</span>{c?.names[locale]}</div>
      <div className="text-xs text-ice-600">{p ? <>{fmt(t.home.from, { price: formatPrice(p.amount, p.currency, intlLocale(locale)) })} <span className="text-amber-700">· {t.common.sandbox}</span></> : t.common.notAvailable}</div>
    </div>
  );
}

function StaticEarth() {
  // No-WebGL fallback: a generated orbit loop (muted, decorative). Reduced motion gets the still poster only.
  return (
    <div aria-hidden className="absolute inset-0">
      <img src="/media/hero-earth-orbit-loop-16x9-poster.webp" alt="" className="absolute inset-0 h-full w-full object-cover object-[70%_50%]" />
      <video className="absolute inset-0 h-full w-full object-cover object-[70%_50%] motion-reduce:hidden" src="/media/hero-earth-orbit-loop-16x9-720.mp4" poster="/media/hero-earth-orbit-loop-16x9-poster.webp" autoPlay muted loop playsInline preload="metadata" />
    </div>
  );
}
