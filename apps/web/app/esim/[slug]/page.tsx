import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DestinationPage } from "@/components/DestinationPage";
import { countryBySlug, serverCatalog, slugOf, INDEXABLE, langAlternates } from "@/lib/server-catalog";
import { COUNTRIES } from "@bleusim/geospatial";

export const revalidate = 300;
export async function generateStaticParams() {
  const dests = await serverCatalog.destinations();
  return dests.map((d) => COUNTRIES.find((c) => c.iso2 === d.iso2)).filter(Boolean).map((c) => ({ slug: slugOf(c!) }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = countryBySlug((await params).slug);
  if (!c) return {};
  const path = `/esim/${slugOf(c)}`;
  return {
    title: `${c.names.en} eSIM — mobile data for your trip`,
    description: `Get an eSIM for ${c.names.en}: pick your data, install before you fly and connect on arrival. Clear activation rules, no roaming surprises.`,
    alternates: { canonical: path, languages: langAlternates(path) },
    robots: { index: INDEXABLE, follow: true },
    openGraph: { title: `${c.names.en} eSIM · BLEUSIM`, url: path },
  };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const c = countryBySlug((await params).slug);
  if (!c?.iso2) notFound();
  const plans = await serverCatalog.country(c.iso2);
  return <DestinationPage kind="country" name={c.names.en} iso2={c.iso2} path={`/esim/${slugOf(c)}`} globeHref={`/?d=${c.iso2.toLowerCase()}`} plans={plans} />;
}
