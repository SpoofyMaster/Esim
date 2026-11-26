"use client";
import { useEffect, useState } from "react";
import { Logo } from "./brand/Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n/client";
import { localePath } from "@/lib/i18n";

// Light, sticky header: gains a hairline and blur once the page scrolls.
export function SiteHeader() {
  const { locale, t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  const home = localePath(locale, "/");
  const links: [string, string][] = [[t.nav.destinations, `${home === "/" ? "" : home}/#destinations`], [t.nav.how, `${home === "/" ? "" : home}/#how`], [t.nav.faq, `${home === "/" ? "" : home}/#faq`]];
  return (
    <header className={`sticky top-0 z-30 transition-colors ${scrolled ? "border-b border-ice-200/80 bg-white/85 backdrop-blur-md" : "border-b border-transparent bg-white/0"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:h-[72px] md:px-8">
        <a href={home} aria-label={t.common.home} className="flex items-center"><Logo className="h-7 w-auto md:h-8" adaptive /></a>
        <nav aria-label="Primary" className="hidden items-center gap-1 text-[15px] text-ice-700 md:flex">
          {links.map(([l, h]) => <a key={h} href={h} className="rounded-full px-4 py-2 transition hover:bg-ice-50 hover:text-ice-900">{l}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block"><LanguageSwitcher tone="adaptive" /></div>
          <a href="/account" className="whitespace-nowrap rounded-full bg-ice-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600">{t.common.myEsims}</a>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            className="grid size-10 place-items-center rounded-full text-ice-800 hover:bg-ice-50 md:hidden">
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>{open ? <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /> : <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}</svg>
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Primary" className="border-t border-ice-200 bg-white px-5 pb-5 pt-2 md:hidden">
          {links.map(([l, h]) => <a key={h} href={h} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-base text-ice-800 hover:bg-ice-50">{l}</a>)}
          <div className="mt-2 px-3"><LanguageSwitcher tone="adaptive" /></div>
        </nav>
      )}
    </header>
  );
}
