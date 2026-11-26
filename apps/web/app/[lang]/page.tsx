import { notFound } from "next/navigation";
import { Explorer } from "@/components/Explorer";
import { HomeSections } from "@/components/home/HomeSections";
import { SiteFooter } from "@/components/SiteFooter";
import { isLocale } from "@/lib/i18n";

export const revalidate = 300;

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <>
      <main>
        <Explorer />
        <HomeSections lang={lang} />
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
