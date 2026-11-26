"use client";
import { useId, useState } from "react";
import { flagEmoji } from "@bleusim/geospatial";
import { useI18n } from "@/lib/i18n/client";
import { localePath } from "@/lib/i18n";

export interface DestCard { key: string; href: string; name: string; sub: string; iso2?: string; icon?: string }

// Country / Region / Global tabs over server-prepared cards (prices come from the catalog, never hard-coded).
export function HomeDestinations({ countries, regions, global, sandbox }: { countries: DestCard[]; regions: DestCard[]; global: DestCard[]; sandbox: boolean }) {
  const { locale, t } = useI18n();
  const [tab, setTab] = useState<"country" | "region" | "global">("country");
  const id = useId();
  const tabs = [["country", t.landing.tabCountry], ["region", t.landing.tabRegion], ["global", t.landing.tabGlobal]] as const;
  const cards = tab === "country" ? countries : tab === "region" ? regions : global;
  return (
    <div>
      <div role="tablist" aria-label={t.landing.tabsLabel} className="inline-flex rounded-full border border-ice-200 bg-white p-1"
        onKeyDown={(e) => {
          const i = tabs.findIndex(([k]) => k === tab);
          const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!d) return;
          const rtl = document.documentElement.dir === "rtl" ? -1 : 1;
          const next = tabs[(i + d * rtl + tabs.length) % tabs.length]![0];
          setTab(next); document.getElementById(`${id}-${next}`)?.focus();
        }}>
        {tabs.map(([k, label]) => (
          <button key={k} id={`${id}-${k}`} role="tab" type="button" aria-selected={tab === k} aria-controls={`${id}-panel`} tabIndex={tab === k ? 0 : -1} onClick={() => setTab(k)}
            className={`rounded-full px-5 py-2 text-[15px] transition ${tab === k ? "bg-ice-900 text-white" : "text-ice-700 hover:text-ice-900"}`}>{label}</button>
        ))}
      </div>
      <ul id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab}`} className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li key={c.key}>
            <a href={localePath(locale, c.href)} className="group flex items-center gap-4 rounded-2xl bg-ice-50 px-5 py-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_40px_-20px_rgba(0,40,120,0.35)] hover:ring-1 hover:ring-blue-500/20">
              <span aria-hidden className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-white text-2xl ring-1 ring-ice-200">{c.iso2 ? flagEmoji(c.iso2) : c.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-lg font-medium text-ice-900">{c.name}</span>
                <span className="block text-sm text-ice-600">{c.sub}</span>
              </span>
              <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" className="text-ice-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600 rtl:-scale-x-100"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
          </li>
        ))}
      </ul>
      {sandbox && <p className="mt-4 text-xs text-amber-800">{t.directory.sandbox}</p>}
    </div>
  );
}
