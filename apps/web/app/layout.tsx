import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/sora";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bleusim.com"),
  title: { default: "BLEUSIM — Travel eSIM data, chosen on a living Earth", template: "%s · BLEUSIM" },
  description: "Explore the planet, pick your destination and get mobile data before you land. One planet. Endless connections.",
  openGraph: { siteName: "BLEUSIM", type: "website" },
  icons: { icon: "/brand/favicon.svg" },
};
export const viewport: Viewport = { themeColor: "#020B1F", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="bg-space-900 text-ice-50 min-h-dvh">{children}</body>
    </html>
  );
}
