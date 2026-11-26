"use client";
import { useId, useRef, useState } from "react";

export interface TabCard { key: string; title: string; sub: string; href: string; flag?: string; image?: string }
export interface TabDef { id: string; label: string; cards: TabCard[] }

const Arrow = () => (
  <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ice-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-ice-900 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">
    <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Segmented tabs (Country / Region / Global) with roving focus, per the WAI-ARIA tabs pattern. */
export function DestinationTabs({ tabs, label }: { tabs: TabDef[]; label: string }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  function move(i: number) {
    const n = (i + tabs.length) % tabs.length;
    setActive(n);
    refs.current[n]?.focus();
  }
  const tab = tabs[active]!;
  return (
    <div>
      <div role="tablist" aria-label={label} className="inline-flex rounded-full border border-ice-200 bg-white p-1">
        {tabs.map((t, i) => (
          <button key={t.id} ref={(el) => { refs.current[i] = el; }} role="tab" id={`${id}-tab-${t.id}`} aria-selected={i === active} aria-controls={`${id}-panel`} tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              const rtl = document.dir === "rtl";
              if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) { e.preventDefault(); move(i + 1); }
              if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) { e.preventDefault(); move(i - 1); }
            }}
            className={`h-10 rounded-full px-5 text-[15px] font-medium transition-colors duration-300 ${i === active ? "bg-ice-900 text-white" : "text-ice-700 hover:text-ice-900"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <ul key={tab.id} id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${tab.id}`} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tab.cards.map((c, i) => (
          <li key={c.key} className="reveal" style={{ animationDelay: `${i * 0.04}s` }}>
            <a href={c.href} className="card-lift group flex items-center gap-4 rounded-2xl bg-ice-50 px-5 py-5 hover:bg-ice-100">
              {c.flag ? (
                <img src={c.flag} alt="" width={44} height={44} className="size-11 shrink-0 rounded-full object-cover shadow-[0_0_0_1px_rgba(13,21,38,0.08)]" />
              ) : c.image ? (
                <img src={c.image} alt="" className="size-11 shrink-0 rounded-full object-cover" loading="lazy" />
              ) : (
                <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xl text-white">◍</span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-lg font-medium text-ice-900">{c.title}</span>
                <span className="block text-[15px] text-ice-600">{c.sub}</span>
              </span>
              <Arrow />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
