"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/catalog";
import { SandboxBanner } from "./Shell";

interface Order { number: string; status: string; email: string; total: { minor: number; currency: string }; items: { plan: { destination: { en: string }; dataMb: number | null; validityDays: number; source: string }; esim: { iccid: string; isSandbox: boolean; lpa: string } | null }[] }

const STATUS: Record<string, { label: string; tone: string }> = {
  FULFILLED: { label: "Ready to install", tone: "text-emerald-700 dark:text-emerald-300" },
  PAYMENT_FAILED: { label: "Payment declined", tone: "text-red-700 dark:text-red-300" },
  PROVISIONING: { label: "Preparing your eSIM", tone: "text-blue-600 dark:text-cyan-300" },
  PAID: { label: "Payment received", tone: "text-blue-600 dark:text-cyan-300" },
  PENDING_PAYMENT: { label: "Waiting for payment", tone: "text-amber-700 dark:text-amber-300" },
  PROVISIONING_FAILED: { label: "We hit a problem issuing your eSIM", tone: "text-red-700 dark:text-red-300" },
};

export function OrderView({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [qr, setQr] = useState<string>("");

  useEffect(() => {
    const t = new URLSearchParams(window.location.hash.slice(1)).get("t") ?? "";
    api<Order>(`/v1/orders/${id}`, { headers: { "x-order-token": t } }).then(setOrder).catch((e: Error) => setErr(e.message));
  }, [id]);
  useEffect(() => {
    const lpa = order?.items[0]?.esim?.lpa;
    if (lpa) QRCode.toString(lpa, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#020B1F", light: "#FFFFFF" } }).then(setQr);
  }, [order]);

  if (err) return <div role="alert" className="rounded-2xl border border-[var(--border)] p-6"><p className="font-medium">Order not found</p><p className="mt-1 text-sm text-[var(--fg-muted)]">Use the link from your confirmation email.</p></div>;
  if (!order) return <div aria-busy className="h-60 animate-pulse rounded-2xl bg-white/5" />;
  const item = order.items[0]!;
  const st = STATUS[order.status] ?? { label: order.status, tone: "" };
  const [, smdp, code] = item.esim?.lpa.split("$") ?? [];

  return (
    <div>
      {(item.plan.source === "DEV_FIXTURE" || item.esim?.isSandbox) && <SandboxBanner />}
      <p className="text-sm text-[var(--fg-muted)]">Order {order.number}</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">{item.plan.destination.en} · {item.plan.dataMb === null ? "Unlimited" : `${item.plan.dataMb / 1024} GB`}</h1>
      <p className={`mt-2 font-medium ${st.tone}`} role="status">{st.label}</p>

      {order.status === "PAYMENT_FAILED" && (
        <div className="mt-6 rounded-2xl border border-[var(--border)] p-5 text-sm">
          Your payment didn’t go through and you haven’t been charged. <a href="/" className="text-[var(--accent)] underline">Choose a plan again</a>.
        </div>
      )}

      {item.esim && (
        <div className="mt-8 grid gap-8 md:grid-cols-[260px_1fr]">
          <figure className="rounded-2xl bg-white p-4">
            <div aria-label="eSIM QR code" role="img" className="aspect-square w-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} />
            {item.esim.isSandbox && <figcaption className="mt-2 text-center text-xs font-medium text-amber-700">Sandbox QR · will not install</figcaption>}
          </figure>
          <div>
            <h2 className="font-medium">Install before you fly</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--fg-muted)]">
              <li>Connect to Wi-Fi at home.</li>
              <li>iPhone: Settings → Cellular → Add eSIM → Use QR code. Android: Settings → Network → SIMs → Add eSIM.</li>
              <li>Scan the QR code, or enter the details below manually.</li>
              <li>Label the line “BLEUSIM” and keep your usual line for calls.</li>
              <li>On arrival, set BLEUSIM for mobile data and turn on <strong>data roaming</strong> for that line.</li>
            </ol>
            <dl className="mt-5 space-y-3 rounded-2xl border border-[var(--border)] p-4 text-sm">
              <div><dt className="text-[var(--fg-muted)]">SM-DP+ address</dt><dd className="break-all font-mono">{smdp}</dd></div>
              <div><dt className="text-[var(--fg-muted)]">Activation code</dt><dd className="break-all font-mono">{code}</dd></div>
              <div><dt className="text-[var(--fg-muted)]">ICCID</dt><dd className="font-mono">{item.esim.iccid}</dd></div>
            </dl>
          </div>
        </div>
      )}
      <p className="mt-8 text-sm text-[var(--fg-muted)]">Total {formatPrice(order.total.minor / 100, order.total.currency)} · {item.esim?.isSandbox ? "sandbox order, no email is sent" : `confirmation sent to ${order.email}`}</p>
    </div>
  );
}
