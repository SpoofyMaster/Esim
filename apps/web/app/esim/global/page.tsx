import type { Metadata } from "next";
import { DestinationPage } from "@/components/DestinationPage";
import { serverCatalog, INDEXABLE, langAlternates } from "@/lib/server-catalog";
export const revalidate = 300;
export const metadata: Metadata = { title: "Global eSIM — data across many countries", description: "One eSIM for multi-country trips. See every covered country before you buy.", alternates: { canonical: "/esim/global", languages: langAlternates("/esim/global") }, robots: { index: INDEXABLE, follow: true } };
export default async function Page() {
  const plans = await serverCatalog.global();
  return <DestinationPage kind="global" name="Global" path="/esim/global" globeHref="/?g=1" plans={plans} />;
}
