import { DESTINATION_IMAGES } from "@/lib/media";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DestinationPage } from "@/components/DestinationPage";
import { regionById, serverCatalog, INDEXABLE, langAlternates } from "@/lib/server-catalog";
import { REGIONS } from "@bleusim/geospatial";

export const revalidate = 300;
export const generateStaticParams = () => REGIONS.map((r) => ({ id: r.id }));
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const r = regionById((await params).id);
  if (!r) return {};
  return { title: `${r.names.en} eSIM — one plan, many countries`, description: `One eSIM for travel across ${r.names.en}. See covered countries, data and activation rules before you buy.`, alternates: { canonical: `/esim/region/${r.id}`, languages: langAlternates(`/esim/region/${r.id}`) }, robots: { index: INDEXABLE, follow: true } };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const r = regionById((await params).id);
  if (!r) notFound();
  const plans = await serverCatalog.region(r.id);
  return <DestinationPage kind="region" name={r.names.en} path={`/esim/region/${r.id}`} globeHref={`/?r=${r.id}`} plans={plans} image={DESTINATION_IMAGES[`region:${r.id}`]} />;
}
