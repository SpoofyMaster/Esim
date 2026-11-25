import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/inter";
import "@fontsource-variable/sora";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "../globals.css";
import { LOCALES, dirOf, isLocale, localePath } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/dicts";
import { I18nProvider } from "@/lib/i18n/client";
import { langAlternates } from "@/lib/server-catalog";

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return {
    metadataBase: new URL("https://bleusim.com"),
    title: { default: t.meta.title, template: "%s · BLEUSIM" },
    description: t.meta.description,
    alternates: { canonical: localePath(lang, "/"), languages: langAlternates("/") },
    openGraph: { siteName: "BLEUSIM", type: "website", locale: lang },
    icons: { icon: "/brand/favicon.svg" },
  };
}
export const viewport: Viewport = { themeColor: "#020B1F", width: "device-width", initialScale: 1 };

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang} dir={dirOf(lang)}>
      <body className="bg-space-900 text-ice-50 min-h-dvh"><I18nProvider locale={lang} t={getDict(lang)}>{children}</I18nProvider></body>
    </html>
  );
}
