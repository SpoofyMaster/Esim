import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";


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
        {/* Real screenshot of the BLEUSIM app home in this language (iOS simulator). */}
        <img src={`/media/app-home-${lang}.jpg`} alt="" loading="eager" decoding="async" className="h-full w-full object-cover object-center" />
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
