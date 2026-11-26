import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/site/LegalPage";

import { PRIVACY } from "@/lib/legal";
import { isLocale, localePath } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";
import { langAlternates } from "@/lib/server-catalog";

type P = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDict(lang).site.privacy, description: PRIVACY.intro, alternates: { canonical: localePath(lang, "/privacy"), languages: langAlternates("/privacy") } };
}
export default async function Page({ params }: P) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <LegalPage lang={lang} doc={PRIVACY} title={getDict(lang).site.privacy}></LegalPage>;
}
