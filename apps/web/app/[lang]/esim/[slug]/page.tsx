import { DESTINATION_IMAGES, DESTINATION_VIDEOS, MOROCCO_GALLERY } from "@/lib/media";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DestinationPage } from "@/components/DestinationPage";
import { countryBySlug, serverCatalog, slugOf, INDEXABLE, langAlternates } from "@/lib/server-catalog";
import { COUNTRIES } from "@bleusim/geospatial";
import { LOCALES, fmt, isLocale, localePath } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";

export const revalidate = 300;
type P = { params: Promise<{ lang: string; slug: string }> };
export async function generateStaticParams() {
  const dests = await serverCatalog.destinations();
  const slugs = dests.map((d) => COUNTRIES.find((c) => c.iso2 === d.iso2)).filter(Boolean).map((c) => slugOf(c!));
  return LOCALES.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, slug } = await params;
  const c = countryBySlug(slug);
  if (!c || !isLocale(lang)) return {};
  const t = getDict(lang);
  const name = c.names[lang];
  const path = `/esim/${slugOf(c)}`;
  return {
    title: fmt(t.meta.countryTitle, { name }),
    description: fmt(t.meta.countryDescription, { name }),
    alternates: { canonical: localePath(lang, path), languages: langAlternates(path) },
    robots: { index: INDEXABLE, follow: true },
    openGraph: { title: `${fmt(t.page.title, { name })} · BLEUSIM`, url: localePath(lang, path), locale: lang },
  };
}
export default async function Page({ params }: P) {
  const { lang, slug } = await params;
  const c = countryBySlug(slug);
  if (!c?.iso2 || !isLocale(lang)) notFound();
  const plans = await serverCatalog.country(c.iso2);
  return <DestinationPage lang={lang} kind="country" name={c.names[lang]} iso2={c.iso2} path={`/esim/${slugOf(c)}`} globeHref={`/?d=${c.iso2.toLowerCase()}`} plans={plans} image={DESTINATION_IMAGES[c.iso2]} video={DESTINATION_VIDEOS[c.iso2]} gallery={c.iso2 === "MA" ? MOROCCO_GALLERY : undefined} />;
}
