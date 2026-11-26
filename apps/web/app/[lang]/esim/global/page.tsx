import { DESTINATION_IMAGES } from "@/lib/media";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DestinationPage } from "@/components/DestinationPage";
import { serverCatalog, INDEXABLE, langAlternates } from "@/lib/server-catalog";
import { isLocale, localePath } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";
export const revalidate = 300;
type P = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return { title: t.meta.globalTitle, description: t.meta.globalDescription, alternates: { canonical: localePath(lang, "/esim/global"), languages: langAlternates("/esim/global") }, robots: { index: INDEXABLE, follow: true } };
}
export default async function Page({ params }: P) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const plans = await serverCatalog.global();
  return <DestinationPage lang={lang} kind="global" name={getDict(lang).common.global} path="/esim/global" globeHref="/explore?g=1" plans={plans} image={DESTINATION_IMAGES.global} />;
}
