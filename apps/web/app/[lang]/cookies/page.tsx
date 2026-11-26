import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/site/LegalPage";
import { CookiePreferences } from "@/components/site/CookiePreferences";
import { COOKIES } from "@/lib/legal";
import { isLocale, localePath } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";
import { langAlternates } from "@/lib/server-catalog";

type P = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDict(lang).site.cookies, description: COOKIES.intro, alternates: { canonical: localePath(lang, "/cookies"), languages: langAlternates("/cookies") } };
}
export default async function Page({ params }: P) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <LegalPage lang={lang} doc={COOKIES} title={getDict(lang).site.cookies}><CookiePreferences /></LegalPage>;
}
