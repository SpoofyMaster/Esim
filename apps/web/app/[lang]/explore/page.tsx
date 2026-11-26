import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Explorer } from "@/components/Explorer";
import { isLocale, localePath } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";
import { langAlternates } from "@/lib/server-catalog";

type P = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return { title: t.landing.globeTitle, description: t.meta.description, alternates: { canonical: localePath(lang, "/explore"), languages: langAlternates("/explore") } };
}

// The cinematic 3D globe (Universe A, dark). `universe-dark` switches the page background behind it.
export default async function ExplorePage({ params }: P) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <main className="universe-dark bg-space-900 text-ice-50"><Explorer /></main>;
}
