import { COUNTRIES } from "@bleusim/geospatial";
import { Symbol } from "@/components/brand/Logo";
import { fmt, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";

// BLEUSIM app concept: there is no app yet, so the screen is labelled as a concept.
const flag = (iso: string) => `/flags/${iso.toLowerCase()}.svg`;

function TabIcon({ d, active }: { d: React.ReactNode; active?: boolean }) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-blue-500" : "text-ice-400"}>{d}</svg>;
}

/** Design width of the coded screen in CSS px; it is scaled to the photo's screen hole with container units. */
const DESIGN_W = 300;

/** The BLEUSIM app screen (concept). Fills its container and scales with it. */
export function AppScreen({ lang }: { lang: Locale }) {
  const d = getDict(lang);
  const a = d.app;
  const name = (iso: string) => COUNTRIES.find((c) => c.iso2 === iso)?.names[lang] ?? iso;
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#F6F9FF] [container-type:size]">
      <div className="app-screen-scale absolute start-0 top-0 flex flex-col text-ice-900" style={{ width: DESIGN_W, "--design-w": `${DESIGN_W}px` } as React.CSSProperties}>
        {/* status bar + island */}
          <div className="flex h-11 items-center justify-between px-7 pt-1 text-[12px] font-semibold" dir="ltr">
            <span>9:41</span>
            <span className="absolute left-1/2 top-2.5 h-[24px] w-[84px] -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-center gap-1">
              <svg width="16" height="10" viewBox="0 0 16 10"><rect x="0" y="6" width="3" height="4" rx="1" fill="currentColor" /><rect x="4.3" y="4" width="3" height="6" rx="1" fill="currentColor" /><rect x="8.6" y="2" width="3" height="8" rx="1" fill="currentColor" /><rect x="12.9" y="0" width="3" height="10" rx="1" fill="currentColor" /></svg>
              <span className="text-[10px]">5G</span>
              <svg width="22" height="11" viewBox="0 0 22 11"><rect x="0.5" y="0.5" width="18" height="10" rx="3" fill="none" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="13" height="7" rx="1.6" fill="currentColor" /><rect x="19.5" y="3.5" width="1.6" height="4" rx="0.8" fill="currentColor" opacity="0.4" /></svg>
            </span>
          </div>

          <div className="space-y-3 px-4 pb-3 pt-1">
            {/* header */}
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-white shadow-sm"><Symbol className="size-5" /></span>
              <span className="flex-1 text-[14px] font-semibold">{a.greeting}</span>
              <span className="relative grid size-8 place-items-center rounded-full bg-white shadow-sm">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16ZM10 20a2 2 0 0 0 4 0" /></svg>
                <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-pink-500 ring-2 ring-white" />
              </span>
            </div>

            {/* active eSIM card */}
            <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-blue-500 via-blue-500 to-cyan-400 p-4 text-white shadow-[0_16px_30px_-16px_rgba(0,87,255,0.9)]">
              <svg viewBox="0 0 200 120" className="absolute -end-10 -top-6 h-36 w-56 opacity-25"><ellipse cx="120" cy="60" rx="90" ry="34" fill="none" stroke="white" strokeWidth="1.5" transform="rotate(-18 120 60)" /><circle cx="150" cy="24" r="5" fill="white" /></svg>
              <div className="relative flex items-center gap-2">
                <img src={flag("MA")} alt="" className="size-7 rounded-full ring-2 ring-white/70" />
                <span className="flex-1">
                  <span className="block text-[10px] uppercase tracking-wider text-white/75">{a.activeLabel}</span>
                  <span className="block text-[15px] font-semibold leading-tight">{name("MA")}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold"><span className="pulse-dot size-1.5 rounded-full bg-[#3EE69A]" />{d.landing.heroActive}</span>
              </div>
              <div className="relative mt-4 flex items-end justify-between">
                <span className="text-[10px] text-white/80">{d.landing.heroRemaining}</span>
                <span dir="ltr" className="text-[13px] font-semibold">3.6 <span className="text-white/70">/ 5 GB</span></span>
              </div>
              <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-white/25">
                <div className="fill-bar h-full w-[72%] rounded-full bg-gradient-to-r from-white to-pink-100 rtl:ms-auto" style={{ animationDelay: "0.8s" }} />
              </div>
              <p className="relative mt-2 text-[10px] text-white/85">{fmt(a.daysLeft, { n: 12 })}</p>
            </div>

            {/* plans list */}
            <div className="rounded-[18px] bg-white p-3 shadow-sm">
              <div className="flex items-baseline justify-between px-1">
                <span className="text-[12px] font-semibold">{a.myPlans}</span>
                <span className="text-[10px] text-ice-500">{fmt(a.plansTotal, { n: 3 })}</span>
              </div>
              <ul className="mt-2 space-y-1.5">
                <li className="flex items-center gap-2.5 rounded-xl bg-ice-50 px-2.5 py-2">
                  <img src={flag("JP")} alt="" className="size-6 rounded-full" />
                  <span className="flex-1"><span className="block text-[11.5px] font-semibold">{name("JP")}</span><span className="block text-[10px] text-ice-500">{fmt(a.planDays, { n: 7 })} · <span dir="ltr">3 GB</span></span></span>
                  <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[9.5px] font-semibold text-pink-700">{a.startsOnArrival}</span>
                </li>
                <li className="flex items-center gap-2.5 rounded-xl bg-ice-50 px-2.5 py-2">
                  <span className="grid size-6 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
                  </span>
                  <span className="flex-1"><span className="block text-[11.5px] font-semibold">{d.common.global}</span><span className="block text-[10px] text-ice-500">{fmt(a.planDays, { n: 30 })} · <span dir="ltr">10 GB</span></span></span>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-ice-400 rtl:-scale-x-100"><path d="m9 6 6 6-6 6" /></svg>
                </li>
              </ul>
              <div className="mt-2 flex items-center justify-between border-t border-ice-100 px-1 pt-2.5">
                <span className="flex items-center gap-1.5 text-[11.5px] font-medium">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-blue-500"><path d="M20 11a8 8 0 0 0-14.5-4.6L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.6L20 16m0 4v-4h-4" /></svg>
                  {a.autoTopUp}
                </span>
                <span className="relative h-[18px] w-8 rounded-full bg-pink-500"><span className="absolute end-[2px] top-[2px] size-[14px] rounded-full bg-white shadow" /></span>
              </div>
            </div>

            {/* quick actions */}
            <div>
              <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-ice-500">{a.quickActions}</p>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {[[a.addPlan, a.addPlanSub, <path key="p" d="M12 5v14M5 12h14" />], [a.install, a.installSub, <><rect key="r" x="7" y="3" width="10" height="18" rx="2" /><path key="q" d="M10 8h4M10 12h4" /></>]].map(([title, sub, icon], i) => (
                  <div key={i} className="rounded-2xl bg-white p-2.5 shadow-sm">
                    <span className={`grid size-7 place-items-center rounded-lg ${i === 0 ? "bg-blue-500/10 text-blue-500" : "bg-pink-100 text-pink-600"}`}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">{icon}</svg>
                    </span>
                    <span className="mt-1.5 block truncate text-[11px] font-semibold">{title}</span>
                    <span className="block truncate text-[9.5px] text-ice-500">{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* tab bar */}
          <nav className="mt-auto grid grid-cols-4 border-t border-ice-100 bg-white px-2 pb-4 pt-2 text-[9.5px]">
            {[
              [d.common.myEsims, <><rect key="a" x="5" y="3" width="14" height="18" rx="3" /><path key="b" d="M9 13h6v4H9z" /></>, true],
              [a.tabExplore, <><circle key="a" cx="12" cy="12" r="9" /><path key="b" d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></>, false],
              [a.tabHelp, <><circle key="a" cx="12" cy="12" r="9" /><path key="b" d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6M12 17h.01" /></>, false],
              [a.tabProfile, <><circle key="a" cx="12" cy="8" r="4" /><path key="b" d="M4 21a8 8 0 0 1 16 0" /></>, false],
            ].map(([label, icon, active], i) => (
              <span key={i} className={`flex flex-col items-center gap-0.5 ${active ? "font-semibold text-blue-500" : "text-ice-500"}`}>
                <span className={`grid h-7 w-11 place-items-center rounded-full ${active ? "bg-blue-500/10" : ""}`}><TabIcon d={icon} active={!!active} /></span>
                <span className="max-w-full truncate">{label}</span>
              </span>
            ))}
          </nav>
          <span className="absolute bottom-1.5 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-ice-900/80" />
      </div>
    </div>
  );
}

type Variant = "studio" | "confetti";
// Screen hole of each photo, as % of the image (3712 x 4608). The photo sits on top; its screen is transparent.
const HOLE: Record<Variant, { left: number; top: number; width: number; height: number }> = {
  studio: { left: 35.99, top: 21.48, width: 28.04, height: 50.0 },
  confetti: { left: 34.32, top: 22.29, width: 32.22, height: 53.71 },
};

/** Generated photo of a hand holding a phone (Higgsfield, 2026-11-26) with the coded app screen behind its transparent screen. */
export function HandPhone({ lang, variant = "studio", className = "" }: { lang: Locale; variant?: Variant; className?: string }) {
  const h = HOLE[variant];
  const base = `/media/hand-phone-${variant}`;
  return (
    <div className={`relative aspect-[3712/4608] w-full [container-type:inline-size] ${className}`}>
      <div aria-hidden className="absolute overflow-hidden" style={{ left: `${h.left}%`, top: `${h.top}%`, width: `${h.width}%`, height: `${h.height}%`, borderRadius: `${h.width * 0.09}cqw` }}>
        <AppScreen lang={lang} />
      </div>
      <img src={`${base}-900.webp`} srcSet={`${base}-900.webp 900w, ${base}-1600.webp 1600w`} sizes="(min-width: 1024px) 480px, 90vw"
        alt={getDict(lang).app.alt} width={1600} height={1986} fetchPriority="high" className="absolute inset-0 h-full w-full" />
    </div>
  );
}

/** App Store / Google Play look-alike buttons, deliberately NOT links: the app doesn't exist yet. */
export function StoreButtons({ lang }: { lang: Locale }) {
  const a = getDict(lang).app;
  const btn = "relative inline-flex h-12 cursor-not-allowed select-none items-center gap-2.5 rounded-xl bg-ice-900 pe-4 ps-3 text-white opacity-95";
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span role="link" aria-disabled="true" aria-describedby="stores-note" className={btn}>
        <svg aria-hidden viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M16.4 12.6c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.6ZM14.1 5.6c.6-.8 1.1-1.8 1-2.9-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2.1-.5 2.7-1.3Z" /></svg>
        <span className="leading-none"><span className="block text-[10px] text-white/80">{a.appleTop}</span><span className="block text-[17px] font-semibold tracking-tight">App Store</span></span>
      </span>
      <span role="link" aria-disabled="true" aria-describedby="stores-note" className={btn}>
        <svg aria-hidden viewBox="0 0 24 24" width="20" height="20"><path d="M4 2.8v18.4c0 .4.4.6.7.4l10-9.2L4.7 2.4c-.3-.2-.7 0-.7.4Z" fill="#39C6FF" /><path d="m14.7 12.4-10 9.2 12.6-7.1-2.6-2.1Z" fill="#FF3EA5" /><path d="M4.7 2.4l10 10 2.6-2.1L4.7 2.4Z" fill="#2F7BFF" /><path d="m17.3 10.3-2.6 2.1 2.6 2.1 3.1-1.7c.5-.3.5-1 0-1.3l-3.1-1.2Z" fill="#FFD43B" /></svg>
        <span className="leading-none"><span className="block text-[10px] text-white/80">{a.googleTop}</span><span className="block text-[17px] font-semibold tracking-tight">Google Play</span></span>
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700">
        <span className="size-1.5 rounded-full bg-pink-500" />{a.comingSoon}
      </span>
      <span id="stores-note" className="sr-only">{a.storesNote}</span>
    </div>
  );
}
