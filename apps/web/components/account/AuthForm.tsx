"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isReg = mode === "register";
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    try {
      await api(`/v1/auth/${mode}`, { method: "POST", json: isReg ? { email, password, name: name || undefined } : { email, password } });
      const next = new URLSearchParams(location.search).get("next");
      location.assign(next && next.startsWith("/") && !next.startsWith("//") ? next : "/account");
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  }
  const field = "mt-1.5 h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 outline-none focus:border-[var(--focus)]";
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-display text-3xl font-semibold tracking-tight">{isReg ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-2 text-sm text-[var(--fg-muted)]">{isReg ? "Keep your eSIMs, data usage and top-ups in one place." : "Sign in to see your eSIMs and top up."}</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {isReg && <div><label htmlFor="name" className="text-sm font-medium">Name <span className="text-[var(--fg-muted)]">(optional)</span></label><input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={field} /></div>}
        <div><label htmlFor="email" className="text-sm font-medium">Email</label><input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} /></div>
        <div>
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input id="password" type="password" required minLength={10} autoComplete={isReg ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} className={field} aria-describedby={isReg ? "pw-hint" : undefined} />
          {isReg && <p id="pw-hint" className="mt-1.5 text-xs text-[var(--fg-muted)]">At least 10 characters.</p>}
        </div>
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <button disabled={busy} className="h-12 w-full rounded-xl bg-blue-500 font-medium text-white hover:bg-blue-400 disabled:opacity-60">{busy ? "Please wait…" : isReg ? "Create account" : "Sign in"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--fg-muted)]">
        {isReg ? <>Already have an account? <a className="text-[var(--accent)] underline" href="/login">Sign in</a></> : <>New to BLEUSIM? <a className="text-[var(--accent)] underline" href="/register">Create an account</a></>}
      </p>
    </div>
  );
}
