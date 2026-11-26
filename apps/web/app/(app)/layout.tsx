import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/sora";
import "../globals.css";

// Checkout, account, sign-in, orders and the back office are English-only for now (see DECISIONS: i18n scope).
export const metadata: Metadata = {
  metadataBase: new URL("https://bleusim.com"),
  title: { default: "BLEUSIM", template: "%s · BLEUSIM" },
  robots: { index: false, follow: false },
  icons: { icon: "/brand/favicon.svg" },
};
export const viewport: Viewport = { themeColor: "#FFFFFF", width: "device-width", initialScale: 1 };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" data-theme="light">
      <body className="min-h-dvh bg-white text-ice-900">{children}</body>
    </html>
  );
}
