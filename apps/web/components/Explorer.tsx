"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { REGIONS, countryByIso2, flagEmoji } from "@bleusim/geospatial";
import { DEV_COVERAGE, regionCoverage, catalog, formatPrice } from "@/lib/catalog";
import { explorer, selectionFromUrl, useExplorer } from "@/lib/store";
import { SearchBox } from "./SearchBox";
import { DestinationPanel } from "./DestinationPanel";
import { Logo } from "./brand/Logo";

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
  const heroHidden = !!selection;

  return (
    <section className="relative h-dvh min-h-[620px] w-full overflow-hidden bg-space-900" aria-label="Explore the world">
      {/* Globe layer */}
      <div className="absolute inset-0 reveal-fade" style={{ animationDelay: "0.1s" }}>
        {showGlobe && env && <EarthScene coverage={DEV_COVERAGE} highlight={highlight} quality={env.quality} reducedMotion={env.reduced} />}
        {env && !showGlobe && <StaticEarth />}
      </div>
      {/* Vignette for legibility */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_45%,transparent_40%,rgba(2,11,31,0.85)_100%)]" />
      <div aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-space-900/90 via-space-900/30 to-transparent transition-opacity duration-700 md:w-2/3 ${heroHidden ? "opacity-0" : "opacity-100"}`} />

      {/* Navigation */}
      <header className="reveal absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 md:px-10 md:py-6" style={{ animationDelay: "0.35s" }}>
        <a href="/" aria-label="BLEUSIM home" className="flex items-center"><Logo className="h-7 w-auto md:h-8" /></a>
        <nav aria-label="Primary" className={`hidden items-center gap-1 text-sm text-ice-200 md:flex ${heroHidden ? "lg:hidden" : ""}`}>
          {[["Destinations", "#destinations"], ["How it works", "#how"], ["Devices", "#devices"], ["Help", "#help"]].map(([l, h]) => (
            <a key={l} href={h} className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white">{l}</a>
          ))}
        </nav>
        {heroHidden && <div className="reveal absolute left-1/2 top-4 hidden w-[min(440px,36vw)] -translate-x-1/2 lg:block md:top-5"><SearchBox size="md" /></div>}
        <div className="flex items-center gap-2">
          <a href="/account" className="rounded-full border border-white/15 px-4 py-2 text-sm text-ice-100 transition hover:border-white/35 hover:text-white">My eSIMs</a>
        </div>
      </header>

      {/* Hero copy + search */}
      <div className={`absolute inset-x-0 top-[18%] z-20 px-5 transition-all duration-700 md:left-10 md:right-auto md:top-[24%] md:w-[560px] md:px-0 ${heroHidden ? "pointer-events-none -translate-y-3 opacity-0" : ""}`}>
        <p className="reveal mb-4 text-xs font-medium uppercase tracking-[0.22em] text-cyan-300" style={{ animationDelay: "0.5s" }}>One planet. Endless connections.</p>
        <h1 className="reveal font-display text-[40px] font-semibold leading-[1.04] tracking-[-0.03em] text-white md:text-[64px]" style={{ animationDelay: "0.6s" }}>
          The world is yours to explore.
        </h1>
        <p className="reveal mt-4 max-w-md text-lg text-ice-300 md:text-xl" style={{ animationDelay: "0.72s" }}>Stay connected wherever life takes you. Pick a place on the planet, get mobile data before you land.</p>
        <div className="reveal mt-8" style={{ animationDelay: "0.82s" }}><SearchBox /></div>
        <div className="reveal mt-4 flex flex-wrap gap-2" style={{ animationDelay: "0.92s" }}>
          {REGIONS.slice(0, 4).map((r) => (
            <button key={r.id} onClick={() => explorer.select({ kind: "region", id: r.id })} className="rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-sm text-ice-200 transition hover:border-cyan-400/50 hover:text-white">
              {r.names.en}
            </button>
          ))}
          <button onClick={() => explorer.select({ kind: "global" })} className="rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-sm text-ice-200 transition hover:border-cyan-400/50 hover:text-white">Global</button>
        </div>
      </div>

      {/* Explore hint */}
      {showGlobe && !selection && (
        <p className={`reveal pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center text-xs tracking-wide text-ice-400 transition-opacity ${ready ? "opacity-100" : "opacity-0"}`} style={{ animationDelay: "1.4s" }}>
          Drag to explore · Scroll to zoom · Click a country
        </p>
      )}

      {showGlobe && <HoverTip prices={prices} />}
      <DestinationPanel />
    </section>
  );
}

function HoverTip({ prices }: { prices: Record<string, { amount: number; currency: string }> }) {
  const iso = useExplorer((s) => s.hoverIso);
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
    <div role="status" className="glass pointer-events-none fixed z-40 rounded-xl px-3 py-2 text-sm" style={{ left: pos.x + 16, top: pos.y + 16 }}>
      <div className="flex items-center gap-2 font-medium text-white"><span aria-hidden>{flagEmoji(iso)}</span>{c?.names.en}</div>
      <div className="text-xs text-ice-300">{p ? <>From {formatPrice(p.amount, p.currency)} <span className="text-amber-300/80">· sandbox</span></> : "Not available yet"}</div>
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
