import { Suspense } from "react";
import { CommerceShell } from "@/components/commerce/Shell";
import { CheckoutForm } from "@/components/commerce/CheckoutForm";
export const metadata = { title: "Checkout", robots: { index: false } };
export default function CheckoutPage() {
  return (
    <CommerceShell step="Secure checkout">
      <Suspense fallback={<p className="text-[var(--fg-muted)]">Loading…</p>}><CheckoutForm /></Suspense>
    </CommerceShell>
  );
}
