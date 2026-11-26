"use client";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_NAMES, localePath, stripLocale, type Locale } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/client";

// A native select: keyboard and screen-reader friendly, and works on every phone.
export function LanguageSwitcher({ tone = "dark" }: { tone?: "dark" | "adaptive" }) {
  const { locale, t } = useI18n();
  const pathname = usePathname() ?? "/";
  function go(l: Locale) {
    const base = stripLocale(pathname);
    window.location.assign(localePath(l, base) + window.location.search);
  }
  const cls = tone === "dark" ? "border-white/15 bg-transparent text-ice-100 hover:border-white/35" : "border-[var(--border)] bg-transparent text-[var(--fg)]";
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t.common.language}</span>
      <select value={locale} onChange={(e) => go(e.target.value as Locale)} data-testid="language-switcher"
        className={`h-9 max-w-[8.5rem] cursor-pointer appearance-none rounded-full border ps-3 pe-7 text-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${cls}`}>
        {LOCALES.map((l) => <option key={l} value={l} lang={l} className="bg-white text-ice-900">{LOCALE_NAMES[l]}</option>)}
      </select>
      <svg aria-hidden width="10" height="10" viewBox="0 0 10 10" className="pointer-events-none absolute end-3 opacity-70"><path d="M1 3l4 4 4-4" stroke="currentColor" fill="none" strokeWidth="1.5" /></svg>
    </label>
  );
}
