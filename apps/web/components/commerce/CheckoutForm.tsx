"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, API_URL } from "@/lib/api";
import { formatPrice } from "@/lib/catalog";
import { SandboxBanner } from "./Shell";

interface PlanDetail { id: string; destination: { names: { en: string } }; dataGb: number | null; validityDays: number; price: { amount: number; currency: string }; coverageCount: number; activation: { windowDays: number }; hotspot: boolean; source: string }
interface CheckoutRes { orderId: string; accessToken: string; paymentRef: string }

export function CheckoutForm() {
  const planId = useSearchParams().get("plan") ?? "";
  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [compat, setCompat] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<CheckoutRes | null>(null);
  const idemKey = useMemo(() => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2, 10)), []);

  useEffect(() => {
    if (!API_URL) { setErr("Checkout needs the BLEUSIM API (NEXT_PUBLIC_API_URL is not set)."); return; }
    if (!/^[a-z0-9-]{3,80}$/.test(planId)) { setErr("No plan selected."); return; }
    api<PlanDetail>(`/v1/plans/${planId}`).then(setPlan).catch((e: Error) => setErr(e.message));
    api<{ user: { email: string } }>("/v1/me").then((m) => setEmail((v) => v || m.user.email)).catch(() => { /* guest checkout */ });
  }, [planId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try { setPending(await api<CheckoutRes>("/v1/checkout", { method: "POST", json: { retailPlanId: planId, email, idempotencyKey: idemKey } })); }
    catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }
  async function pay(outcome: "succeeded" | "failed") {
    if (!pending) return;
    setBusy(true); setErr(null);
    try {
      await api(`/v1/sandbox/payments/${pending.paymentRef}/complete`, { method: "POST", json: { outcome } });
      window.location.assign(`/order/${pending.orderId}#t=${pending.accessToken}`);
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  }

  if (err && !plan) return <div role="alert" className="rounded-2xl border border-[var(--border)] p-6"><p className="font-medium">We can’t start checkout</p><p className="mt-1 text-sm text-[var(--fg-muted)]">{err}</p><a href="/" className="mt-4 inline-block text-sm text-[var(--accent)] underline">Back to destinations</a></div>;
  if (!plan) return <div aria-busy className="h-40 animate-pulse rounded-2xl bg-white/5" />;

  const label = plan.dataGb === null ? "Unlimited" : `${plan.dataGb} GB`;
  return (
    <div className="grid gap-8 md:grid-cols-[1fr_300px]">
      <div>
        {plan.source === "DEV_FIXTURE" && <SandboxBanner />}
        <h1 className="font-display text-3xl font-semibold tracking-tight">Checkout</h1>
        {!pending ? (
          <form onSubmit={submit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email for your eSIM</label>
              <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 outline-none focus:border-[var(--focus)]" />
              <p className="mt-1.5 text-xs text-[var(--fg-muted)]">We send your QR code and installation steps here. <a href={`/login?next=${encodeURIComponent(`/checkout?plan=${planId}`)}`} className="underline">Sign in</a> to keep it in My eSIMs.</p>
            </div>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" required checked={compat} onChange={(e) => setCompat(e.target.checked)} className="mt-0.5 size-4 accent-[var(--accent)]" />
              <span>My phone supports eSIM and is carrier-unlocked. <a href="/#devices" className="text-[var(--accent)] underline">Check devices</a></span>
            </label>
            {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
            <button disabled={busy} className="h-12 w-full rounded-xl bg-blue-500 font-medium text-white transition hover:bg-blue-400 disabled:opacity-60">
              {busy ? "Creating order…" : `Continue to payment · ${formatPrice(plan.price.amount, plan.price.currency)}`}
            </button>
          </form>
        ) : (
          <section aria-labelledby="pay-h" className="mt-6 rounded-2xl border border-[var(--border)] p-6">
            <h2 id="pay-h" className="font-medium">Sandbox payment</h2>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">A real card form (Stripe) replaces this step once payment keys are configured. Choose an outcome to test the flow.</p>
            {err && <p role="alert" className="mt-3 text-sm text-red-700">{err}</p>}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button disabled={busy} onClick={() => pay("succeeded")} className="h-11 flex-1 rounded-xl bg-blue-500 font-medium text-white hover:bg-blue-400 disabled:opacity-60">Simulate successful payment</button>
              <button disabled={busy} onClick={() => pay("failed")} className="h-11 flex-1 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-subtle)] disabled:opacity-60">Simulate declined payment</button>
            </div>
          </section>
        )}
      </div>
      <aside aria-label="Order summary" className="h-fit rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5">
        <p className="text-sm text-[var(--fg-muted)]">{plan.destination.names.en}</p>
        <p className="mt-1 font-display text-2xl font-semibold">{label} <span className="text-base font-normal text-[var(--fg-muted)]">· {plan.validityDays} days</span></p>
        <ul className="mt-4 space-y-1.5 text-sm text-[var(--fg-muted)]">
          <li>Activates on arrival, within {plan.activation.windowDays} days of purchase</li>
          <li>{plan.coverageCount} {plan.coverageCount === 1 ? "country" : "countries"} covered</li>
          <li>Hotspot {plan.hotspot ? "allowed" : "not allowed"}</li>
          <li>Data only, no phone number</li>
        </ul>
        <div className="mt-5 flex items-baseline justify-between border-t border-[var(--border)] pt-4">
          <span className="text-sm">Total</span><span className="font-display text-xl font-semibold">{formatPrice(plan.price.amount, plan.price.currency)}</span>
        </div>
      </aside>
    </div>
  );
}
