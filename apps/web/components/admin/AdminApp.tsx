"use client";
// Back office. The API enforces every permission; this UI only hides sections the API would refuse.
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/catalog";
import { Logo } from "@/components/brand/Logo";

type Permission = "overview" | "orders" | "retryProvisioning" | "esims" | "catalog" | "suppliers" | "toggleSupplier" | "users" | "audit";
type Names = { en: string };
const ROLES = ["CUSTOMER", "SUPPORT", "CATALOG_MANAGER", "FINANCE", "ADMIN"] as const;

const TABS: { id: string; label: string; need: Permission }[] = [
  { id: "overview", label: "Overview", need: "overview" },
  { id: "orders", label: "Orders", need: "orders" },
  { id: "esims", label: "eSIMs", need: "esims" },
  { id: "plans", label: "Plans", need: "catalog" },
  { id: "suppliers", label: "Suppliers", need: "suppliers" },
  { id: "users", label: "Users", need: "users" },
  { id: "audit", label: "Audit log", need: "audit" },
];

const money = (minor: number, currency: string) => formatPrice(minor / 100, currency);
const when = (d: string) => new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
const label = (s: string) => s.replace(/_/g, " ").toLowerCase();

export function AdminApp() {
  const [me, setMe] = useState<{ user: { email: string; role: string }; permissions: Permission[] } | null | "denied" | "signin">(null);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    api<{ user: { email: string; role: string }; permissions: Permission[] }>("/v1/admin/me")
      .then(setMe)
      .catch((e: { status?: number }) => setMe(e.status === 401 ? "signin" : "denied"));
    const h = location.hash.slice(1);
    if (TABS.some((t) => t.id === h)) setTab(h);
  }, []);
  const go = (id: string) => { setTab(id); history.replaceState(null, "", `#${id}`); };

  if (me === null) return <div aria-busy className="m-10 h-40 animate-pulse rounded-2xl bg-[var(--bg-subtle)]" />;
  if (me === "signin") return <Center title="Sign in to the back office"><a href="/login?next=/admin" className="mt-6 inline-flex h-11 items-center rounded-xl bg-blue-500 px-6 font-medium text-white hover:bg-blue-400">Sign in</a></Center>;
  if (me === "denied") return <Center title="This account has no back-office access"><p className="mt-2 text-sm text-[var(--fg-muted)]">Ask an administrator to give your account a staff role.</p></Center>;

  const tabs = TABS.filter((t) => me.permissions.includes(t.need));
  const current = tabs.find((t) => t.id === tab) ?? tabs[0]!;
  const has = (p: Permission) => me.permissions.includes(p);

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--fg)] md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-[var(--border)] p-4 md:min-h-dvh md:border-b-0 md:border-r">
        <a href="/" aria-label="BLEUSIM home" className="block h-7"><Logo className="h-7" adaptive /></a>
        <p className="mt-1 text-xs text-[var(--fg-muted)]">Back office</p>
        <nav aria-label="Back office" className="mt-6 flex gap-1 overflow-x-auto md:flex-col">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => go(t.id)} aria-current={current.id === t.id ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm ${current.id === t.id ? "bg-blue-500/10 font-medium text-[var(--accent)]" : "hover:bg-[var(--bg-subtle)]"}`}>{t.label}</button>
          ))}
        </nav>
        <p className="mt-6 hidden text-xs text-[var(--fg-muted)] md:block">{me.user.email}<br />{label(me.user.role)}</p>
      </aside>
      <main className="min-w-0 p-5 md:p-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{current.label}</h1>
        <div className="mt-6">
          {current.id === "overview" && <Overview />}
          {current.id === "orders" && <Orders canRetry={has("retryProvisioning")} />}
          {current.id === "esims" && <Esims />}
          {current.id === "plans" && <Plans />}
          {current.id === "suppliers" && <Suppliers canToggle={has("toggleSupplier")} />}
          {current.id === "users" && <Users />}
          {current.id === "audit" && <Audit />}
        </div>
      </main>
    </div>
  );
}

function Center({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="grid min-h-dvh place-items-center bg-[var(--bg)] p-6 text-center text-[var(--fg)]"><div><h1 className="font-display text-2xl font-semibold">{title}</h1>{children}</div></div>;
}

/** Loads a paginated admin list; `reload()` refetches from the start. */
function useList<T>(path: string, key: string) {
  const [rows, setRows] = useState<T[] | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const load = useCallback(async (cursor?: string) => {
    try {
      const sep = path.includes("?") ? "&" : "?";
      const r = await api<Record<string, unknown>>(path + (cursor ? `${sep}cursor=${encodeURIComponent(cursor)}` : ""));
      const items = r[key] as T[];
      setRows((prev) => (cursor && prev ? [...prev, ...items] : items));
      setNext((r.nextCursor as string | null) ?? null); setErr(null);
    } catch (e) { setErr((e as Error).message); }
  }, [path, key]);
  useEffect(() => { setRows(null); load(); }, [load]);
  return { rows, next, err, more: () => next && load(next), reload: () => load() };
}

function ListState({ rows, err, empty }: { rows: unknown[] | null; err: string | null; empty: string }) {
  if (err) return <p role="alert" className="text-red-700 dark:text-red-300">{err}</p>;
  if (!rows) return <div aria-busy className="h-32 animate-pulse rounded-2xl bg-[var(--bg-subtle)]" />;
  if (rows.length === 0) return <p className="text-[var(--fg-muted)]">{empty}</p>;
  return null;
}
const More = ({ next, onClick }: { next: string | null; onClick: () => void }) => next ? <button onClick={onClick} className="mt-4 rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--bg-subtle)]">Load more</button> : null;
const Table = ({ head, children }: { head: string[]; children: React.ReactNode }) => (
  <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
    <table className="w-full min-w-[640px] text-left text-sm">
      <thead className="bg-[var(--bg-subtle)] text-[var(--fg-muted)]"><tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`border-t border-[var(--border)] px-4 py-3 ${className}`}>{children}</td>;
const Search = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
  <label className="mb-4 block max-w-sm"><span className="sr-only">{placeholder}</span>
    <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]" />
  </label>
);
function useDebounced(v: string, ms = 300) { const [d, setD] = useState(v); useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]); return d; }

function Overview() {
  type O = { sandboxOnly: boolean; orders: Record<string, number>; revenue: Record<string, { grossMinor: number; wholesaleMinor: number }>; esims: { status: string; isSandbox: boolean; count: number }[]; users: number; provisioningFailures: number };
  const [o, setO] = useState<O | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { api<O>("/v1/admin/overview").then(setO).catch((e) => setErr(e.message)); }, []);
  if (err) return <p role="alert" className="text-red-700 dark:text-red-300">{err}</p>;
  if (!o) return <div aria-busy className="h-32 animate-pulse rounded-2xl bg-[var(--bg-subtle)]" />;
  const totalOrders = Object.values(o.orders).reduce((a, b) => a + b, 0);
  const esims = o.esims.reduce((a, b) => a + b.count, 0);
  return (
    <div>
      {o.sandboxOnly && <p role="note" className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">Sandbox only: every enabled supplier is a test sandbox, so these orders and amounts are test data, not real sales.</p>}
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat k="Orders" v={String(totalOrders)} />
        <Stat k="eSIMs" v={String(esims)} />
        <Stat k="Customers" v={String(o.users)} />
        <Stat k="Provisioning failures" v={String(o.provisioningFailures)} alert={o.provisioningFailures > 0} />
        {Object.entries(o.revenue).map(([cur, r]) => (
          <div key={cur} className="contents">
            <Stat k={`Paid volume (${cur})`} v={money(r.grossMinor, cur)} />
            <Stat k={`Gross margin (${cur})`} v={money(r.grossMinor - r.wholesaleMinor, cur)} />
          </div>
        ))}
      </dl>
      <h2 className="mt-10 font-display text-lg font-semibold">Orders by status</h2>
      <ul className="mt-3 flex flex-wrap gap-2 text-sm">{Object.entries(o.orders).map(([s, n]) => <li key={s} className="rounded-full border border-[var(--border)] px-3 py-1.5">{label(s)} · {n}</li>)}</ul>
    </div>
  );
}
const Stat = ({ k, v, alert }: { k: string; v: string; alert?: boolean }) => (
  <div className={`rounded-2xl border p-4 ${alert ? "border-red-500/50 bg-red-500/5" : "border-[var(--border)] bg-[var(--bg-subtle)]"}`}><dt className="text-sm text-[var(--fg-muted)]">{k}</dt><dd className="mt-1 font-display text-2xl font-semibold">{v}</dd></div>
);

type OrderRow = { id: string; number: string; email: string; status: string; total: { minor: number; currency: string }; createdAt: string; destinations: Names[]; isTopUp: boolean };
function Orders({ canRetry }: { canRetry: boolean }) {
  const [q, setQ] = useState(""); const dq = useDebounced(q);
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const params = new URLSearchParams({ ...(dq ? { q: dq } : {}), ...(status ? { status } : {}) }).toString();
  const l = useList<OrderRow>(`/v1/admin/orders${params ? `?${params}` : ""}`, "orders");
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Search value={q} onChange={setQ} placeholder="Search order number or email" />
        <label className="mb-4"><span className="sr-only">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm">
            <option value="">All statuses</option>
            {["PENDING_PAYMENT", "PAID", "PROVISIONING", "FULFILLED", "PROVISIONING_FAILED", "PAYMENT_FAILED", "REFUNDED"].map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
        </label>
      </div>
      <ListState rows={l.rows} err={l.err} empty="No orders match." />
      {l.rows && l.rows.length > 0 && (
        <Table head={["Order", "Customer", "Item", "Status", "Total", "Placed"]}>
          {l.rows.map((o) => (
            <tr key={o.id}>
              <Td><button onClick={() => setOpen(o.id)} className="font-mono text-xs text-[var(--accent)] underline">{o.number}</button></Td>
              <Td>{o.email}</Td>
              <Td>{o.destinations.map((d) => d.en).join(", ")}{o.isTopUp ? " · top-up" : ""}</Td>
              <Td><StatusPill s={o.status} /></Td>
              <Td>{money(o.total.minor, o.total.currency)}</Td>
              <Td className="text-[var(--fg-muted)]">{when(o.createdAt)}</Td>
            </tr>
          ))}
        </Table>
      )}
      <More next={l.next} onClick={l.more} />
      {open && <OrderDetail id={open} canRetry={canRetry} onClose={() => setOpen(null)} onChanged={l.reload} />}
    </div>
  );
}
const StatusPill = ({ s }: { s: string }) => {
  const tone = s === "FULFILLED" ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300" : s.includes("FAILED") ? "bg-red-500/15 text-red-800 dark:text-red-300" : "bg-[var(--bg-subtle)] text-[var(--fg-muted)]";
  return <span className={`rounded-full px-2 py-0.5 text-xs ${tone}`}>{label(s)}</span>;
};

function OrderDetail({ id, canRetry, onClose, onChanged }: { id: string; canRetry: boolean; onClose: () => void; onChanged: () => void }) {
  type D = { order: { number: string; email: string; status: string; createdAt: string; total: { minor: number; currency: string }; payments: { provider: string; ref: string; status: string; amountMinor: number; currency: string }[]; items: { id: string; plan: string; destination: Names; unitPriceMinor: number; wholesaleMinor: number; supplierId: string; provisionAttempts: number; esim: { iccid: string; status: string; isSandbox: boolean } | null }[] }; audit: { action: string; at: string }[] };
  const [d, setD] = useState<D | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const load = useCallback(() => api<D>(`/v1/admin/orders/${id}`).then(setD).catch((e) => setMsg(e.message)), [id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [onClose]);
  async function retry() {
    setBusy(true); setMsg(null);
    try { const r = await api<{ status: string }>(`/v1/admin/orders/${id}/retry-provisioning`, { method: "POST" }); setMsg(`Provisioning ${label(r.status)}.`); await load(); onChanged(); }
    catch (e) { setMsg((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="od-h" className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div className="h-full w-full max-w-xl overflow-y-auto bg-[var(--bg)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between"><h2 id="od-h" className="font-display text-xl font-semibold">Order {d?.order.number ?? ""}</h2><button autoFocus onClick={onClose} aria-label="Close" className="rounded-full px-3 py-1 text-xl hover:bg-[var(--bg-subtle)]">×</button></div>
        {!d ? <div aria-busy className="mt-6 h-40 animate-pulse rounded-2xl bg-[var(--bg-subtle)]" /> : (
          <div className="mt-4 space-y-6 text-sm">
            <p>{d.order.email} · <StatusPill s={d.order.status} /> · {money(d.order.total.minor, d.order.total.currency)} · {when(d.order.createdAt)}</p>
            {canRetry && d.order.status === "PROVISIONING_FAILED" && <button disabled={busy} onClick={retry} className="h-10 rounded-xl bg-blue-500 px-4 font-medium text-white hover:bg-blue-400 disabled:opacity-60">{busy ? "Retrying…" : "Retry provisioning"}</button>}
            {msg && <p role="status">{msg}</p>}
            <section><h3 className="font-medium">Items</h3><ul className="mt-2 space-y-2">{d.order.items.map((i) => (
              <li key={i.id} className="rounded-xl border border-[var(--border)] p-3">
                <p>{i.destination.en} · <span className="font-mono text-xs">{i.plan}</span></p>
                <p className="text-[var(--fg-muted)]">Price {money(i.unitPriceMinor, d.order.total.currency)} · cost {money(i.wholesaleMinor, d.order.total.currency)} · supplier {i.supplierId} · attempts {i.provisionAttempts}</p>
                {i.esim && <p className="mt-1">ICCID <span className="font-mono">{i.esim.iccid}</span> · {label(i.esim.status)}{i.esim.isSandbox ? " · sandbox" : ""}</p>}
              </li>))}</ul></section>
            <section><h3 className="font-medium">Payments</h3><ul className="mt-2 space-y-1">{d.order.payments.map((p) => <li key={p.ref}>{p.provider} · <span className="font-mono text-xs">{p.ref}</span> · {label(p.status)} · {money(p.amountMinor, p.currency)}</li>)}</ul></section>
            <section><h3 className="font-medium">History</h3><ol className="mt-2 space-y-1 text-[var(--fg-muted)]">{d.audit.map((a, n) => <li key={n}>{when(a.at)} · {a.action}</li>)}</ol></section>
            <p className="text-xs text-[var(--fg-muted)]">Activation codes are never shown here. Customers get them from their order page or My eSIMs.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Esims() {
  type E = { id: string; iccid: string; status: string; isSandbox: boolean; supplierId: string; dataTotalMb: number | null; dataUsedMb: number; destination: Names; orderNumber: string; email: string; createdAt: string };
  const [q, setQ] = useState(""); const dq = useDebounced(q);
  const l = useList<E>(`/v1/admin/esims${dq ? `?q=${encodeURIComponent(dq)}` : ""}`, "esims");
  return (
    <div>
      <Search value={q} onChange={setQ} placeholder="Search ICCID" />
      <ListState rows={l.rows} err={l.err} empty="No eSIMs yet." />
      {l.rows && l.rows.length > 0 && (
        <Table head={["ICCID", "Destination", "Customer", "Status", "Data used", "Supplier"]}>
          {l.rows.map((e) => (
            <tr key={e.id}>
              <Td className="font-mono text-xs">{e.iccid}</Td><Td>{e.destination.en}</Td><Td>{e.email}<br /><span className="font-mono text-xs text-[var(--fg-muted)]">{e.orderNumber}</span></Td>
              <Td>{label(e.status)}{e.isSandbox ? " · sandbox" : ""}</Td>
              <Td>{e.dataTotalMb === null ? `${e.dataUsedMb} MB · unlimited` : `${e.dataUsedMb} / ${e.dataTotalMb} MB`}</Td><Td>{e.supplierId}</Td>
            </tr>
          ))}
        </Table>
      )}
      <More next={l.next} onClick={l.more} />
    </div>
  );
}

function Plans() {
  type P = { id: string; destination: { id: string; names: Names }; active: boolean; source: string; priceMinor: number; currency: string; wholesaleMinor: number; dataMb: number | null; validityDays: number; supplierId: string };
  const [dest, setDest] = useState(""); const dd = useDebounced(dest);
  const l = useList<P>(`/v1/admin/plans${dd ? `?destination=${encodeURIComponent(dd.toLowerCase())}` : ""}`, "plans");
  const [msg, setMsg] = useState<string | null>(null);
  async function patch(id: string, body: { active?: boolean; priceMinor?: number }) {
    setMsg(null);
    try { await api(`/v1/admin/plans/${id}`, { method: "PATCH", json: body }); setMsg("Saved."); l.reload(); } catch (e) { setMsg((e as Error).message); }
  }
  return (
    <div>
      <Search value={dest} onChange={setDest} placeholder="Destination id, e.g. jp or region:europe" />
      {msg && <p role="status" className="mb-3 text-sm">{msg}</p>}
      <ListState rows={l.rows} err={l.err} empty="No plans." />
      {l.rows && l.rows.length > 0 && (
        <Table head={["Plan", "Destination", "Data · days", "Price", "Cost", "Margin", "On sale"]}>
          {l.rows.map((p) => (
            <tr key={p.id}>
              <Td className="font-mono text-xs">{p.id}{p.source === "DEV_FIXTURE" && <span className="ml-1 rounded bg-amber-500/15 px-1 text-amber-800 dark:text-amber-300">fixture</span>}</Td>
              <Td>{p.destination.names.en}</Td>
              <Td>{p.dataMb === null ? "Unlimited" : `${p.dataMb / 1024} GB`} · {p.validityDays}</Td>
              <Td><PriceEdit p={p} onSave={(minor) => patch(p.id, { priceMinor: minor })} /></Td>
              <Td>{money(p.wholesaleMinor, p.currency)}</Td>
              <Td>{Math.round(((p.priceMinor - p.wholesaleMinor) / p.priceMinor) * 100)}%</Td>
              <Td><label className="inline-flex items-center gap-2"><input type="checkbox" checked={p.active} onChange={(e) => patch(p.id, { active: e.target.checked })} /><span className="sr-only">On sale: {p.id}</span></label></Td>
            </tr>
          ))}
        </Table>
      )}
      <More next={l.next} onClick={l.more} />
    </div>
  );
}
function PriceEdit({ p, onSave }: { p: { id: string; priceMinor: number; currency: string }; onSave: (minor: number) => void }) {
  const [v, setV] = useState((p.priceMinor / 100).toFixed(2));
  useEffect(() => setV((p.priceMinor / 100).toFixed(2)), [p.priceMinor]);
  const minor = Math.round(Number(v) * 100);
  const changed = Number.isFinite(minor) && minor > 0 && minor !== p.priceMinor;
  return (
    <form className="flex items-center gap-1" onSubmit={(e) => { e.preventDefault(); if (changed) onSave(minor); }}>
      <label><span className="sr-only">Price in {p.currency} for {p.id}</span>
        <input inputMode="decimal" value={v} onChange={(e) => setV(e.target.value)} className="h-8 w-20 rounded-lg border border-[var(--border)] bg-transparent px-2 text-sm" /></label>
      {changed && <button className="rounded-lg bg-blue-500 px-2 py-1 text-xs text-white">Save</button>}
    </form>
  );
}

function Suppliers({ canToggle }: { canToggle: boolean }) {
  type S = { id: string; name: string; adapter: string; enabled: boolean; priority: number; isSandbox: boolean; plans: number };
  const [rows, setRows] = useState<S[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const load = useCallback(() => api<{ suppliers: S[] }>("/v1/admin/suppliers").then((r) => setRows(r.suppliers)).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);
  async function toggle(s: S) { try { await api(`/v1/admin/suppliers/${s.id}`, { method: "PATCH", json: { enabled: !s.enabled } }); load(); } catch (e) { setErr((e as Error).message); } }
  return (
    <div>
      <ListState rows={rows} err={err} empty="No suppliers configured." />
      {rows && rows.length > 0 && (
        <Table head={["Supplier", "Adapter", "Type", "Priority", "Plans", "Enabled"]}>
          {rows.map((s) => (
            <tr key={s.id}>
              <Td>{s.name}<br /><span className="font-mono text-xs text-[var(--fg-muted)]">{s.id}</span></Td><Td>{s.adapter}</Td><Td>{s.isSandbox ? "Sandbox" : "Live"}</Td><Td>{s.priority}</Td><Td>{s.plans}</Td>
              <Td>{canToggle ? <label className="inline-flex items-center gap-2"><input type="checkbox" checked={s.enabled} onChange={() => toggle(s)} /><span className="sr-only">Enabled: {s.name}</span></label> : s.enabled ? "Yes" : "No"}</Td>
            </tr>
          ))}
        </Table>
      )}
      <p className="mt-4 text-sm text-[var(--fg-muted)]">Real suppliers are added once contracts and API keys exist. No live supplier is connected yet.</p>
    </div>
  );
}

function Users() {
  type U = { id: string; email: string; name: string | null; role: string; createdAt: string; orders: number };
  const [q, setQ] = useState(""); const dq = useDebounced(q);
  const l = useList<U>(`/v1/admin/users${dq ? `?q=${encodeURIComponent(dq)}` : ""}`, "users");
  const [msg, setMsg] = useState<string | null>(null);
  async function setRole(u: U, role: string) {
    setMsg(null);
    try { await api(`/v1/admin/users/${u.id}/role`, { method: "PATCH", json: { role } }); setMsg(`${u.email} is now ${label(role)} and was signed out.`); l.reload(); } catch (e) { setMsg((e as Error).message); }
  }
  return (
    <div>
      <Search value={q} onChange={setQ} placeholder="Search email" />
      {msg && <p role="status" className="mb-3 text-sm">{msg}</p>}
      <ListState rows={l.rows} err={l.err} empty="No users match." />
      {l.rows && l.rows.length > 0 && (
        <Table head={["Email", "Name", "Orders", "Joined", "Role"]}>
          {l.rows.map((u) => (
            <tr key={u.id}>
              <Td>{u.email}</Td><Td>{u.name ?? "—"}</Td><Td>{u.orders}</Td><Td className="text-[var(--fg-muted)]">{when(u.createdAt)}</Td>
              <Td><label><span className="sr-only">Role for {u.email}</span>
                <select value={u.role} onChange={(e) => setRole(u, e.target.value)} className="h-8 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 text-sm">{ROLES.map((r) => <option key={r} value={r}>{label(r)}</option>)}</select></label></Td>
            </tr>
          ))}
        </Table>
      )}
      <More next={l.next} onClick={l.more} />
    </div>
  );
}

function Audit() {
  type A = { id: string; action: string; target: string | null; actor: string | null; ip: string | null; meta: unknown; at: string };
  const [q, setQ] = useState(""); const dq = useDebounced(q);
  const l = useList<A>(`/v1/admin/audit${dq ? `?action=${encodeURIComponent(dq)}` : ""}`, "entries");
  return (
    <div>
      <Search value={q} onChange={setQ} placeholder="Filter by action prefix, e.g. admin." />
      <ListState rows={l.rows} err={l.err} empty="No entries." />
      {l.rows && l.rows.length > 0 && (
        <Table head={["When", "Action", "Target", "By", "Details"]}>
          {l.rows.map((a) => (
            <tr key={a.id}>
              <Td className="whitespace-nowrap text-[var(--fg-muted)]">{when(a.at)}</Td><Td className="font-mono text-xs">{a.action}</Td><Td className="font-mono text-xs">{a.target ?? "—"}</Td><Td>{a.actor ?? "system"}</Td>
              <Td className="max-w-xs truncate font-mono text-xs">{a.meta ? JSON.stringify(a.meta) : ""}</Td>
            </tr>
          ))}
        </Table>
      )}
      <More next={l.next} onClick={l.more} />
    </div>
  );
}
