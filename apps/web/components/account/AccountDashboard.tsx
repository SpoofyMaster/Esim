"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import type { Plan } from "@bleusim/catalog";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/catalog";
import { flagEmoji } from "@bleusim/geospatial";
import { SandboxBanner } from "@/components/commerce/Shell";

interface Esim { id: string; iccid: string; status: string; isSandbox: boolean; destination: { id: string; kind: string; names: { en: string } }; dataTotalMb: number | null; dataUsedMb: number; usageLive: boolean; validityDays: number; orderNumber: string; purchasedAt: string; topUpAvailable: boolean }
interface OrderRow { id: string; number: string; status: string; total: { minor: number; currency: string }; createdAt: string; destinations: { en: string }[]; isTopUp: boolean }

const fmtData = (mb: number) => (mb >= 1024 ? `${(mb / 1024).toFixed(mb % 1024 ? 1 : 0)} GB` : `${mb} MB`);

export function AccountDashboard() {
  const [me, setMe] = useState<{ email: string; name: string | null } | null | undefined>(undefined);
  const [esims, setEsims] = useState<Esim[] | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const m = await api<{ user: { email: string; name: string | null } }>("/v1/me");
      setMe(m.user);
      const [e, o] = await Promise.all([api<{ esims: Esim[] }>("/v1/me/esims"), api<{ orders: OrderRow[] }>("/v1/me/orders")]);
      setEsims(e.esims); setOrders(o.orders);
    } catch (e) {
      if ((e as { status?: number }).status === 401) { setMe(null); return; }
      setErr((e as Error).message);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (me === null) return (
    <div className="mx-auto max-w-sm text-center">
      <h1 className="font-display text-2xl font-semibold">Sign in to see your eSIMs</h1>
      <a href="/login?next=/account" className="mt-6 inline-flex h-11 items-center rounded-xl bg-blue-500 px-6 font-medium text-white hover:bg-blue-400">Sign in</a>
    </div>
  );
  if (err) return <p role="alert" className="text-red-700">{err}</p>;
  if (!me || !esims) return <div aria-busy className="h-48 animate-pulse rounded-2xl bg-white/5" />;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">My eSIMs</h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">{me.name ? `${me.name} · ` : ""}{me.email}</p>
        </div>
        <button onClick={async () => { await api("/v1/auth/logout", { method: "POST" }); location.assign("/"); }} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--bg-subtle)]">Sign out</button>
      </div>
      {esims.some((e) => e.isSandbox) && <div className="mt-6"><SandboxBanner /></div>}

      {esims.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[var(--border)] p-8 text-center">
          <p className="font-medium">No eSIMs yet</p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">Pick a destination on the globe to get started.</p>
          <a href="/" className="mt-4 inline-block text-sm text-[var(--accent)] underline">Explore destinations</a>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">{esims.map((e) => <EsimCard key={e.id} esim={e} onChanged={load} />)}</ul>
      )}

      {orders.length > 0 && (
        <section className="mt-12" aria-labelledby="orders-h">
          <h2 id="orders-h" className="font-display text-xl font-semibold">Purchase history</h2>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-[var(--fg-muted)]"><tr><th className="py-2 font-normal">Order</th><th className="font-normal">Item</th><th className="font-normal">Status</th><th className="text-right font-normal">Total</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-[var(--border)]">
                  <td className="py-3 font-mono text-xs">{o.number}</td>
                  <td>{o.destinations.map((d) => d.en).join(", ")}{o.isTopUp ? " · top-up" : ""}</td>
                  <td>{o.status.replace(/_/g, " ").toLowerCase()}</td>
                  <td className="text-right">{formatPrice(o.total.minor / 100, o.total.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

function EsimCard({ esim, onChanged }: { esim: Esim; onChanged: () => void }) {
  const [panel, setPanel] = useState<"none" | "install" | "topup">("none");
  const pct = esim.dataTotalMb ? Math.min(100, (esim.dataUsedMb / esim.dataTotalMb) * 100) : 0;
  const remaining = esim.dataTotalMb === null ? null : Math.max(0, esim.dataTotalMb - esim.dataUsedMb);
  const iso = esim.destination.kind === "COUNTRY" ? esim.destination.id.toUpperCase() : null;
  return (
    <li className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5">
      <div className="flex items-center gap-3">
        <span aria-hidden className="grid size-10 place-items-center rounded-xl bg-white/10 text-xl">{iso ? flagEmoji(iso) : "◍"}</span>
        <div className="flex-1">
          <p className="font-medium">{esim.destination.names.en}</p>
          <p className="text-xs text-[var(--fg-muted)]">ICCID {esim.iccid} · {esim.status.toLowerCase().replace(/_/g, " ")}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm">
          <span>{remaining === null ? "Unlimited data" : `${fmtData(remaining)} left`}</span>
          {esim.dataTotalMb !== null && <span className="text-[var(--fg-muted)]">{fmtData(esim.dataUsedMb)} of {fmtData(esim.dataTotalMb)} used</span>}
        </div>
        {esim.dataTotalMb !== null && (
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Data used">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${Math.max(pct, 1)}%` }} />
          </div>
        )}
        <p className="mt-2 text-xs text-[var(--fg-muted)]">{esim.usageLive ? "Usage updated just now" : "Showing last known usage"} · valid {esim.validityDays} days from activation</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button aria-expanded={panel === "install"} onClick={() => setPanel(panel === "install" ? "none" : "install")} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--bg-subtle)]">Install details</button>
        {esim.topUpAvailable && <button aria-expanded={panel === "topup"} onClick={() => setPanel(panel === "topup" ? "none" : "topup")} className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400">Top up</button>}
      </div>
      {panel === "install" && <InstallDetails id={esim.id} />}
      {panel === "topup" && <TopUp esim={esim} onDone={() => { setPanel("none"); onChanged(); }} />}
    </li>
  );
}

function InstallDetails({ id }: { id: string }) {
  const [d, setD] = useState<{ lpa: string; isSandbox: boolean } | null>(null);
  const [svg, setSvg] = useState("");
  useEffect(() => { api<{ lpa: string; isSandbox: boolean }>(`/v1/me/esims/${id}/install`).then(async (x) => { setD(x); setSvg(await QRCode.toString(x.lpa, { type: "svg", margin: 1 })); }); }, [id]);
  if (!d) return <div aria-busy className="mt-4 h-32 animate-pulse rounded-xl bg-white/5" />;
  const [, smdp, code] = d.lpa.split("$");
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-[160px_1fr]">
      <figure className="rounded-xl bg-white p-2"><div role="img" aria-label="eSIM QR code" className="[&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />{d.isSandbox && <figcaption className="text-center text-[11px] text-amber-700">Sandbox · will not install</figcaption>}</figure>
      <dl className="space-y-2 text-sm"><div><dt className="text-[var(--fg-muted)]">SM-DP+ address</dt><dd className="break-all font-mono">{smdp}</dd></div><div><dt className="text-[var(--fg-muted)]">Activation code</dt><dd className="break-all font-mono">{code}</dd></div></dl>
    </div>
  );
}

function TopUp({ esim, onDone }: { esim: Esim; onDone: () => void }) {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [chosen, setChosen] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const key = useMemo(() => crypto.randomUUID(), []);
  useEffect(() => { api<{ plans: Plan[] }>(`/v1/destinations/${encodeURIComponent(esim.destination.id)}/plans`).then((r) => { const p = r.plans.filter((x) => x.dataGb !== null); setPlans(p); setChosen(p[0]?.id ?? ""); }); }, [esim.destination.id]);
  async function buy() {
    setBusy(true); setErr(null);
    try {
      const r = await api<{ paymentRef: string }>(`/v1/me/esims/${esim.id}/topups`, { method: "POST", json: { retailPlanId: chosen, idempotencyKey: key } });
      await api(`/v1/sandbox/payments/${r.paymentRef}/complete`, { method: "POST", json: { outcome: "succeeded" } });
      onDone();
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  }
  if (!plans) return <div aria-busy className="mt-4 h-20 animate-pulse rounded-xl bg-white/5" />;
  return (
    <fieldset className="mt-4">
      <legend className="text-sm text-[var(--fg-muted)]">Add data to this eSIM</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {plans.map((p) => (
          <label key={p.id} className={`cursor-pointer rounded-xl border px-3 py-2 text-sm ${chosen === p.id ? "border-[var(--accent)] bg-blue-500/10" : "border-[var(--border)]"}`}>
            <input type="radio" name={`topup-${esim.id}`} className="sr-only" checked={chosen === p.id} onChange={() => setChosen(p.id)} />
            {p.dataGb} GB · {formatPrice(p.price.amount, p.price.currency)}
          </label>
        ))}
      </div>
      {err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}
      <button disabled={busy || !chosen} onClick={buy} className="mt-3 h-10 rounded-xl bg-blue-500 px-5 text-sm font-medium text-white hover:bg-blue-400 disabled:opacity-60">{busy ? "Adding…" : "Pay (sandbox) and add data"}</button>
    </fieldset>
  );
}
