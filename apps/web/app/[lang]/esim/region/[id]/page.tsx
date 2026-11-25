import { DESTINATION_IMAGES } from "@/lib/media";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DestinationPage } from "@/components/DestinationPage";
import { regionById, serverCatalog, INDEXABLE, langAlternates } from "@/lib/server-catalog";
import { REGIONS } from "@bleusim/geospatial";
import { LOCALES, fmt, isLocale, localePath } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";

export const revalidate = 300;
type P = { params: Promise<{ lang: string; id: string }> };
export const generateStaticParams = () => LOCALES.flatMap((lang) => REGIONS.map((r) => ({ lang, id: r.id })));
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, id } = await params;
  const r = regionById(id);
  if (!r || !isLocale(lang)) return {};
  const t = getDict(lang);
  const name = r.names[lang];
  const path = `/esim/region/${r.id}`;
  return { title: fmt(t.meta.regionTitle, { name }), description: fmt(t.meta.regionDescription, { name }), alternates: { canonical: localePath(lang, path), languages: langAlternates(path) }, robots: { index: INDEXABLE, follow: true } };
}
export default async function Page({ params }: P) {
  const { lang, id } = await params;
  const r = regionById(id);
  if (!r || !isLocale(lang)) notFound();
  const plans = await serverCatalog.region(r.id);
  return <DestinationPage lang={lang} kind="region" name={r.names[lang]} path={`/esim/region/${r.id}`} globeHref={`/?r=${r.id}`} plans={plans} image={DESTINATION_IMAGES[`region:${r.id}`]} />;
}
