import { COUNTRIES } from "@bleusim/geospatial";
import { Logo } from "./brand/Logo";
import { slugOf } from "@/lib/slug";
import { fmt, localePath, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";

export const POPULAR = ["US", "JP", "TH", "GB", "TR", "PT", "FR", "DE", "NL"] as const;

export function SiteFooter({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const L = (p: string) => localePath(lang, p);
  const home = L("/") === "/" ? "" : L("/");
  const cols: { title: string; links: [string, string][] }[] = [
    { title: t.footer.popular, links: POPULAR.map((iso) => COUNTRIES.find((c) => c.iso2 === iso)!).map((c) => [c.names[lang], L(`/esim/${slugOf(c)}`)]) },
    { title: t.footer.company, links: [[t.home.allDestinations, L("/destinations")], [t.common.global, L("/esim/global")], [t.common.myEsims, "/account"]] },
    { title: t.footer.help, links: [[t.nav.how, `${home}/#how`], [t.nav.faq, `${home}/#faq`]] },
    { title: t.footer.legal, links: [[t.footer.privacy, "/privacy"], [t.footer.terms, "/terms"], [t.footer.cookies, "/cookies"]] },
  ];
  return (
    <footer className="border-t border-ice-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <a href={L("/")} aria-label={t.common.home} className="inline-flex"><Logo className="h-8" adaptive /></a>
        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="text-sm font-semibold text-ice-900">{c.title}</h2>
              <ul className="mt-4 space-y-2.5 text-[15px] text-ice-600">
                {c.links.map(([l, h]) => <li key={h}><a href={h} className="hover:text-blue-600">{l}</a></li>)}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-ice-200 pt-6 text-sm text-ice-500 md:flex-row md:items-center md:justify-between">
          <p>{fmt(t.footer.rights, { year: new Date().getFullYear() })}</p>
          <p>{t.footer.sandbox}{lang !== "en" ? ` ${t.footer.legalEnglish}` : ""}</p>
        </div>
      </div>
    </footer>
  );
}
