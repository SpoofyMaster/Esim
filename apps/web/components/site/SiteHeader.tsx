import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { localePath, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";

const SearchIcon = () => (
  <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
);

// Light, sticky site header shared by the homepage, destination pages and legal pages.
export function SiteHeader({ lang }: { lang: Locale }) {
  const d = getDict(lang);
  const t = d.site;
  const L = (p: string) => localePath(lang, p);
  const home = L("/");
  const links: [string, string][] = [
    [t.navDestinations, `${home}#destinations`],
    [t.navHow, `${home}#how`],
    [t.navExplore, L("/explore")],
    [t.navHelp, `${home}#faq`],
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-ice-100/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 md:h-[72px] md:px-8">
        <a href={home} aria-label={d.common.home} className="flex h-7 items-center md:h-8"><Logo className="h-full" adaptive /></a>
        <nav aria-label="Primary" className="ms-4 hidden items-center gap-1 text-[15px] text-ice-700 lg:flex">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="whitespace-nowrap rounded-full px-3.5 py-2 transition hover:bg-ice-50 hover:text-ice-900">{label}</a>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <a href={L("/destinations")} className="hidden h-10 items-center gap-2 whitespace-nowrap rounded-full border border-ice-900 px-4 text-sm font-medium text-ice-900 transition hover:bg-ice-900 hover:text-white xl:inline-flex">
            <SearchIcon />{t.searchDestinations}
          </a>
          <LanguageSwitcher tone="adaptive" />
          <a href="/account" className="hidden h-10 items-center whitespace-nowrap rounded-full bg-blue-500 px-4 text-sm font-medium text-white transition hover:bg-blue-600 sm:inline-flex">{d.common.myEsims}</a>
          <details className="relative lg:hidden">
            <summary aria-label={t.menu} className="grid size-10 cursor-pointer list-none place-items-center rounded-full border border-ice-200 text-ice-900">
              <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </summary>
            <div className="absolute end-0 top-12 w-64 rounded-2xl border border-ice-100 bg-white p-2 shadow-[0_24px_60px_-24px_rgba(13,21,38,0.4)]">
              {links.map(([label, href]) => <a key={href} href={href} className="block rounded-xl px-4 py-3 text-ice-900 hover:bg-ice-50">{label}</a>)}
              <a href={L("/destinations")} className="block rounded-xl px-4 py-3 text-ice-900 hover:bg-ice-50">{t.searchDestinations}</a>
              <a href="/account" className="mt-1 block rounded-xl bg-blue-500 px-4 py-3 text-center font-medium text-white">{d.common.myEsims}</a>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
