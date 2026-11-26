import { COUNTRIES } from "@bleusim/geospatial";
import { Logo } from "@/components/brand/Logo";
import { slugOf } from "@/lib/slug";
import { fmt, localePath, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";

export const POPULAR_ISO = ["US", "JP", "TH", "GB", "TR", "PT", "FR", "DE", "NL"];
const FOOTER_ISO = [...POPULAR_ISO, "MA"];

export function SiteFooter({ lang }: { lang: Locale }) {
  const d = getDict(lang);
  const t = d.site;
  const L = (p: string) => localePath(lang, p);
  const home = L("/");
  const cols: { title: string; links: [string, string][] }[] = [
    {
      title: t.footerPopular,
      links: FOOTER_ISO.map((iso) => COUNTRIES.find((c) => c.iso2 === iso)).filter((c) => !!c).map((c) => [c.names[lang], L(`/esim/${slugOf(c)}`)] as [string, string]),
    },
    { title: t.footerCompany, links: [[t.navHow, `${home}#how`], [t.navExplore, L("/explore")], [t.footerAll, L("/destinations")], [d.common.myEsims, "/account"]] },
    { title: t.footerEsim, links: [[t.footerWhat, `${home}#what`], [t.footerRegional, L("/esim/region/europe")], [t.footerGlobal, L("/esim/global")]] },
    { title: t.footerHelp, links: [[t.footerFaq, `${home}#faq`], [t.privacy, L("/privacy")], [t.terms, L("/terms")], [t.cookies, L("/cookies")]] },
  ];
  return (
    <footer className="border-t border-ice-100 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <div className="flex flex-col gap-4 border-b border-ice-100 pb-10 md:flex-row md:items-center md:justify-between">
          <a href={home} aria-label={d.common.home} className="h-9"><Logo className="h-9" adaptive /></a>
          <p className="max-w-sm text-sm text-ice-600">{t.footerTagline}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="text-sm font-semibold text-ice-900">{c.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {c.links.map(([label, href]) => <li key={href}><a href={href} className="text-[15px] text-ice-600 transition hover:text-blue-600">{label}</a></li>)}
              </ul>
            </nav>
          ))}
        </div>
        <div className="flex flex-col gap-4 border-t border-ice-100 pt-6 text-sm text-ice-600 md:flex-row md:items-center md:justify-between">
          <p>{fmt(t.rights, { year: new Date().getFullYear() })}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li><a href={L("/privacy")} className="underline-offset-4 hover:underline">{t.privacy}</a></li>
            <li><a href={L("/terms")} className="underline-offset-4 hover:underline">{t.terms}</a></li>
            <li><a href={L("/cookies")} className="underline-offset-4 hover:underline">{t.cookies}</a></li>
          </ul>
        </div>
        <p className="mt-6 text-xs text-ice-500">{t.sandbox}</p>
      </div>
    </footer>
  );
}
